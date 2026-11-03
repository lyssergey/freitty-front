import type { ReactNode } from "react";
import { cn } from "@/components/ui/cn";

/** Page title row (mockup `.fc-page-title`): h1 on the left, actions on the right. */
export function PageHeader({
  title,
  actions,
  className,
}: {
  title: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-5 flex flex-wrap items-center gap-x-4 gap-y-3", className)}>
      <h1 className="text-title font-bold text-ink">{title}</h1>
      {actions && <div className="ml-auto flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
