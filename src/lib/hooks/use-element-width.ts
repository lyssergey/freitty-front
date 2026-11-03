"use client";

import { useCallback, useState } from "react";

/** Measures an element's content width (ResizeObserver). Attach the returned callback ref. */
export function useElementWidth<T extends HTMLElement>(): [(node: T | null) => void, number] {
  const [width, setWidth] = useState(0);

  const ref = useCallback((node: T | null) => {
    if (!node) return;
    setWidth(Math.round(node.getBoundingClientRect().width));
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setWidth(Math.round(entry.contentRect.width));
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, width];
}
