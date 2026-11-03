"use client";

import { motion } from "motion/react";
import Link from "next/link";
import type { ReactNode, Ref } from "react";
import type { OrderListItem } from "@/lib/api/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/components/ui/cn";
import { usePrefetchOrder } from "@/lib/api/hooks";
import { destinationText, hubRoute, orderHref, orderSubtitle } from "@/lib/domain/order-display";
import { formatCarrier } from "@/lib/format/carrier";
import { formatDateTime, formatDayMonth } from "@/lib/format/dates";
import type { DisplayVariant } from "@/lib/format/quantity";
import { CardActions } from "./card-actions";
import { CreatedByChip } from "./created-by-chip";
import { NextStepText } from "./next-step-text";
import { OrderBadges } from "./order-badges";
import { QuantityValue } from "./quantity-value";
import { RefNumbers } from "./ref-numbers";

function Field({ label, children, wide }: { label: string; children: ReactNode; wide?: boolean }) {
  return (
    <div className={cn("min-w-0", wide && "col-span-2")}>
      <dt className="text-ink-muted">{label}</dt>
      <dd className="truncate font-semibold text-ink">{children}</dd>
    </div>
  );
}

export interface OrderCardProps {
  order: OrderListItem;
  /** `full` — dashboard (6 fields, live countdown); `compact` — order list grid. */
  variant: DisplayVariant;
  /** Position in the grid, for the staggered entrance. */
  index?: number;
  /** Forwarded to the article (AnimatePresence `popLayout` measures exiting cards). */
  ref?: Ref<HTMLElement>;
}

/**
 * Order card (mockup `.order-card`). The whole card opens the order: the number is a
 * stretched link covering the card, while the refs popover and toolbar icons sit above it.
 * Hovering or focusing the card prefetches the order detail.
 */
export function OrderCard({ order, variant, index = 0, ref }: OrderCardProps) {
  const prefetchOrder = usePrefetchOrder();
  const isDraft = order.status === "draft";
  const hasAlerts = order.openAlerts.length > 0;
  const full = variant === "full";
  const showTrailers =
    full && order.type === "consolidation" && order.consolidatedTrailers !== null;
  const titleId = `order-${order.id}`;

  return (
    <motion.article
      ref={ref}
      layout="position"
      aria-labelledby={titleId}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: isDraft ? 0.75 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.15 } }}
      transition={{
        duration: 0.25,
        ease: "easeOut",
        delay: Math.min(index, 8) * 0.04,
        // The stagger is for the entrance only: on a filter change every card reflows at once.
        layout: { duration: 0.3, ease: "easeOut" },
      }}
      onPointerEnter={() => prefetchOrder(order.number)}
      onFocus={() => prefetchOrder(order.number)}
      className={cn(
        "@container relative flex flex-col gap-2.5 rounded-card border border-line bg-surface p-4",
        // Hover lift via CSS `translate` (motion owns `transform`), so it never waits for the stagger.
        "transition-[border-color,box-shadow,translate] duration-150 hover:-translate-y-0.5 hover:border-accent hover:shadow-card-hover motion-reduce:hover:translate-y-0",
        "has-[.stretched-link:focus-visible]:border-accent has-[.stretched-link:focus-visible]:outline-2 has-[.stretched-link:focus-visible]:outline-offset-2 has-[.stretched-link:focus-visible]:outline-accent",
        hasAlerts && "border-t-2 border-t-danger hover:border-t-danger",
        isDraft && "border-dashed",
      )}
    >
      <header className="flex items-start justify-between gap-2.5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 id={titleId} className="text-md leading-5 font-bold text-navy">
              <Link
                href={orderHref(order.number)}
                className="stretched-link rounded-sm focus-visible:outline-none"
              >
                {order.number}
              </Link>
            </h3>
            {!isDraft && <RefNumbers order={order} variant={variant} />}
          </div>
          <p className="mt-0.5 text-2xs text-ink-muted">{orderSubtitle(order, variant)}</p>
          {!isDraft && <CreatedByChip user={order.createdBy} />}
        </div>
        <OrderBadges order={order} stacked={!full} />
      </header>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
        <Field label="Hub">{hubRoute(order)}</Field>
        <Field label="Date">
          {order.scheduledAt
            ? full
              ? formatDateTime(order.scheduledAt)
              : formatDayMonth(order.scheduledAt)
            : "—"}
        </Field>
        <Field label="Q-ty">
          <QuantityValue cargo={order.cargo} variant={variant} />
        </Field>
        <Field label="Carrier">{formatCarrier(order.carrier, variant)}</Field>
        {full && (
          <Field label="Destination" wide={!showTrailers}>
            {destinationText(order)}
          </Field>
        )}
        {showTrailers && (
          <Field label="Trailers">
            <Badge tone="purple" variant="soft">
              {order.consolidatedTrailers} consolidated
            </Badge>
          </Field>
        )}
      </dl>

      <footer className="mt-auto flex flex-wrap items-center justify-between gap-x-2 gap-y-2 border-t border-dashed border-line pt-2.5">
        <NextStepText order={order} variant={variant} />
        <CardActions orderNumber={order.number} isDraft={isDraft} />
      </footer>
    </motion.article>
  );
}

/** Placeholder with the same footprint as a card. */
export function OrderCardSkeleton({ variant }: { variant: DisplayVariant }) {
  const full = variant === "full";
  return (
    <div aria-hidden className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <span className="skeleton-shimmer block h-5 w-36 rounded" />
          <span className="skeleton-shimmer block h-3 w-40 rounded" />
          <span className="skeleton-shimmer block h-3.5 w-28 rounded" />
        </div>
        <span className="skeleton-shimmer block h-4 w-24 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        {Array.from({ length: full ? 6 : 4 }, (_, i) => (
          <span key={i} className="space-y-1.5">
            <span className="skeleton-shimmer block h-3 w-12 rounded" />
            <span className="skeleton-shimmer block h-3.5 w-24 rounded" />
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-dashed border-line pt-3">
        <span className="skeleton-shimmer block h-3.5 w-32 rounded" />
        <span className="skeleton-shimmer block h-[22px] w-28 rounded" />
      </div>
    </div>
  );
}
