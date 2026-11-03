"use client";

import { ArrowLeft, DollarSign, Package, TriangleAlert, Truck } from "lucide-react";
import type { OrderDetail } from "@/lib/api/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { CreatedByChip } from "@/components/orders/created-by-chip";
import { TypeBadge } from "@/components/orders/order-badges";
import { RefNumbers } from "@/components/orders/ref-numbers";
import {
  ALERT_BADGE,
  CARGO_STATUS_META,
  ORDER_STATUS_META,
  currentOperationLabel,
} from "@/lib/domain/labels";
import { invoiceLabel } from "@/lib/domain/order-display";
import { formatCarrier } from "@/lib/format/carrier";
import { useBackNavigation } from "@/lib/hooks/use-back-navigation";

function InvoiceIndicator({ invoice }: { invoice: OrderDetail["invoice"] }) {
  const state = !invoice
    ? { label: "Not invoiced yet", className: "text-ink-faint" }
    : invoice.paidAt
      ? { label: `Invoice ${invoiceLabel(invoice.number)} paid`, className: "text-success" }
      : { label: `Invoice ${invoiceLabel(invoice.number)} unpaid`, className: "text-warning" };
  return (
    <span role="img" aria-label={state.label} title={state.label} className={state.className}>
      <DollarSign aria-hidden className="size-4.5" strokeWidth={3} />
    </span>
  );
}

/** "← 📦 Order#: FR001383 $ 🚚 [CROSS-DOCK] [● ON STOCK] [LOADING IN PROGRESS] REF N … by …". */
export function OrderSummaryRow({ order }: { order: OrderDetail }) {
  const goBack = useBackNavigation("/orders");
  const cargo = CARGO_STATUS_META[order.cargoStatus];
  const status = order.currentOperation
    ? { label: currentOperationLabel(order.currentOperation), tone: "blue" as const }
    : ORDER_STATUS_META[order.status];
  const carrier = formatCarrier(order.carrier);

  return (
    <div className="mb-3 flex flex-wrap items-center gap-2.5">
      <Button
        variant="secondary"
        size="sm"
        className="h-8 px-2.5"
        aria-label="Back"
        onClick={goBack}
      >
        <ArrowLeft aria-hidden className="size-4!" />
      </Button>
      <Package aria-hidden className="size-5 text-accent-strong" />
      <p className="flex items-baseline gap-1.5">
        <span className="text-body text-ink-muted">Order#:</span>
        <strong className="text-md font-bold text-ink">{order.number}</strong>
      </p>
      <InvoiceIndicator invoice={order.invoice} />
      <span
        role="img"
        aria-label={`Transport: ${carrier}`}
        title={`Transport: ${carrier}`}
        className="text-ink-muted"
      >
        <Truck aria-hidden className="size-4.5" />
      </span>
      <TypeBadge type={order.type} />
      {/* A draft or an order without cargo has no cargo whose status could be "Expected". */}
      {order.status !== "draft" && order.cargo.length > 0 && (
        <Badge tone={cargo.tone} dot>
          {cargo.label}
        </Badge>
      )}
      <Badge tone={status.tone}>{status.label}</Badge>
      {order.openAlerts.length > 0 && <Badge tone={ALERT_BADGE.tone}>{ALERT_BADGE.label}</Badge>}
      <RefNumbers order={order} variant="full" />

      <div className={cn("flex flex-wrap items-center gap-2 sm:ml-auto")}>
        <CreatedByChip user={order.createdBy} variant="outlined" compact />
        {order.deltas.length > 0 && (
          <Badge tone="amber">
            <TriangleAlert aria-hidden className="size-3" />
            Actual ≠ Expected
          </Badge>
        )}
      </div>
    </div>
  );
}
