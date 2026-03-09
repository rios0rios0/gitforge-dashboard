import { useCallback, useEffect, useState } from "react";
import type { Repository } from "../../domain/entities/repository";
import type { DashboardService } from "../../domain/services/dashboard_service";

export interface UseRepositoriesResult {
  repositories: Repository[];
  isLoading: boolean;
  error: string | null;
  lastFetchedAt: Date | null;
  refetch: () => void;
}

export const useRepositories = (
  dashboardService: DashboardService,
  token: string | null,
  username: string | null,
): UseRepositoriesResult => {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<Date | null>(null);

  const fetchRepositories = useCallback(async () => {
    if (!token || !username) return;

    setIsLoading(true);
    setError(null);

    try {
      const repos = await dashboardService.listRepositories(token, username);
      setRepositories(repos);
      setLastFetchedAt(new Date());
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch repositories";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [dashboardService, token, username]);

  useEffect(() => {
    fetchRepositories();
  }, [fetchRepositories]);

  return { repositories, isLoading, error, lastFetchedAt, refetch: fetchRepositories };
};
