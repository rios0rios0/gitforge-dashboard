import type { Repository } from "../../src/domain/entities/repository";
import type { DashboardService } from "../../src/domain/services/dashboard_service";

export class StubDashboardService implements DashboardService {
  private result: Repository[] = [];
  private error: Error | null = null;

  withRepositories(repos: Repository[]): this {
    this.result = repos;
    return this;
  }

  withError(error: Error): this {
    this.error = error;
    return this;
  }

  async listRepositories(_token: string, _username: string): Promise<Repository[]> {
    if (this.error) throw this.error;
    return this.result;
  }
}
