import type { DashboardService } from "../../domain/services/dashboard_service";
import { DashboardHeader } from "../components/dashboard_header";
import { FilterBar } from "../components/filter_bar";
import { RepositoryGrid } from "../components/repository_grid";
import { useAutoRefresh } from "../hooks/use_auto_refresh";
import { useFilters } from "../hooks/use_filters";
import { useRepositories } from "../hooks/use_repositories";

interface DashboardPageProps {
  dashboardService: DashboardService;
  token: string;
  username: string;
  onLogout: () => void;
}

export const DashboardPage = ({ dashboardService, token, username, onLogout }: DashboardPageProps) => {
  const { repositories, isLoading, error, lastFetchedAt, refetch } = useRepositories(
    dashboardService,
    token,
    username,
  );
  const { filter, filteredRepositories, languages, updateFilter, resetFilters } =
    useFilters(repositories);
  const { interval, setInterval } = useAutoRefresh(refetch);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <DashboardHeader
          username={username}
          lastFetchedAt={lastFetchedAt}
          refreshInterval={interval}
          isLoading={isLoading}
          onRefresh={refetch}
          onIntervalChange={setInterval}
          onLogout={onLogout}
        />

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}

        <FilterBar
          filter={filter}
          languages={languages}
          onFilterChange={updateFilter}
          onReset={resetFilters}
        />

        <RepositoryGrid
          repositories={filteredRepositories}
          totalCount={repositories.length}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};
