import type { ReactNode } from "react";
import { Card, CardHeader } from "@/components/ui/card";
import { cn } from "@/components/ui/cn";

/** White card with a title row (title · subtitle · action) wrapping a table. */
export function TableCard({
  title,
  subtitle,
  action,
  footer,
  children,
  className,
  id,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  const titleId = `${id ?? title.toLowerCase().replace(/\s+/g, "-")}-title`;
  return (
    <Card
      as="section"
      id={id}
      aria-labelledby={titleId}
      className={cn("mb-3.5 overflow-hidden", className)}
    >
      <CardHeader>
        <div className="flex flex-wrap items-baseline gap-x-2">
          <h2 id={titleId} className="text-base font-bold text-ink">
            {title}
          </h2>
          {subtitle && <p className="text-2xs text-ink-muted">{subtitle}</p>}
        </div>
        {action}
      </CardHeader>
      {children}
      {footer}
    </Card>
  );
}
