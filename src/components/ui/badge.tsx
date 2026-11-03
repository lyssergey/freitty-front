import type { HTMLAttributes } from "react";
import type { Tone } from "@/lib/domain/labels";
import { cn } from "./cn";

/** Full class strings per tone, so Tailwind can see them. */
export const TONE_CLASSES: Record<Tone, string> = {
  gray: "bg-tone-gray text-tone-gray-ink",
  green: "bg-tone-green text-tone-green-ink",
  lime: "bg-tone-lime text-tone-lime-ink",
  blue: "bg-tone-blue text-tone-blue-ink",
  sky: "bg-tone-sky text-tone-sky-ink",
  cyan: "bg-tone-cyan text-tone-cyan-ink",
  teal: "bg-tone-teal text-tone-teal-ink",
  purple: "bg-tone-purple text-tone-purple-ink",
  red: "bg-tone-red text-tone-red-ink",
  rose: "bg-tone-rose text-tone-rose-ink",
  amber: "bg-tone-amber text-tone-amber-ink",
  orange: "bg-tone-orange text-tone-orange-ink",
};

/** Solid dot colour per tone (status dots in pipeline headers). */
export const TONE_DOT_CLASSES: Record<Tone, string> = {
  gray: "bg-tone-gray-ink",
  green: "bg-tone-green-ink",
  lime: "bg-tone-lime-ink",
  blue: "bg-tone-blue-ink",
  sky: "bg-tone-sky-ink",
  cyan: "bg-tone-cyan-ink",
  teal: "bg-tone-teal-ink",
  purple: "bg-tone-purple-ink",
  red: "bg-tone-red-ink",
  rose: "bg-tone-rose-ink",
  amber: "bg-tone-amber-ink",
  orange: "bg-tone-orange-ink",
};

export type BadgeVariant = "status" | "soft";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  /**
   * `status` — 10px uppercase pill (types, statuses, categories);
   * `soft` — sentence-case 11px pill (counters like "2 consolidated").
   */
  variant?: BadgeVariant;
  /** Leading "●" dot, e.g. "● On Stock". */
  dot?: boolean;
}

export function Badge({
  tone = "gray",
  variant = "status",
  dot,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full whitespace-nowrap",
        variant === "status"
          ? "px-2 py-[3px] text-3xs font-bold tracking-[0.03em] uppercase"
          : "px-2 py-px text-2xs font-extrabold",
        TONE_CLASSES[tone],
        className,
      )}
      {...props}
    >
      {dot && <span aria-hidden className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
