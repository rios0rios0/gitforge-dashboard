import { useMemo, useState } from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { Repository } from "../../domain/entities/repository";
import { StatusBadge } from "./status_badge";

interface RepositoryTableProps {
  repositories: Repository[];
  totalCount: number;
  isLoading: boolean;
}

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

const columns: ColumnDef<Repository>[] = [
  {
    accessorKey: "fullName",
    header: "Repository",
    cell: ({ row }) => {
      const repo = row.original;
      return (
        <div>
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
        </div>
      );
    },
    filterFn: "includesString",
  },
  {
    id: "ciStatus",
    accessorFn: (row) => row.ciStatus?.state ?? "NONE",
    header: "CI Status",
    cell: ({ row }) => <StatusBadge state={row.original.ciStatus?.state ?? null} />,
    filterFn: (row, _columnId, filterValue) => {
      if (!filterValue || filterValue === "all") return true;
      const state = row.original.ciStatus?.state ?? null;
      if (filterValue === "passing") return state === "SUCCESS";
      if (filterValue === "failing") return state !== null && state !== "SUCCESS";
      if (filterValue === "no-ci") return state === null;
      return true;
    },
    meta: { filterType: "select", options: ["all", "passing", "failing", "no-ci"] },
  },
  {
    accessorKey: "primaryLanguage",
    header: "Language",
    cell: ({ getValue }) => {
      const lang = getValue<string | null>();
      return lang ? (
        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
          {lang}
        </span>
      ) : (
        <span className="text-xs text-gray-400 dark:text-gray-500">-</span>
      );
    },
    filterFn: "includesString",
  },
  {
    id: "latestRelease",
    accessorFn: (row) => row.latestRelease?.tagName ?? "",
    header: "Release",
    cell: ({ row }) => {
      const release = row.original.latestRelease;
      if (!release) return <span className="text-xs text-gray-400 dark:text-gray-500">-</span>;
      return (
        <a
          href={release.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <span className="font-mono">{release.tagName}</span>
          <span className="ml-1 text-gray-400 dark:text-gray-500">
            {formatRelativeDate(release.publishedAt)}
          </span>
        </a>
      );
    },
    filterFn: "includesString",
  },
  {
    id: "latestTag",
    accessorFn: (row) => row.latestTag?.name ?? "",
    header: "Tag",
    cell: ({ row }) => {
      const tag = row.original.latestTag;
      return tag ? (
        <span className="font-mono text-xs">{tag.name}</span>
      ) : (
        <span className="text-xs text-gray-400 dark:text-gray-500">-</span>
      );
    },
    filterFn: "includesString",
  },
  {
    accessorKey: "updatedAt",
    header: "Updated",
    cell: ({ getValue }) => (
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {formatRelativeDate(getValue<string>())}
      </span>
    ),
    enableColumnFilter: false,
  },
  {
    accessorKey: "visibility",
    header: "Visibility",
    cell: ({ getValue }) => {
      const v = getValue<string>();
      return v === "PRIVATE" ? (
        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
          private
        </span>
      ) : (
        <span className="text-xs text-gray-400 dark:text-gray-500">public</span>
      );
    },
    meta: { filterType: "select", options: ["", "PUBLIC", "PRIVATE"] },
    filterFn: (row, _columnId, filterValue) => {
      if (!filterValue) return true;
      return row.original.visibility === filterValue;
    },
  },
];

const ColumnFilter = ({ column }: { column: { getFilterValue: () => unknown; setFilterValue: (v: unknown) => void; columnDef: ColumnDef<Repository> } }) => {
  const meta = column.columnDef.meta as { filterType?: string; options?: string[] } | undefined;

  if (meta?.filterType === "select") {
    return (
      <select
        value={(column.getFilterValue() as string) ?? ""}
        onChange={(e) => column.setFilterValue(e.target.value || undefined)}
        className="w-full rounded border border-gray-200 px-1.5 py-1 text-xs dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
      >
        <option value="">All</option>
        {meta.options?.filter(Boolean).map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    );
  }

  return (
    <input
      type="text"
      value={(column.getFilterValue() as string) ?? ""}
      onChange={(e) => column.setFilterValue(e.target.value || undefined)}
      placeholder="Filter..."
      className="w-full rounded border border-gray-200 px-1.5 py-1 text-xs dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
    />
  );
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
}: RepositoryTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([{ id: "fullName", desc: false }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [showForks, setShowForks] = useState(false);

  const filteredData = useMemo(() => {
    let data = repositories;
    if (!showArchived) data = data.filter((r) => !r.isArchived);
    if (!showForks) data = data.filter((r) => !r.isFork);
    return data;
  }, [repositories, showArchived, showForks]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 25 } },
  });

  if (!isLoading && repositories.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500 dark:text-gray-400">
        No repositories found.
      </div>
    );
  }

  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {table.getFilteredRowModel().rows.length} of {totalCount} repositories
          </p>
          <label className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} />
            Archived
          </label>
          <label className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <input type="checkbox" checked={showForks} onChange={(e) => setShowForks(e.target.checked)} />
            Forks
          </label>
        </div>
        {table.getPageCount() > 1 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
              className="rounded-md border border-gray-300 px-2 py-1 text-xs disabled:opacity-40 dark:border-gray-600"
            >
              Previous
            </button>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
            </span>
            <button
              type="button"
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
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
            {table.getHeaderGroups().map((headerGroup) => (
              <>
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      scope="col"
                      aria-sort={
                        header.column.getIsSorted()
                          ? header.column.getIsSorted() === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                      }
                      className="whitespace-nowrap px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                    >
                      <button
                        type="button"
                        className="inline-flex w-full items-center text-left cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() && (
                          <span className="ml-1" aria-hidden="true">
                            {header.column.getIsSorted() === "asc" ? "\u25B2" : "\u25BC"}
                          </span>
                        )}
                      </button>
                    </th>
                  ))}
                </tr>
                <tr key={`${headerGroup.id}-filter`} className="border-t border-gray-100 dark:border-gray-700">
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-3 py-1.5">
                      {header.column.getCanFilter() ? (
                        <ColumnFilter column={header.column as never} />
                      ) : null}
                    </th>
                  ))}
                </tr>
              </>
            ))}
          </thead>
          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="whitespace-nowrap px-3 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>
    </>
  );
};
