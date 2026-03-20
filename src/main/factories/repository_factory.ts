import type { Platform } from "../../domain/entities/platform";
import type { ContributorRepository } from "../../domain/repositories/contributor_repository";
import type { RepositoryRepository } from "../../domain/repositories/repository_repository";
import type { SonarRepository } from "../../domain/repositories/sonar_repository";
import { AdoRestContributorRepository } from "../../infrastructure/repositories/ado_rest_contributor_repository";
import { AdoRestRepositoryRepository } from "../../infrastructure/repositories/ado_rest_repository_repository";
import { GitHubGraphQLContributorRepository } from "../../infrastructure/repositories/github_graphql_contributor_repository";
import { GitHubGraphQLRepositoryRepository } from "../../infrastructure/repositories/github_graphql_repository_repository";
import { NoOpSonarRepository, type SonarConfig, SonarRepositoryImpl } from "../../infrastructure/repositories/sonar_repository_impl";
import type { WakaTimeRepository } from "../../domain/repositories/wakatime_repository";
import { NoOpWakaTimeRepository, WakaTimeRepositoryImpl } from "../../infrastructure/repositories/wakatime_repository_impl";

const repositoryHandlers: Record<Platform, () => RepositoryRepository> = {
  github: () => new GitHubGraphQLRepositoryRepository(),
  "azure-devops": () => new AdoRestRepositoryRepository(),
};

const contributorHandlers: Record<Platform, () => ContributorRepository> = {
  github: () => new GitHubGraphQLContributorRepository(),
  "azure-devops": () => new AdoRestContributorRepository(),
};

export const createRepositoryRepository = (platform: Platform): RepositoryRepository => {
  const handler = repositoryHandlers[platform];
  return handler();
};

export const createContributorRepository = (platform: Platform): ContributorRepository => {
  const handler = contributorHandlers[platform];
  return handler();
};

export const createSonarRepository = (config?: SonarConfig): SonarRepository =>
  config ? new SonarRepositoryImpl(config) : new NoOpSonarRepository();

export const createWakaTimeRepository = (token?: string): WakaTimeRepository =>
  token ? new WakaTimeRepositoryImpl(token) : new NoOpWakaTimeRepository();
