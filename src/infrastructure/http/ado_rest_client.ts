export const adoRequest = async <T>(token: string, url: string): Promise<T> => {
  const response = await fetch(url, {
    headers: {
      Authorization: `Basic ${btoa(`:${token}`)}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Azure DevOps API error: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
};
