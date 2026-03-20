import { useEffect } from "react";
import type { DashboardService } from "../../domain/services/dashboard_service";
import { FilterBar } from "../components/filter_bar";
import { RepositoryGrid } from "../components/repository_grid";
import { useFilters } from "../hooks/use_filters";
import { useRepositories } from "../hooks/use_repositories";

interface DashboardPageProps {
  dashboardService: DashboardService;
  token: string;
  username: string;
  onRefetchRef?: (refetch: () => Promise<void>) => void;
}

export const DashboardPage = ({
  dashboardService,
  token,
  username,
  onRefetchRef,
}: DashboardPageProps) => {
  const { repositories, isLoading, error, refetch } = useRepositories(
    dashboardService,
    token,
    username,
  );
  const { filter, filteredRepositories, languages, updateFilter, resetFilters } =
    useFilters(repositories);

  useEffect(() => {
    onRefetchRef?.(refetch);
  }, [onRefetchRef, refetch]);

  return (
    <div>
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
  );
};
