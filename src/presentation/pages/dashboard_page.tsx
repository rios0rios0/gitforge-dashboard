import { useCallback, useEffect } from "react";
import type { DashboardService } from "../../domain/services/dashboard_service";
import type { SortField } from "../../domain/entities/dashboard_filter";
import { FilterBar } from "../components/filter_bar";
import { RepositoryTable } from "../components/repository_table";
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

  const handleSortChange = useCallback(
    (field: SortField) => {
      if (filter.sortField === field) {
        updateFilter({
          sortDirection: filter.sortDirection === "asc" ? "desc" : "asc",
        });
      } else {
        updateFilter({ sortField: field, sortDirection: "asc" });
      }
    },
    [filter.sortField, filter.sortDirection, updateFilter],
  );

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

      <RepositoryTable
        repositories={filteredRepositories}
        totalCount={repositories.length}
        isLoading={isLoading}
        filter={filter}
        onSortChange={handleSortChange}
      />
    </div>
  );
};
