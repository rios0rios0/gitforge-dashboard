import { useState } from "react";
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
import type { Contributor } from "../../domain/entities/contributor";

interface ContributorsTableProps {
  contributors: Contributor[];
  totalCount: number;
  isLoading: boolean;
  onDateRangeApply: (dateFrom: string | null, dateTo: string | null) => void;
}

const formatRate = (rate: number): string => `${rate.toFixed(1)}%`;

const rateClass = (rate: number): string =>
  rate >= 80
    ? "text-green-700 dark:text-green-400"
    : rate >= 50
      ? "text-yellow-700 dark:text-yellow-400"
      : "text-red-700 dark:text-red-400";

const columns: ColumnDef<Contributor>[] = [
  {
    accessorKey: "username",
    header: "Contributor",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <img src={row.original.avatarUrl} alt={row.original.username} className="h-6 w-6 rounded-full" />
        <a
          href={row.original.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          {row.original.username}
        </a>
      </div>
    ),
    filterFn: "includesString",
  },
  {
    accessorKey: "approvedPRs",
    header: "Approved PRs",
    cell: ({ row }) => (
      <span className="text-sm text-gray-700 dark:text-gray-300">
        {row.original.approvedPRs}
        <span className="ml-1 text-xs text-gray-400 dark:text-gray-500">/ {row.original.totalPRs}</span>
      </span>
    ),
    enableColumnFilter: false,
  },
  {
    accessorKey: "linesOfCode",
    header: "Lines of Code",
    cell: ({ row }) => (
      <div className="text-sm text-gray-700 dark:text-gray-300">
        {row.original.linesOfCode.toLocaleString()}
        <div className="text-xs text-gray-400 dark:text-gray-500">
          <span className="text-green-600 dark:text-green-400">+{row.original.linesAdded.toLocaleString()}</span>
          {" / "}
          <span className="text-red-600 dark:text-red-400">-{row.original.linesDeleted.toLocaleString()}</span>
        </div>
      </div>
    ),
    enableColumnFilter: false,
  },
  {
    accessorKey: "prApprovalRate",
    header: "Approval Rate",
    cell: ({ getValue }) => (
      <span className={rateClass(getValue<number>())}>{formatRate(getValue<number>())}</span>
    ),
    enableColumnFilter: false,
  },
  {
    accessorKey: "pipelineSuccessRate",
    header: "Pipeline",
    cell: ({ row }) => (
      <span>
        <span className={rateClass(row.original.pipelineSuccessRate)}>
          {formatRate(row.original.pipelineSuccessRate)}
        </span>
        <span className="ml-1 text-xs text-gray-400 dark:text-gray-500">
          ({row.original.successfulPipelineRuns}/{row.original.totalPipelineRuns})
        </span>
      </span>
    ),
    enableColumnFilter: false,
  },
  {
    id: "bugs",
    accessorFn: (row) => row.sonarCloudMetrics?.bugs ?? null,
    header: "Bugs",
    cell: ({ getValue }) => (
      <span className="text-sm text-gray-700 dark:text-gray-300">{getValue<number | null>() ?? "-"}</span>
    ),
    enableColumnFilter: false,
  },
  {
    id: "codeSmells",
    accessorFn: (row) => row.sonarCloudMetrics?.codeSmells ?? null,
    header: "Smells",
    cell: ({ getValue }) => (
      <span className="text-sm text-gray-700 dark:text-gray-300">{getValue<number | null>() ?? "-"}</span>
    ),
    enableColumnFilter: false,
  },
  {
    id: "securityHotspots",
    accessorFn: (row) => row.sonarCloudMetrics?.securityHotspots ?? null,
    header: "Hotspots",
    cell: ({ getValue }) => (
      <span className="text-sm text-gray-700 dark:text-gray-300">{getValue<number | null>() ?? "-"}</span>
    ),
    enableColumnFilter: false,
  },
  {
    id: "vulnerabilities",
    accessorFn: (row) => row.sonarCloudMetrics?.vulnerabilities ?? null,
    header: "Vulns",
    cell: ({ getValue }) => (
      <span className="text-sm text-gray-700 dark:text-gray-300">{getValue<number | null>() ?? "-"}</span>
    ),
    enableColumnFilter: false,
  },
  {
    id: "coverage",
    accessorFn: (row) => row.sonarCloudMetrics?.coverage ?? null,
    header: "Coverage",
    cell: ({ getValue }) => {
      const v = getValue<number | null>();
      return <span className="text-sm text-gray-700 dark:text-gray-300">{v !== null ? formatRate(v) : "-"}</span>;
    },
    enableColumnFilter: false,
  },
  {
    id: "duplications",
    accessorFn: (row) => row.sonarCloudMetrics?.duplications ?? null,
    header: "Dups",
    cell: ({ getValue }) => {
      const v = getValue<number | null>();
      return <span className="text-sm text-gray-700 dark:text-gray-300">{v !== null ? formatRate(v) : "-"}</span>;
    },
    enableColumnFilter: false,
  },
  {
    id: "technicalDebt",
    accessorFn: (row) => row.sonarCloudMetrics?.technicalDebt ?? null,
    header: "Debt",
    cell: ({ getValue }) => (
      <span className="text-sm text-gray-700 dark:text-gray-300">{getValue<string | null>() ?? "-"}</span>
    ),
    enableColumnFilter: false,
  },
];

const ColumnFilter = ({ column }: { column: { getFilterValue: () => unknown; setFilterValue: (v: unknown) => void } }) => (
  <input
    type="text"
    value={(column.getFilterValue() as string) ?? ""}
    onChange={(e) => column.setFilterValue(e.target.value || undefined)}
    placeholder="Filter..."
    className="w-full rounded border border-gray-200 px-1.5 py-1 text-xs dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
  />
);

const LoadingSkeleton = () => (
  <tbody>
    {Array.from({ length: 5 }, (_, i) => (
      <tr key={i} className="animate-pulse">
        {Array.from({ length: 12 }, (_, j) => (
          <td key={j} className="px-3 py-3">
            <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700" />
          </td>
        ))}
      </tr>
    ))}
  </tbody>
);

export const ContributorsTable = ({
  contributors,
  totalCount,
  isLoading,
  onDateRangeApply,
}: ContributorsTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([{ id: "linesOfCode", desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const table = useReactTable({
    data: contributors,
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

  if (!isLoading && contributors.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500 dark:text-gray-400">
        No contributors found.
      </div>
    );
  }

  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {table.getFilteredRowModel().rows.length} of {totalCount} contributors
          </p>
          <div className="flex items-center gap-2">
            <input
              type="date"
              aria-label="Date from"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded border border-gray-300 px-2 py-1 text-xs dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
            />
            <span className="text-xs text-gray-400">to</span>
            <input
              type="date"
              aria-label="Date to"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded border border-gray-300 px-2 py-1 text-xs dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
            />
            <button
              type="button"
              onClick={() => onDateRangeApply(dateFrom || null, dateTo || null)}
              className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
            >
              Apply
            </button>
          </div>
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
