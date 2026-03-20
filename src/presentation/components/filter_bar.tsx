import type {
  CIFilter,
  DashboardFilter,
  ReleaseFilter,
} from "../../domain/entities/dashboard_filter";

interface FilterBarProps {
  filter: DashboardFilter;
  languages: string[];
  onFilterChange: (partial: Partial<DashboardFilter>) => void;
  onReset: () => void;
}

export const FilterBar = ({ filter, languages, onFilterChange, onReset }: FilterBarProps) => (
  <div className="mb-6 flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
    <input
      type="text"
      placeholder="Search repositories..."
      aria-label="Search repositories"
      value={filter.searchQuery}
      onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
      className="min-w-48 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
    />

    <select
      value={filter.ciFilter}
      onChange={(e) => onFilterChange({ ciFilter: e.target.value as CIFilter })}
      className="rounded-md border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
    >
      <option value="all">All CI</option>
      <option value="passing">Passing</option>
      <option value="failing">Failing</option>
      <option value="no-ci">No CI</option>
    </select>

    <select
      value={filter.releaseFilter}
      onChange={(e) => onFilterChange({ releaseFilter: e.target.value as ReleaseFilter })}
      className="rounded-md border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
    >
      <option value="all">All Releases</option>
      <option value="has-release">Has Release</option>
      <option value="no-release">No Release</option>
    </select>

    <select
      value={filter.languageFilter ?? ""}
      onChange={(e) => onFilterChange({ languageFilter: e.target.value || null })}
      className="rounded-md border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
    >
      <option value="">All Languages</option>
      {languages.map((lang) => (
        <option key={lang} value={lang}>
          {lang}
        </option>
      ))}
    </select>

    <label className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
      <input
        type="checkbox"
        checked={filter.showArchived}
        onChange={(e) => onFilterChange({ showArchived: e.target.checked })}
      />
      Archived
    </label>

    <label className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
      <input
        type="checkbox"
        checked={filter.showForks}
        onChange={(e) => onFilterChange({ showForks: e.target.checked })}
      />
      Forks
    </label>

    <button
      onClick={onReset}
      className="ml-auto rounded-md px-2 py-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
    >
      Reset
    </button>
  </div>
);
