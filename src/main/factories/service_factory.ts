import type { AuthenticationService } from "../../domain/services/authentication_service";
import type { ContributorService } from "../../domain/services/contributor_service";
import type { DashboardService } from "../../domain/services/dashboard_service";
import type { ContributorRepository } from "../../domain/repositories/contributor_repository";
import type { RepositoryRepository } from "../../domain/repositories/repository_repository";
import type { SonarRepository } from "../../domain/repositories/sonar_repository";
import type { WakaTimeRepository } from "../../domain/repositories/wakatime_repository";
import { EncryptedAuthenticationService } from "../../infrastructure/services/encrypted_authentication_service";
import { LocalStorageAuthenticationService } from "../../infrastructure/services/local_storage_authentication_service";
import { GitHubDashboardService } from "../../service/github_dashboard_service";
import { GitHubContributorService } from "../../service/github_contributor_service";

export const createAuthenticationService = async (): Promise<AuthenticationService> => {
  const delegate = new LocalStorageAuthenticationService();
  return EncryptedAuthenticationService.create(delegate);
};

export const createDashboardService = (
  repositoryRepository: RepositoryRepository,
  sonarRepository: SonarRepository,
): DashboardService => new GitHubDashboardService(repositoryRepository, sonarRepository);

export const createContributorService = (
  contributorRepository: ContributorRepository,
  sonarRepository: SonarRepository,
  wakaTimeRepository: WakaTimeRepository,
): ContributorService =>
  new GitHubContributorService(contributorRepository, sonarRepository, wakaTimeRepository);
