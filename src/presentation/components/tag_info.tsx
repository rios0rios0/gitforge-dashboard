import type { Tag } from "../../domain/entities/tag";

interface TagInfoProps {
  tag: Tag | null;
  hasRelease: boolean;
}

export const TagInfo = ({ tag, hasRelease }: TagInfoProps) => {
  if (hasRelease || !tag) return null;

  return (
    <span className="inline-flex items-center gap-1 text-xs text-gray-500">
      <span className="font-mono">{tag.name}</span>
      <span className="text-gray-400">(tag only)</span>
    </span>
  );
};
