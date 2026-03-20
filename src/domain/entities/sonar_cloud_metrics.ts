export interface SonarCloudMetrics {
  readonly bugs: number;
  readonly codeSmells: number;
  readonly securityHotspots: number;
  readonly vulnerabilities: number;
  readonly coverage: number;
  readonly duplications: number;
  readonly technicalDebt: string;
}

export const EMPTY_SONAR_METRICS: SonarCloudMetrics = {
  bugs: 0,
  codeSmells: 0,
  securityHotspots: 0,
  vulnerabilities: 0,
  coverage: 0,
  duplications: 0,
  technicalDebt: "0min",
};
