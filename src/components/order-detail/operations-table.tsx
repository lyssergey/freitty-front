"use client";

import { Camera, Copy, MessageSquare, Plus, Trash2, Wrench } from "lucide-react";
import type { OrderDetail, OrderOperation } from "@/lib/api/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { EmptyState } from "@/components/ui/empty-state";
import { IconButton } from "@/components/ui/icon-button";
import { THead, Table, Td, Th, Tr } from "@/components/ui/table";
import { useNotInDemo } from "@/components/ui/toast";
import { OPERATION_LABEL, isActiveStatus } from "@/lib/domain/labels";
import { formatDayMonthTime } from "@/lib/format/dates";
import { formatMoney } from "@/lib/format/money";
import { unitLongWithSize } from "@/lib/format/quantity";
import { TableCard } from "./table-card";

function OperationName({ operation }: { operation: OrderOperation }) {
  const label = OPERATION_LABEL[operation.kind];
  if (operation.kind === "disposal") return <Badge tone="red">{label}</Badge>;
  return (
    <span className="whitespace-nowrap">
      {operation.billable && (
        <span
          className="mr-1 font-bold text-success-strong"
          title={`Billable · ${formatMoney(operation.amountCents)}`}
        >
          $
        </span>
      )}
      {label}
    </span>
  );
}

/** Secondary text of a row: muted grey falls just short of AA on the disposal row's red tint. */
function secondaryText(operation: OrderOperation) {
  return operation.kind === "disposal" ? "text-ink-subtle" : "text-ink-muted";
}

function RowActions({ operation, editable }: { operation: OrderOperation; editable: boolean }) {
  const notInDemo = useNotInDemo();
  const label = OPERATION_LABEL[operation.kind].toLowerCase();
  return (
    <span
      className={cn(
        "flex items-center gap-0.5 text-xs whitespace-nowrap",
        secondaryText(operation),
      )}
    >
      <button
        type="button"
        onClick={notInDemo}
        aria-label={`${operation.commentsCount} comments on ${label}`}
        className="inline-flex items-center gap-1 rounded px-1 py-0.5 hover:bg-surface-sunken hover:text-ink-soft"
      >
        <MessageSquare aria-hidden className="size-3.5" />
        {operation.commentsCount}
      </button>
      <span aria-hidden>·</span>
      <button
        type="button"
        onClick={notInDemo}
        aria-label={`${operation.photosCount} photos of ${label}`}
        className="inline-flex items-center gap-1 rounded px-1 py-0.5 hover:bg-surface-sunken hover:text-ink-soft"
      >
        <Camera aria-hidden className="size-3.5" />
        {operation.photosCount}
      </button>
      {editable && (
        <>
          <span aria-hidden>·</span>
          <IconButton variant="plain" label={`Duplicate ${label}`} onClick={notInDemo}>
            <Copy aria-hidden />
          </IconButton>
          <span aria-hidden>·</span>
          <IconButton variant="plain" label={`Delete ${label}`} onClick={notInDemo}>
            <Trash2 aria-hidden />
          </IconButton>
        </>
      )}
    </span>
  );
}

/**
 * Warehouse operations log (appliedAt ascending); billable rows marked with "$". Operations are
 * logged while the order is active: a draft has none yet and a closed order's log is final.
 */
export function OperationsTable({ order }: { order: OrderDetail }) {
  const notInDemo = useNotInDemo();
  const editable = isActiveStatus(order.status);

  return (
    <TableCard
      title="Operations"
      action={
        editable && (
          <Button variant="secondary" size="sm" onClick={notInDemo}>
            <Plus aria-hidden />
            Operation
          </Button>
        )
      }
    >
      {order.operations.length === 0 ? (
        <EmptyState
          variant="inline"
          icon={<Wrench />}
          title="No operations yet"
          description="Unloading, loading and other handling will be logged here by the warehouse as it happens."
        />
      ) : (
        <Table className="min-w-[680px]">
          <caption className="sr-only">Operations of {order.number}</caption>
          <THead>
            <tr>
              <Th>Operation</Th>
              <Th>Trailer</Th>
              <Th className="text-right">Q-ty</Th>
              <Th>Unit</Th>
              <Th>Applied at</Th>
              <Th>Action</Th>
            </tr>
          </THead>
          <tbody>
            {order.operations.map((operation) => {
              const disposal = operation.kind === "disposal";
              return (
                <Tr key={operation.id} className={cn(disposal && "bg-brand-soft")}>
                  <Td>
                    <OperationName operation={operation} />
                  </Td>
                  <Td className="whitespace-nowrap">{operation.trailerNumber ?? "—"}</Td>
                  <Td
                    className={cn(
                      "text-right font-semibold",
                      disposal ? "text-danger" : "text-accent-strong",
                    )}
                  >
                    {operation.qty}
                  </Td>
                  <Td className="whitespace-nowrap">{unitLongWithSize(operation.unitType)}</Td>
                  <Td className={cn("whitespace-nowrap", secondaryText(operation))}>
                    {formatDayMonthTime(operation.appliedAt)}
                  </Td>
                  <Td>
                    <RowActions operation={operation} editable={editable} />
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
