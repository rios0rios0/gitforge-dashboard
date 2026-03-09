import type { RefreshInterval } from "../hooks/use_auto_refresh";

interface DashboardHeaderProps {
  username: string;
  lastFetchedAt: Date | null;
  refreshInterval: RefreshInterval;
  isLoading: boolean;
  onRefresh: () => void;
  onIntervalChange: (interval: RefreshInterval) => void;
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

export const DashboardHeader = ({
  username,
  lastFetchedAt,
  refreshInterval,
  isLoading,
  onRefresh,
  onIntervalChange,
  onLogout,
}: DashboardHeaderProps) => (
  <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">GitForge Dashboard</h1>
      <p className="text-sm text-gray-500">
        {username}
        {lastFetchedAt && <> &middot; Last updated {formatTime(lastFetchedAt)}</>}
      </p>
    </div>

    <div className="flex items-center gap-3">
      <select
        value={refreshInterval}
        onChange={(e) => onIntervalChange(Number(e.target.value) as RefreshInterval)}
        className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
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
        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
      >
        Disconnect
      </button>
    </div>
  </header>
);
