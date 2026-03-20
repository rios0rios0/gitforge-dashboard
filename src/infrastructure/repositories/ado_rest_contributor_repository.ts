import type { Contributor } from "../../domain/entities/contributor";
import type { ContributorRepository } from "../../domain/repositories/contributor_repository";
import { mapAdoPullRequestsToContributors } from "../../service/mappers/ado_contributor_mapper";
import type { AdoPullRequestNode } from "../../service/mappers/ado_contributor_node";
import type { AdoProject, AdoRepositoryNode } from "../../service/mappers/ado_repository_node";
import { adoRequest } from "../http/ado_rest_client";

const ADO_API = "https://dev.azure.com";
const API_VERSION = "api-version=7.1";
const BATCH_SIZE = 10;

interface AdoListResponse<T> {
  value: T[];
  count: number;
}

const fetchProjects = async (token: string, org: string): Promise<AdoProject[]> => {
  const url = `${ADO_API}/${org}/_apis/projects?${API_VERSION}`;
  const response = await adoRequest<AdoListResponse<AdoProject>>(token, url);
  return response.value;
};

const fetchRepos = async (
  token: string,
  org: string,
  project: string,
): Promise<AdoRepositoryNode[]> => {
  const url = `${ADO_API}/${org}/${project}/_apis/git/repositories?${API_VERSION}`;
  const response = await adoRequest<AdoListResponse<AdoRepositoryNode>>(token, url);
  return response.value;
};

const fetchCompletedPRs = async (
  token: string,
  org: string,
  project: string,
  repoId: string,
  dateFrom: string | null,
  dateTo: string | null,
): Promise<AdoPullRequestNode[]> => {
  const params = new URLSearchParams({
    "searchCriteria.status": "completed",
    "$top": "250",
    "api-version": "7.1",
  });
  if (dateFrom) params.set("searchCriteria.minTime", dateFrom);
  if (dateTo) params.set("searchCriteria.maxTime", dateTo);

  try {
    const url = `${ADO_API}/${org}/${project}/_apis/git/repositories/${repoId}/pullrequests?${params.toString()}`;
    const response = await adoRequest<AdoListResponse<AdoPullRequestNode>>(token, url);
    return response.value;
  } catch {
    return [];
  }
};

export class AdoRestContributorRepository implements ContributorRepository {
  async listContributors(
    token: string,
    organization: string,
    dateFrom: string | null,
    dateTo: string | null,
  ): Promise<Contributor[]> {
    const projects = await fetchProjects(token, organization);

    const allRepos: AdoRepositoryNode[] = [];
    for (const project of projects) {
      try {
        const repos = await fetchRepos(token, organization, project.name);
        allRepos.push(...repos);
      } catch {
        // skip projects where repo access fails
      }
    }

    const allPRs: AdoPullRequestNode[] = [];
    for (let i = 0; i < allRepos.length; i += BATCH_SIZE) {
      const batch = allRepos.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map((repo) =>
          fetchCompletedPRs(token, organization, repo.project.name, repo.id, dateFrom, dateTo),
        ),
      );
      for (const prs of batchResults) {
        allPRs.push(...prs);
      }
    }

    return mapAdoPullRequestsToContributors(allPRs);
  }
}
