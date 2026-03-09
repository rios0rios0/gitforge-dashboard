import type { AuthenticationService } from "../../domain/services/authentication_service";
import type { DashboardService } from "../../domain/services/dashboard_service";
import type { RepositoryRepository } from "../../domain/repositories/repository_repository";
import { LocalStorageAuthenticationService } from "../../infrastructure/services/local_storage_authentication_service";
import { GitHubDashboardService } from "../../service/github_dashboard_service";

export const createAuthenticationService = (): AuthenticationService =>
  new LocalStorageAuthenticationService();

export const createDashboardService = (
  repositoryRepository: RepositoryRepository,
): DashboardService => new GitHubDashboardService(repositoryRepository);
