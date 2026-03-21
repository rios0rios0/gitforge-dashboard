import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Navigation } from "../../../src/presentation/components/navigation";

describe("Navigation", () => {
  const defaultProps = {
    activePage: "dashboard" as const,
    username: "testuser",
    lastFetchedAt: null as Date | null,
    refreshInterval: 300000 as const,
    isLoading: false,
    theme: "dark" as const,
    onPageChange: vi.fn(),
    onRefresh: vi.fn(),
    onIntervalChange: vi.fn(),
    onToggleTheme: vi.fn(),
    onLogout: vi.fn(),
  };

  it("should render username", () => {
    // given / when
    render(<Navigation {...defaultProps} />);

    // then
    expect(screen.getByText("testuser")).toBeInTheDocument();
  });

  it("should render all three nav items", () => {
    // given / when
    render(<Navigation {...defaultProps} />);

    // then
    expect(screen.getByText("Repositories")).toBeInTheDocument();
    expect(screen.getByText("Contributors")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("should highlight active page", () => {
    // given / when
    render(<Navigation {...defaultProps} activePage="contributors" />);

    // then
    const contributorsBtn = screen.getByText("Contributors");
    expect(contributorsBtn.className).toContain("bg-blue-100");
  });

  it("should call onPageChange when nav item is clicked", () => {
    // given
    const onPageChange = vi.fn();
    render(<Navigation {...defaultProps} onPageChange={onPageChange} />);

    // when
    fireEvent.click(screen.getByText("Contributors"));

    // then
    expect(onPageChange).toHaveBeenCalledWith("contributors");
  });

  it("should call onRefresh when Refresh button is clicked", () => {
    // given
    const onRefresh = vi.fn();
    render(<Navigation {...defaultProps} onRefresh={onRefresh} />);

    // when
    fireEvent.click(screen.getByText("Refresh"));

    // then
    expect(onRefresh).toHaveBeenCalled();
  });

  it("should display 'Loading...' when isLoading is true", () => {
    // given / when
    render(<Navigation {...defaultProps} isLoading={true} />);

    // then
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should call onLogout when Disconnect is clicked", () => {
    // given
    const onLogout = vi.fn();
    render(<Navigation {...defaultProps} onLogout={onLogout} />);

    // when
    fireEvent.click(screen.getByText("Disconnect"));

    // then
    expect(onLogout).toHaveBeenCalled();
  });

  it("should call onToggleTheme when theme button is clicked", () => {
    // given
    const onToggleTheme = vi.fn();
    render(<Navigation {...defaultProps} onToggleTheme={onToggleTheme} />);

    // when
    fireEvent.click(screen.getByLabelText("Toggle theme"));

    // then
    expect(onToggleTheme).toHaveBeenCalled();
  });

  it("should render last updated time when lastFetchedAt is provided", () => {
    // given
    const date = new Date("2026-03-21T10:30:00Z");

    // when
    render(<Navigation {...defaultProps} lastFetchedAt={date} />);

    // then
    expect(screen.getByText(/Last updated/)).toBeInTheDocument();
  });
});
