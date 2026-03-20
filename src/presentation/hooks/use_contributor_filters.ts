import { useCallback, useMemo, useState } from "react";
import type { Contributor } from "../../domain/entities/contributor";
import {
  DEFAULT_CONTRIBUTOR_FILTER,
  filterContributors,
  sortContributors,
  type ContributorFilter,
} from "../../domain/entities/contributor_filter";

export interface UseContributorFiltersResult {
  filter: ContributorFilter;
  filteredContributors: Contributor[];
  updateFilter: (partial: Partial<ContributorFilter>) => void;
  resetFilters: () => void;
}

export const useContributorFilters = (
  contributors: readonly Contributor[],
): UseContributorFiltersResult => {
  const [filter, setFilter] = useState<ContributorFilter>(DEFAULT_CONTRIBUTOR_FILTER);

  const filteredContributors = useMemo(() => {
    const filtered = filterContributors(contributors, filter);
    return sortContributors(filtered, filter.sortField, filter.sortDirection);
  }, [contributors, filter]);

  const updateFilter = useCallback((partial: Partial<ContributorFilter>) => {
    setFilter((prev) => ({ ...prev, ...partial }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilter(DEFAULT_CONTRIBUTOR_FILTER);
  }, []);

  return { filter, filteredContributors, updateFilter, resetFilters };
};
