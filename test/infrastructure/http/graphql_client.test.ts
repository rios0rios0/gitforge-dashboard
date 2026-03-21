import { describe, it, expect, vi, beforeEach } from "vitest";
import { graphqlRequest } from "../../../src/infrastructure/http/graphql_client";

describe("graphqlRequest", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should return data when API responds successfully", async () => {
    // given
    const responseData = { user: { name: "test" } };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: responseData }),
      }),
    );

    // when
    const result = await graphqlRequest("token123", "query { user { name } }");

    // then
    expect(result).toEqual(responseData);
  });

  it("should throw when HTTP response is not ok", async () => {
    // given
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
      }),
    );

    // when / then
    await expect(graphqlRequest("bad-token", "query {}")).rejects.toThrow(
      "GitHub API error: 401 Unauthorized",
    );
  });

  it("should throw when GraphQL response contains errors", async () => {
    // given
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            data: null,
            errors: [{ message: "Field not found" }, { message: "Invalid query" }],
          }),
      }),
    );

    // when / then
    await expect(graphqlRequest("token", "query {}")).rejects.toThrow(
      "GraphQL error: Field not found, Invalid query",
    );
  });

  it("should send correct Authorization header with bearer token", async () => {
    // given
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: {} }),
    });
    vi.stubGlobal("fetch", fetchMock);

    // when
    await graphqlRequest("my-secret-token", "query {}");

    // then
    const [, options] = fetchMock.mock.calls[0];
    expect(options.headers.Authorization).toBe("bearer my-secret-token");
    expect(options.headers["Content-Type"]).toBe("application/json");
  });

  it("should send query and variables in request body", async () => {
    // given
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: {} }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const query = "query($id: ID!) { node(id: $id) { id } }";
    const variables = { id: "123" };

    // when
    await graphqlRequest("token", query, variables);

    // then
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.query).toBe(query);
    expect(body.variables).toEqual(variables);
  });
});
