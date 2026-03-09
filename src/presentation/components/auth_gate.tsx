import { useState } from "react";

interface AuthGateProps {
  onLogin: (token: string, username: string) => void;
  error: string | null;
}

export const AuthGate = ({ onLogin, error }: AuthGateProps) => {
  const [token, setToken] = useState("");
  const [username, setUsername] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token.trim() && username.trim()) {
      onLogin(token.trim(), username.trim());
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">GitForge Dashboard</h1>
        <p className="mb-6 text-sm text-gray-500">
          Connect with a GitHub Personal Access Token to view your repositories.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="mb-1 block text-sm font-medium text-gray-700">
              GitHub Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your-username"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label htmlFor="token" className="mb-1 block text-sm font-medium text-gray-700">
              Personal Access Token
            </label>
            <input
              id="token"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ghp_... or github_pat_..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              required
            />
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

        <div className="mt-6 rounded-md bg-gray-50 p-3 text-xs text-gray-500">
          <p className="font-medium">Recommended: Fine-grained PAT</p>
          <ul className="mt-1 list-inside list-disc space-y-0.5">
            <li>Resource owner: your account</li>
            <li>Repository access: All repositories</li>
            <li>Permissions: Metadata (read-only)</li>
          </ul>
          <p className="mt-1">Your token is stored locally and never sent to any server except GitHub's API.</p>
        </div>
      </div>
    </div>
  );
};
