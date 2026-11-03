"use client";

import { useEffect, useRef, useState } from "react";

/** Which horizontal edges of a scroll container currently clip content. */
export type ScrollEdges = "none" | "start" | "end" | "both";

/** Clipped edges from the scroller's metrics (1px tolerance for sub-pixel scroll positions). */
export function readScrollEdges(
  element: Pick<HTMLElement, "scrollLeft" | "scrollWidth" | "clientWidth">,
): ScrollEdges {
  const clipsStart = element.scrollLeft > 1;
  const clipsEnd = element.scrollWidth - element.clientWidth - element.scrollLeft > 1;
  if (clipsStart && clipsEnd) return "both";
  if (clipsStart) return "start";
  return clipsEnd ? "end" : "none";
}

/**
 * Tracks the clipped edges of a horizontal scroller (on scroll and on resize of the scroller or
 * its children). Put the value on `data-edges` next to the `scroll-fade-x` class to fade those
 * edges — a hint that tabs / tables / the pipeline continue off-screen.
 *
 * @param contentKey Re-attach the observers when the set of children changes (e.g. item count).
 */
export function useScrollEdges<T extends HTMLElement>(contentKey?: unknown) {
  const ref = useRef<T>(null);
  const [edges, setEdges] = useState<ScrollEdges>("none");

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const update = () => setEdges(readScrollEdges(element));
    update();
    element.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(element);
    for (const child of element.children) observer.observe(child);
    return () => {
      element.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [contentKey]);

  return [ref, edges] as const;
}
