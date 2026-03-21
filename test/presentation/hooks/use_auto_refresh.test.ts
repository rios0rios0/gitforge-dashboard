import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAutoRefresh } from "../../../src/presentation/hooks/use_auto_refresh";

describe("useAutoRefresh", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should set up interval with default 5 min", () => {
    // given
    const onRefresh = vi.fn();

    // when
    const { result } = renderHook(() => useAutoRefresh(onRefresh));

    // then
    expect(result.current.interval).toBe(300000);
  });

  it("should call onRefresh at the configured interval", () => {
    // given
    const onRefresh = vi.fn();
    renderHook(() => useAutoRefresh(onRefresh, 60000));

    // when
    vi.advanceTimersByTime(60000);

    // then
    expect(onRefresh).toHaveBeenCalledTimes(1);

    // when
    vi.advanceTimersByTime(60000);

    // then
    expect(onRefresh).toHaveBeenCalledTimes(2);
  });

  it("should not call onRefresh when interval is 0", () => {
    // given
    const onRefresh = vi.fn();
    renderHook(() => useAutoRefresh(onRefresh, 0));

    // when
    vi.advanceTimersByTime(600000);

    // then
    expect(onRefresh).not.toHaveBeenCalled();
  });

  it("should clear old interval when interval changes", () => {
    // given
    const onRefresh = vi.fn();
    const { result } = renderHook(() => useAutoRefresh(onRefresh, 60000));

    // when
    act(() => {
      result.current.setInterval(0);
    });
    vi.advanceTimersByTime(120000);

    // then
    expect(onRefresh).not.toHaveBeenCalled();
  });

  it("should clear interval on unmount", () => {
    // given
    const onRefresh = vi.fn();
    const { unmount } = renderHook(() => useAutoRefresh(onRefresh, 60000));

    // when
    unmount();
    vi.advanceTimersByTime(120000);

    // then
    expect(onRefresh).not.toHaveBeenCalled();
  });
});
