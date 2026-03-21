import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTheme } from "../../../src/presentation/hooks/use_theme";

const STORAGE_KEY = "gitforge-dashboard:theme";

describe("useTheme", () => {
  const storageStore = new Map<string, string>();

  beforeEach(() => {
    storageStore.clear();
    document.documentElement.classList.remove("dark");

    vi.stubGlobal("localStorage", {
      getItem: (key: string) => storageStore.get(key) ?? null,
      setItem: (key: string, value: string) => storageStore.set(key, value),
      removeItem: (key: string) => storageStore.delete(key),
      clear: () => storageStore.clear(),
      get length() {
        return storageStore.size;
      },
      key: (index: number) => [...storageStore.keys()][index] ?? null,
    });
  });

  it("should default to dark when system prefers dark", () => {
    // given
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query === "(prefers-color-scheme: dark)",
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    // when
    const { result } = renderHook(() => useTheme());

    // then
    expect(result.current.theme).toBe("dark");
  });

  it("should default to light when system prefers light", () => {
    // given
    vi.stubGlobal("matchMedia", () => ({
      matches: false,
      media: "",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    // when
    const { result } = renderHook(() => useTheme());

    // then
    expect(result.current.theme).toBe("light");
  });

  it("should load saved theme from localStorage", () => {
    // given
    storageStore.set(STORAGE_KEY, "light");

    // when
    const { result } = renderHook(() => useTheme());

    // then
    expect(result.current.theme).toBe("light");
  });

  it("should toggle from light to dark", () => {
    // given
    storageStore.set(STORAGE_KEY, "light");
    const { result } = renderHook(() => useTheme());

    // when
    act(() => {
      result.current.toggleTheme();
    });

    // then
    expect(result.current.theme).toBe("dark");
  });

  it("should toggle from dark to light", () => {
    // given
    storageStore.set(STORAGE_KEY, "dark");
    const { result } = renderHook(() => useTheme());

    // when
    act(() => {
      result.current.toggleTheme();
    });

    // then
    expect(result.current.theme).toBe("light");
  });

  it("should persist theme to localStorage", () => {
    // given
    storageStore.set(STORAGE_KEY, "light");
    const { result } = renderHook(() => useTheme());

    // when
    act(() => {
      result.current.toggleTheme();
    });

    // then
    expect(storageStore.get(STORAGE_KEY)).toBe("dark");
  });

  it("should add dark class on document root when dark", () => {
    // given
    storageStore.set(STORAGE_KEY, "dark");

    // when
    renderHook(() => useTheme());

    // then
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});
