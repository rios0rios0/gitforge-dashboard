import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RepositoryCard } from "../../../src/presentation/components/repository_card";
import { RepositoryBuilder } from "../../builders/repository_builder";

describe("RepositoryCard", () => {
  it("should render repository name as a link", () => {
    // given
    const repo = RepositoryBuilder.create().withName("my-repo").build();

    // when
    render(<RepositoryCard repository={repo} />);

    // then
    const link = screen.getByText("my-repo");
    expect(link).toBeInTheDocument();
    expect(link.closest("a")).toHaveAttribute("href", "https://github.com/user/my-repo");
  });

  it("should render green status badge when CI status is SUCCESS", () => {
    // given
    const repo = RepositoryBuilder.create().withCiStatus("SUCCESS").build();

    // when
    render(<RepositoryCard repository={repo} />);

    // then
    expect(screen.getByText("Passing")).toBeInTheDocument();
  });

  it("should render release tag name when latestRelease exists", () => {
    // given
    const repo = RepositoryBuilder.create()
      .withLatestRelease({ tagName: "v2.1.0" })
      .build();

    // when
    render(<RepositoryCard repository={repo} />);

    // then
    expect(screen.getByText("v2.1.0")).toBeInTheDocument();
  });

  it("should render 'No releases' when latestRelease is null", () => {
    // given
    const repo = RepositoryBuilder.create().build();

    // when
    render(<RepositoryCard repository={repo} />);

    // then
    expect(screen.getByText("No releases")).toBeInTheDocument();
  });

  it("should render 'archived' badge when repository is archived", () => {
    // given
    const repo = RepositoryBuilder.create().asArchived().build();

    // when
    render(<RepositoryCard repository={repo} />);

    // then
    expect(screen.getByText("archived")).toBeInTheDocument();
  });

  it("should render 'private' badge when repository is private", () => {
    // given
    const repo = RepositoryBuilder.create().asPrivate().build();

    // when
    render(<RepositoryCard repository={repo} />);

    // then
    expect(screen.getByText("private")).toBeInTheDocument();
  });

  it("should render language pill when primaryLanguage exists", () => {
    // given
    const repo = RepositoryBuilder.create().withLanguage("Go").build();

    // when
    render(<RepositoryCard repository={repo} />);

    // then
    expect(screen.getByText("Go")).toBeInTheDocument();
  });
});
