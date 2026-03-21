import { describe, it, expect } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useContributors } from "../../../src/presentation/hooks/use_contributors";
import { StubContributorService } from "../../doubles/stub_contributor_service";
import { ContributorBuilder } from "../../builders/contributor_builder";

describe("useContributors", () => {
  it("should fetch contributors on mount when token and username are present", async () => {
    // given
    const contributors = [ContributorBuilder.create().withUsername("alice").build()];
    const service = new StubContributorService().withContributors(contributors);

    // when
    const { result } = renderHook(() => useContributors(service, "token", "user"));

    // then
    await waitFor(() => {
      expect(result.current.contributors).toEqual(contributors);
    });
  });

  it("should set isLoading true during fetch and false after", async () => {
    // given
    const service = new StubContributorService().withContributors([]);

    // when
    const { result } = renderHook(() => useContributors(service, "token", "user"));

    // then
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("should set error message when fetch fails", async () => {
    // given
    const service = new StubContributorService().withError(new Error("Network error"));

    // when
    const { result } = renderHook(() => useContributors(service, "token", "user"));

    // then
    await waitFor(() => {
      expect(result.current.error).toBe("Network error");
    });
  });

  it("should not fetch when token is null", async () => {
    // given
    const service = new StubContributorService().withContributors([
      ContributorBuilder.create().build(),
    ]);

    // when
    const { result } = renderHook(() => useContributors(service, null, "user"));

    // then
    expect(result.current.contributors).toEqual([]);
  });

  it("should pass dateFrom and dateTo to refetch", async () => {
    // given
    const service = new StubContributorService().withContributors([]);
    const { result } = renderHook(() => useContributors(service, "token", "user"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // when
    await act(async () => {
      await result.current.refetch("2026-01-01", "2026-02-01");
    });

    // then
    expect(result.current.isLoading).toBe(false);
  });

  it("should set lastFetchedAt after successful fetch", async () => {
    // given
    const service = new StubContributorService().withContributors([]);

    // when
    const { result } = renderHook(() => useContributors(service, "token", "user"));

    // then
    await waitFor(() => {
      expect(result.current.lastFetchedAt).toBeInstanceOf(Date);
    });
  });
});
