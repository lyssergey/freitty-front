"use client";

import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { useScrollEdges } from "@/lib/hooks/use-scroll-edges";
import { cn } from "./cn";

/**
 * Thin table primitives with the mockup's spacing: 14px side padding on the outer columns,
 * 6px between inner ones, light row dividers, uppercase grey header on `surface-subtle`.
 * The table scrolls horizontally when it doesn't fit, with the clipped edge faded out.
 */
export function Table({ className, ...props }: HTMLAttributes<HTMLTableElement>) {
  const [scrollRef, edges] = useScrollEdges<HTMLDivElement>();
  return (
    <div
      ref={scrollRef}
      data-edges={edges}
      className="scroll-fade-x scrollbar-thin overflow-x-auto"
    >
      <table className={cn("w-full border-collapse text-body", className)} {...props} />
    </div>
  );
}

export function THead({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn("bg-surface-subtle text-2xs text-ink-muted uppercase", className)}
      {...props}
    />
  );
}

export function Th({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope="col"
      className={cn(
        "px-1.5 py-2 text-left font-bold tracking-[0.03em] whitespace-nowrap first:pl-3.5 last:pr-3.5",
        className,
      )}
      {...props}
    />
  );
}

export function Tr({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn("border-t border-line-soft", className)} {...props} />;
}

export function Td({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("px-1.5 py-2.5 first:pl-3.5 last:pr-3.5", className)} {...props} />;
}
