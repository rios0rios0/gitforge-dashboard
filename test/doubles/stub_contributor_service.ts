import type { Contributor } from "../../src/domain/entities/contributor";
import type { ContributorService } from "../../src/domain/services/contributor_service";

export class StubContributorService implements ContributorService {
  private result: Contributor[] = [];
  private error: Error | null = null;

  withContributors(contributors: Contributor[]): this {
    this.result = contributors;
    return this;
  }

  withError(error: Error): this {
    this.error = error;
    return this;
  }

  async listContributors(
    _token: string,
    _username: string,
    _dateFrom: string | null,
    _dateTo: string | null,
  ): Promise<Contributor[]> {
    if (this.error) throw this.error;
    return this.result;
  }
}
