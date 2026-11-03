"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { markInAppNavigation } from "@/lib/hooks/use-back-navigation";

/**
 * Records that the user moved between pages inside the app — how "← Back" decides in browsers
 * without the Navigation API (see `useBackNavigation`).
 */
export function NavigationTracker() {
  const pathname = usePathname();
  const initialPath = useRef(pathname);

  useEffect(() => {
    if (pathname !== initialPath.current) markInAppNavigation();
  }, [pathname]);

  return null;
}
