import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  WakaTimeRepositoryImpl,
  NoOpWakaTimeRepository,
} from "../../../src/infrastructure/repositories/wakatime_repository_impl";

describe("WakaTimeRepositoryImpl", () => {
  const token = "waka-token-123";

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should fetch members and their 30-day summaries", async () => {
    // given
    const repo = new WakaTimeRepositoryImpl(token);
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: [
              { user: { username: "alice", display_name: "Alice A", email: "alice@example.com" } },
            ],
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: [
              { grand_total: { total_seconds: 3600 } },
              { grand_total: { total_seconds: 7200 } },
            ],
          }),
          { status: 200 },
        ),
      );

    // when
    const result = await repo.getMemberSummaries("my-org");

    // then
    expect(result.get("Alice A")).toEqual({
      totalSeconds: 10800,
      dailyAverageSeconds: 5400,
    });
    expect(result.get("alice@example.com")).toEqual({
      totalSeconds: 10800,
      dailyAverageSeconds: 5400,
    });
  });

  it("should store summaries by both display name and email", async () => {
    // given
    const repo = new WakaTimeRepositoryImpl(token);
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: [
              { user: { username: "bob", display_name: "Bob B", email: "bob@test.com" } },
            ],
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ data: [{ grand_total: { total_seconds: 100 } }] }),
          { status: 200 },
        ),
      );

    // when
    const result = await repo.getMemberSummaries("org");

    // then
    expect(result.has("Bob B")).toBe(true);
    expect(result.has("bob@test.com")).toBe(true);
    expect(result.get("Bob B")).toEqual(result.get("bob@test.com"));
  });

  it("should return empty map when member fetch fails", async () => {
    // given
    const repo = new WakaTimeRepositoryImpl(token);
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response("Unauthorized", { status: 401 }),
    );

    // when
    const result = await repo.getMemberSummaries("my-org");

    // then
    expect(result.size).toBe(0);
  });

  it("should skip individual member summary failures", async () => {
    // given
    const repo = new WakaTimeRepositoryImpl(token);
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: [
              { user: { username: "alice", display_name: "Alice", email: "a@x.com" } },
              { user: { username: "bob", display_name: "Bob", email: "b@x.com" } },
            ],
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(new Response("Error", { status: 500 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ data: [{ grand_total: { total_seconds: 600 } }] }),
          { status: 200 },
        ),
      );

    // when
    const result = await repo.getMemberSummaries("my-org");

    // then
    expect(result.has("Alice")).toBe(false);
    expect(result.has("Bob")).toBe(true);
  });

  it("should process members in batches of 5", async () => {
    // given
    const repo = new WakaTimeRepositoryImpl(token);
    const members = Array.from({ length: 7 }, (_, i) => ({
      user: { username: `user${i}`, display_name: `User ${i}`, email: `u${i}@x.com` },
    }));

    const fetchSpy = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: members }), { status: 200 }),
      );

    for (let i = 0; i < 7; i++) {
      fetchSpy.mockResolvedValueOnce(
        new Response(
          JSON.stringify({ data: [{ grand_total: { total_seconds: 100 } }] }),
          { status: 200 },
        ),
      );
    }

    // when
    const result = await repo.getMemberSummaries("my-org");

    // then
    // 1 member list fetch + 7 summary fetches = 8 total
    expect(fetchSpy).toHaveBeenCalledTimes(8);
    expect(result.size).toBe(14); // 7 display names + 7 emails
  });

  it("should calculate daily average from total seconds / days", async () => {
    // given
    const repo = new WakaTimeRepositoryImpl(token);
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: [{ user: { username: "u1", display_name: "U1", email: "u1@x.com" } }],
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: [
              { grand_total: { total_seconds: 1000 } },
              { grand_total: { total_seconds: 2000 } },
              { grand_total: { total_seconds: 3000 } },
            ],
          }),
          { status: 200 },
        ),
      );

    // when
    const result = await repo.getMemberSummaries("org");

    // then
    const metrics = result.get("U1")!;
    expect(metrics.totalSeconds).toBe(6000);
    expect(metrics.dailyAverageSeconds).toBe(2000); // 6000 / 3 = 2000
  });

  it("should handle empty summary data (0 days)", async () => {
    // given
    const repo = new WakaTimeRepositoryImpl(token);
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: [{ user: { username: "u1", display_name: "U1", email: "" } }],
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: [] }), { status: 200 }),
      );

    // when
    const result = await repo.getMemberSummaries("org");

    // then
    const metrics = result.get("U1")!;
    expect(metrics.totalSeconds).toBe(0);
    expect(metrics.dailyAverageSeconds).toBe(0); // 0 / 1 = 0, uses || 1 for division
  });
});

describe("NoOpWakaTimeRepository", () => {
  it("should return empty map", async () => {
    // given
    const repo = new NoOpWakaTimeRepository();

    // when
    const result = await repo.getMemberSummaries("any-org");

    // then
    expect(result).toEqual(new Map());
  });
});
