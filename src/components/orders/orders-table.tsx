"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";
import type { OrderListItem } from "@/lib/api/types";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { cn } from "@/components/ui/cn";
import { THead, Table, Td, Th, Tr } from "@/components/ui/table";
import { usePrefetchOrder } from "@/lib/api/hooks";
import { ORDER_TYPE_META } from "@/lib/domain/labels";
import { hubRoute, orderHref } from "@/lib/domain/order-display";
import { formatCarrier } from "@/lib/format/carrier";
import { formatDayMonth } from "@/lib/format/dates";
import { NextStepText } from "./next-step-text";
import { StatusBadge } from "./order-badges";
import { QuantityValue } from "./quantity-value";
import { RefNumbers } from "./ref-numbers";

const COLUMNS = [
  "Order",
  "Ref N",
  "Status",
  "Hub",
  "Date",
  "Q-ty",
  "Carrier",
  "Created by",
  "Next",
] as const;

/** A little more air between the nine columns than the detail tables have. */
const CELL = "px-2";

function OrderRow({ order }: { order: OrderListItem }) {
  const router = useRouter();
  const prefetchOrder = usePrefetchOrder();
  const href = orderHref(order.number);
  const hasAlerts = order.openAlerts.length > 0;

  // The whole row opens the order — in a new tab on Ctrl/Cmd-click or middle-click, like a link.
  // Real controls inside it (links, the refs popover — even though it's portaled, React events
  // bubble through portals) handle their own clicks.
  function isOnControl(event: MouseEvent) {
    return (event.target as Element).closest("a, button, [role='dialog']") !== null;
  }

  function openInNewTab() {
    window.open(href, "_blank", "noopener");
  }

  function onRowClick(event: MouseEvent<HTMLTableRowElement>) {
    if (isOnControl(event)) return;
    if (event.ctrlKey || event.metaKey) openInNewTab();
    else router.push(href);
  }

  function onRowAuxClick(event: MouseEvent<HTMLTableRowElement>) {
    if (event.button === 1 && !isOnControl(event)) openInNewTab();
  }

  // A middle press would otherwise start autoscroll (Windows, Linux) and swallow the auxclick.
  function onRowMouseDown(event: MouseEvent<HTMLTableRowElement>) {
    if (event.button === 1 && !isOnControl(event)) event.preventDefault();
  }

  return (
    <Tr
      onClick={onRowClick}
      onAuxClick={onRowAuxClick}
      onMouseDown={onRowMouseDown}
      onPointerEnter={() => prefetchOrder(order.number)}
      className={cn(
        "cursor-pointer transition-colors hover:bg-surface-subtle",
        order.status === "draft" && "opacity-75",
      )}
    >
      <Td
        className={cn(
          CELL,
          "whitespace-nowrap",
          hasAlerts && "shadow-[inset_3px_0_0_var(--color-danger)]",
        )}
      >
        <Link
          href={href}
          onFocus={() => prefetchOrder(order.number)}
          className="font-bold text-navy hover:underline"
        >
          {order.number}
        </Link>
        <div className="text-2xs text-ink-muted">{ORDER_TYPE_META[order.type].label}</div>
      </Td>
      <Td className={CELL}>
        <RefNumbers order={order} variant="compact" />
      </Td>
      <Td className={CELL}>
        <StatusBadge order={order} />
      </Td>
      <Td className={cn(CELL, "whitespace-nowrap")}>{hubRoute(order)}</Td>
      <Td className={cn(CELL, "whitespace-nowrap text-ink-muted")}>
        {order.scheduledAt ? formatDayMonth(order.scheduledAt) : "—"}
      </Td>
      <Td className={cn(CELL, "font-semibold whitespace-nowrap")}>
        <QuantityValue cargo={order.cargo} variant="compact" />
      </Td>
      <Td className={cn(CELL, "whitespace-nowrap")}>{formatCarrier(order.carrier, "compact")}</Td>
      <Td className={CELL}>
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
          <Avatar
            initials={order.createdBy.initials}
            color={order.createdBy.avatarColor}
            size={18}
          />
          {order.createdBy.name}
        </span>
      </Td>
      <Td className={cn(CELL, "max-w-[220px]")}>
        <NextStepText order={order} variant="compact" className="block truncate" />
      </Td>
    </Tr>
  );
}

/** Compact orders table; rows open the order detail. Scrolls horizontally on small screens. */
export function OrdersTable({ orders }: { orders: readonly OrderListItem[] }) {
  return (
    <Card className="overflow-hidden">
      <Table className="min-w-[1000px]">
        <caption className="sr-only">Orders</caption>
        <THead>
          <tr>
            {COLUMNS.map((column) => (
              <Th key={column} className={CELL}>
                {column}
              </Th>
            ))}
          </tr>
        </THead>
        <tbody>
          {orders.map((order) => (
            <OrderRow key={order.id} order={order} />
          ))}
        </tbody>
      </Table>
    </Card>
  );
}

export function OrdersTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <Card aria-hidden className="overflow-hidden">
      <div className="h-8 bg-surface-subtle" />
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-6 border-t border-line-soft px-3.5 py-3.5">
          <span className="skeleton-shimmer block h-4 w-24 rounded" />
          <span className="skeleton-shimmer block h-4 w-20 rounded" />
          <span className="skeleton-shimmer block h-4 w-16 rounded-full" />
          <span className="skeleton-shimmer hidden h-4 w-20 rounded sm:block" />
          <span className="skeleton-shimmer hidden h-4 w-14 rounded md:block" />
          <span className="skeleton-shimmer hidden h-4 w-24 rounded lg:block" />
        </div>
      ))}
    </Card>
  );
}
