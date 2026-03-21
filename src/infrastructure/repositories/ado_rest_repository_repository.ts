import type { Repository } from "../../domain/entities/repository";
import type { RepositoryRepository } from "../../domain/repositories/repository_repository";
import { mapAdoRepoToRepository } from "../../service/mappers/ado_repository_mapper";
import type { AdoBuildNode, AdoProject, AdoRefNode, AdoRepositoryNode } from "../../service/mappers/ado_repository_node";
import { adoRequest } from "../http/ado_rest_client";

const ADO_API = "https://dev.azure.com";
const API_VERSION = "api-version=7.1";
const BATCH_SIZE = 10;

interface AdoListResponse<T> {
  value: T[];
  count: number;
}

const fetchProjects = async (token: string, org: string): Promise<AdoProject[]> => {
  const url = `${ADO_API}/${org}/_apis/projects?${API_VERSION}`;
  const response = await adoRequest<AdoListResponse<AdoProject>>(token, url);
  return response.value;
};

const fetchRepos = async (
  token: string,
  org: string,
  project: string,
): Promise<AdoRepositoryNode[]> => {
  const url = `${ADO_API}/${org}/${project}/_apis/git/repositories?${API_VERSION}`;
  const response = await adoRequest<AdoListResponse<AdoRepositoryNode>>(token, url);
  return response.value;
};

const fetchLatestBuild = async (
  token: string,
  org: string,
  project: string,
  repoId: string,
): Promise<AdoBuildNode | null> => {
  try {
    const url = `${ADO_API}/${org}/${project}/_apis/build/builds?repositoryId=${repoId}&repositoryType=TfsGit&$top=1&queryOrder=finishTimeDescending&${API_VERSION}`;
    const response = await adoRequest<AdoListResponse<AdoBuildNode>>(token, url);
    return response.value[0] ?? null;
  } catch {
    return null;
  }
};

const fetchBranches = async (
  token: string,
  org: string,
  project: string,
  repoId: string,
): Promise<string[]> => {
  try {
    const url = `${ADO_API}/${org}/${project}/_apis/git/repositories/${repoId}/refs?filter=heads/&${API_VERSION}`;
    const response = await adoRequest<AdoListResponse<AdoRefNode>>(token, url);
    return response.value.map((ref) => ref.name.replace("refs/heads/", ""));
  } catch {
    return [];
  }
};

const fetchLatestTag = async (
  token: string,
  org: string,
  project: string,
  repoId: string,
): Promise<AdoRefNode | null> => {
  try {
    const url = `${ADO_API}/${org}/${project}/_apis/git/repositories/${repoId}/refs?filter=tags/&$top=1&${API_VERSION}`;
    const response = await adoRequest<AdoListResponse<AdoRefNode>>(token, url);
    return response.value[0] ?? null;
  } catch {
    return null;
  }
};

const processBatch = async <T, R>(
  items: T[],
  batchSize: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> => {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(fn));
    results.push(...batchResults);
  }
  return results;
};

export class AdoRestRepositoryRepository implements RepositoryRepository {
  async listAll(token: string, organization: string): Promise<Repository[]> {
    const projects = await fetchProjects(token, organization);

    const allRepos: AdoRepositoryNode[] = [];
    for (const project of projects) {
      try {
        const repos = await fetchRepos(token, organization, project.name);
        allRepos.push(...repos);
      } catch {
        // skip projects where repo access fails
      }
    }

    return processBatch(allRepos, BATCH_SIZE, async (repo) => {
      const projectName = repo.project.name;
      const [build, tagRef, branches] = await Promise.all([
        fetchLatestBuild(token, organization, projectName, repo.id),
        fetchLatestTag(token, organization, projectName, repo.id),
        fetchBranches(token, organization, projectName, repo.id),
      ]);
      return mapAdoRepoToRepository(repo, build, tagRef, organization, branches);
    });
  }
}
