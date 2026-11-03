/**
 * Display labels and badge tones for every domain enum (SPEC §1). Pure maps — components look
 * values up here instead of hardcoding copy, so the wording lives in one place.
 */
import type {
  ActivityPeriod,
  AlertKind,
  CargoStatus,
  DatePreset,
  NextActionKind,
  OperationKind,
  OrderListItem,
  OrderSegment,
  OrderStatus,
  OrderType,
  ServiceKind,
  SupplyCategory,
  TrailerType,
  UnitType,
  UserRole,
} from "@/lib/api/types";
import { ACTIVE_ORDER_STATUSES } from "@/lib/api/types";

/** Badge colour families — each maps to a `tone-*` token pair in tokens.css. */
export const TONES = [
  "gray",
  "green",
  "lime",
  "blue",
  "sky",
  "cyan",
  "teal",
  "purple",
  "red",
  "rose",
  "amber",
  "orange",
] as const;
export type Tone = (typeof TONES)[number];

export interface LabelTone {
  label: string;
  tone: Tone;
}

export const ORDER_TYPE_META: Record<OrderType, LabelTone> = {
  cross_dock: { label: "Cross-Dock", tone: "cyan" },
  consolidation: { label: "Consolidation", tone: "purple" },
};

/** `label` = badge / filter option; `flowLabel` = pipeline column & status-flow step. */
export const ORDER_STATUS_META: Record<OrderStatus, LabelTone & { flowLabel: string }> = {
  draft: { label: "Draft", flowLabel: "Draft", tone: "gray" },
  ready: { label: "New", flowLabel: "Ready", tone: "green" },
  in_progress: { label: "In progress", flowLabel: "In Progress", tone: "blue" },
  consolidated: { label: "Consolidated", flowLabel: "Consolidated", tone: "purple" },
  in_transit: { label: "In transit", flowLabel: "In Transit", tone: "sky" },
  deconsolidated: { label: "Deconsolidated", flowLabel: "Deconsolidated", tone: "teal" },
  closed: { label: "Completed", flowLabel: "Closed", tone: "gray" },
};

/** Replaces the status badge while an order has open alerts. */
export const ALERT_BADGE: LabelTone = { label: "Alert", tone: "red" };

export const SERVICE_META: Record<ServiceKind, LabelTone> = {
  storage: { label: "Storage", tone: "sky" },
  pickup: { label: "Pickup", tone: "teal" },
  transload: { label: "Transload", tone: "blue" },
  restock_rework: { label: "Restock & Rework", tone: "purple" },
  labeling: { label: "Labeling", tone: "amber" },
  shrink_wrap: { label: "Shrink wrap", tone: "lime" },
};

export const CARGO_STATUS_META: Record<CargoStatus, LabelTone> = {
  expected: { label: "Expected", tone: "gray" },
  on_stock: { label: "On Stock", tone: "green" },
  dispatched: { label: "Dispatched", tone: "sky" },
};

export const OPERATION_LABEL: Record<OperationKind, string> = {
  unloading: "Unloading",
  loading: "Loading",
  restack: "Restack",
  disposal: "Disposal",
  transload: "Transload",
  consolidation: "Consolidation",
  deconsolidation: "Deconsolidation",
  wrapping: "Wrapping",
};

export const NEXT_ACTION_META: Record<NextActionKind, { label: string; compact: string }> = {
  await_truck: { label: "Waiting for truck", compact: "Await truck" },
  unloading: { label: "Unloading", compact: "Unloading" },
  loading: { label: "Loading", compact: "Loading" },
  consolidation: { label: "Consolidation", compact: "Consolidation" },
  dispatch: { label: "Dispatch", compact: "Dispatch" },
  deconsolidation: { label: "Deconsolidation", compact: "Deconsolidation" },
  delivery: { label: "Delivery", compact: "Delivery" },
  upload_photo: { label: "Upload photo", compact: "Upload photo" },
  confirm_bol: { label: "Confirm BOL", compact: "Confirm BOL" },
  book_delivery: { label: "Book delivery slot", compact: "Book delivery slot" },
  approve_delta: { label: "Approve q-ty delta", compact: "Approve q-ty delta" },
  pay_invoice: { label: "Pay invoice", compact: "Pay invoice" },
};

