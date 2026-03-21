import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { ContributorsPage } from "../../../src/presentation/pages/contributors_page";
import { StubContributorService } from "../../doubles/stub_contributor_service";
import { ContributorBuilder } from "../../builders/contributor_builder";

describe("ContributorsPage", () => {
  it("should render ContributorsTable with fetched contributors", async () => {
    // given
    const contributors = [ContributorBuilder.create().withUsername("alice").build()];
    const service = new StubContributorService().withContributors(contributors);

    // when
    render(
      <ContributorsPage
        contributorService={service}
        token="token"
        username="user"
      />,
    );

    // then
    await waitFor(() => {
      expect(screen.getByText("alice")).toBeInTheDocument();
    });
  });

  it("should display error message when fetch fails", async () => {
    // given
    const service = new StubContributorService().withError(new Error("Auth failed"));

    // when
    render(
      <ContributorsPage
        contributorService={service}
        token="token"
        username="user"
      />,
    );

    // then
    await waitFor(() => {
      expect(screen.getByText("Auth failed")).toBeInTheDocument();
    });
  });
});
