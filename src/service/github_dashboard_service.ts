import type { ComplianceStatus } from "../domain/entities/compliance_status";
import type { Repository } from "../domain/entities/repository";
import type { ComplianceRepository } from "../domain/repositories/compliance_repository";
import type { RepositoryRepository } from "../domain/repositories/repository_repository";
import type { SonarRepository } from "../domain/repositories/sonar_repository";
import type { DashboardService } from "../domain/services/dashboard_service";

const BATCH_SIZE = 10;

const matchRepoToProject = (repoName: string, projectKey: string): boolean =>
  projectKey.toLowerCase().includes(repoName.toLowerCase());

export class GitHubDashboardService implements DashboardService {
  private readonly repositoryRepository: RepositoryRepository;
  private readonly sonarRepository: SonarRepository;
  private readonly complianceRepository: ComplianceRepository;

  constructor(
    repositoryRepository: RepositoryRepository,
    sonarRepository: SonarRepository,
    complianceRepository: ComplianceRepository,
  ) {
    this.repositoryRepository = repositoryRepository;
    this.sonarRepository = sonarRepository;
    this.complianceRepository = complianceRepository;
  }

  async listRepositories(token: string, username: string): Promise<Repository[]> {
    const repos = await this.repositoryRepository.listAll(token, username);
    const withSonar = await this.enrichWithSonar(repos);
    return this.enrichWithCompliance(withSonar, token);
  }

  private async enrichWithSonar(repos: Repository[]): Promise<Repository[]> {
    const projectKeys = await this.sonarRepository.listProjectKeys();
    if (projectKeys.length === 0) return repos;

    const repoToProject = new Map<string, string>();
    for (const repo of repos) {
      const matched = projectKeys.find((key) => matchRepoToProject(repo.name, key));
      if (matched) repoToProject.set(repo.id, matched);
    }

    if (repoToProject.size === 0) return repos;

    const metricsMap = new Map<string, Awaited<ReturnType<SonarRepository["getProjectMetrics"]>>>();
    const entries = [...repoToProject.entries()];
    for (let i = 0; i < entries.length; i += BATCH_SIZE) {
      const batch = entries.slice(i, i + BATCH_SIZE);
      const results = await Promise.all(
        batch.map(async ([repoId, projectKey]) => {
          const metrics = await this.sonarRepository.getProjectMetrics(projectKey);
          return [repoId, metrics] as const;
        }),
      );
      for (const [repoId, metrics] of results) {
        metricsMap.set(repoId, metrics);
      }
    }

    return repos.map((repo) => ({
      ...repo,
      sonarMetrics: metricsMap.get(repo.id) ?? null,
    }));
  }

  private async enrichWithCompliance(repos: Repository[], token: string): Promise<Repository[]> {
    const complianceMap = new Map<string, ComplianceStatus | null>();

    for (let i = 0; i < repos.length; i += BATCH_SIZE) {
      const batch = repos.slice(i, i + BATCH_SIZE);
      const results = await Promise.all(
        batch.map(async (repo) => {
          const parts = repo.fullName.split("/");
          const owner = parts.length >= 3 ? `${parts[0]}/${parts[1]}` : parts[0];
          const status = await this.complianceRepository.getComplianceStatus(
            token,
            owner,
            repo.name,
            repo.defaultBranch,
          );
          return [repo.id, status] as const;
        }),
      );
      for (const [repoId, status] of results) {
        complianceMap.set(repoId, status);
      }
    }

    return repos.map((repo) => ({
      ...repo,
      complianceStatus: complianceMap.get(repo.id) ?? null,
    }));
  }
}
