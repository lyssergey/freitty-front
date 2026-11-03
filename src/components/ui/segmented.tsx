"use client";

import { motion } from "motion/react";
import { useRef, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "./cn";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

interface SegmentedProps<T extends string> {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Accessible name of the group. */
  label: string;
  /** Shared-layout id of the sliding indicator (unique per page). */
  layoutId: string;
  /**
   * `track` — grey track with a sliding white pill (view toggle);
   * `pills` — separate rounded pills, the active one filled red (activity periods).
   */
  variant?: "track" | "pills";
  className?: string;
}

/** Single-choice control with radio semantics: arrow keys move and select. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  layoutId,
  variant = "track",
  className,
}: SegmentedProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const step =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? -1
          : 0;
    if (!step) return;
    event.preventDefault();
    const next = (index + step + options.length) % options.length;
    const option = options[next];
    if (!option) return;
    onChange(option.value);
    refs.current[next]?.focus();
  }

  const isTrack = variant === "track";

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        "inline-flex items-center",
        isTrack ? "gap-1 rounded-md bg-surface-muted p-[3px]" : "flex-wrap gap-1.5",
        className,
      )}
    >
      {options.map((option, index) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            ref={(node) => {
              refs.current[index] = node;
            }}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={cn(
              "relative inline-flex items-center gap-1.5 text-xs whitespace-nowrap transition-colors [&_svg]:size-3.5",
              isTrack
                ? cn(
                    "h-6 rounded px-2.5",
                    active ? "font-semibold text-ink" : "text-ink-subtle hover:text-ink",
                  )
                : cn(
                    "h-[26px] rounded-full border px-3 text-2xs",
                    active
                      ? "border-brand font-bold text-white"
                      : "border-line-cool bg-surface font-semibold text-slate hover:border-slate-faint hover:text-ink",
                  ),
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                aria-hidden
                className={cn(
                  "absolute inset-0",
                  isTrack ? "rounded bg-surface shadow-panel" : "-m-px rounded-full bg-brand",
                )}
                transition={{ type: "spring", bounce: 0.15, duration: 0.35 }}
              />
            )}
            <span className="relative inline-flex items-center gap-1.5">
              {option.icon}
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
