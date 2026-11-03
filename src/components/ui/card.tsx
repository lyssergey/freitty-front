import type { HTMLAttributes } from "react";
import { cn } from "./cn";

/** White panel with the mockup's 1px border and 10px radius (`as="section"` for landmarks). */
export function Card({
  as: Tag = "div",
  className,
  ...props
}: HTMLAttributes<HTMLElement> & { as?: "div" | "section" }) {
  return <Tag className={cn("rounded-card border border-line bg-surface", className)} {...props} />;
}

/** Title row of a table-like card: title (+ subtitle) on the left, actions on the right. */
export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-2 border-b border-line px-3.5 py-3",
        className,
      )}
      {...props}
    />
  );
}

/** Small uppercase caption used at the top of tiles ("YOUR ASSIGNED DOCK"). */
export function CardEyebrow({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-2xs font-bold tracking-[0.02em] text-ink-muted uppercase", className)}
      {...props}
    />
  );
}
