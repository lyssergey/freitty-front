"use client";

import { motion } from "motion/react";
import { useEffect, useRef, type KeyboardEvent } from "react";
import { useScrollEdges } from "@/lib/hooks/use-scroll-edges";
import { cn } from "./cn";

/** Keeps a scrolled-into-view tab clear of the faded edge. */
const EDGE_GAP = 24;

export interface TabItem<T extends string> {
  value: T;
  label: string;
  /** Count pill; `undefined` renders a placeholder while loading. */
  count?: number;
  /** Red count pill (e.g. Alerts). */
  urgent?: boolean;
}

interface TabsProps<T extends string> {
  items: readonly TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Accessible name of the tab list. */
  label: string;
  /** Shared-layout id of the animated underline (unique per page). */
  layoutId: string;
  /** Id of the region the tabs control. */
  controls?: string;
  showCounts?: boolean;
  className?: string;
}

/**
 * Underlined tabs (mockup `.tabs`): the active tab is navy with a red 2px underline that slides
 * between tabs via a shared `layoutId`. Arrow keys / Home / End move focus (roving tabindex);
 * Enter or Space selects. On narrow screens the row scrolls sideways (edges fade out) and keeps
 * the active tab in view.
 */
export function Tabs<T extends string>({
  items,
  value,
  onChange,
  label,
  layoutId,
  controls,
  showCounts = true,
  className,
}: TabsProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const [listRef, edges] = useScrollEdges<HTMLDivElement>(items.length);
  const activeIndex = items.findIndex((item) => item.value === value);

  // Bring the active tab into view when it sits off-screen (deep link, keyboard selection).
  useEffect(() => {
    const list = listRef.current;
    const tab = refs.current[activeIndex];
    if (!list || !tab) return;
    const listBox = list.getBoundingClientRect();
    const tabBox = tab.getBoundingClientRect();
    const hiddenStart = listBox.left - tabBox.left;
    const hiddenEnd = tabBox.right - listBox.right;
    if (hiddenStart > 0) list.scrollLeft -= hiddenStart + EDGE_GAP;
    else if (hiddenEnd > 0) list.scrollLeft += hiddenEnd + EDGE_GAP;
  }, [activeIndex, listRef]);

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = items.length - 1;
    const target =
      event.key === "ArrowRight"
        ? index === last
          ? 0
          : index + 1
        : event.key === "ArrowLeft"
          ? index === 0
            ? last
            : index - 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : null;
    if (target === null) return;
    event.preventDefault();
    refs.current[target]?.focus();
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={label}
      data-edges={edges}
      className={cn(
        "scroll-fade-x flex [scrollbar-width:none] gap-1 overflow-x-auto border-b border-line [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {items.map((item, index) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            ref={(node) => {
              refs.current[index] = node;
            }}
            type="button"
            role="tab"
            id={`${layoutId}-${item.value}`}
            aria-selected={active}
            aria-controls={controls}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(item.value)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={cn(
              "relative -mb-px flex shrink-0 items-center gap-1 px-4 py-2.5 text-body font-semibold whitespace-nowrap transition-colors",
              "focus-visible:-outline-offset-2",
              active ? "text-navy" : "text-ink-muted hover:text-ink",
            )}
          >
            {item.label}
            {showCounts &&
              (item.count === undefined ? (
                <span aria-hidden className="skeleton-shimmer h-3.5 w-5 rounded-lg" />
              ) : (
                <span
                  className={cn(
                    "rounded-lg px-1.5 py-px text-3xs leading-3.5 tabular-nums",
                    item.urgent && item.count > 0
                      ? "bg-tone-red text-tone-red-ink"
                      : "bg-tone-gray text-tone-gray-ink",
                  )}
                >
                  {item.count}
                </span>
              ))}
            {active && (
              <motion.span
                layoutId={layoutId}
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-0.5 bg-brand"
                transition={{ type: "spring", bounce: 0.15, duration: 0.35 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
