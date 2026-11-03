"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

/**
 * Fallback for browsers without the Navigation API: set once the user has navigated inside the
 * app (see `NavigationTracker`).
 */
let hasInAppHistory = false;

export function markInAppNavigation() {
  hasInAppHistory = true;
}

/**
 * How many history entries back the previous screen of this app is (0: none). The Navigation API
 * only lists this origin's entries, so there is none on the first one — also after the user
 * returned to it with the browser's Back button, which a "has navigated" flag can't tell. Entries
 * of the current page itself (the skip link's `#main`) are skipped: going back to them wouldn't
 * leave the page.
 */
function stepsBackToPreviousScreen(): number {
  if (typeof navigation === "undefined") return hasInAppHistory ? 1 : 0;
  const entries = navigation.entries();
  const current = navigation.currentEntry?.index ?? 0;
  for (let index = current - 1; index >= 0; index--) {
    const url = entries[index]?.url;
    if (url && new URL(url).pathname !== window.location.pathname) return current - index;
  }
  return 0;
}

/**
 * "←" goes back to the exact previous screen (e.g. a filtered list) instead of a fixed URL — but
 * never out of the app: when the page was opened directly it goes to `fallbackHref`.
 */
export function useBackNavigation(fallbackHref: string) {
  const router = useRouter();
  return useCallback(() => {
    const steps = stepsBackToPreviousScreen();
    if (steps > 0) window.history.go(-steps);
    else router.push(fallbackHref);
  }, [router, fallbackHref]);
}
