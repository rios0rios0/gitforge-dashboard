import { useCallback, useMemo, useState } from "react";
import type { Repository } from "../../domain/entities/repository";
import {
  DEFAULT_FILTER,
  filterRepositories,
  sortRepositories,
  type DashboardFilter,
} from "../../domain/entities/dashboard_filter";

export interface UseFiltersResult {
  filter: DashboardFilter;
  filteredRepositories: Repository[];
  languages: string[];
  updateFilter: (partial: Partial<DashboardFilter>) => void;
  resetFilters: () => void;
}

export const useFilters = (repositories: readonly Repository[]): UseFiltersResult => {
  const [filter, setFilter] = useState<DashboardFilter>(DEFAULT_FILTER);

  const languages = useMemo(() => {
    const langs = new Set<string>();
    for (const repo of repositories) {
      if (repo.primaryLanguage) langs.add(repo.primaryLanguage);
    }
    return [...langs].sort();
  }, [repositories]);

  const filteredRepositories = useMemo(() => {
    const filtered = filterRepositories(repositories, filter);
    return sortRepositories(filtered, filter.sortField, filter.sortDirection);
  }, [repositories, filter]);

  const updateFilter = useCallback((partial: Partial<DashboardFilter>) => {
    setFilter((prev) => ({ ...prev, ...partial }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilter(DEFAULT_FILTER);
  }, []);

  return { filter, filteredRepositories, languages, updateFilter, resetFilters };
};
