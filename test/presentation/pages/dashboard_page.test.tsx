import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { DashboardPage } from "../../../src/presentation/pages/dashboard_page";
import { StubDashboardService } from "../../doubles/stub_dashboard_service";
import { RepositoryBuilder } from "../../builders/repository_builder";

describe("DashboardPage", () => {
  it("should render RepositoryTable with fetched repositories", async () => {
    // given
    const repos = [RepositoryBuilder.create().withName("test-repo").build()];
    const service = new StubDashboardService().withRepositories(repos);

    // when
    render(
      <DashboardPage
        dashboardService={service}
        token="token"
        username="user"
      />,
    );

    // then
    await waitFor(() => {
      expect(screen.getByText("user/test-repo")).toBeInTheDocument();
    });
  });

  it("should display error message when fetch fails", async () => {
    // given
    const service = new StubDashboardService().withError(new Error("Server error"));

    // when
    render(
      <DashboardPage
        dashboardService={service}
        token="token"
        username="user"
      />,
    );

    // then
    await waitFor(() => {
      expect(screen.getByText("Server error")).toBeInTheDocument();
    });
  });

  it("should call onRefetchRef with refetch function", async () => {
    // given
    const service = new StubDashboardService().withRepositories([]);
    const onRefetchRef = vi.fn();

    // when
    render(
      <DashboardPage
        dashboardService={service}
        token="token"
        username="user"
        onRefetchRef={onRefetchRef}
      />,
    );

    // then
    await waitFor(() => {
      expect(onRefetchRef).toHaveBeenCalledWith(expect.any(Function));
    });
  });
});
