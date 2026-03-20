export interface GraphQLPullRequestNode {
  number: number;
  title: string;
  state: "OPEN" | "CLOSED" | "MERGED";
  createdAt: string;
  mergedAt: string | null;
  additions: number;
  deletions: number;
  author: {
    login: string;
    avatarUrl: string;
    url: string;
  } | null;
  reviews: {
    nodes: {
      state: "APPROVED" | "CHANGES_REQUESTED" | "COMMENTED" | "DISMISSED" | "PENDING";
    }[];
  };
  commits: {
    nodes: {
      commit: {
        statusCheckRollup: {
          state: string;
          contexts: {
            totalCount: number;
          };
        } | null;
      };
    }[];
  };
}

export interface GraphQLContributorQueryResponse {
  user: {
    repositories: {
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
      nodes: {
        name: string;
        pullRequests: {
          pageInfo: { hasNextPage: boolean; endCursor: string | null };
          nodes: GraphQLPullRequestNode[];
        };
      }[];
    };
  };
}
