import type { ReactNode } from "react";
import { cn } from "./cn";

const tones = {
  warning: "border-warning-line border-l-warning bg-warning-soft text-warning-ink",
  danger: "border-brand-line border-l-danger bg-brand-soft text-danger-ink",
  info: "border-tone-blue border-l-accent bg-accent-soft text-navy",
  /** Something the client has to do — the orange of "awaiting your action". */
  attention: "border-tone-orange border-l-attention bg-attention-soft text-tone-orange-ink",
} as const;

/** Inline banner with a 3px accent edge (mockup's read-only transfer banner). */
export function Notice({
  tone,
  icon,
  children,
  action,
  className,
}: {
  tone: keyof typeof tones;
  icon: ReactNode;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      role={tone === "danger" ? "alert" : "note"}
      className={cn(
        "flex flex-wrap items-center gap-x-2.5 gap-y-2 rounded-lg border border-l-[3px] px-3.5 py-2.5 text-xs",
        tones[tone],
        className,
      )}
    >
      <span aria-hidden className="shrink-0 [&_svg]:size-4">
        {icon}
      </span>
      <p className="min-w-0 flex-1">{children}</p>
      {action}
    </div>
  );
}
