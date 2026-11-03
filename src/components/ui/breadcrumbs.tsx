import Link from "next/link";
import { Fragment } from "react";
import { cn } from "./cn";

export interface Crumb {
  label: string;
  href?: string;
}

/** "Home › Orders" — the last crumb is the current page. */
export function Breadcrumbs({ items, className }: { items: readonly Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cn("mb-2", className)}>
      <ol className="flex flex-wrap items-center gap-1 text-xs text-ink-muted">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <Fragment key={`${item.label}-${index}`}>
              <li>
                {item.href && !last ? (
                  <Link href={item.href} className="rounded-sm hover:text-accent hover:underline">
                    {item.label}
                  </Link>
                ) : (
                  <span aria-current={last ? "page" : undefined}>{item.label}</span>
                )}
              </li>
              {!last && (
                <li aria-hidden className="text-accent">
                  ›
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
