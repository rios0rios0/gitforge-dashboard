import type { CIState } from "../../domain/entities/workflow_status";

const STATE_STYLES: Record<CIState | "NONE", { bg: string; text: string; label: string }> = {
  SUCCESS: { bg: "bg-green-100", text: "text-green-800", label: "Passing" },
  FAILURE: { bg: "bg-red-100", text: "text-red-800", label: "Failing" },
  ERROR: { bg: "bg-red-100", text: "text-red-800", label: "Error" },
  PENDING: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pending" },
  EXPECTED: { bg: "bg-blue-100", text: "text-blue-800", label: "Expected" },
  NONE: { bg: "bg-gray-100", text: "text-gray-500", label: "No CI" },
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
