import type { Repository } from "../domain/entities/repository";
import type { RepositoryRepository } from "../domain/repositories/repository_repository";
import type { DashboardService } from "../domain/services/dashboard_service";

export class GitHubDashboardService implements DashboardService {
  private readonly repositoryRepository: RepositoryRepository;

  constructor(repositoryRepository: RepositoryRepository) {
    this.repositoryRepository = repositoryRepository;
  }

  async listRepositories(token: string, username: string): Promise<Repository[]> {
    return this.repositoryRepository.listAll(token, username);
  }
}
