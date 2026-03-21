import { describe, it, expect } from "vitest";
import {
  createRepositoryRepository,
  createContributorRepository,
  createSonarRepository,
  createWakaTimeRepository,
} from "../../../src/main/factories/repository_factory";
import { GitHubGraphQLRepositoryRepository } from "../../../src/infrastructure/repositories/github_graphql_repository_repository";
import { AdoRestRepositoryRepository } from "../../../src/infrastructure/repositories/ado_rest_repository_repository";
import { GitHubGraphQLContributorRepository } from "../../../src/infrastructure/repositories/github_graphql_contributor_repository";
import { AdoRestContributorRepository } from "../../../src/infrastructure/repositories/ado_rest_contributor_repository";
import { SonarRepositoryImpl, NoOpSonarRepository } from "../../../src/infrastructure/repositories/sonar_repository_impl";
import { WakaTimeRepositoryImpl, NoOpWakaTimeRepository } from "../../../src/infrastructure/repositories/wakatime_repository_impl";

describe("repository_factory", () => {
  describe("createRepositoryRepository", () => {
    it("should return GitHubGraphQLRepositoryRepository for github", () => {
      // given / when
      const repo = createRepositoryRepository("github");

      // then
      expect(repo).toBeInstanceOf(GitHubGraphQLRepositoryRepository);
    });

    it("should return AdoRestRepositoryRepository for azure-devops", () => {
      // given / when
      const repo = createRepositoryRepository("azure-devops");

      // then
      expect(repo).toBeInstanceOf(AdoRestRepositoryRepository);
    });
  });

  describe("createContributorRepository", () => {
    it("should return GitHubGraphQLContributorRepository for github", () => {
      // given / when
      const repo = createContributorRepository("github");

      // then
      expect(repo).toBeInstanceOf(GitHubGraphQLContributorRepository);
    });

    it("should return AdoRestContributorRepository for azure-devops", () => {
      // given / when
      const repo = createContributorRepository("azure-devops");

      // then
      expect(repo).toBeInstanceOf(AdoRestContributorRepository);
    });
  });

  describe("createSonarRepository", () => {
    it("should return SonarRepositoryImpl when config is provided", () => {
      // given
      const config = { type: "cloud" as const, token: "tok", baseUrl: "https://sonar.io" };

      // when
      const repo = createSonarRepository(config);

      // then
      expect(repo).toBeInstanceOf(SonarRepositoryImpl);
    });

    it("should return NoOpSonarRepository when no config", () => {
      // given / when
      const repo = createSonarRepository();

      // then
      expect(repo).toBeInstanceOf(NoOpSonarRepository);
    });
  });

  describe("createWakaTimeRepository", () => {
    it("should return WakaTimeRepositoryImpl when token is provided", () => {
      // given / when
      const repo = createWakaTimeRepository("waka-token");

      // then
      expect(repo).toBeInstanceOf(WakaTimeRepositoryImpl);
    });

    it("should return NoOpWakaTimeRepository when no token", () => {
      // given / when
      const repo = createWakaTimeRepository();

      // then
      expect(repo).toBeInstanceOf(NoOpWakaTimeRepository);
    });
  });
});
