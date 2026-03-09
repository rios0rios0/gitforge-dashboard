import type { Repository } from "../../domain/entities/repository";
import { ReleaseInfo } from "./release_info";
import { StatusBadge } from "./status_badge";
import { TagInfo } from "./tag_info";

interface RepositoryCardProps {
  repository: Repository;
}

export const RepositoryCard = ({ repository }: RepositoryCardProps) => (
  <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
    <div className="mb-2 flex items-start justify-between">
      <div className="min-w-0 flex-1">
        <a
          href={repository.url}
          target="_blank"
          rel="noopener noreferrer"
          className="truncate text-sm font-semibold text-blue-600 hover:text-blue-800"
        >
          {repository.name}
        </a>
        {repository.isArchived && (
          <span className="ml-2 rounded bg-orange-100 px-1.5 py-0.5 text-xs text-orange-700">
            archived
          </span>
        )}
        {repository.visibility === "PRIVATE" && (
          <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
            private
          </span>
        )}
      </div>
      <StatusBadge state={repository.ciStatus?.state ?? null} />
    </div>

    {repository.description && (
      <p className="mb-2 truncate text-xs text-gray-500">{repository.description}</p>
    )}

    <div className="flex items-center gap-3">
      <ReleaseInfo release={repository.latestRelease} />
      <TagInfo tag={repository.latestTag} hasRelease={repository.latestRelease !== null} />
    </div>

    <div className="mt-2 flex items-center gap-2">
      {repository.primaryLanguage && (
        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700">
          {repository.primaryLanguage}
        </span>
      )}
    </div>
  </div>
);
