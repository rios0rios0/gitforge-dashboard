import { useCallback, useEffect, useState } from "react";
import type { Contributor } from "../../domain/entities/contributor";
import type { ContributorService } from "../../domain/services/contributor_service";

export interface UseContributorsResult {
  contributors: Contributor[];
  isLoading: boolean;
  error: string | null;
  lastFetchedAt: Date | null;
  refetch: (dateFrom?: string | null, dateTo?: string | null) => Promise<void>;
}

export const useContributors = (
  contributorService: ContributorService,
  token: string | null,
  username: string | null,
): UseContributorsResult => {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<Date | null>(null);

  const fetchContributors = useCallback(
    async (dateFrom: string | null = null, dateTo: string | null = null) => {
      if (!token || !username) return;

      setIsLoading(true);
      setError(null);

      try {
        const data = await contributorService.listContributors(
          token,
          username,
          dateFrom,
          dateTo,
        );
        setContributors(data);
        setLastFetchedAt(new Date());
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to fetch contributors";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [contributorService, token, username],
  );

  useEffect(() => {
    fetchContributors();
  }, [fetchContributors]);

  return { contributors, isLoading, error, lastFetchedAt, refetch: fetchContributors };
};
