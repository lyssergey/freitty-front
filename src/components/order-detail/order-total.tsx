import { Receipt } from "lucide-react";
import type { OrderDetail } from "@/lib/api/types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { invoiceLabel } from "@/lib/domain/order-display";
import { formatDayMonth } from "@/lib/format/dates";
import { formatMoney } from "@/lib/format/money";

/** Operations + supplies = order total, with the invoice status when invoiced. */
export function OrderTotal({ order }: { order: OrderDetail }) {
  const { totals, invoice } = order;

  return (
    <Card
      as="section"
      aria-label="Order total"
      className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-3.5 py-3"
    >
      <dl className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
        <div className="flex gap-1.5">
          <dt>Operations</dt>
          <dd className="font-semibold text-ink">{formatMoney(totals.operationsCents)}</dd>
        </div>
        <span aria-hidden>+</span>
        <div className="flex gap-1.5">
          <dt>Supplies</dt>
          <dd className="font-semibold text-ink">{formatMoney(totals.suppliesCents)}</dd>
        </div>
      </dl>

      <div className="flex flex-wrap items-center gap-3">
        {invoice && (
          <span className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
            <Receipt aria-hidden className="size-3.5" />
            Invoice{" "}
            <span className="font-semibold text-accent">{invoiceLabel(invoice.number)}</span>
            {invoice.paidAt ? (
              <Badge tone="green">Paid {formatDayMonth(invoice.paidAt)}</Badge>
            ) : (
              <Badge tone="amber">Due · {formatMoney(invoice.amountCents)}</Badge>
            )}
          </span>
        )}
        <p className="flex items-baseline gap-2">
          <span className="text-xs text-ink-muted">Order total</span>
          <strong className="text-lg font-bold text-ink tabular-nums">
            {formatMoney(totals.totalCents)}
          </strong>
        </p>
      </div>
    </Card>
  );
}
