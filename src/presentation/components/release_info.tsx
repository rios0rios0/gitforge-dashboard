import type { Release } from "../../domain/entities/release";

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

interface ReleaseInfoProps {
  release: Release | null;
}

export const ReleaseInfo = ({ release }: ReleaseInfoProps) => {
  if (!release) {
    return <span className="text-xs text-gray-400">No releases</span>;
  }

  return (
    <a
      href={release.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
    >
      <span className="font-mono">{release.tagName}</span>
      <span className="text-gray-400">{formatRelativeDate(release.publishedAt)}</span>
      {release.isPrerelease && (
        <span className="rounded bg-yellow-100 px-1 text-yellow-700">pre</span>
      )}
    </a>
  );
};
