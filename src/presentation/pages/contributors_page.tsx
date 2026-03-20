import { useCallback } from "react";
import type { ContributorService } from "../../domain/services/contributor_service";
import type { ContributorSortField } from "../../domain/entities/contributor_filter";
import { ContributorFilterBar } from "../components/contributor_filter_bar";
import { ContributorsTable } from "../components/contributors_table";
import { useContributorFilters } from "../hooks/use_contributor_filters";
import { useContributors } from "../hooks/use_contributors";

interface ContributorsPageProps {
  contributorService: ContributorService;
  token: string;
  username: string;
}

export const ContributorsPage = ({
  contributorService,
  token,
  username,
}: ContributorsPageProps) => {
  const { contributors, isLoading, error, refetch } = useContributors(
    contributorService,
    token,
    username,
  );
  const { filter, filteredContributors, updateFilter, resetFilters } =
    useContributorFilters(contributors);

  const handleDateRangeApply = useCallback(
    (dateFrom: string | null, dateTo: string | null) => {
      refetch(dateFrom, dateTo);
    },
    [refetch],
  );

  const handleSortChange = useCallback(
    (field: ContributorSortField) => {
      if (filter.sortField === field) {
        updateFilter({
          sortDirection: filter.sortDirection === "asc" ? "desc" : "asc",
        });
      } else {
        updateFilter({ sortField: field, sortDirection: "desc" });
      }
    },
    [filter.sortField, filter.sortDirection, updateFilter],
  );

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <ContributorFilterBar
        filter={filter}
        onFilterChange={updateFilter}
        onDateRangeApply={handleDateRangeApply}
        onReset={resetFilters}
      />

      <ContributorsTable
        contributors={filteredContributors}
        totalCount={contributors.length}
        isLoading={isLoading}
        filter={filter}
        onSortChange={handleSortChange}
      />
    </div>
  );
};
