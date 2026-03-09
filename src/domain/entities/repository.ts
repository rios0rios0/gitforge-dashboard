import type { Release } from "./release";
import type { Tag } from "./tag";
import type { WorkflowStatus } from "./workflow_status";

export interface Repository {
  readonly id: string;
  readonly name: string;
  readonly fullName: string;
  readonly url: string;
  readonly description: string | null;
  readonly primaryLanguage: string | null;
  readonly visibility: "PUBLIC" | "PRIVATE";
  readonly isArchived: boolean;
  readonly isFork: boolean;
  readonly defaultBranch: string;
  readonly updatedAt: string;
  readonly ciStatus: WorkflowStatus | null;
  readonly latestRelease: Release | null;
  readonly latestTag: Tag | null;
  readonly hasWorkflows: boolean;
}
