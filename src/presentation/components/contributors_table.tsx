import type { Contributor } from "../../domain/entities/contributor";
import type { ContributorFilter, ContributorSortField, SortDirection } from "../../domain/entities/contributor_filter";

interface ContributorsTableProps {
  contributors: Contributor[];
  totalCount: number;
  isLoading: boolean;
  filter: ContributorFilter;
  onSortChange: (field: ContributorSortField) => void;
}

const SortHeader = ({
  label,
  field,
  currentField,
  currentDirection,
  onClick,
}: {
  label: string;
  field: ContributorSortField;
  currentField: ContributorSortField;
  currentDirection: SortDirection;
  onClick: (field: ContributorSortField) => void;
}) => {
  const isActive = currentField === field;
  return (
    <th
      className="cursor-pointer whitespace-nowrap px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-gray-700"
      onClick={() => onClick(field)}
    >
      {label}
      {isActive && (
        <span className="ml-1">{currentDirection === "asc" ? "\u25B2" : "\u25BC"}</span>
      )}
    </th>
  );
};

const formatRate = (rate: number): string => `${rate.toFixed(1)}%`;

const LoadingSkeleton = () => (
  <tbody>
    {Array.from({ length: 5 }, (_, i) => (
      <tr key={i} className="animate-pulse">
        {Array.from({ length: 13 }, (_, j) => (
          <td key={j} className="px-3 py-3">
            <div className="h-4 w-16 rounded bg-gray-200" />
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
  filter,
  onSortChange,
}: ContributorsTableProps) => {
  const headerProps = {
    currentField: filter.sortField,
    currentDirection: filter.sortDirection,
    onClick: onSortChange,
  };

  if (!isLoading && contributors.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        No contributors found for the selected filters.
      </div>
    );
  }

  return (
    <>
      <p className="mb-4 text-sm text-gray-500">
        Showing {contributors.length} of {totalCount} contributors
      </p>
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <SortHeader label="Contributor" field="username" {...headerProps} />
              <SortHeader label="Approved PRs" field="approvedPRs" {...headerProps} />
              <SortHeader label="Lines of Code" field="linesOfCode" {...headerProps} />
              <SortHeader label="Approval Rate" field="prApprovalRate" {...headerProps} />
              <SortHeader
                label="Pipeline Success"
                field="pipelineSuccessRate"
                {...headerProps}
              />
              <SortHeader label="Bugs" field="bugs" {...headerProps} />
              <SortHeader label="Code Smells" field="codeSmells" {...headerProps} />
              <SortHeader label="Security Hotspots" field="securityHotspots" {...headerProps} />
              <SortHeader label="Vulnerabilities" field="vulnerabilities" {...headerProps} />
              <SortHeader label="Coverage" field="coverage" {...headerProps} />
              <SortHeader label="Duplications" field="duplications" {...headerProps} />
              <SortHeader label="Technical Debt" field="technicalDebt" {...headerProps} />
            </tr>
          </thead>
          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            <tbody className="divide-y divide-gray-200">
              {contributors.map((contributor) => (
                <tr key={contributor.username} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-3 py-3">
                    <div className="flex items-center gap-2">
                      <img
                        src={contributor.avatarUrl}
                        alt={contributor.username}
                        className="h-6 w-6 rounded-full"
                      />
                      <a
                        href={contributor.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        {contributor.username}
                      </a>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-700">
                    {contributor.approvedPRs}
                    <span className="ml-1 text-xs text-gray-400">/ {contributor.totalPRs}</span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-700">
                    {contributor.linesOfCode.toLocaleString()}
                    <div className="text-xs text-gray-400">
                      <span className="text-green-600">+{contributor.linesAdded.toLocaleString()}</span>
                      {" / "}
                      <span className="text-red-600">-{contributor.linesDeleted.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-sm">
                    <span
                      className={
                        contributor.prApprovalRate >= 80
                          ? "text-green-700"
                          : contributor.prApprovalRate >= 50
                            ? "text-yellow-700"
                            : "text-red-700"
                      }
                    >
                      {formatRate(contributor.prApprovalRate)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-sm">
                    <span
                      className={
                        contributor.pipelineSuccessRate >= 80
                          ? "text-green-700"
                          : contributor.pipelineSuccessRate >= 50
                            ? "text-yellow-700"
                            : "text-red-700"
                      }
                    >
                      {formatRate(contributor.pipelineSuccessRate)}
                    </span>
                    <span className="ml-1 text-xs text-gray-400">
                      ({contributor.successfulPipelineRuns}/{contributor.totalPipelineRuns})
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-700">
                    {contributor.sonarCloudMetrics?.bugs ?? "-"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-700">
                    {contributor.sonarCloudMetrics?.codeSmells ?? "-"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-700">
                    {contributor.sonarCloudMetrics?.securityHotspots ?? "-"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-700">
                    {contributor.sonarCloudMetrics?.vulnerabilities ?? "-"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-700">
                    {contributor.sonarCloudMetrics
                      ? formatRate(contributor.sonarCloudMetrics.coverage)
                      : "-"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-700">
                    {contributor.sonarCloudMetrics
                      ? formatRate(contributor.sonarCloudMetrics.duplications)
                      : "-"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-700">
                    {contributor.sonarCloudMetrics?.technicalDebt ?? "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>
    </>
  );
};
