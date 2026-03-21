import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SettingsPage } from "../../../src/presentation/pages/settings_page";

const defaultProps = {
  token: "ghp_test123",
  username: "testuser",
  platform: "github" as const,
  sonarToken: "squ_sonar123",
  sonarType: "cloud" as const,
  sonarUrl: null,
  wakaTimeToken: "wk_test123",
  onUpdateVcs: vi.fn(),
  onUpdateSonar: vi.fn(),
  onUpdateWakaTime: vi.fn(),
};

describe("SettingsPage", () => {
  it("should render three integration cards when all integrations are configured", () => {
    // given / when
    render(<SettingsPage {...defaultProps} />);

    // then
    expect(screen.getByRole("heading", { name: "GitHub" })).toBeInTheDocument();
    expect(screen.getByText("Code Quality (Sonar)")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "WakaTime" })).toBeInTheDocument();
    expect(screen.getAllByText("Connected")).toHaveLength(3);
  });

  it("should render Sonar card as disconnected when no Sonar token exists", () => {
    // given
    const props = { ...defaultProps, sonarToken: null, sonarType: null, onUpdateSonar: vi.fn() };

    // when
    render(<SettingsPage {...props} />);

    // then
    expect(screen.getAllByText("Connected")).toHaveLength(2);
    expect(screen.getByText("Disconnected")).toBeInTheDocument();
  });

  it("should call onUpdateSonar with null when Sonar disconnect button is clicked", () => {
    // given
    const onUpdateSonar = vi.fn();
    render(<SettingsPage {...defaultProps} onUpdateSonar={onUpdateSonar} />);

    // when
    const disconnectButtons = screen.getAllByText("Disconnect");
    fireEvent.click(disconnectButtons[0]);

    // then
    expect(onUpdateSonar).toHaveBeenCalledWith(null);
  });

  it("should call onUpdateWakaTime with null when WakaTime disconnect button is clicked", () => {
    // given
    const onUpdateWakaTime = vi.fn();
    render(<SettingsPage {...defaultProps} onUpdateWakaTime={onUpdateWakaTime} />);

    // when
    const disconnectButtons = screen.getAllByText("Disconnect");
    fireEvent.click(disconnectButtons[1]);

    // then
    expect(onUpdateWakaTime).toHaveBeenCalledWith(null);
  });

  it("should not show disconnect button for VCS card", () => {
    // given / when
    render(<SettingsPage {...defaultProps} />);

    // then
    // VCS card has Edit only, Sonar and WakaTime have Edit + Disconnect = 2 Disconnect buttons total
    expect(screen.getAllByText("Disconnect")).toHaveLength(2);
    expect(screen.getAllByText("Edit")).toHaveLength(3);
  });
});
