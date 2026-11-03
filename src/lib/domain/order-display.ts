/** Small, pure presentation helpers for orders (cards, tables, detail). */
import type { HubRef, OrderListItem, UserRef } from "@/lib/api/types";
import type { DisplayVariant } from "@/lib/format/quantity";
import { ORDER_TYPE_META, SERVICE_META, USER_ROLE_META } from "./labels";

/**
 * Card subtitle: "Cross-Dock · Storage" (first service), "Consolidation · 3 sub-orders"
 * (compact "· 3 sub"), drafts "Consolidation · incomplete".
 */
export function orderSubtitle(
  order: Pick<OrderListItem, "type" | "status" | "services" | "subOrders">,
  variant: DisplayVariant,
): string {
  const type = ORDER_TYPE_META[order.type].label;
  if (order.status === "draft") return `${type} · incomplete`;

  if (order.type === "consolidation") {
    const count = order.subOrders.length;
    if (variant === "compact") return `${type} · ${count} sub`;
    return `${type} · ${count} sub-order${count === 1 ? "" : "s"}`;
  }

  const [firstService] = order.services;
  return firstService ? `${type} · ${SERVICE_META[firstService].label}` : type;
}

/** "Markham" or "Markham → Toronto" when the order moves between hubs. */
export function hubRoute(order: Pick<OrderListItem, "hub" | "destinationHub">): string {
  return order.destinationHub ? `${order.hub.name} → ${order.destinationHub.name}` : order.hub.name;
}

/** "Markham (ON)". */
export function hubWithProvince(hub: HubRef): string {
  return `${hub.name} (${hub.province})`;
}

/** "Detroit, MI · via External PDF"; "—" when unknown. */
export function destinationText(
  order: Pick<OrderListItem, "destination" | "destinationNote">,
): string {
  const parts = [order.destination, order.destinationNote].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : "—";
}

/** "3 refs" (full) / "3" (compact). */
export function refCountLabel(count: number, variant: DisplayVariant): string {
  if (variant === "compact") return String(count);
  return `${count} ref${count === 1 ? "" : "s"}`;
}

/** "User 6 (floor lead)". */
export function userWithRole(user: Pick<UserRef, "name" | "role">): string {
  return `${user.name} (${USER_ROLE_META[user.role].label.toLowerCase()})`;
}

/** Invoice numbers are digits on the wire, shown as `#001812`. */
export function invoiceLabel(number: string): string {
  return `#${number}`;
}

/** "9 pallets" / "1 pallet". */
export function palletsLabel(count: number): string {
  return `${count} pallet${count === 1 ? "" : "s"}`;
}

/** Path of the order detail page. */
export function orderHref(number: string): string {
  return `/orders/${encodeURIComponent(number)}`;
}
