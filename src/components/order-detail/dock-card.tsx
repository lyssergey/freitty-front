"use client";

import { Truck } from "lucide-react";
import { motion } from "motion/react";
import type { OrderDetail } from "@/lib/api/types";
import { Card, CardEyebrow } from "@/components/ui/card";
import { cn } from "@/components/ui/cn";
import { OPERATION_LABEL, isActiveStatus } from "@/lib/domain/labels";
import { formatDateTime } from "@/lib/format/dates";

/** The cargo has left the origin dock: on the road, or already split at the destination hub. */
function cargoDispatched(order: OrderDetail): boolean {
  return (
    order.cargoStatus === "dispatched" ||
    order.status === "in_transit" ||
    order.status === "deconsolidated"
  );
}

function dockState(order: OrderDetail) {
  if (order.status === "closed") {
    return { text: "Released · order completed", className: "text-ink-muted", docked: false };
  }
  if (cargoDispatched(order)) {
    return { text: "Released · cargo dispatched", className: "text-ink-muted", docked: false };
  }
  if (order.trailerNumber && isActiveStatus(order.status)) {
    const operation = order.currentOperation
      ? ` · ${OPERATION_LABEL[order.currentOperation].toLowerCase()}`
      : "";
    return { text: `Trailer docked${operation}`, className: "text-success-ink", docked: true };
  }
  return { text: "Waiting for the trailer", className: "text-warning-ink", docked: false };
}

/** Why there is no dock, by lifecycle. */
function noDockText(order: OrderDetail): string {
  if (order.status === "closed") return "No dock was assigned to this order.";
  if (order.status === "draft") return "A dock is assigned after the order is submitted.";
  if (cargoDispatched(order)) return "Cargo dispatched — no dock in use.";
  return "No dock assigned yet — the hub assigns one when your truck is scheduled.";
}

/**
 * Top-down schematic: hub wall, the assigned dock (red) with its neighbours, parked trailer.
 * The docks cluster around the centre (neighbours 33px either side), so it also reads well
 * when the card is full-width on small screens.
 */
function DockSchematic({
  hubName,
  dock,
  trailer,
}: {
  hubName: string;
  dock: OrderDetail["dock"];
  trailer: string | null;
}) {
  const left = dock && dock.number - 1 >= 1 ? dock.number - 1 : null;
  const right = dock && dock.number + 1 <= dock.hubDockCount ? dock.number + 1 : null;

  return (
    <div aria-hidden className="bg-dock-floor relative h-[150px] overflow-hidden rounded-lg">
      <div className="absolute inset-x-3 top-3 flex h-[22px] items-center justify-center rounded bg-sidebar text-3xs font-bold tracking-[1px] text-white uppercase">
        {hubName} hub
      </div>
      {left !== null && (
        <div className="absolute top-11 right-[calc(50%_+_68px)] grid h-[50px] w-[38px] place-items-center rounded bg-ink-faint text-[9px] text-white">
          {left}
        </div>
      )}
      {right !== null && (
        <div className="absolute top-11 left-[calc(50%_+_68px)] grid h-[50px] w-[38px] place-items-center rounded bg-ink-faint text-[9px] text-white">
          {right}
        </div>
      )}
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.3, duration: 0.45, delay: 0.1 }}
        className={cn(
          "absolute top-11 left-1/2 -ml-[35px] grid h-[50px] w-[70px] place-items-center rounded border-2 text-2xs font-bold text-white uppercase",
          dock
            ? "border-danger-ink bg-brand"
            : "border-dashed border-ink-faint bg-transparent text-ink-faint",
        )}
      >
        {dock ? `Dock ${dock.number}` : "No dock"}
      </motion.div>
      {trailer && (
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
          className="absolute bottom-2.5 left-1/2 -ml-[41px] flex h-7 w-[82px] items-center justify-center gap-1 rounded-[3px] border-2 border-ink bg-surface text-[9px] font-bold text-ink"
        >
          <Truck className="size-3" />
          {trailer}
        </motion.div>
      )}
    </div>
  );
}

/** "Your assigned dock" card. */
export function DockCard({ order }: { order: OrderDetail }) {
  const { dock } = order;
  const state = dockState(order);

  return (
    <Card as="section" aria-labelledby="dock-title" className="p-3.5">
      <CardEyebrow id="dock-title" className="mb-2.5">
        Your assigned dock
      </CardEyebrow>
      <DockSchematic
        hubName={order.hub.name}
        dock={dock}
        trailer={dock && state.docked ? order.trailerNumber : null}
      />
      <div className="mt-2.5 text-xs leading-[1.55]">
        {dock ? (
          <>
            <p className="font-bold text-ink">
              Dock {dock.number}
              {dock.bay && ` · Bay ${dock.bay}`}
            </p>
            {dock.assignedAt && (
              <p className="text-ink-muted">Assigned {formatDateTime(dock.assignedAt)}</p>
            )}
            <p className={cn("mt-1 flex items-center gap-1.5 font-semibold", state.className)}>
              <span aria-hidden className="size-2 rounded-full bg-current" />
              {state.text}
            </p>
          </>
        ) : (
          <p className="text-ink-muted">{noDockText(order)}</p>
        )}
      </div>
    </Card>
  );
}
