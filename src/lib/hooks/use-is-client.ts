"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** `false` during SSR and hydration, `true` afterwards — for client-only UI like portals. */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
