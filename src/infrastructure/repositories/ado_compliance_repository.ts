import type { ComplianceStatus } from "../../domain/entities/compliance_status";
import { computeComplianceColor } from "../../domain/entities/compliance_status";
import type { ComplianceRepository } from "../../domain/repositories/compliance_repository";
import { adoRequest } from "../http/ado_rest_client";

const ADO_API = "https://dev.azure.com";
const API_VERSION = "api-version=7.1";
const BUILD_VALIDATION_TYPE_ID = "0609b952-1397-4640-95ec-e00a01b2c241";

interface AdoBuildDefinition {
  readonly id: number;
  readonly name: string;
}

interface AdoPolicyConfiguration {
  readonly isEnabled: boolean;
  readonly isBlocking: boolean;
  readonly type: { readonly id: string };
  readonly settings: {
    readonly buildDefinitionId?: number;
    readonly validDuration?: number;
    readonly scope: readonly { readonly refName: string; readonly matchKind: string }[];
  };
}

interface AdoListResponse<T> {
  readonly value: T[];
}

export class AdoComplianceRepository implements ComplianceRepository {
  async getComplianceStatus(
    token: string,
    owner: string,
    repoName: string,
    defaultBranch: string,
  ): Promise<ComplianceStatus | null> {
    try {
      const [org, project] = owner.split("/");
      if (!org || !project) return null;

      const [definitions, policies] = await Promise.all([
        this.fetchBuildDefinitions(token, org, project, repoName),
        this.fetchPolicyConfigurations(token, org, project),
      ]);

      const pipelineExists = definitions.some(
        (d) => d.name.toLowerCase() === repoName.toLowerCase(),
      );

      const branchRef = `refs/heads/${defaultBranch}`;
      const branchPolicies = policies.filter((p) =>
        p.isEnabled && p.settings.scope.some((s) => s.refName === branchRef),
      );

      const branchProtection = branchPolicies.length > 0;

      const buildValidationPolicies = branchPolicies.filter(
        (p) => p.type.id === BUILD_VALIDATION_TYPE_ID,
      );
      const buildPolicyOnPRs = buildValidationPolicies.length > 0;
      const buildPolicyExpiration = buildValidationPolicies.some(
        (p) => (p.settings.validDuration ?? 0) > 0,
      );

      const checks = [pipelineExists, buildPolicyOnPRs, buildPolicyExpiration, branchProtection];
      return {
        pipelineExists,
        buildPolicyOnPRs,
        buildPolicyExpiration,
        branchProtection,
        color: computeComplianceColor(checks),
      };
    } catch {
      return null;
    }
  }

  private async fetchBuildDefinitions(
    token: string,
    org: string,
    project: string,
    name: string,
  ): Promise<AdoBuildDefinition[]> {
    const url = `${ADO_API}/${org}/${project}/_apis/build/definitions?name=${encodeURIComponent(name)}&${API_VERSION}`;
    const response = await adoRequest<AdoListResponse<AdoBuildDefinition>>(token, url);
    return response.value;
  }

  private async fetchPolicyConfigurations(
    token: string,
    org: string,
    project: string,
  ): Promise<AdoPolicyConfiguration[]> {
    const url = `${ADO_API}/${org}/${project}/_apis/policy/configurations?${API_VERSION}`;
    const response = await adoRequest<AdoListResponse<AdoPolicyConfiguration>>(token, url);
    return response.value;
  }
}
