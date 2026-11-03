import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const router = vi.hoisted(() => ({ back: vi.fn(), push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

/** Fresh module per test: the in-app flag is module state. */
async function setup({ navigated }: { navigated: boolean }) {
  vi.resetModules();
  const { markInAppNavigation, useBackNavigation } = await import("./use-back-navigation");
  if (navigated) markInAppNavigation();
  const { result } = renderHook(() => useBackNavigation("/orders"));
  result.current();
}

beforeEach(() => {
  router.back.mockClear();
  router.push.mockClear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useBackNavigation", () => {
  it("goes back when the previous history entry belongs to the app", async () => {
    vi.stubGlobal("navigation", { canGoBack: true });
    await setup({ navigated: true });
    expect(router.back).toHaveBeenCalledOnce();
    expect(router.push).not.toHaveBeenCalled();
  });

  it("opens the fallback on the first entry, even after navigating around and coming back", async () => {
    vi.stubGlobal("navigation", { canGoBack: false });
    await setup({ navigated: true });
    expect(router.push).toHaveBeenCalledWith("/orders");
    expect(router.back).not.toHaveBeenCalled();
  });

  it("falls back to the in-app flag without the Navigation API", async () => {
    vi.stubGlobal("navigation", undefined);
    await setup({ navigated: false });
    expect(router.push).toHaveBeenCalledWith("/orders");

    await setup({ navigated: true });
    expect(router.back).toHaveBeenCalledOnce();
  });
});
