import type { SonarCloudMetrics } from "../../src/domain/entities/sonar_cloud_metrics";
import type { SonarCloudRepository } from "../../src/domain/repositories/sonar_cloud_repository";

export class StubSonarCloudRepository implements SonarCloudRepository {
  private projectKeys: string[] = [];
  private projectMetrics: Map<string, SonarCloudMetrics | null> = new Map();

  withProjectKeys(keys: string[]): this {
    this.projectKeys = keys;
    return this;
  }

  withProjectMetrics(key: string, metrics: SonarCloudMetrics | null): this {
    this.projectMetrics.set(key, metrics);
    return this;
  }

  async getMetricsByAuthor(
    _organization: string,
    _author: string,
  ): Promise<SonarCloudMetrics | null> {
    return null;
  }

  async getProjectMetrics(projectKey: string): Promise<SonarCloudMetrics | null> {
    return this.projectMetrics.get(projectKey) ?? null;
  }

  async listProjectKeys(_organization: string): Promise<string[]> {
    return this.projectKeys;
  }
}
