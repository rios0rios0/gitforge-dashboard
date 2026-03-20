import type { Contributor } from "../domain/entities/contributor";
import type { SonarCloudMetrics } from "../domain/entities/sonar_cloud_metrics";
import type { ContributorRepository } from "../domain/repositories/contributor_repository";
import type { SonarCloudRepository } from "../domain/repositories/sonar_cloud_repository";
import type { ContributorService } from "../domain/services/contributor_service";

const aggregateProjectMetrics = (
  metricsArray: (SonarCloudMetrics | null)[],
): SonarCloudMetrics | null => {
  const valid = metricsArray.filter((m): m is SonarCloudMetrics => m !== null);
  if (valid.length === 0) return null;

  return {
    bugs: valid.reduce((sum, m) => sum + m.bugs, 0),
    codeSmells: valid.reduce((sum, m) => sum + m.codeSmells, 0),
    securityHotspots: valid.reduce((sum, m) => sum + m.securityHotspots, 0),
    vulnerabilities: valid.reduce((sum, m) => sum + m.vulnerabilities, 0),
    coverage:
      valid.reduce((sum, m) => sum + m.coverage, 0) / valid.length,
    duplications:
      valid.reduce((sum, m) => sum + m.duplications, 0) / valid.length,
    technicalDebt: formatTotalDebt(valid),
  };
};

const formatTotalDebt = (metrics: SonarCloudMetrics[]): string => {
  let totalMinutes = 0;
  for (const m of metrics) {
    totalMinutes += parseDebtToMinutes(m.technicalDebt);
  }
  const days = Math.floor(totalMinutes / (8 * 60));
  const hours = Math.floor((totalMinutes % (8 * 60)) / 60);
  const mins = totalMinutes % 60;
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  parts.push(`${mins}min`);
  return parts.join(" ");
};

const parseDebtToMinutes = (debt: string): number => {
  let minutes = 0;
  const dayMatch = debt.match(/(\d+)d/);
  const hourMatch = debt.match(/(\d+)h/);
  const minMatch = debt.match(/(\d+)min/);
  if (dayMatch) minutes += parseInt(dayMatch[1], 10) * 8 * 60;
  if (hourMatch) minutes += parseInt(hourMatch[1], 10) * 60;
  if (minMatch) minutes += parseInt(minMatch[1], 10);
  return minutes;
};

export class GitHubContributorService implements ContributorService {
  private readonly contributorRepository: ContributorRepository;
  private readonly sonarCloudRepository: SonarCloudRepository;

  constructor(
    contributorRepository: ContributorRepository,
    sonarCloudRepository: SonarCloudRepository,
  ) {
    this.contributorRepository = contributorRepository;
    this.sonarCloudRepository = sonarCloudRepository;
  }

  async listContributors(
    token: string,
    username: string,
    dateFrom: string | null,
    dateTo: string | null,
  ): Promise<Contributor[]> {
    const contributors = await this.contributorRepository.listContributors(
      token,
      username,
      dateFrom,
      dateTo,
    );

    // Try to fetch SonarCloud metrics
    const projectKeys = await this.sonarCloudRepository.listProjectKeys(username);
    if (projectKeys.length === 0) return contributors;

    const projectMetrics = await Promise.all(
      projectKeys.map((key) => this.sonarCloudRepository.getProjectMetrics(key)),
    );

    const aggregated = aggregateProjectMetrics(projectMetrics);
    if (!aggregated) return contributors;

    // Distribute SonarCloud metrics proportionally by lines of code
    const totalLines = contributors.reduce((sum, c) => sum + c.linesOfCode, 0);
    if (totalLines === 0) return contributors;

    return contributors.map((c) => {
      const ratio = c.linesOfCode / totalLines;
      return {
        ...c,
        sonarCloudMetrics: {
          bugs: Math.round(aggregated.bugs * ratio),
          codeSmells: Math.round(aggregated.codeSmells * ratio),
          securityHotspots: Math.round(aggregated.securityHotspots * ratio),
          vulnerabilities: Math.round(aggregated.vulnerabilities * ratio),
          coverage: Math.round(aggregated.coverage * 10) / 10,
          duplications: Math.round(aggregated.duplications * 10) / 10,
          technicalDebt: formatProportionalDebt(aggregated.technicalDebt, ratio),
        },
      };
    });
  }
}

const formatProportionalDebt = (totalDebt: string, ratio: number): string => {
  const totalMinutes = parseDebtToMinutes(totalDebt);
  const proportional = Math.round(totalMinutes * ratio);
  const days = Math.floor(proportional / (8 * 60));
  const hours = Math.floor((proportional % (8 * 60)) / 60);
  const mins = proportional % 60;
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  parts.push(`${mins}min`);
  return parts.join(" ");
};
