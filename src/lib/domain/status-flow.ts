/**
 * The lifecycle line on the order detail page: "Draft → Ready → In Progress → Closed".
 * Cross-dock orders use the short 4-step flow; consolidations walk the full 7-step lifecycle.
 */
import type { OrderStatus, OrderType } from "@/lib/api/types";
import { ORDER_STATUSES } from "@/lib/api/types";
import { ORDER_STATUS_META } from "./labels";

export type FlowStepState = "past" | "current" | "future";

export interface FlowStep {
  status: OrderStatus;
  label: string;
  state: FlowStepState;
}

const CROSS_DOCK_FLOW: readonly OrderStatus[] = ["draft", "ready", "in_progress", "closed"];

export function statusFlowFor(type: OrderType): readonly OrderStatus[] {
  return type === "cross_dock" ? CROSS_DOCK_FLOW : ORDER_STATUSES;
}

export function buildStatusFlow(type: OrderType, status: OrderStatus): FlowStep[] {
  let flow = statusFlowFor(type);
  // A status outside the short flow (unexpected for cross-dock) → show the full lifecycle.
  if (!flow.includes(status)) flow = ORDER_STATUSES;

  const currentIndex = flow.indexOf(status);
  return flow.map((step, index) => ({
    status: step,
    label: ORDER_STATUS_META[step].flowLabel,
    state: index < currentIndex ? "past" : index === currentIndex ? "current" : "future",
  }));
}
