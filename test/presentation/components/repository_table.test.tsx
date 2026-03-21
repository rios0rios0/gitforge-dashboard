import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RepositoryTable } from "../../../src/presentation/components/repository_table";
import { RepositoryBuilder } from "../../builders/repository_builder";

describe("RepositoryTable", () => {
  it("should render 'No repositories found.' when repositories is empty and not loading", () => {
    // given / when
    render(<RepositoryTable repositories={[]} totalCount={0} isLoading={false} />);

    // then
    expect(screen.getByText("No repositories found.")).toBeInTheDocument();
  });

  it("should render loading skeleton when isLoading is true", () => {
    // given / when
    const { container } = render(
      <RepositoryTable repositories={[]} totalCount={0} isLoading={true} />,
    );

    // then
    const skeletonRows = container.querySelectorAll("tr.animate-pulse");
    expect(skeletonRows.length).toBeGreaterThan(0);
  });

  it("should render repository rows with name, CI status, and language", () => {
    // given
    const repos = [
      RepositoryBuilder.create()
        .withName("my-repo")
        .withLanguage("TypeScript")
        .withCiStatus("SUCCESS")
        .build(),
    ];

    // when
    render(<RepositoryTable repositories={repos} totalCount={1} isLoading={false} />);

    // then
    expect(screen.getByText("user/my-repo")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
  });

  it("should render archived badge for archived repos", () => {
    // given
    const repos = [RepositoryBuilder.create().withName("old-repo").asArchived().build()];

    // when
    render(<RepositoryTable repositories={repos} totalCount={1} isLoading={false} />);

    // then - archived repos are hidden by default, need to check the checkbox
    fireEvent.click(screen.getByLabelText("Archived"));
    expect(screen.getByText("archived")).toBeInTheDocument();
  });

  it("should render fork badge for forked repos", () => {
    // given
    const repos = [RepositoryBuilder.create().withName("fork-repo").asFork().build()];

    // when
    render(<RepositoryTable repositories={repos} totalCount={1} isLoading={false} />);

    // then - forks are hidden by default
    fireEvent.click(screen.getByLabelText("Forks"));
    expect(screen.getByText("fork")).toBeInTheDocument();
  });

  it("should show repository count", () => {
    // given
    const repos = [
      RepositoryBuilder.create().withName("repo-1").build(),
      RepositoryBuilder.create().withName("repo-2").build(),
    ];

    // when
    render(<RepositoryTable repositories={repos} totalCount={5} isLoading={false} />);

    // then
    expect(screen.getByText(/2 of 5 repositories/)).toBeInTheDocument();
  });

  it("should filter archived repos by default (showArchived off)", () => {
    // given
    const repos = [
      RepositoryBuilder.create().withName("active").build(),
      RepositoryBuilder.create().withName("old").asArchived().build(),
    ];

    // when
    render(<RepositoryTable repositories={repos} totalCount={2} isLoading={false} />);

    // then
    expect(screen.getByText("user/active")).toBeInTheDocument();
    expect(screen.queryByText("user/old")).not.toBeInTheDocument();
  });

  it("should show archived repos when checkbox is checked", () => {
    // given
    const repos = [
      RepositoryBuilder.create().withName("active").build(),
      RepositoryBuilder.create().withName("old").asArchived().build(),
    ];
    render(<RepositoryTable repositories={repos} totalCount={2} isLoading={false} />);

    // when
    fireEvent.click(screen.getByLabelText("Archived"));

    // then
    expect(screen.getByText("user/old")).toBeInTheDocument();
  });

  it("should show fork repos when checkbox is checked", () => {
    // given
    const repos = [
      RepositoryBuilder.create().withName("mine").build(),
      RepositoryBuilder.create().withName("forked").asFork().build(),
    ];
    render(<RepositoryTable repositories={repos} totalCount={2} isLoading={false} />);

    // when
    fireEvent.click(screen.getByLabelText("Forks"));

    // then
    expect(screen.getByText("user/forked")).toBeInTheDocument();
  });

  it("should render release tag and relative date", () => {
    // given
    const repos = [
      RepositoryBuilder.create()
        .withName("released")
        .withLatestRelease({
          tagName: "v2.0.0",
          publishedAt: new Date().toISOString(),
        })
        .build(),
    ];

    // when
    render(<RepositoryTable repositories={repos} totalCount={1} isLoading={false} />);

    // then
    expect(screen.getByText("v2.0.0")).toBeInTheDocument();
    expect(screen.getByText("today")).toBeInTheDocument();
  });

  it("should render 'private' badge for private repos", () => {
    // given
    const repos = [RepositoryBuilder.create().withName("secret").asPrivate().build()];

    // when
    render(<RepositoryTable repositories={repos} totalCount={1} isLoading={false} />);

    // then
    expect(screen.getByText("private")).toBeInTheDocument();
  });

  it("should render Sonar quality gate Passed status", () => {
    // given
    const repos = [
      {
        ...RepositoryBuilder.create().withName("sonar-ok").build(),
        sonarMetrics: {
          bugs: 0,
          codeSmells: 0,
          securityHotspots: 0,
          vulnerabilities: 0,
          coverage: 90,
          duplications: 1,
          technicalDebt: "0min",
          qualityGateStatus: "OK" as const,
        },
      },
    ];

    // when
    render(<RepositoryTable repositories={repos} totalCount={1} isLoading={false} />);

    // then
    expect(screen.getByText("Passed")).toBeInTheDocument();
  });

  it("should render Sonar quality gate Failed status", () => {
    // given
    const repos = [
      {
        ...RepositoryBuilder.create().withName("sonar-fail").build(),
        sonarMetrics: {
          bugs: 5,
          codeSmells: 10,
          securityHotspots: 1,
          vulnerabilities: 2,
          coverage: 20,
          duplications: 15,
          technicalDebt: "5d",
          qualityGateStatus: "ERROR" as const,
        },
      },
    ];

    // when
    render(<RepositoryTable repositories={repos} totalCount={1} isLoading={false} />);

    // then
    expect(screen.getByText("Failed")).toBeInTheDocument();
  });
});
