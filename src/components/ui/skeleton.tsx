import { cn } from "./cn";

/** Shimmering placeholder block; size it with utility classes. */
export function Skeleton({ className }: { className?: string }) {
  return <span aria-hidden className={cn("skeleton-shimmer block rounded-md", className)} />;
}
