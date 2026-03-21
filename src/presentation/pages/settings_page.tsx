import { useState } from "react";
import type { Platform } from "../../domain/entities/platform";
import type { SonarLoginInfo, SonarType } from "../hooks/use_authentication";
import { IntegrationCard } from "../components/integration_card";

interface SettingsPageProps {
  token: string;
  username: string;
  platform: Platform;
  sonarToken: string | null;
  sonarType: SonarType | null;
  sonarUrl: string | null;
  wakaTimeToken: string | null;
  onUpdateVcs: (token: string, username: string, platform: Platform) => void;
  onUpdateSonar: (sonar: SonarLoginInfo | null) => void;
  onUpdateWakaTime: (token: string | null) => void;
}

const PLATFORM_OPTIONS: { value: Platform; label: string }[] = [
  { value: "github", label: "GitHub" },
  { value: "azure-devops", label: "Azure DevOps" },
];

const SONAR_OPTIONS: { value: SonarType | "none"; label: string }[] = [
  { value: "none", label: "None" },
  { value: "cloud", label: "SonarCloud" },
  { value: "qube", label: "SonarQube" },
];

const inputClass =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100";

const labelClass = "mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300";

const toggleContainerClass =
  "flex rounded-md border border-gray-200 bg-gray-50 p-1 dark:border-gray-600 dark:bg-gray-700";

const toggleActiveClass = "bg-white text-gray-900 shadow-sm dark:bg-gray-600 dark:text-gray-100";
const toggleInactiveClass = "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200";

