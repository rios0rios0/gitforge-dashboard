import { useCallback } from "react";
import type { ContributorService } from "../../domain/services/contributor_service";
import { ContributorsTable } from "../components/contributors_table";
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

  const handleDateRangeApply = useCallback(
    (dateFrom: string | null, dateTo: string | null) => {
      refetch(dateFrom, dateTo);
    },
    [refetch],
  );

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">{error}</div>
      )}

      <ContributorsTable
        contributors={contributors}
        totalCount={contributors.length}
        isLoading={isLoading}
        onDateRangeApply={handleDateRangeApply}
      />
    </div>
  );
};
