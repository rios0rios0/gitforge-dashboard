import type { ComplianceColor, ComplianceStatus } from "../../domain/entities/compliance_status";

const COLOR_STYLES: Record<ComplianceColor, { bg: string; text: string; label: string }> = {
  green: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-800 dark:text-green-400", label: "Compliant" },
  yellow: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-800 dark:text-yellow-400", label: "Partial" },
  red: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-800 dark:text-red-400", label: "Non-compliant" },
};

interface ComplianceBadgeProps {
  status: ComplianceStatus | null;
}

export const ComplianceBadge = ({ status }: ComplianceBadgeProps) => {
  if (!status) return <span className="text-xs text-gray-400 dark:text-gray-500">-</span>;

  const style = COLOR_STYLES[status.color];
  const checks = [
    { label: "Pipeline exists", ok: status.pipelineExists },
    { label: "Build policy on PRs", ok: status.buildPolicyOnPRs },
    { label: "Build policy expiration", ok: status.buildPolicyExpiration },
    { label: "Branch protection", ok: status.branchProtection },
  ];
  const title = checks.map((c) => `${c.ok ? "\u2713" : "\u2717"} ${c.label}`).join("\n");

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style.bg} ${style.text} cursor-help`}
      title={title}
    >
      {style.label}
    </span>
  );
};
