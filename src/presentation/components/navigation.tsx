import type { RefreshInterval } from "../hooks/use_auto_refresh";
import type { Theme } from "../hooks/use_theme";

export type ActivePage = "dashboard" | "contributors";

interface NavigationProps {
  activePage: ActivePage;
  username: string;
  lastFetchedAt: Date | null;
  refreshInterval: RefreshInterval;
  isLoading: boolean;
  theme: Theme;
  onPageChange: (page: ActivePage) => void;
  onRefresh: () => void;
  onIntervalChange: (interval: RefreshInterval) => void;
  onToggleTheme: () => void;
  onLogout: () => void;
}

const formatTime = (date: Date): string =>
  date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

const INTERVAL_OPTIONS: { value: RefreshInterval; label: string }[] = [
  { value: 60000, label: "1 min" },
  { value: 300000, label: "5 min" },
  { value: 900000, label: "15 min" },
  { value: 0, label: "Off" },
];

const NAV_ITEMS: { page: ActivePage; label: string }[] = [
  { page: "dashboard", label: "Repositories" },
  { page: "contributors", label: "Contributors" },
];

export const Navigation = ({
  activePage,
  username,
  lastFetchedAt,
  refreshInterval,
  isLoading,
  theme,
  onPageChange,
  onRefresh,
  onIntervalChange,
  onToggleTheme,
  onLogout,
}: NavigationProps) => (
  <header className="mb-6 border-b border-gray-200 pb-4 dark:border-gray-700">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold">GitForge Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {username}
          {lastFetchedAt && <> &middot; Last updated {formatTime(lastFetchedAt)}</>}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onToggleTheme}
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
          aria-label="Toggle theme"
        >
          {theme === "light" ? "\u263E" : "\u2600"}
        </button>

        <select
          value={refreshInterval}
          onChange={(e) => onIntervalChange(Number(e.target.value) as RefreshInterval)}
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        >
          {INTERVAL_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              Auto: {label}
            </option>
          ))}
        </select>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? "Loading..." : "Refresh"}
        </button>

        <button
          onClick={onLogout}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Disconnect
        </button>
      </div>
    </div>

    <nav className="mt-4 flex gap-1">
      {NAV_ITEMS.map(({ page, label }) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activePage === page
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          }`}
        >
          {label}
        </button>
      ))}
    </nav>
  </header>
);
