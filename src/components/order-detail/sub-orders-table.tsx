import { CircleCheck, Layers, TriangleAlert } from "lucide-react";
import type { OrderDetail, SubOrderSummary } from "@/lib/api/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/components/ui/cn";
import { EmptyState } from "@/components/ui/empty-state";
import { THead, Table, Td, Th, Tr } from "@/components/ui/table";
import { ALERT_LABEL } from "@/lib/domain/labels";
import { formatDelta, unitWithSize } from "@/lib/format/quantity";
import { TableCard } from "./table-card";

function SubOrderState({ sub }: { sub: SubOrderSummary }) {
  if (sub.alert) {
    return (
      <span title={sub.alert.message}>
        <Badge tone="red">
          <TriangleAlert aria-hidden className="size-3" />
          {ALERT_LABEL[sub.alert.kind]}
        </Badge>
      </span>
    );
  }
  if (sub.actualQty === null) return <Badge tone="gray">Expected</Badge>;
  if (sub.actualQty !== sub.declaredQty) {
    return <Badge tone="amber">Δ {formatDelta(sub.actualQty - sub.declaredQty)}</Badge>;
  }
  return (
    <Badge tone="green">
      <CircleCheck aria-hidden className="size-3" />
      Counted
    </Badge>
  );
}

/** Consolidation only: one row per client sub-order (ref, unit, declared vs actual, alert). */
export function SubOrdersTable({ order }: { order: OrderDetail }) {
  return (
    <TableCard
      title="Sub-orders"
      subtitle={
        order.subOrders.length > 0
          ? `${order.subOrders.length} client references consolidated into this order`
          : undefined
      }
    >
      {order.subOrders.length === 0 ? (
        <EmptyState
          variant="inline"
          icon={<Layers />}
          title="No sub-orders yet"
          description="Add the client references you want to consolidate while editing the order."
        />
      ) : (
        <Table className="min-w-[640px]">
          <caption className="sr-only">Sub-orders of {order.number}</caption>
          <THead>
            <tr>
              <Th>Sub-order</Th>
              <Th>Ref N</Th>
              <Th>Unit</Th>
              <Th className="text-right">Declared</Th>
              <Th className="text-right">Actual</Th>
              <Th>Status / alert</Th>
            </tr>
          </THead>
          <tbody>
            {order.subOrders.map((sub) => {
              const mismatch = sub.actualQty !== null && sub.actualQty !== sub.declaredQty;
              return (
                <Tr key={sub.id} className={cn(sub.alert && "bg-brand-soft")}>
                  <Td className="font-mono text-xs font-bold text-tone-purple-ink">{sub.number}</Td>
                  <Td className="font-mono text-xs font-extrabold text-brand">{sub.refNumber}</Td>
                  <Td className="whitespace-nowrap">{unitWithSize(sub.unitType)}</Td>
                  <Td className="text-right font-semibold">{sub.declaredQty}</Td>
                  <Td className={cn("text-right font-semibold", mismatch && "text-attention")}>
                    {sub.actualQty ?? "—"}
                  </Td>
                  <Td>
                    <SubOrderState sub={sub} />
                  </Td>
                </Tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </TableCard>
  );
}
