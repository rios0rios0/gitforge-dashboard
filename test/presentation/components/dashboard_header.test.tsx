import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DashboardHeader } from "../../../src/presentation/components/dashboard_header";

describe("DashboardHeader", () => {
  const defaultProps = {
    username: "testuser",
    lastFetchedAt: null as Date | null,
    refreshInterval: 300000 as const,
    isLoading: false,
    onRefresh: vi.fn(),
    onIntervalChange: vi.fn(),
    onLogout: vi.fn(),
  };

  it("should render username", () => {
    // given / when
    render(<DashboardHeader {...defaultProps} />);

    // then
    expect(screen.getByText("testuser")).toBeInTheDocument();
  });

  it("should render last updated time", () => {
    // given
    const date = new Date("2026-03-21T10:30:00Z");

    // when
    render(<DashboardHeader {...defaultProps} lastFetchedAt={date} />);

    // then
    expect(screen.getByText(/Last updated/)).toBeInTheDocument();
  });

  it("should call onRefresh when Refresh button is clicked", () => {
    // given
    const onRefresh = vi.fn();
    render(<DashboardHeader {...defaultProps} onRefresh={onRefresh} />);

    // when
    fireEvent.click(screen.getByText("Refresh"));

    // then
    expect(onRefresh).toHaveBeenCalled();
  });

  it("should disable Refresh button when isLoading is true", () => {
    // given / when
    render(<DashboardHeader {...defaultProps} isLoading={true} />);

    // then
    expect(screen.getByText("Loading...")).toBeDisabled();
  });

  it("should call onLogout when Disconnect is clicked", () => {
    // given
    const onLogout = vi.fn();
    render(<DashboardHeader {...defaultProps} onLogout={onLogout} />);

    // when
    fireEvent.click(screen.getByText("Disconnect"));

    // then
    expect(onLogout).toHaveBeenCalled();
  });

  it("should call onIntervalChange when select value changes", () => {
    // given
    const onIntervalChange = vi.fn();
    render(<DashboardHeader {...defaultProps} onIntervalChange={onIntervalChange} />);

    // when
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "60000" } });

    // then
    expect(onIntervalChange).toHaveBeenCalledWith(60000);
  });
});
