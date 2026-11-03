"use client";

import { ArrowRight, Hand, TriangleAlert } from "lucide-react";
import type { OrderListItem } from "@/lib/api/types";
import { cn } from "@/components/ui/cn";
import { resolveNextStep } from "@/lib/domain/next-step";
import { invoiceLabel } from "@/lib/domain/order-display";
import { formatCountdown } from "@/lib/format/dates";
import { formatMoney } from "@/lib/format/money";
import type { DisplayVariant } from "@/lib/format/quantity";
import { useNow } from "@/lib/hooks/use-now";

/** Spelled out on full cards; compact ones show the hand icon and say it to screen readers only. */
const CLIENT_PREFIX = "Your action: ";

/** Live countdown to the next action's due time ("2h 14m", red "overdue 3h"). */
function Countdown({ dueAt }: { dueAt: string }) {
  const now = useNow();
  const countdown = formatCountdown(dueAt, now);
  return (
    <strong className={cn("font-bold", countdown.overdue ? "text-danger" : "text-ink")}>
      {countdown.text}
    </strong>
  );
}

/** The "Next: …" line of an order card footer (see `resolveNextStep`). */
export function NextStepText({
  order,
  variant,
  className,
}: {
  order: Pick<OrderListItem, "status" | "openAlerts" | "nextAction" | "invoice">;
  variant: DisplayVariant;
  className?: string;
}) {
  const step = resolveNextStep(order, variant);
  const base = cn("min-w-0 text-xs", className);

  switch (step.kind) {
    case "draft":
      return (
        <span className={cn(base, "inline-flex items-center gap-1 font-semibold text-accent")}>
          Continue editing <ArrowRight aria-hidden className="size-3.5" />
        </span>
      );
    case "alert":
      return (
        <span className={cn(base, "inline-flex items-center gap-1 font-bold text-danger")}>
          <TriangleAlert aria-hidden className="size-3.5 shrink-0" />
          <span className="truncate">
            {variant === "full" ? `Next: ${step.label}` : step.label}
          </span>
        </span>
      );
    case "paid":
      return (
        <span className={cn(base, "text-ink-muted")}>
          Next: Paid · {formatMoney(step.amountCents)}
          {variant === "full" && (
            <>
              {" · "}
              <span className="text-accent">{invoiceLabel(step.invoiceNumber)}</span>
            </>
          )}
        </span>
      );
    case "invoice_due":
      return (
        <span className={cn(base, "font-semibold text-warning-ink")}>
          Invoice {invoiceLabel(step.invoiceNumber)} due
          {variant === "full" && <> · {formatMoney(step.amountCents)}</>}
        </span>
      );
    case "closed":
      return <span className={cn(base, "text-ink-muted")}>Next: Closed</span>;
    case "action":
      if (step.requiresClient) {
        // The client's own to-do (what puts the order into "Need attention"): orange with a hand,
        // the label truncates first so the countdown stays visible.
        return (
          <span
            className={cn(base, "inline-flex items-center gap-1 font-bold text-tone-orange-ink")}
          >
            <Hand aria-hidden className="size-3.5 shrink-0" />
            <span className="truncate">
              <span className={cn(variant !== "full" && "sr-only")}>{CLIENT_PREFIX}</span>
              {step.label}
            </span>
            {variant === "full" && step.dueAt && (
              <span className="shrink-0 whitespace-nowrap">
                {" · "}
                <Countdown dueAt={step.dueAt} />
              </span>
            )}
          </span>
        );
      }
      return (
        <span className={cn(base, "text-ink-muted")}>
          Next: {step.label}
          {variant === "full" && step.dueAt && (
            <>
              {" · "}
              <Countdown dueAt={step.dueAt} />
            </>
          )}
        </span>
      );
    case "none":
      return <span className={cn(base, "text-ink-muted")}>Next: —</span>;
  }
}
