import type { OrderListItem } from "@/lib/api/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/components/ui/cn";
import { ORDER_TYPE_META, orderStatusBadge } from "@/lib/domain/labels";

export function TypeBadge({ type }: { type: OrderListItem["type"] }) {
  const meta = ORDER_TYPE_META[type];
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}

/** Status pill — "Alert" while the order has open alerts. */
export function StatusBadge({ order }: { order: Pick<OrderListItem, "status" | "openAlerts"> }) {
  const badge = orderStatusBadge(order);
  return <Badge tone={badge.tone}>{badge.label}</Badge>;
}

/**
 * Type + status pills in a card header (drafts show only "Draft"). Stacked, or — unless
 * `stacked` — side by side once the card (an `@container`) is wide enough.
 */
export function OrderBadges({
  order,
  stacked,
  className,
}: {
  order: Pick<OrderListItem, "type" | "status" | "openAlerts">;
  stacked?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 flex-col items-end gap-1",
        !stacked && "@md:flex-row @md:flex-wrap @md:items-start @md:justify-end",
        className,
      )}
    >
      {order.status !== "draft" && <TypeBadge type={order.type} />}
      <StatusBadge order={order} />
    </div>
  );
}
