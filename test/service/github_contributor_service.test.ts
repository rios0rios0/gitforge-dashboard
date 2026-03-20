import { describe, expect, it } from "vitest";
import { GitHubContributorService } from "../../src/service/github_contributor_service";
import { ContributorBuilder } from "../builders/contributor_builder";
import { StubContributorRepository } from "../doubles/stub_contributor_repository";
import { StubSonarCloudRepository } from "../doubles/stub_sonar_cloud_repository";

describe("GitHubContributorService", () => {
  it("should return contributors without SonarCloud metrics when no projects exist", async () => {
    // given
    const contributors = [
      ContributorBuilder.create().withUsername("alice").withLinesOfCode(500).build(),
    ];
    const contributorRepo = new StubContributorRepository().withContributors(contributors);
    const sonarRepo = new StubSonarCloudRepository().withProjectKeys([]);
    const service = new GitHubContributorService(contributorRepo, sonarRepo);

    // when
    const result = await service.listContributors("token", "user", null, null);

    // then
    expect(result).toHaveLength(1);
    expect(result[0].username).toBe("alice");
    expect(result[0].sonarCloudMetrics).toBeNull();
  });

  it("should distribute SonarCloud metrics proportionally by lines of code", async () => {
    // given
    const contributors = [
      ContributorBuilder.create().withUsername("alice").withLinesOfCode(750).build(),
      ContributorBuilder.create().withUsername("bob").withLinesOfCode(250).build(),
    ];
    const contributorRepo = new StubContributorRepository().withContributors(contributors);
    const sonarRepo = new StubSonarCloudRepository()
      .withProjectKeys(["proj-1"])
      .withProjectMetrics("proj-1", {
        bugs: 20,
        codeSmells: 100,
        securityHotspots: 4,
        vulnerabilities: 8,
        coverage: 80,
        duplications: 10,
        technicalDebt: "1d 2h 0min",
      });
    const service = new GitHubContributorService(contributorRepo, sonarRepo);

    // when
    const result = await service.listContributors("token", "user", null, null);

    // then
    expect(result).toHaveLength(2);
    expect(result[0].sonarCloudMetrics?.bugs).toBe(15);
    expect(result[1].sonarCloudMetrics?.bugs).toBe(5);
    expect(result[0].sonarCloudMetrics?.codeSmells).toBe(75);
    expect(result[1].sonarCloudMetrics?.codeSmells).toBe(25);
  });

  it("should return contributors without metrics when totalLines is zero", async () => {
    // given
    const contributors = [
      ContributorBuilder.create().withUsername("alice").withLinesOfCode(0).build(),
    ];
    const contributorRepo = new StubContributorRepository().withContributors(contributors);
    const sonarRepo = new StubSonarCloudRepository()
      .withProjectKeys(["proj-1"])
      .withProjectMetrics("proj-1", {
        bugs: 10,
        codeSmells: 20,
        securityHotspots: 0,
        vulnerabilities: 0,
        coverage: 80,
        duplications: 5,
        technicalDebt: "0min",
      });
    const service = new GitHubContributorService(contributorRepo, sonarRepo);

    // when
    const result = await service.listContributors("token", "user", null, null);

    // then
    expect(result).toHaveLength(1);
    expect(result[0].sonarCloudMetrics).toBeNull();
  });

  it("should return contributors without metrics when all project fetches return null", async () => {
    // given
    const contributors = [
      ContributorBuilder.create().withUsername("alice").withLinesOfCode(500).build(),
    ];
    const contributorRepo = new StubContributorRepository().withContributors(contributors);
    const sonarRepo = new StubSonarCloudRepository()
      .withProjectKeys(["proj-1"])
      .withProjectMetrics("proj-1", null);
    const service = new GitHubContributorService(contributorRepo, sonarRepo);

    // when
    const result = await service.listContributors("token", "user", null, null);

    // then
    expect(result).toHaveLength(1);
    expect(result[0].sonarCloudMetrics).toBeNull();
  });

  it("should propagate error when contributor repository fetch fails", async () => {
    // given
    const contributorRepo = new StubContributorRepository().withError(new Error("API failure"));
    const sonarRepo = new StubSonarCloudRepository();
    const service = new GitHubContributorService(contributorRepo, sonarRepo);

    // when / then
    await expect(service.listContributors("token", "user", null, null)).rejects.toThrow(
      "API failure",
    );
  });
});
