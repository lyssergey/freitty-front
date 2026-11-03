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
 * Whether the previous history entry is a screen of this app. The Navigation API only lists this
 * origin's entries, so `canGoBack` is false on the first one — also after the user returned to it
 * with the browser's Back button, which a "has navigated" flag can't tell.
 */
function canGoBackInApp(): boolean {
  if (typeof navigation !== "undefined") return navigation.canGoBack;
  return hasInAppHistory;
}

/**
 * "←" goes back to the exact previous screen (e.g. a filtered list) instead of a fixed URL — but
 * never out of the app: when the page was opened directly it goes to `fallbackHref`.
 */
export function useBackNavigation(fallbackHref: string) {
  const router = useRouter();
  return useCallback(() => {
    if (canGoBackInApp()) router.back();
    else router.push(fallbackHref);
  }, [router, fallbackHref]);
}
