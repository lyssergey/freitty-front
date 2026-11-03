"use client";

import type { ReactNode } from "react";
import type { CargoSummary, OrderDetail } from "@/lib/api/types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/components/ui/cn";
import { SERVICE_META, TRAILER_TYPE_LABEL } from "@/lib/domain/labels";
import { hubWithProvince, userWithRole } from "@/lib/domain/order-display";
import { buildStatusFlow } from "@/lib/domain/status-flow";
import { formatCarrier } from "@/lib/format/carrier";
import { formatFullDate, isToday } from "@/lib/format/dates";
import { formatDelta, normalizeCargo, unitWithSize } from "@/lib/format/quantity";
import { useNow } from "@/lib/hooks/use-now";

export const QUANTITY_SECTION_ID = "quantity";

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <dt className="text-ink-muted">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </>
  );
}

function DeclaredQuantity({ cargo }: { cargo: CargoSummary[] }) {
  if (cargo.length === 0) return <>—</>;
  return (
    <span className="flex flex-wrap gap-x-3">
      {cargo.map((line) => (
        <span key={line.unitType} className="font-semibold">
          {line.declared}{" "}
          <span className="text-2xs font-medium text-ink-muted">{unitWithSize(line.unitType)}</span>
        </span>
      ))}
    </span>
  );
}

function ActualQuantity({ cargo }: { cargo: CargoSummary[] }) {
  const counted = cargo.filter((line) => line.actual !== null);
  if (counted.length === 0) return <span className="text-ink-muted">Not counted yet</span>;
  return (
    <span className="flex flex-wrap gap-x-3">
      {counted.map((line) => {
        const diff = (line.actual ?? 0) - line.declared;
        return (
          <span
            key={line.unitType}
            className={cn(
              "inline-flex items-center gap-1.5 font-semibold",
              diff && "text-warning-ink",
            )}
          >
            {line.actual}
            {cargo.length > 1 && (
              <span className="text-2xs font-medium text-ink-muted">
                {unitWithSize(line.unitType)}
              </span>
            )}
            {diff !== 0 && (
              <span className="rounded-full bg-attention px-2 py-px text-3xs font-bold text-white">
                Δ {formatDelta(diff)}
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}

function StatusFlow({ order }: { order: OrderDetail }) {
  const steps = buildStatusFlow(order.type, order.status);
  return (
    <ol className="flex flex-wrap items-center gap-x-1 text-2xs" aria-label="Status flow">
      {steps.map((step, index) => (
        <li key={step.status} className="flex items-center gap-1">
          {index > 0 && (
            <span aria-hidden className="text-ink-faint">
              →
            </span>
          )}
          <span
            aria-current={step.state === "current" ? "step" : undefined}
            className={cn(
              step.state === "current" && "font-bold text-accent-strong",
              step.state === "past" && "text-ink-soft",
              step.state === "future" && "text-ink-muted",
            )}
          >
            {step.label}
          </span>
        </li>
      ))}
    </ol>
  );
}

function scrollToQuantity() {
  const target = document.getElementById(QUANTITY_SECTION_ID);
  if (!target) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  target.focus({ preventScroll: true });
}

/** Two-column key/value summary of the order (customer, hub, cargo, carrier, dock, flow…). */
export function MetaCard({ order }: { order: OrderDetail }) {
  const now = useNow();
  const cargo = normalizeCargo(order.cargo);
  const today = order.scheduledAt ? isToday(order.scheduledAt, now) : false;
  const consolidation = order.type === "consolidation";

  return (
    <Card
      as="section"
      aria-label="Order details"
      className="mb-4 grid gap-x-3.5 gap-y-1.5 p-3.5 md:grid-cols-2"
    >
      <dl className="grid grid-cols-[minmax(96px,130px)_minmax(0,1fr)] content-start gap-x-3.5 gap-y-1.5 text-body">
        <Row label="Customer">
          <span className="font-semibold">{order.company.name}</span>
        </Row>
        <Row label="Hub">
          {hubWithProvince(order.hub)}
          {order.destinationHub && ` → ${hubWithProvince(order.destinationHub)}`}
        </Row>
        <Row label="Services">
          {order.services.length > 0 ? (
            <span className="flex flex-wrap gap-1">
              {order.services.map((service) => (
                <Badge key={service} tone={SERVICE_META[service].tone}>
                  {SERVICE_META[service].label}
                </Badge>
              ))}
            </span>
          ) : (
            "—"
          )}
        </Row>
        <Row label="Date">
          {order.scheduledAt ? (
            <span className={cn(today && "font-semibold text-danger")}>
              {formatFullDate(order.scheduledAt)}
              {today && " · today"}
            </span>
          ) : (
            "—"
          )}
        </Row>
        <Row label="Declared q-ty">
          <DeclaredQuantity cargo={cargo} />
        </Row>
        <Row label="Actual q-ty">{cargo.length > 0 ? <ActualQuantity cargo={cargo} /> : "—"}</Row>
        <Row label="Trailer type">
          {order.trailerType ? (
            <Badge tone="gray" className="bg-surface-sunken">
              {TRAILER_TYPE_LABEL[order.trailerType]}
            </Badge>
          ) : (
            "—"
          )}
        </Row>
        {consolidation && (
          <>
            <Row label="Sub-orders">{order.subOrders.length || "—"}</Row>
            <Row label="Trailers consolidated">{order.consolidatedTrailers ?? "—"}</Row>
          </>
        )}
      </dl>

      <dl className="grid grid-cols-[minmax(96px,130px)_minmax(0,1fr)] content-start gap-x-3.5 gap-y-1.5 text-body">
        <Row label="Carrier">
          <span className="font-semibold">{formatCarrier(order.carrier)}</span>
        </Row>
        <Row label="Phone">
          {order.carrier?.phone ? (
            <a
              href={`tel:${order.carrier.phone.replace(/\s+/g, "")}`}
              className="hover:text-accent"
            >
              {order.carrier.phone}
            </a>
          ) : (
            "—"
          )}
        </Row>
        <Row label="Truck / trailer">
          {order.truckNumber || order.trailerNumber
            ? `${order.truckNumber ?? "—"} / ${order.trailerNumber ?? "—"}`
            : "—"}
        </Row>
        <Row label="Dock">
          {order.dock ? (
            <strong className="text-brand">
              Dock {order.dock.number}
              {order.dock.bay && ` · Bay ${order.dock.bay}`}
            </strong>
          ) : (
            "—"
          )}
        </Row>
        <Row label="Assigned to">
          {order.assignee ? (
            <span className="font-semibold text-brand">{userWithRole(order.assignee)}</span>
          ) : (
            "—"
          )}
        </Row>
        <Row label="Status flow">
          <StatusFlow order={order} />
        </Row>
        <Row label="Deltas detected">
          {order.deltas.length > 0 ? (
            <span className="inline-flex flex-wrap items-center gap-1.5">
              <Badge tone="amber">{order.deltas.length} (q-ty)</Badge>
              <button
                type="button"
                onClick={scrollToQuantity}
                className="rounded-sm text-2xs font-bold text-accent-strong hover:underline"
              >
                View all →
              </button>
            </span>
          ) : (
            "—"
          )}
        </Row>
      </dl>
    </Card>
  );
}
