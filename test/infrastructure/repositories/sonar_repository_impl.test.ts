import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  SonarRepositoryImpl,
  NoOpSonarRepository,
  type SonarConfig,
} from "../../../src/infrastructure/repositories/sonar_repository_impl";

describe("SonarRepositoryImpl", () => {
  const cloudConfig: SonarConfig = {
    type: "cloud",
    token: "sonar-token-123",
    baseUrl: "https://sonarcloud.io/",
    organization: "my-org",
  };

  const qubeConfig: SonarConfig = {
    type: "qube",
    token: "sonar-token-456",
    baseUrl: "https://sonar.example.com",
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("listProjectKeys", () => {
    it("should return project keys on success", async () => {
      // given
      const repo = new SonarRepositoryImpl(cloudConfig);
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            components: [{ key: "proj-a" }, { key: "proj-b" }],
            paging: { total: 2 },
          }),
          { status: 200 },
        ),
      );

      // when
      const result = await repo.listProjectKeys();

      // then
      expect(result).toEqual(["proj-a", "proj-b"]);
    });

    it("should return empty array on failure", async () => {
      // given
      const repo = new SonarRepositoryImpl(cloudConfig);
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response("Unauthorized", { status: 401 }),
      );

      // when
      const result = await repo.listProjectKeys();

      // then
      expect(result).toEqual([]);
    });

    it("should include organization param for cloud type", async () => {
      // given
      const repo = new SonarRepositoryImpl(cloudConfig);
      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify({ components: [], paging: { total: 0 } }), { status: 200 }),
      );

      // when
      await repo.listProjectKeys();

      // then
      const url = fetchSpy.mock.calls[0][0] as string;
      expect(url).toContain("organization=my-org");
    });

    it("should omit organization param for qube type", async () => {
      // given
      const repo = new SonarRepositoryImpl(qubeConfig);
      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify({ components: [], paging: { total: 0 } }), { status: 200 }),
      );

      // when
      await repo.listProjectKeys();

      // then
      const url = fetchSpy.mock.calls[0][0] as string;
      expect(url).not.toContain("organization=");
    });
  });

  describe("getProjectMetrics", () => {
    it("should return parsed metrics with quality gate OK", async () => {
      // given
      const repo = new SonarRepositoryImpl(cloudConfig);
      vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              component: {
                measures: [
                  { metric: "bugs", value: "5" },
                  { metric: "code_smells", value: "10" },
                  { metric: "security_hotspots", value: "2" },
                  { metric: "vulnerabilities", value: "1" },
                  { metric: "coverage", value: "82.5" },
                  { metric: "duplicated_lines_density", value: "3.2" },
                  { metric: "sqale_index", value: "530" },
                ],
              },
            }),
            { status: 200 },
          ),
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ projectStatus: { status: "OK" } }), { status: 200 }),
        );

      // when
      const result = await repo.getProjectMetrics("my-project");

      // then
      expect(result).not.toBeNull();
      expect(result!.bugs).toBe(5);
      expect(result!.codeSmells).toBe(10);
      expect(result!.securityHotspots).toBe(2);
      expect(result!.vulnerabilities).toBe(1);
      expect(result!.coverage).toBe(82.5);
      expect(result!.duplications).toBe(3.2);
      expect(result!.qualityGateStatus).toBe("OK");
      expect(result!.technicalDebt).toBe("1d 50min");
    });

    it("should return parsed metrics with quality gate ERROR", async () => {
      // given
      const repo = new SonarRepositoryImpl(cloudConfig);
      vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              component: {
                measures: [
                  { metric: "bugs", value: "0" },
                  { metric: "sqale_index", value: "0" },
                ],
              },
            }),
            { status: 200 },
          ),
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ projectStatus: { status: "ERROR" } }), { status: 200 }),
        );

      // when
      const result = await repo.getProjectMetrics("my-project");

      // then
      expect(result).not.toBeNull();
      expect(result!.qualityGateStatus).toBe("ERROR");
      expect(result!.technicalDebt).toBe("0min");
    });

    it("should return null on failure", async () => {
      // given
      const repo = new SonarRepositoryImpl(cloudConfig);
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response("Not Found", { status: 404 }),
      );

      // when
      const result = await repo.getProjectMetrics("bad-project");

      // then
      expect(result).toBeNull();
    });

    it("should handle quality gate fetch failure gracefully", async () => {
      // given
      const repo = new SonarRepositoryImpl(cloudConfig);
      vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              component: { measures: [{ metric: "bugs", value: "1" }] },
            }),
            { status: 200 },
          ),
        )
        .mockResolvedValueOnce(new Response("Server Error", { status: 500 }));

      // when
      const result = await repo.getProjectMetrics("my-project");

      // then
      expect(result).not.toBeNull();
      expect(result!.qualityGateStatus).toBe("NONE");
    });

    it("should format technical debt with days hours and minutes", async () => {
      // given
      const repo = new SonarRepositoryImpl(cloudConfig);
      vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              component: {
                measures: [{ metric: "sqale_index", value: "1530" }],
              },
            }),
            { status: 200 },
          ),
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ projectStatus: { status: "OK" } }), { status: 200 }),
        );

      // when
      const result = await repo.getProjectMetrics("my-project");

      // then
      // 1530 min = 3d (3*480=1440) + 1h (60) + 30min
      expect(result!.technicalDebt).toBe("3d 1h 30min");
    });
  });

  describe("getIssuesByAuthor", () => {
    it("should aggregate issues by author and type", async () => {
      // given
      const repo = new SonarRepositoryImpl(cloudConfig);
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            issues: [
              { author: "alice", type: "BUG" },
              { author: "alice", type: "BUG" },
              { author: "bob", type: "CODE_SMELL" },
              { author: "alice", type: "VULNERABILITY" },
              { author: "bob", type: "SECURITY_HOTSPOT" },
            ],
            paging: { total: 5, pageIndex: 1, pageSize: 500 },
          }),
          { status: 200 },
        ),
      );

      // when
      const result = await repo.getIssuesByAuthor("my-project");

      // then
      expect(result.get("alice")).toEqual({
        bugs: 2,
        codeSmells: 0,
        vulnerabilities: 1,
        securityHotspots: 0,
      });
      expect(result.get("bob")).toEqual({
        bugs: 0,
        codeSmells: 1,
        vulnerabilities: 0,
        securityHotspots: 1,
      });
    });

    it("should paginate when results exceed page size", async () => {
      // given
      const repo = new SonarRepositoryImpl(cloudConfig);
      const fetchSpy = vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              issues: [{ author: "alice", type: "BUG" }],
              paging: { total: 501, pageIndex: 1, pageSize: 500 },
            }),
            { status: 200 },
          ),
        )
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              issues: [{ author: "bob", type: "CODE_SMELL" }],
              paging: { total: 501, pageIndex: 2, pageSize: 500 },
            }),
            { status: 200 },
          ),
        );

      // when
      const result = await repo.getIssuesByAuthor("my-project");

      // then
      expect(fetchSpy).toHaveBeenCalledTimes(2);
      expect(result.size).toBe(2);
    });

    it("should handle unknown author as 'unknown'", async () => {
      // given
      const repo = new SonarRepositoryImpl(cloudConfig);
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            issues: [{ author: "", type: "BUG" }],
            paging: { total: 1, pageIndex: 1, pageSize: 500 },
          }),
          { status: 200 },
        ),
      );

      // when
      const result = await repo.getIssuesByAuthor("my-project");

      // then
      expect(result.has("unknown")).toBe(true);
      expect(result.get("unknown")!.bugs).toBe(1);
    });

    it("should return partial results on mid-pagination failure", async () => {
      // given
      const repo = new SonarRepositoryImpl(cloudConfig);
      vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              issues: [{ author: "alice", type: "BUG" }],
              paging: { total: 1000, pageIndex: 1, pageSize: 500 },
            }),
            { status: 200 },
          ),
        )
        .mockResolvedValueOnce(new Response("Server Error", { status: 500 }));

      // when
      const result = await repo.getIssuesByAuthor("my-project");

      // then
      expect(result.size).toBe(1);
      expect(result.get("alice")!.bugs).toBe(1);
    });
  });
});

describe("NoOpSonarRepository", () => {
  it("should return empty values for all methods", async () => {
    // given
    const repo = new NoOpSonarRepository();

    // when
    const keys = await repo.listProjectKeys();
    const metrics = await repo.getProjectMetrics("any");
    const issues = await repo.getIssuesByAuthor("any");

    // then
    expect(keys).toEqual([]);
    expect(metrics).toBeNull();
    expect(issues).toEqual(new Map());
  });
});
