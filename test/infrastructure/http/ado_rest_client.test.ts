import { describe, it, expect, vi, beforeEach } from "vitest";
import { adoRequest } from "../../../src/infrastructure/http/ado_rest_client";

describe("adoRequest", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should return parsed JSON when API responds successfully", async () => {
    // given
    const responseData = { value: [{ id: "1", name: "repo1" }], count: 1 };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(responseData),
      }),
    );

    // when
    const result = await adoRequest("token", "https://dev.azure.com/org/_apis/projects");

    // then
    expect(result).toEqual(responseData);
  });

  it("should throw when HTTP response is not ok", async () => {
    // given
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        statusText: "Forbidden",
      }),
    );

    // when / then
    await expect(
      adoRequest("token", "https://dev.azure.com/org/_apis/projects"),
    ).rejects.toThrow("Azure DevOps API error: 403 Forbidden");
  });

  it("should send Basic auth header with base64-encoded token", async () => {
    // given
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
    vi.stubGlobal("fetch", fetchMock);

    // when
    await adoRequest("my-pat-token", "https://dev.azure.com/org/_apis/projects");

    // then
    const [, options] = fetchMock.mock.calls[0];
    expect(options.headers.Authorization).toBe(`Basic ${btoa(":my-pat-token")}`);
  });

  it("should send Content-Type application/json header", async () => {
    // given
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
    vi.stubGlobal("fetch", fetchMock);

    // when
    await adoRequest("token", "https://dev.azure.com/org/_apis/projects");

    // then
    const [, options] = fetchMock.mock.calls[0];
    expect(options.headers["Content-Type"]).toBe("application/json");
  });
});
