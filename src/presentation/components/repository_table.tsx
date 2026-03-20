import { useState } from "react";
import type { Repository } from "../../domain/entities/repository";
import type { DashboardFilter, SortDirection, SortField } from "../../domain/entities/dashboard_filter";
import { StatusBadge } from "./status_badge";

interface RepositoryTableProps {
  repositories: Repository[];
  totalCount: number;
  isLoading: boolean;
  filter: DashboardFilter;
  onSortChange: (field: SortField) => void;
}

const PAGE_SIZE = 25;

const SortHeader = ({
  label,
  field,
  currentField,
  currentDirection,
  onClick,
}: {
  label: string;
  field: SortField;
  currentField: SortField;
  currentDirection: SortDirection;
  onClick: (field: SortField) => void;
}) => {
  const isActive = currentField === field;
  return (
    <th
      scope="col"
      aria-sort={
        isActive
          ? currentDirection === "asc"
            ? "ascending"
            : "descending"
          : "none"
      }
      className="whitespace-nowrap px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
    >
      <button
        type="button"
        className="inline-flex w-full items-center text-left cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        onClick={() => onClick(field)}
      >
        <span>{label}</span>
        {isActive && (
          <span className="ml-1" aria-hidden="true">
            {currentDirection === "asc" ? "\u25B2" : "\u25BC"}
          </span>
        )}
      </button>
    </th>
  );
};

const formatRelativeDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 30) return `${diffDays}d ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
};

const LoadingSkeleton = () => (
  <tbody>
    {Array.from({ length: 8 }, (_, i) => (
      <tr key={i} className="animate-pulse">
        {Array.from({ length: 7 }, (_, j) => (
          <td key={j} className="px-3 py-3">
            <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700" />
          </td>
        ))}
      </tr>
    ))}
  </tbody>
);

export const RepositoryTable = ({
  repositories,
  totalCount,
  isLoading,
  filter,
  onSortChange,
}: RepositoryTableProps) => {
  const [page, setPage] = useState(0);

  const headerProps = {
    currentField: filter.sortField,
    currentDirection: filter.sortDirection,
    onClick: onSortChange,
  };

  if (!isLoading && repositories.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500 dark:text-gray-400">
        No repositories match the current filters.
      </div>
    );
  }

  const totalPages = Math.ceil(repositories.length / PAGE_SIZE);
  const paged = repositories.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing {repositories.length} of {totalCount} repositories
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-md border border-gray-300 px-2 py-1 text-xs disabled:opacity-40 dark:border-gray-600"
            >
              Previous
            </button>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {page + 1} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-md border border-gray-300 px-2 py-1 text-xs disabled:opacity-40 dark:border-gray-600"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <SortHeader label="Repository" field="name" {...headerProps} />
              <SortHeader label="CI Status" field="ciStatus" {...headerProps} />
              <SortHeader label="Language" field="language" {...headerProps} />
              <SortHeader label="Latest Release" field="releaseDate" {...headerProps} />
              <SortHeader label="Latest Tag" field="latestTag" {...headerProps} />
              <SortHeader label="Updated" field="updatedAt" {...headerProps} />
              <SortHeader label="Visibility" field="visibility" {...headerProps} />
            </tr>
          </thead>
          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {paged.map((repo) => (
                <tr key={repo.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="whitespace-nowrap px-3 py-3">
                    <div className="flex items-center gap-2">
                      <a
                        href={repo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        {repo.fullName}
                      </a>
                      {repo.isArchived && (
                        <span className="rounded bg-orange-100 px-1.5 py-0.5 text-xs text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                          archived
                        </span>
                      )}
                      {repo.isFork && (
                        <span className="rounded bg-purple-100 px-1.5 py-0.5 text-xs text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                          fork
                        </span>
                      )}
                    </div>
                    {repo.description && (
                      <p className="mt-0.5 max-w-md truncate text-xs text-gray-400 dark:text-gray-500">
                        {repo.description}
                      </p>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <StatusBadge state={repo.ciStatus?.state ?? null} />
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {repo.primaryLanguage ? (
                      <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                        {repo.primaryLanguage}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 dark:text-gray-500">-</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {repo.latestRelease ? (
                      <a
                        href={repo.latestRelease.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <span className="font-mono">{repo.latestRelease.tagName}</span>
                        <span className="ml-1 text-gray-400 dark:text-gray-500">
                          {formatRelativeDate(repo.latestRelease.publishedAt)}
                        </span>
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400 dark:text-gray-500">-</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {repo.latestTag ? (
                      <span className="font-mono text-xs">{repo.latestTag.name}</span>
                    ) : (
                      <span className="text-xs text-gray-400 dark:text-gray-500">-</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-xs text-gray-500 dark:text-gray-400">
                    {formatRelativeDate(repo.updatedAt)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-xs text-gray-500 dark:text-gray-400">
                    {repo.visibility === "PRIVATE" ? (
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 text-gray-600 dark:bg-gray-700 dark:text-gray-300">private</span>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500">public</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>
    </>
  );
};
