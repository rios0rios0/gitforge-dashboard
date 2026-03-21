import { describe, it, expect } from "vitest";
import { createDashboardService, createContributorService } from "../../../src/main/factories/service_factory";
import { GitHubDashboardService } from "../../../src/service/github_dashboard_service";
import { GitHubContributorService } from "../../../src/service/github_contributor_service";
import { StubComplianceRepository } from "../../doubles/stub_compliance_repository";
import { StubRepositoryRepository } from "../../doubles/stub_repository_repository";
import { StubContributorRepository } from "../../doubles/stub_contributor_repository";
import { StubSonarRepository } from "../../doubles/stub_sonar_repository";
import { StubWakaTimeRepository } from "../../doubles/stub_wakatime_repository";

describe("service_factory", () => {
  it("should return GitHubDashboardService instance", () => {
    // given
    const repoRepo = new StubRepositoryRepository();
    const sonarRepo = new StubSonarRepository();
    const complianceRepo = new StubComplianceRepository();

    // when
    const service = createDashboardService(repoRepo, sonarRepo, complianceRepo);

    // then
    expect(service).toBeInstanceOf(GitHubDashboardService);
  });

  it("should return GitHubContributorService instance", () => {
    // given
    const contributorRepo = new StubContributorRepository();
    const sonarRepo = new StubSonarRepository();
    const wakaRepo = new StubWakaTimeRepository();

    // when
    const service = createContributorService(contributorRepo, sonarRepo, wakaRepo);

    // then
    expect(service).toBeInstanceOf(GitHubContributorService);
  });
});
