"use client";

import { Lightbulb, PackageOpen, Pencil, Plus, Trash2 } from "lucide-react";
import type { OrderDetail } from "@/lib/api/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { IconButton } from "@/components/ui/icon-button";
import { THead, Table, Td, Th, Tr } from "@/components/ui/table";
import { useNotInDemo } from "@/components/ui/toast";
import { SUPPLY_CATEGORY_META } from "@/lib/domain/labels";
import { formatMoney } from "@/lib/format/money";
import { TableCard } from "./table-card";

/**
 * Stock items bought for the order (platform sale) with the subtotal that goes on the invoice.
 * They can be picked from the draft on and are final once the order is closed.
 */
export function SuppliesTable({ order }: { order: OrderDetail }) {
  const notInDemo = useNotInDemo();
  const editable = order.status !== "closed";

  return (
    <TableCard
      title="Supplies"
      subtitle="mandatory stock items purchased as Platform Sale"
      action={
        editable && (
          <Button variant="secondary" size="sm" onClick={notInDemo}>
            <Plus aria-hidden />
            Supply
          </Button>
        )
      }
      footer={
        <p className="flex items-start gap-1.5 border-t border-tip-line bg-tip px-3.5 py-2 text-2xs text-tip-ink">
          <Lightbulb aria-hidden className="mt-px size-3.5 shrink-0" />
          Supply picker (FOE catalog — 16 SKUs) will be available while creating Cross-Dock /
          Sub-orders. Clients see platform prices only.
        </p>
      }
    >
      {order.supplies.length === 0 ? (
        <EmptyState
          variant="inline"
          icon={<PackageOpen />}
          title="No supplies purchased"
          description="Straps, corners, wrap or pallets bought for this order will be listed here."
        />
      ) : (
        <Table className="min-w-[680px]">
          <caption className="sr-only">Supplies of {order.number}</caption>
          <THead>
            <tr>
              <Th>SKU</Th>
              <Th>Category</Th>
              <Th className="text-right">Q-ty</Th>
              <Th className="text-right">Unit $</Th>
              <Th className="text-right">Line total</Th>
              {editable && <Th>Action</Th>}
            </tr>
          </THead>
          <tbody>
            {order.supplies.map((supply) => {
              const category = SUPPLY_CATEGORY_META[supply.category];
              return (
                <Tr key={supply.id}>
                  <Td>
                    <span className="font-medium text-ink">{supply.name}</span>
                    <span className="ml-2 font-mono text-3xs text-ink-muted">{supply.sku}</span>
                  </Td>
                  <Td>
                    <Badge tone={category.tone}>{category.label}</Badge>
                  </Td>
                  <Td className="text-right font-semibold text-ink">{supply.qty}</Td>
                  <Td className="text-right">{formatMoney(supply.unitPriceCents)}</Td>
                  <Td className="text-right font-semibold">{formatMoney(supply.lineTotalCents)}</Td>
                  {editable && (
                    <Td>
                      <span className="flex items-center gap-0.5 text-ink-faint">
                        <IconButton
                          variant="plain"
                          label={`Edit ${supply.name}`}
                          onClick={notInDemo}
                        >
                          <Pencil aria-hidden />
                        </IconButton>
                        <span aria-hidden>·</span>
                        <IconButton
                          variant="plain"
                          label={`Remove ${supply.name}`}
                          onClick={notInDemo}
                        >
                          <Trash2 aria-hidden />
                        </IconButton>
                      </span>
                    </Td>
                  )}
                </Tr>
              );
            })}
          </tbody>
          <tfoot className="bg-surface-subtle text-xs">
            <tr className="border-t border-line">
              <Td colSpan={4} className="text-right font-semibold text-ink-muted">
                Supply subtotal
              </Td>
              <Td className="text-right font-bold text-ink">
                {formatMoney(order.totals.suppliesCents)}
              </Td>
              {editable && (
                <Td className="text-2xs whitespace-nowrap text-ink-muted">→ Invoice line items</Td>
              )}
            </tr>
          </tfoot>
        </Table>
      )}
    </TableCard>
  );
}
