import type { RepositoryRepository } from "../../domain/repositories/repository_repository";
import { GitHubGraphQLRepositoryRepository } from "../../infrastructure/repositories/github_graphql_repository_repository";

export const createRepositoryRepository = (): RepositoryRepository =>
  new GitHubGraphQLRepositoryRepository();
