import type { SonarMetrics, QualityGateStatus } from "../../domain/entities/sonar_metrics";
import type { AuthorIssues, SonarRepository } from "../../domain/repositories/sonar_repository";

export interface SonarConfig {
  type: "cloud" | "qube";
  token: string;
  baseUrl: string;
  organization?: string;
}

interface SonarMeasure {
  metric: string;
  value: string;
}

interface SonarMeasuresResponse {
  component: { measures: SonarMeasure[] };
}

interface SonarProjectSearchResponse {
  components: { key: string }[];
  paging: { total: number };
}

interface SonarQualityGateResponse {
  projectStatus: { status: string };
}

interface SonarIssue {
  author: string;
  type: "BUG" | "CODE_SMELL" | "VULNERABILITY" | "SECURITY_HOTSPOT";
}

interface SonarIssuesResponse {
  issues: SonarIssue[];
  paging: { total: number; pageIndex: number; pageSize: number };
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

const parseMeasures = (measures: SonarMeasure[], qualityGate: QualityGateStatus): SonarMetrics => {
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
    qualityGateStatus: qualityGate,
  };
};

const sonarFetch = async <T>(token: string, url: string): Promise<T> => {
  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) throw new Error(`Sonar API error: ${response.status}`);
  return (await response.json()) as T;
};

export class SonarRepositoryImpl implements SonarRepository {
  private readonly config: SonarConfig;
  private readonly apiBase: string;

  constructor(config: SonarConfig) {
    this.config = config;
    this.apiBase = `${config.baseUrl.replace(/\/$/, "")}/api`;
  }

  async listProjectKeys(): Promise<string[]> {
    try {
      const orgParam =
        this.config.type === "cloud" && this.config.organization
          ? `&organization=${encodeURIComponent(this.config.organization)}`
          : "";
      const url = `${this.apiBase}/projects/search?ps=500${orgParam}`;
      const data = await sonarFetch<SonarProjectSearchResponse>(this.config.token, url);
      return data.components.map((c) => c.key);
    } catch {
      return [];
    }
  }

  async getProjectMetrics(projectKey: string): Promise<SonarMetrics | null> {
    try {
      const [measuresData, gateData] = await Promise.all([
        sonarFetch<SonarMeasuresResponse>(
          this.config.token,
          `${this.apiBase}/measures/component?component=${encodeURIComponent(projectKey)}&metricKeys=${METRIC_KEYS}`,
        ),
        sonarFetch<SonarQualityGateResponse>(
          this.config.token,
          `${this.apiBase}/qualitygates/project_status?projectKey=${encodeURIComponent(projectKey)}`,
        ).catch(() => null),
      ]);

      const gateStatus = gateData?.projectStatus?.status;
      const qualityGate: QualityGateStatus =
        gateStatus === "OK" ? "OK" : gateStatus === "ERROR" ? "ERROR" : "NONE";

      return parseMeasures(measuresData.component.measures, qualityGate);
    } catch {
      return null;
    }
  }

  async getIssuesByAuthor(projectKey: string): Promise<Map<string, AuthorIssues>> {
    const result = new Map<string, AuthorIssues>();
    let page = 1;
    const pageSize = 500;

    try {
      for (;;) {
        const url = `${this.apiBase}/issues/search?componentKeys=${encodeURIComponent(projectKey)}&statuses=OPEN,CONFIRMED&ps=${pageSize}&p=${page}`;
        const data = await sonarFetch<SonarIssuesResponse>(this.config.token, url);

        for (const issue of data.issues) {
          const author = issue.author || "unknown";
          let entry = result.get(author);
          if (!entry) {
            entry = { bugs: 0, codeSmells: 0, vulnerabilities: 0, securityHotspots: 0 };
            result.set(author, entry);
          }

          const typeHandlers: Record<string, () => void> = {
            BUG: () => entry.bugs++,
            CODE_SMELL: () => entry.codeSmells++,
            VULNERABILITY: () => entry.vulnerabilities++,
            SECURITY_HOTSPOT: () => entry.securityHotspots++,
          };
          typeHandlers[issue.type]?.();
        }

        if (page * pageSize >= data.paging.total) break;
        page++;
      }
    } catch {
      // return whatever we collected
    }

    return result;
  }
}

export class NoOpSonarRepository implements SonarRepository {
  async listProjectKeys(): Promise<string[]> {
    return [];
  }

  async getProjectMetrics(_projectKey: string): Promise<SonarMetrics | null> {
    return null;
  }

  async getIssuesByAuthor(_projectKey: string): Promise<Map<string, AuthorIssues>> {
    return new Map();
  }
}
