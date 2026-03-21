import type { Repository } from "../domain/entities/repository";
import type { RepositoryRepository } from "../domain/repositories/repository_repository";
import type { SonarRepository } from "../domain/repositories/sonar_repository";
import type { DashboardService } from "../domain/services/dashboard_service";

const BATCH_SIZE = 10;

const matchRepoToProject = (repoName: string, projectKey: string): boolean =>
  projectKey.toLowerCase().includes(repoName.toLowerCase());

export class GitHubDashboardService implements DashboardService {
  private readonly repositoryRepository: RepositoryRepository;
  private readonly sonarRepository: SonarRepository;

  constructor(repositoryRepository: RepositoryRepository, sonarRepository: SonarRepository) {
    this.repositoryRepository = repositoryRepository;
    this.sonarRepository = sonarRepository;
  }

  async listRepositories(token: string, username: string): Promise<Repository[]> {
    const repos = await this.repositoryRepository.listAll(token, username);

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
}
