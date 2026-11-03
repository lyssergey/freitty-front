"use client";

import { Camera, CircleCheck } from "lucide-react";
import type { OrderDetail } from "@/lib/api/types";
import { Card, CardEyebrow } from "@/components/ui/card";
import { cn } from "@/components/ui/cn";
import { useNotInDemo } from "@/components/ui/toast";
import { UNIT_META } from "@/lib/domain/labels";
import {
  formatDelta,
  normalizeCargo,
  quantityText,
  totalActual,
  totalDeclared,
  unitWithSize,
} from "@/lib/format/quantity";
import { QUANTITY_SECTION_ID } from "./meta-card";

const VISIBLE_THUMBS = 2;

/**
 * Expected + Actual side by side with the note on its own row; all three across on xl, where
 * the row next to the dock card is wide enough. Shared with the page skeleton.
 */
export const QUANTITY_GRID = "grid grid-cols-2 gap-2.5 xl:grid-cols-3";
export const QUANTITY_NOTE_SPAN = "col-span-2 xl:col-span-1";

function PhotoThumbs({ count }: { count: number }) {
  const notInDemo = useNotInDemo();
  if (count === 0) return null;
  const visible = Math.min(count, VISIBLE_THUMBS);
  const rest = count - visible;
  return (
    <div className="mt-2 flex gap-1">
      {Array.from({ length: visible }, (_, i) => (
        <button
          key={i}
          type="button"
          onClick={notInDemo}
          aria-label={`Open photo ${i + 1} of ${count}`}
          className="grid size-[34px] place-items-center rounded bg-line text-ink-subtle transition-colors hover:bg-line-strong"
        >
          <Camera aria-hidden className="size-4" />
        </button>
      ))}
      {rest > 0 && (
        <button
          type="button"
          onClick={notInDemo}
          aria-label={`Show ${rest} more photos`}
          className="grid size-[34px] place-items-center rounded bg-line text-2xs text-ink-subtle transition-colors hover:bg-line-strong"
        >
          +{rest}
        </button>
      )}
    </div>
  );
}

/** Expected (BOL) · Actual (warehouse) · Warehouse note — the quantity reconciliation row. */
export function QuantityCards({ order }: { order: OrderDetail }) {
  const cargo = normalizeCargo(order.cargo);
  const declared = totalDeclared(cargo);
  const actual = totalActual(cargo);
  const delta = order.deltas.reduce((sum, d) => sum + d.diff, 0);
  const hasDelta = order.deltas.length > 0;
  const [single] = cargo;
  const unitCaption =
    cargo.length === 1 && single
      ? unitWithSize(single.unitType, "long")
      : cargo.length > 1
        ? quantityText(cargo, "compact")
        : "No cargo declared yet";

  return (
    <div
      id={QUANTITY_SECTION_ID}
      tabIndex={-1}
      className={cn(QUANTITY_GRID, "scroll-mt-24 outline-none")}
    >
      <Card className="p-3">
        <CardEyebrow className="mb-1.5 text-3xs">Expected (BOL)</CardEyebrow>
        <p className="text-stat font-bold text-ink">{cargo.length > 0 ? declared : "—"}</p>
        <p className="text-2xs text-ink-muted">{unitCaption}</p>
      </Card>

      <Card className={cn("p-3", hasDelta && "border-warning-line bg-warning-tint")}>
        <CardEyebrow className={cn("mb-1.5 text-3xs", hasDelta && "text-warning-ink")}>
          Actual (warehouse)
        </CardEyebrow>
        <p
          className={cn(
            "flex items-baseline gap-1.5 text-stat font-bold",
            hasDelta ? "text-warning-ink" : "text-ink",
          )}
        >
          {actual ?? "—"}
          {hasDelta && (
            <span className="rounded-[10px] bg-attention px-2 py-0.5 text-xs font-bold text-white">
              {formatDelta(delta)}
            </span>
          )}
        </p>
        <p className={cn("text-2xs", hasDelta ? "text-warning-ink" : "text-ink-muted")}>
          {actual === null ? (
            "Not counted yet"
          ) : hasDelta ? (
            "Delta from BOL · read-only"
          ) : (
            <span className="inline-flex items-center gap-1 text-success-ink">
              <CircleCheck aria-hidden className="size-3" />
              Matches BOL
            </span>
          )}
        </p>
        {hasDelta && order.deltas.length > 1 && (
          <ul className="mt-1.5 text-2xs text-warning-ink">
            {order.deltas.map((d) => (
              <li key={d.unitType}>
                {UNIT_META[d.unitType].long}: {d.declared} → {d.actual} ({formatDelta(d.diff)})
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className={cn("p-3", QUANTITY_NOTE_SPAN)}>
        <CardEyebrow className="mb-1.5 text-3xs">Warehouse note</CardEyebrow>
        {order.warehouseNote ? (
          <blockquote className="text-xs leading-normal text-ink">
            “{order.warehouseNote}”
          </blockquote>
        ) : (
          <p className="text-xs text-ink-muted">No notes from the warehouse.</p>
        )}
        <PhotoThumbs count={order.photosCount} />
      </Card>
    </div>
  );
}
