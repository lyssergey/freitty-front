import type { ReactNode } from "react";
import { cn } from "./cn";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  /** `panel` — standalone dashed box; `inline` — inside an existing card (tables). */
  variant?: "panel" | "inline";
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = "panel",
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 text-center",
        variant === "panel"
          ? "rounded-card border border-dashed border-line-strong bg-surface px-6 py-12"
          : "px-6 py-8",
        className,
      )}
    >
      {icon && (
        <span className="mb-1 grid size-10 place-items-center rounded-full bg-surface-sunken text-ink-faint [&_svg]:size-5">
          {icon}
        </span>
      )}
      <p className="text-body font-semibold text-ink">{title}</p>
      {description && <p className="max-w-sm text-xs text-ink-muted">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
