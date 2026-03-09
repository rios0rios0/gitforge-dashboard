import type { Repository } from "../entities/repository";

export interface DashboardService {
  listRepositories(token: string, username: string): Promise<Repository[]>;
}
