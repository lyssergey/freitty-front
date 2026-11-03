"use client";

import { useSyncExternalStore } from "react";

/**
 * A shared clock for countdowns and "today" checks: one interval for the whole app, started by
 * the first subscriber and stopped by the last, so every card ticks in sync.
 */
const TICK_MS = 30_000;

let now = Date.now();
let timer: ReturnType<typeof setInterval> | undefined;
const listeners = new Set<() => void>();

function emit() {
  now = Date.now();
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    // The clock may be stale after a period without subscribers.
    now = Date.now();
    timer = setInterval(emit, TICK_MS);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}

const getSnapshot = () => now;

/** Current time in ms, refreshed every 30 s. */
export function useNow(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
