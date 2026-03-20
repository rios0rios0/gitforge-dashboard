import { useState } from "react";
import type { Platform } from "../../domain/entities/platform";
import type { LoginCredentials, SonarLoginInfo, SonarType } from "../hooks/use_authentication";

interface AuthGateProps {
  onLogin: (token: string, username: string, credentials: LoginCredentials, platform: Platform) => void;
  error: string | null;
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

export const AuthGate = ({ onLogin, error }: AuthGateProps) => {
  const [platform, setPlatform] = useState<Platform>("github");
  const [token, setToken] = useState("");
  const [username, setUsername] = useState("");
  const [sonarType, setSonarType] = useState<SonarType | "none">("none");
  const [sonarToken, setSonarToken] = useState("");
  const [sonarUrl, setSonarUrl] = useState("");
  const [wakaTimeToken, setWakaTimeToken] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim() || !username.trim()) return;

    const sonar: SonarLoginInfo | null =
      sonarType !== "none" && sonarToken.trim()
        ? {
            type: sonarType,
            token: sonarToken.trim(),
            url: sonarType === "qube" ? sonarUrl.trim() || undefined : undefined,
          }
        : null;

    const credentials: LoginCredentials = {
      sonar,
      wakaTimeToken: wakaTimeToken.trim() || null,
    };

    onLogin(token.trim(), username.trim(), credentials, platform);
  };

  const isGitHub = platform === "github";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">GitForge Dashboard</h1>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Connect to your repositories and view CI status, releases, and contributor metrics.
        </p>

        <div className="mb-6 flex rounded-md border border-gray-200 bg-gray-50 p-1 dark:border-gray-600 dark:bg-gray-700">
          {PLATFORM_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setPlatform(opt.value)}
              className={`flex-1 rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                platform === opt.value
                  ? "bg-white text-gray-900 shadow-sm dark:bg-gray-600 dark:text-gray-100"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {isGitHub ? "GitHub Username" : "Organization Name"}
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={isGitHub ? "your-username" : "your-organization"}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label htmlFor="token" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Personal Access Token
            </label>
            <input
              id="token"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder={isGitHub ? "ghp_... or github_pat_..." : "your ADO PAT"}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Code Quality Integration{" "}
              <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <div className="flex rounded-md border border-gray-200 bg-gray-50 p-1 dark:border-gray-600 dark:bg-gray-700">
              {SONAR_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSonarType(opt.value)}
                  className={`flex-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
                    sonarType === opt.value
                      ? "bg-white text-gray-900 shadow-sm dark:bg-gray-600 dark:text-gray-100"
                      : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {sonarType !== "none" && (
            <>
              {sonarType === "qube" && (
                <div>
                  <label htmlFor="sonarUrl" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    SonarQube Instance URL
                  </label>
                  <input
                    id="sonarUrl"
                    type="url"
                    value={sonarUrl}
                    onChange={(e) => setSonarUrl(e.target.value)}
                    placeholder="https://sonarqube.example.com"
                    className={inputClass}
                  />
                </div>
              )}
              <div>
                <label htmlFor="sonarToken" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {sonarType === "cloud" ? "SonarCloud Token" : "SonarQube Token"}
                </label>
                <input
                  id="sonarToken"
                  type="password"
                  value={sonarToken}
                  onChange={(e) => setSonarToken(e.target.value)}
                  placeholder="your Sonar token"
                  className={inputClass}
                />
              </div>
            </>
          )}

          <div>
            <label htmlFor="wakaTimeToken" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              WakaTime API Key{" "}
              <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <input
              id="wakaTimeToken"
              type="password"
              value={wakaTimeToken}
              onChange={(e) => setWakaTimeToken(e.target.value)}
              placeholder="skip or paste your WakaTime API key"
              className={inputClass}
            />
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Leave blank to skip. Time tracking columns will be hidden.
            </p>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">{error}</div>
          )}

          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Connect
          </button>
        </form>

        <div className="mt-6 rounded-md bg-gray-50 p-3 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-400">
          <p className="mt-1">
            Your tokens are stored locally and never sent to any server except their respective APIs.
          </p>
        </div>
      </div>
    </div>
  );
};
