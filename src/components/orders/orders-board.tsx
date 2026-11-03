"use client";

import { TriangleAlert } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import type { OrderListItem, OrdersBoardColumn } from "@/lib/api/types";
import { TONE_DOT_CLASSES } from "@/components/ui/badge";
import { cn } from "@/components/ui/cn";
import { usePrefetchOrder } from "@/lib/api/hooks";
import { ORDER_STATUS_META } from "@/lib/domain/labels";
import { hubRoute, orderHref, orderSubtitle } from "@/lib/domain/order-display";
import { ordersHref, type OrderFilters } from "@/lib/domain/order-filters";
import { formatDayMonth } from "@/lib/format/dates";
import { useScrollEdges } from "@/lib/hooks/use-scroll-edges";
import { NextStepText } from "./next-step-text";
import { TypeBadge } from "./order-badges";
import { QuantityValue } from "./quantity-value";

function BoardCard({ order, index }: { order: OrderListItem; index: number }) {
  const prefetchOrder = usePrefetchOrder();
  const hasAlerts = order.openAlerts.length > 0;
  const isDraft = order.status === "draft";

  return (
    <motion.article
      layout="position"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: isDraft ? 0.75 : 1, y: 0 }}
      transition={{
        duration: 0.2,
        delay: Math.min(index, 10) * 0.03,
        layout: { duration: 0.25, ease: "easeOut" },
      }}
      onPointerEnter={() => prefetchOrder(order.number)}
      onFocus={() => prefetchOrder(order.number)}
      className={cn(
        "relative rounded-lg border border-line bg-surface p-2.5 text-2xs",
        "transition-[border-color,box-shadow] hover:border-accent hover:shadow-card-hover",
        "has-[.stretched-link:focus-visible]:outline-2 has-[.stretched-link:focus-visible]:outline-offset-2 has-[.stretched-link:focus-visible]:outline-accent",
        hasAlerts && "border-t-2 border-t-danger hover:border-t-danger",
        isDraft && "border-dashed",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-body font-bold text-navy">
          <Link
            href={orderHref(order.number)}
            className="stretched-link focus-visible:outline-none"
          >
            {order.number}
          </Link>
        </h4>
        <span className="flex items-center gap-1">
          {hasAlerts && (
            <TriangleAlert aria-label="Has open alerts" className="size-3.5 text-danger" />
          )}
          {!isDraft && <TypeBadge type={order.type} />}
        </span>
      </div>
      <p className="mt-0.5 truncate text-ink-muted">
        {orderSubtitle(order, "compact")} · {hubRoute(order)}
      </p>
      <p className="mt-1.5 flex justify-between gap-2">
        <span className="text-ink-muted">
          {order.scheduledAt ? formatDayMonth(order.scheduledAt) : "—"}
        </span>
        <span className="truncate font-semibold text-ink">
          <QuantityValue cargo={order.cargo} variant="compact" />
        </span>
      </p>
      <div className="mt-2 border-t border-dashed border-line pt-1.5">
        <NextStepText order={order} variant="compact" className="block truncate text-2xs" />
      </div>
    </motion.article>
  );
}

/**
 * Pipeline view: one kanban column per status in lifecycle order (≤ 20 cards each, with a link
 * to the full list when a column holds more). Scrolls horizontally.
 */
export function OrdersBoard({
  columns,
  filters,
}: {
  columns: readonly OrdersBoardColumn[];
  filters: OrderFilters;
}) {
  const [scrollRef, edges] = useScrollEdges<HTMLDivElement>();

  return (
    <div
      ref={scrollRef}
      data-edges={edges}
      className="scroll-fade-x -mx-4 scrollbar-thin overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0"
    >
      <ol className="flex min-w-max gap-3" aria-label="Pipeline">
        {columns.map((column) => {
          const meta = ORDER_STATUS_META[column.status];
          const hidden = column.count - column.items.length;
          return (
            <li
              key={column.status}
              aria-label={`${meta.flowLabel}: ${column.count} orders`}
              className="flex w-[260px] shrink-0 flex-col rounded-card border border-line bg-surface-subtle"
            >
              <header className="flex items-center justify-between gap-2 border-b border-line px-3 py-2.5">
                <h3 className="flex items-center gap-2 text-xs font-bold text-ink">
                  <span
                    aria-hidden
                    className={cn("size-2 rounded-full", TONE_DOT_CLASSES[meta.tone])}
                  />
                  {meta.flowLabel}
                </h3>
                <span className="rounded-lg bg-tone-gray px-1.5 py-px text-3xs font-bold text-tone-gray-ink tabular-nums">
                  {column.count}
                </span>
              </header>
              <div className="flex max-h-[calc(100dvh-330px)] min-h-[140px] scrollbar-thin flex-col gap-2 overflow-y-auto p-2">
                {column.items.length === 0 ? (
                  <p className="m-auto py-6 text-2xs text-ink-muted">No orders</p>
                ) : (
                  column.items.map((order, index) => (
                    <BoardCard key={order.id} order={order} index={index} />
                  ))
                )}
              </div>
              {hidden > 0 && (
                <Link
                  href={ordersHref({ ...filters, view: "cards", status: column.status, page: 1 })}
                  className="border-t border-line px-3 py-2 text-2xs font-semibold text-accent hover:underline"
                >
                  +{hidden} more · view all {column.count} →
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function OrdersBoardSkeleton() {
  return (
    <div aria-hidden className="flex gap-3 overflow-hidden">
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          className="flex w-[260px] shrink-0 flex-col gap-2 rounded-card border border-line bg-surface-subtle p-2"
        >
          <span className="skeleton-shimmer m-1 block h-4 w-24 rounded" />
          {Array.from({ length: 3 - (i % 2) }, (_, j) => (
            <span key={j} className="skeleton-shimmer block h-[92px] rounded-lg" />
          ))}
        </div>
      ))}
    </div>
  );
}
