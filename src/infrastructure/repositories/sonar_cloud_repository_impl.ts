import type { SonarCloudMetrics } from "../../domain/entities/sonar_cloud_metrics";
import type { SonarCloudRepository } from "../../domain/repositories/sonar_cloud_repository";

const SONAR_CLOUD_API = "https://sonarcloud.io/api";

interface SonarMeasure {
  metric: string;
  value: string;
}

interface SonarMeasuresResponse {
  component: {
    measures: SonarMeasure[];
  };
}

interface SonarProjectSearchResponse {
  components: { key: string }[];
  paging: { total: number };
}

const METRIC_KEYS = [
  "bugs",
  "code_smells",
  "security_hotspots",
  "vulnerabilities",
  "coverage",
  "duplicated_lines_density",
  "sqale_index",
].join(",");

const parseMeasures = (measures: SonarMeasure[]): SonarCloudMetrics => {
  const get = (key: string): string => measures.find((m) => m.metric === key)?.value ?? "0";

  const sqaleMinutes = parseInt(get("sqale_index"), 10);
  const days = Math.floor(sqaleMinutes / (8 * 60));
  const hours = Math.floor((sqaleMinutes % (8 * 60)) / 60);
  const mins = sqaleMinutes % 60;
  const debtParts: string[] = [];
  if (days > 0) debtParts.push(`${days}d`);
  if (hours > 0) debtParts.push(`${hours}h`);
  debtParts.push(`${mins}min`);

  return {
    bugs: parseInt(get("bugs"), 10),
    codeSmells: parseInt(get("code_smells"), 10),
    securityHotspots: parseInt(get("security_hotspots"), 10),
    vulnerabilities: parseInt(get("vulnerabilities"), 10),
    coverage: parseFloat(get("coverage")),
    duplications: parseFloat(get("duplicated_lines_density")),
    technicalDebt: debtParts.join(" "),
  };
};

export class SonarCloudRepositoryImpl implements SonarCloudRepository {
  private readonly sonarToken: string;

  constructor(sonarToken: string) {
    this.sonarToken = sonarToken;
  }

  async getMetricsByAuthor(): Promise<SonarCloudMetrics | null> {
    return null;
  }

  async getProjectMetrics(projectKey: string): Promise<SonarCloudMetrics | null> {
    try {
      const url = `${SONAR_CLOUD_API}/measures/component?component=${encodeURIComponent(projectKey)}&metricKeys=${METRIC_KEYS}`;
      const response = await fetch(url, {
        headers: this.sonarToken
          ? { Authorization: `Bearer ${this.sonarToken}` }
          : {},
      });

      if (!response.ok) return null;

      const data = (await response.json()) as SonarMeasuresResponse;
      return parseMeasures(data.component.measures);
    } catch {
      return null;
    }
  }

  async listProjectKeys(organization: string): Promise<string[]> {
    try {
      const url = `${SONAR_CLOUD_API}/projects/search?organization=${encodeURIComponent(organization)}&ps=500`;
      const response = await fetch(url, {
        headers: this.sonarToken
          ? { Authorization: `Bearer ${this.sonarToken}` }
          : {},
      });

      if (!response.ok) return [];

      const data = (await response.json()) as SonarProjectSearchResponse;
      return data.components.map((c) => c.key);
    } catch {
      return [];
    }
  }
}

export class NoOpSonarCloudRepository implements SonarCloudRepository {
  async getMetricsByAuthor(): Promise<SonarCloudMetrics | null> {
    return null;
  }

  async getProjectMetrics(): Promise<SonarCloudMetrics | null> {
    return null;
  }

  async listProjectKeys(): Promise<string[]> {
    return [];
  }
}
