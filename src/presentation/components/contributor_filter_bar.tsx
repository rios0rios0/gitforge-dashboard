import type {
  ContributorFilter,
  ContributorSortField,
  SortDirection,
} from "../../domain/entities/contributor_filter";

interface ContributorFilterBarProps {
  filter: ContributorFilter;
  onFilterChange: (partial: Partial<ContributorFilter>) => void;
  onDateRangeApply: (dateFrom: string | null, dateTo: string | null) => void;
  onReset: () => void;
}

const SORT_OPTIONS: { value: ContributorSortField; label: string }[] = [
  { value: "linesOfCode", label: "Lines of Code" },
  { value: "username", label: "Username" },
  { value: "approvedPRs", label: "Approved PRs" },
  { value: "prApprovalRate", label: "Approval Rate" },
  { value: "pipelineSuccessRate", label: "Pipeline Success" },
  { value: "bugs", label: "Bugs" },
  { value: "codeSmells", label: "Code Smells" },
  { value: "securityHotspots", label: "Security Hotspots" },
  { value: "vulnerabilities", label: "Vulnerabilities" },
  { value: "coverage", label: "Coverage" },
  { value: "duplications", label: "Duplications" },
  { value: "technicalDebt", label: "Technical Debt" },
];

export const ContributorFilterBar = ({
  filter,
  onFilterChange,
  onDateRangeApply,
  onReset,
}: ContributorFilterBarProps) => (
  <div className="mb-6 flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
    <input
      type="text"
      placeholder="Search contributors..."
      aria-label="Search contributors"
      value={filter.searchQuery}
      onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
      className="min-w-48 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
    />

    <div className="flex items-center gap-2">
      <label className="text-sm text-gray-600 dark:text-gray-300">From:</label>
      <input
        type="date"
        aria-label="Date from"
        value={filter.dateFrom ?? ""}
        onChange={(e) => onFilterChange({ dateFrom: e.target.value || null })}
        className="rounded-md border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
      />
    </div>

    <div className="flex items-center gap-2">
      <label className="text-sm text-gray-600 dark:text-gray-300">To:</label>
      <input
        type="date"
        aria-label="Date to"
        value={filter.dateTo ?? ""}
        onChange={(e) => onFilterChange({ dateTo: e.target.value || null })}
        className="rounded-md border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
      />
    </div>

    <button
      onClick={() => onDateRangeApply(filter.dateFrom, filter.dateTo)}
      className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
    >
      Apply Dates
    </button>

    <select
      value={filter.sortField}
      onChange={(e) =>
        onFilterChange({ sortField: e.target.value as ContributorSortField })
      }
      className="rounded-md border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
    >
      {SORT_OPTIONS.map(({ value, label }) => (
        <option key={value} value={value}>
          Sort: {label}
        </option>
      ))}
    </select>

    <button
      onClick={() =>
        onFilterChange({
          sortDirection:
            filter.sortDirection === "asc" ? ("desc" as SortDirection) : ("asc" as SortDirection),
        })
      }
      className="rounded-md border border-gray-300 px-2 py-1.5 text-sm hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
    >
      {filter.sortDirection === "asc" ? "Asc" : "Desc"}
    </button>

    <button
      onClick={onReset}
      className="ml-auto rounded-md px-2 py-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
    >
      Reset
    </button>
  </div>
);
