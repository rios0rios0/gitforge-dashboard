import { useState } from "react";
import type { Platform } from "../../domain/entities/platform";

interface AuthGateProps {
  onLogin: (token: string, username: string, sonarToken: string | null, platform: Platform) => void;
  error: string | null;
}

const PLATFORM_OPTIONS: { value: Platform; label: string }[] = [
  { value: "github", label: "GitHub" },
  { value: "azure-devops", label: "Azure DevOps" },
];

export const AuthGate = ({ onLogin, error }: AuthGateProps) => {
  const [platform, setPlatform] = useState<Platform>("github");
  const [token, setToken] = useState("");
  const [username, setUsername] = useState("");
  const [sonarToken, setSonarToken] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token.trim() && username.trim()) {
      onLogin(token.trim(), username.trim(), sonarToken.trim() || null, platform);
    }
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
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
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
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              required
            />
          </div>

          <div>
            <label htmlFor="sonarToken" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              SonarCloud Token{" "}
              <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <input
              id="sonarToken"
              type="password"
              value={sonarToken}
              onChange={(e) => setSonarToken(e.target.value)}
              placeholder="skip or paste your SonarCloud token"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            />
            <p className="mt-1 text-xs text-gray-400">
              Leave blank to skip. SonarCloud columns will show &ldquo;-&rdquo;.
            </p>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}

          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Connect
          </button>
        </form>

        <div className="mt-6 rounded-md bg-gray-50 p-3 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-400">
          {isGitHub ? (
            <>
              <p className="font-medium">Recommended: Fine-grained PAT</p>
              <ul className="mt-1 list-inside list-disc space-y-0.5">
                <li>Resource owner: your account</li>
                <li>Repository access: All repositories</li>
                <li>Permissions: Metadata (read-only)</li>
              </ul>
            </>
          ) : (
            <>
              <p className="font-medium">Azure DevOps PAT Scopes</p>
              <ul className="mt-1 list-inside list-disc space-y-0.5">
                <li>Code: Read</li>
                <li>Build: Read</li>
                <li>Project and Team: Read</li>
              </ul>
            </>
          )}
          <p className="mt-1">
            Your tokens are stored locally and never sent to any server except their respective APIs.
          </p>
        </div>
      </div>
    </div>
  );
};
