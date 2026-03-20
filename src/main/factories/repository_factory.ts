import type { ContributorRepository } from "../../domain/repositories/contributor_repository";
import type { RepositoryRepository } from "../../domain/repositories/repository_repository";
import type { SonarCloudRepository } from "../../domain/repositories/sonar_cloud_repository";
import { GitHubGraphQLContributorRepository } from "../../infrastructure/repositories/github_graphql_contributor_repository";
import { GitHubGraphQLRepositoryRepository } from "../../infrastructure/repositories/github_graphql_repository_repository";
import { NoOpSonarCloudRepository, SonarCloudRepositoryImpl } from "../../infrastructure/repositories/sonar_cloud_repository_impl";

export const createRepositoryRepository = (): RepositoryRepository =>
  new GitHubGraphQLRepositoryRepository();

export const createContributorRepository = (): ContributorRepository =>
  new GitHubGraphQLContributorRepository();

export const createSonarCloudRepository = (sonarToken?: string): SonarCloudRepository =>
  sonarToken ? new SonarCloudRepositoryImpl(sonarToken) : new NoOpSonarCloudRepository();
