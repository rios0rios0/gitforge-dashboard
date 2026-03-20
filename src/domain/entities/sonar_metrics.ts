export type QualityGateStatus = "OK" | "ERROR" | "NONE";

export interface SonarMetrics {
  readonly bugs: number;
  readonly codeSmells: number;
  readonly securityHotspots: number;
  readonly vulnerabilities: number;
  readonly coverage: number;
  readonly duplications: number;
  readonly technicalDebt: string;
  readonly qualityGateStatus: QualityGateStatus;
}

export const EMPTY_SONAR_METRICS: SonarMetrics = {
  bugs: 0,
  codeSmells: 0,
  securityHotspots: 0,
  vulnerabilities: 0,
  coverage: 0,
  duplications: 0,
  technicalDebt: "0min",
  qualityGateStatus: "NONE",
};
