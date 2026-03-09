import type { Repository } from "../../domain/entities/repository";
import { RepositoryCard } from "./repository_card";

interface RepositoryGridProps {
  repositories: Repository[];
  totalCount: number;
  isLoading: boolean;
}

export const RepositoryGrid = ({ repositories, totalCount, isLoading }: RepositoryGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="animate-pulse rounded-lg border border-gray-200 bg-white p-4">
            <div className="mb-2 h-4 w-3/4 rounded bg-gray-200" />
            <div className="mb-2 h-3 w-1/2 rounded bg-gray-100" />
            <div className="h-3 w-1/4 rounded bg-gray-100" />
          </div>
        ))}
      </div>
    );
  }

  if (repositories.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        No repositories match the current filters.
      </div>
    );
  }

  return (
    <>
      <p className="mb-4 text-sm text-gray-500">
        Showing {repositories.length} of {totalCount} repositories
      </p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {repositories.map((repo) => (
          <RepositoryCard key={repo.id} repository={repo} />
        ))}
      </div>
    </>
  );
};
