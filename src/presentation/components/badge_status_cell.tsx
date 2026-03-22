import { useCallback, useEffect, useState } from "react";
import type { BadgeColor, BadgeStatus } from "../../domain/entities/badge_status";

const COLOR_STYLES: Record<BadgeColor, { bg: string; text: string; label: string }> = {
  green: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-800 dark:text-green-400", label: "Complete" },
  yellow: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-800 dark:text-yellow-400", label: "Incomplete" },
};

interface BadgeStatusCellProps {
  status: BadgeStatus | null;
}

export const BadgeStatusCell = ({ status }: BadgeStatusCellProps) => {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((prev) => !prev), []);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, close]);

  if (!status) return <span className="text-xs text-gray-400 dark:text-gray-500">-</span>;

  const style = COLOR_STYLES[status.color];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="true"
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium cursor-pointer ${style.bg} ${style.text}`}
      >
        {style.label}
      </button>
      {open && (
        <>
          <div data-testid="badge-overlay" className="fixed inset-0 z-10" onClick={close} />
          <div
            role="menu"
            aria-label="Badge details"
            className="absolute left-0 top-full z-20 mt-1 w-64 rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800"
          >
            <ul className="py-1">
              {status.checks.map((check) => (
                <li
                  key={check.label}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300"
                >
                  <span className={check.present ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}>
                    {check.present ? "\u2713" : "\u2717"}
                  </span>
                  {check.label}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};
