const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";

export interface GraphQLResponse<T> {
  data: T;
  errors?: { message: string }[];
}

export const graphqlRequest = async <T>(
  token: string,
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> => {
  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: "POST",
    headers: {
      Authorization: `bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  const json = (await response.json()) as GraphQLResponse<T>;

  if (json.errors?.length) {
    throw new Error(`GraphQL error: ${json.errors.map((e) => e.message).join(", ")}`);
  }

  return json.data;
};