export const SettingsPage = ({
  token,
  username,
  platform,
  sonarToken,
  sonarType,
  sonarUrl,
  wakaTimeToken,
  onUpdateVcs,
  onUpdateSonar,
  onUpdateWakaTime,
}: SettingsPageProps) => {
  const [vcsToken, setVcsToken] = useState(token);
  const [vcsUsername, setVcsUsername] = useState(username);
  const [vcsPlatform, setVcsPlatform] = useState<Platform>(platform);

  const [localSonarType, setLocalSonarType] = useState<SonarType | "none">(sonarType ?? "none");
  const [localSonarToken, setLocalSonarToken] = useState(sonarToken ?? "");
  const [localSonarUrl, setLocalSonarUrl] = useState(sonarUrl ?? "");

  const [localWakaTimeToken, setLocalWakaTimeToken] = useState(wakaTimeToken ?? "");

  const handleVcsSave = () => {
    if (vcsToken.trim() && vcsUsername.trim()) {
      onUpdateVcs(vcsToken.trim(), vcsUsername.trim(), vcsPlatform);
    }
  };

  const handleSonarSave = () => {
    const trimmedToken = localSonarToken.trim();
    const trimmedUrl = localSonarUrl.trim();

    if (localSonarType === "none" || !trimmedToken) {
      onUpdateSonar(null);
      return;
    }

    if (localSonarType === "qube" && !trimmedUrl) {
      return;
    }

    onUpdateSonar({
      type: localSonarType,
      token: trimmedToken,
      url: localSonarType === "qube" ? trimmedUrl : undefined,
    });
  };

  const handleSonarDisconnect = () => {
    onUpdateSonar(null);
    setLocalSonarType("none");
    setLocalSonarToken("");
    setLocalSonarUrl("");
  };

  const handleWakaTimeSave = () => {
    const trimmed = localWakaTimeToken.trim();
    onUpdateWakaTime(trimmed || null);
  };

  const handleVcsCancel = () => {
    setVcsToken(token);
    setVcsUsername(username);
    setVcsPlatform(platform);
  };

  const handleSonarCancel = () => {
    setLocalSonarType(sonarType ?? "none");
    setLocalSonarToken(sonarToken ?? "");
    setLocalSonarUrl(sonarUrl ?? "");
  };

  const handleWakaTimeDisconnect = () => {
    onUpdateWakaTime(null);
    setLocalWakaTimeToken("");
  };

  const handleWakaTimeCancel = () => {
    setLocalWakaTimeToken(wakaTimeToken ?? "");
  };

  const isGitHub = vcsPlatform === "github";

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Settings</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Manage your integration tokens. Tokens are encrypted and stored locally in your browser.
      </p>

      <IntegrationCard
        title={isGitHub ? "GitHub" : "Azure DevOps"}
        description="Version control platform for repository data, CI status, and releases."
        status="connected"
        isRequired
        onSave={handleVcsSave}
        onCancel={handleVcsCancel}
      >
        {(editing) => (
          <>
            <div className={toggleContainerClass}>
              {PLATFORM_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  disabled={!editing}
                  onClick={() => setVcsPlatform(opt.value)}
                  className={`flex-1 rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                    vcsPlatform === opt.value ? toggleActiveClass : toggleInactiveClass
                  } ${!editing ? "cursor-default opacity-70" : ""}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div>
              <label htmlFor="vcsUsername" className={labelClass}>
                {isGitHub ? "GitHub Username" : "Organization Name"}
              </label>
              <input
                id="vcsUsername"
                type="text"
                value={vcsUsername}
                onChange={(e) => setVcsUsername(e.target.value)}
                disabled={!editing}
                className={`${inputClass} ${!editing ? "opacity-70" : ""}`}
              />
            </div>
            <div>
              <label htmlFor="vcsToken" className={labelClass}>Personal Access Token</label>
              <input
                id="vcsToken"
                type="password"
                value={vcsToken}
                onChange={(e) => setVcsToken(e.target.value)}
                disabled={!editing}
                className={`${inputClass} ${!editing ? "opacity-70" : ""}`}
              />
            </div>
          </>
        )}
      </IntegrationCard>

      <IntegrationCard
        title="Code Quality (Sonar)"
        description="SonarCloud or SonarQube integration for code quality and security metrics."
        status={sonarToken ? "connected" : "disconnected"}
        onSave={handleSonarSave}
        onCancel={handleSonarCancel}
        onDisconnect={handleSonarDisconnect}
      >
        {(editing) => (
          <>
            <div className={toggleContainerClass}>
              {SONAR_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  disabled={!editing}
                  onClick={() => setLocalSonarType(opt.value)}
                  className={`flex-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
                    localSonarType === opt.value ? toggleActiveClass : toggleInactiveClass
                  } ${!editing ? "cursor-default opacity-70" : ""}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {localSonarType !== "none" && (
              <>
                {localSonarType === "qube" && (
                  <div>
                    <label htmlFor="sonarUrl" className={labelClass}>SonarQube Instance URL</label>
                    <input
                      id="sonarUrl"
                      type="url"
                      value={localSonarUrl}
                      onChange={(e) => setLocalSonarUrl(e.target.value)}
                      disabled={!editing}
                      placeholder="https://sonarqube.example.com"
                      className={`${inputClass} ${!editing ? "opacity-70" : ""}`}
                    />
                  </div>
                )}
                <div>
                  <label htmlFor="sonarToken" className={labelClass}>
                    {localSonarType === "cloud" ? "SonarCloud Token" : "SonarQube Token"}
                  </label>
                  <input
                    id="sonarToken"
                    type="password"
                    value={localSonarToken}
                    onChange={(e) => setLocalSonarToken(e.target.value)}
                    disabled={!editing}
                    placeholder="your Sonar token"
                    className={`${inputClass} ${!editing ? "opacity-70" : ""}`}
                  />
                </div>
              </>
            )}
          </>
        )}
      </IntegrationCard>

      <IntegrationCard
        title="WakaTime"
        description="Time tracking integration for per-contributor coding time metrics."
        status={wakaTimeToken ? "connected" : "disconnected"}
        onSave={handleWakaTimeSave}
        onCancel={handleWakaTimeCancel}
        onDisconnect={handleWakaTimeDisconnect}
      >
        {(editing) => (
          <div>
            <label htmlFor="wakaTimeToken" className={labelClass}>API Key</label>
            <input
              id="wakaTimeToken"
              type="password"
              value={localWakaTimeToken}
              onChange={(e) => setLocalWakaTimeToken(e.target.value)}
              disabled={!editing}
              placeholder="your WakaTime API key"
              className={`${inputClass} ${!editing ? "opacity-70" : ""}`}
            />
          </div>
        )}
      </IntegrationCard>
    </div>
  );
};
