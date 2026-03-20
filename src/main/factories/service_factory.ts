import type { AuthenticationService } from "../../domain/services/authentication_service";
import type { ContributorService } from "../../domain/services/contributor_service";
import type { DashboardService } from "../../domain/services/dashboard_service";
import type { ContributorRepository } from "../../domain/repositories/contributor_repository";
import type { RepositoryRepository } from "../../domain/repositories/repository_repository";
import type { SonarCloudRepository } from "../../domain/repositories/sonar_cloud_repository";
import { LocalStorageAuthenticationService } from "../../infrastructure/services/local_storage_authentication_service";
import { GitHubDashboardService } from "../../service/github_dashboard_service";
import { GitHubContributorService } from "../../service/github_contributor_service";

export const createAuthenticationService = (): AuthenticationService =>
  new LocalStorageAuthenticationService();

export const createDashboardService = (
  repositoryRepository: RepositoryRepository,
): DashboardService => new GitHubDashboardService(repositoryRepository);

export const createContributorService = (
  contributorRepository: ContributorRepository,
  sonarCloudRepository: SonarCloudRepository,
): ContributorService =>
  new GitHubContributorService(contributorRepository, sonarCloudRepository);