export const ALERT_LABEL: Record<AlertKind, string> = {
  photo_missing: "photo missing",
  qty_mismatch: "q-ty mismatch",
  damaged_cargo: "damaged cargo",
  late_arrival: "late arrival",
};

export const TRAILER_TYPE_LABEL: Record<TrailerType, string> = {
  van_53: "Van · 53ft",
  reefer_53: "Reefer · 53ft",
  flatbed_48: "Flatbed · 48ft",
  straight_26: "Straight truck · 26ft",
};

export const UNIT_META: Record<UnitType, { long: string; short: string; size: string }> = {
  standard: { long: "Standard", short: "Std", size: "48×40" },
  xl: { long: "XL", short: "XL", size: "48×48" },
};

export const SUPPLY_CATEGORY_META: Record<SupplyCategory, LabelTone> = {
  securement: { label: "Securement", tone: "blue" },
  edge_protection: { label: "Edge protect", tone: "amber" },
  wrap: { label: "Wrap", tone: "lime" },
  pallets: { label: "Pallets", tone: "gray" },
  labeling: { label: "Labeling", tone: "purple" },
};

export const USER_ROLE_META: Record<UserRole, LabelTone & { compact: string }> = {
  admin: { label: "Admin", compact: "Admin", tone: "purple" },
  dispatcher: { label: "Dispatcher", compact: "Disp", tone: "blue" },
  driver: { label: "Driver", compact: "Driver", tone: "amber" },
  floor_lead: { label: "Floor lead", compact: "Lead", tone: "teal" },
};

export const SEGMENT_LABEL: Record<OrderSegment, string> = {
  all: "All",
  cross_dock: "Cross-Dock",
  consolidation: "Consolidation",
  alerts: "Alerts",
  drafts: "Drafts",
  attention: "Need attention",
};

export const DATE_PRESET_LABEL: Record<DatePreset, string> = {
  "30d": "Last 30 days",
  today: "Today",
  week: "This week",
  all: "All time",
};

export const ACTIVITY_PERIOD_META: Record<
  ActivityPeriod,
  { pill: string; title: string; noun: string; caption: string }
> = {
  day: { pill: "Day", title: "Daily", noun: "day", caption: "last 14 days" },
  week: { pill: "CW", title: "Weekly", noun: "week", caption: "last 12 weeks" },
  month: { pill: "Month", title: "Monthly", noun: "month", caption: "last 12 months" },
  quarter: { pill: "Quarter", title: "Quarterly", noun: "quarter", caption: "last 6 quarters" },
};

// ---------------------------------------------------------------------------------------------
// Derived helpers
// ---------------------------------------------------------------------------------------------

export function isActiveStatus(status: OrderStatus): boolean {
  return (ACTIVE_ORDER_STATUSES as readonly OrderStatus[]).includes(status);
}

/** The card's status pill: "Alert" while the order has open alerts, else the status badge. */
export function orderStatusBadge(order: Pick<OrderListItem, "status" | "openAlerts">): LabelTone {
  if (order.openAlerts.length > 0) return ALERT_BADGE;
  const { label, tone } = ORDER_STATUS_META[order.status];
  return { label, tone };
}

/** "Loading in progress". */
export function currentOperationLabel(kind: OperationKind): string {
  return `${OPERATION_LABEL[kind]} in progress`;
}

/** "Photo missing" — alert label as a sentence. */
export function alertSentence(kind: AlertKind): string {
  const label = ALERT_LABEL[kind];
  return label.charAt(0).toUpperCase() + label.slice(1);
}
