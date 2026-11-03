"use client";

import { ChevronDown, TriangleAlert } from "lucide-react";
import type { OrderListItem } from "@/lib/api/types";
import { cn } from "@/components/ui/cn";
import { Popover } from "@/components/ui/popover";
import { ALERT_LABEL } from "@/lib/domain/labels";
import { palletsLabel, refCountLabel } from "@/lib/domain/order-display";
import type { DisplayVariant } from "@/lib/format/quantity";

const LABEL = "text-[9.5px] font-bold tracking-[0.05em] uppercase";

/** Single client reference, inline: "REF N: REF-1004". */
export function RefNumberInline({ value, className }: { value: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-baseline gap-[5px] whitespace-nowrap", className)}>
      <span className={cn(LABEL, "text-ink-muted")}>Ref N:</span>
      <span className="font-mono text-body font-extrabold tracking-[0.02em] text-brand">
        {value}
      </span>
    </span>
  );
}

/**
 * Client reference number(s) of an order: inline for a single ref (cross-dock), or a
 * "REF N 3 refs ▾" pill that opens a popover listing every sub-order (consolidation).
 */
export function RefNumbers({
  order,
  variant,
  className,
}: {
  order: Pick<OrderListItem, "number" | "type" | "refNumber" | "subOrders">;
  variant: DisplayVariant;
  className?: string;
}) {
  const { subOrders } = order;

  if (subOrders.length === 0) {
    return order.refNumber ? (
      <RefNumberInline value={order.refNumber} className={className} />
    ) : null;
  }

  return (
    <Popover
      label={`Reference numbers of ${order.number}`}
      trigger={(props, open) => (
        <button
          {...props}
          type="button"
          aria-label={`${subOrders.length} reference numbers — show sub-orders of ${order.number}`}
          className={cn(
            "relative z-10 inline-flex items-center gap-[5px] rounded-[10px] border border-brand-line bg-brand-soft px-2.5 py-0.5 whitespace-nowrap",
            "transition-colors hover:bg-brand-tint aria-expanded:bg-brand-tint",
            className,
          )}
        >
          <span className={cn(LABEL, "text-ink-subtle")}>Ref N</span>
          <span className="font-mono text-[12.5px] leading-4 font-extrabold text-brand">
            {refCountLabel(subOrders.length, variant)}
          </span>
          <ChevronDown
            aria-hidden
            className={cn("size-3 text-brand transition-transform", open && "rotate-180")}
            strokeWidth={3}
          />
        </button>
      )}
    >
      <ul className="max-w-[calc(100vw-16px)] min-w-[min(320px,calc(100vw-16px))] rounded-md border border-brand-line bg-brand-faint px-2.5 py-2 shadow-popover">
        {subOrders.map((sub) => (
          <li
            key={sub.id}
            className="grid grid-cols-[110px_1fr_auto] items-baseline gap-2.5 border-b border-dashed border-brand-tint py-1 last:border-b-0"
          >
            <span className="font-mono text-[10.5px] font-bold tracking-[0.02em] text-tone-purple-ink">
              {sub.number}
            </span>
            <span className="font-mono text-xs font-extrabold tracking-[0.02em] text-brand">
              {sub.refNumber}
            </span>
            <span className="text-[10.5px] whitespace-nowrap text-ink-muted">
              {palletsLabel(sub.actualQty ?? sub.declaredQty)}
              {sub.alert && (
                <>
                  {" · "}
                  <em className="inline-flex items-center gap-0.5 text-danger">
                    <TriangleAlert aria-hidden className="size-3" />
                    {ALERT_LABEL[sub.alert.kind]}
                  </em>
                </>
              )}
            </span>
          </li>
        ))}
      </ul>
    </Popover>
  );
}
