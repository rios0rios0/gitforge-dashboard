import type { SonarCloudMetrics } from "../entities/sonar_cloud_metrics";

export interface SonarCloudRepository {
  getMetricsByAuthor(
    organization: string,
    author: string,
  ): Promise<SonarCloudMetrics | null>;

  getProjectMetrics(
    projectKey: string,
  ): Promise<SonarCloudMetrics | null>;

  listProjectKeys(organization: string): Promise<string[]>;
}
