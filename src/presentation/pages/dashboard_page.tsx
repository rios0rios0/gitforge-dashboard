import { useEffect } from "react";
import type { DashboardService } from "../../domain/services/dashboard_service";
import { RepositoryTable } from "../components/repository_table";
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

  useEffect(() => {
    onRefetchRef?.(refetch);
  }, [onRefetchRef, refetch]);

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">{error}</div>
      )}

      <RepositoryTable
        repositories={repositories}
        totalCount={repositories.length}
        isLoading={isLoading}
      />
    </div>
  );
};
