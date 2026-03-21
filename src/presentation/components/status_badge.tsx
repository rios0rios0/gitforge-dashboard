import type { CIState } from "../../domain/entities/workflow_status";

const STATE_STYLES: Record<CIState | "NONE", { bg: string; text: string; label: string }> = {
  SUCCESS: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-800 dark:text-green-400", label: "Passing" },
  FAILURE: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-800 dark:text-red-400", label: "Failing" },
  ERROR: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-800 dark:text-red-400", label: "Error" },
  PENDING: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-800 dark:text-yellow-400", label: "Pending" },
  EXPECTED: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-800 dark:text-blue-400", label: "Expected" },
  NONE: { bg: "bg-gray-100 dark:bg-gray-700", text: "text-gray-500 dark:text-gray-400", label: "No CI" },
};

interface StatusBadgeProps {
  state: CIState | null;
}

export const StatusBadge = ({ state }: StatusBadgeProps) => {
  const style = STATE_STYLES[state ?? "NONE"];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
};
