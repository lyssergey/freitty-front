import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from "vitest";

const router = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

/** Fresh module per test: the in-app flag is module state. */
async function goBack({ navigated = false } = {}) {
  vi.resetModules();
  const { markInAppNavigation, useBackNavigation } = await import("./use-back-navigation");
  if (navigated) markInAppNavigation();
  const { result } = renderHook(() => useBackNavigation("/orders"));
  result.current();
}

/** The Navigation API's view of this tab: same-origin entries, `current` being the page shown. */
function stubHistory(paths: string[], current = paths.length - 1) {
  const entries = paths.map((path, index) => ({
    url: new URL(path, window.location.origin).href,
    index,
  }));
  vi.stubGlobal("navigation", { entries: () => entries, currentEntry: entries[current] });
  window.history.replaceState(null, "", paths[current]);
}

let go: MockInstance<History["go"]>;

beforeEach(() => {
  router.push.mockClear();
  go = vi.spyOn(window.history, "go").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("useBackNavigation", () => {
  it("goes back when the previous history entry belongs to the app", async () => {
    stubHistory(["/orders?view=table&hub=MAR", "/orders/FR001383"]);
    await goBack();
    expect(go).toHaveBeenCalledWith(-1);
    expect(router.push).not.toHaveBeenCalled();
  });

  it("opens the fallback on the first entry, even after navigating around and coming back", async () => {
    stubHistory(["/orders/FR001383", "/orders"], 0);
    await goBack({ navigated: true });
    expect(router.push).toHaveBeenCalledWith("/orders");
    expect(go).not.toHaveBeenCalled();
  });

  it("skips entries of the same page, like the skip link's #main", async () => {
    stubHistory(["/orders/FR001383", "/orders/FR001383#main"]);
    await goBack();
    expect(router.push).toHaveBeenCalledWith("/orders");
    expect(go).not.toHaveBeenCalled();

    stubHistory(["/orders?segment=alerts", "/orders/FR001674", "/orders/FR001674#main"]);
    await goBack();
    expect(go).toHaveBeenCalledWith(-2);
  });

  it("falls back to the in-app flag without the Navigation API", async () => {
    vi.stubGlobal("navigation", undefined);
    await goBack({ navigated: false });
    expect(router.push).toHaveBeenCalledWith("/orders");

    await goBack({ navigated: true });
    expect(go).toHaveBeenCalledWith(-1);
  });
});
