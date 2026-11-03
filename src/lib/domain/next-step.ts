/**
 * Resolves the "Next: …" line in an order card footer. Precedence:
 *
 *   1. draft                → "Continue editing →"
 *   2. open alert           → "⚠ Next: Upload photo" (the pending action, else the alert itself)
 *   3. closed + paid        → "Next: Paid · $508.00 · #001812"
 *   4. closed + unpaid inv. → "Invoice #001812 due"
 *   5. closed, no invoice   → "Next: Closed"
 *   6. next action          → "Next: Loading · 2h 14m" (countdown when it has a due time);
 *                             client-owned ones stand out (orange, hand icon):
 *                             "Your action: Confirm BOL · 9h 0m"
 *   7. otherwise            → "Next: —"
 */
import type { OrderListItem } from "@/lib/api/types";
import type { DisplayVariant } from "@/lib/format/quantity";
import { NEXT_ACTION_META, alertSentence } from "./labels";

export type NextStep =
  | { kind: "draft" }
  | { kind: "alert"; label: string }
  | { kind: "paid"; amountCents: number; invoiceNumber: string }
  | { kind: "invoice_due"; amountCents: number; invoiceNumber: string }
  | { kind: "closed" }
  | { kind: "action"; label: string; dueAt: string | null; requiresClient: boolean }
  | { kind: "none" };

export function resolveNextStep(
  order: Pick<OrderListItem, "status" | "openAlerts" | "nextAction" | "invoice">,
  variant: DisplayVariant = "full",
): NextStep {
  if (order.status === "draft") return { kind: "draft" };

  const actionLabel = order.nextAction
    ? NEXT_ACTION_META[order.nextAction.kind][variant === "full" ? "label" : "compact"]
    : null;

  const [newestAlert] = order.openAlerts;
  if (newestAlert) {
    return { kind: "alert", label: actionLabel ?? alertSentence(newestAlert.kind) };
  }

  if (order.status === "closed") {
    const { invoice } = order;
    if (!invoice) return { kind: "closed" };
    return invoice.paidAt
      ? { kind: "paid", amountCents: invoice.amountCents, invoiceNumber: invoice.number }
      : { kind: "invoice_due", amountCents: invoice.amountCents, invoiceNumber: invoice.number };
  }

  if (order.nextAction && actionLabel) {
    return {
      kind: "action",
      label: actionLabel,
      dueAt: order.nextAction.dueAt,
      requiresClient: order.nextAction.requiresClient,
    };
  }

  return { kind: "none" };
}
