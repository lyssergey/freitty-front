/**
 * Shared shapes of the Freitty API — an exact mirror of the backend contract (SPEC §1 enums,
 * §4 DTOs). Dates are ISO-8601 UTC strings; money is integer cents. Keep in sync with the API.
 *
 * Enum value lists are runtime constants (used by URL parsing and label maps); the TS types are
 * derived from them so the two can never drift apart.
 */

// ---------------------------------------------------------------------------------------------
// Enums (§1)
// ---------------------------------------------------------------------------------------------

export const ORDER_TYPES = ["cross_dock", "consolidation"] as const;
export type OrderType = (typeof ORDER_TYPES)[number];

/** Lifecycle order. */
export const ORDER_STATUSES = [
  "draft",
  "ready",
  "in_progress",
  "consolidated",
  "in_transit",
  "deconsolidated",
  "closed",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ACTIVE_ORDER_STATUSES = [
  "ready",
  "in_progress",
  "consolidated",
  "in_transit",
  "deconsolidated",
] as const satisfies readonly OrderStatus[];

export const USER_ROLES = ["admin", "dispatcher", "driver", "floor_lead"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const UNIT_TYPES = ["standard", "xl"] as const;
export type UnitType = (typeof UNIT_TYPES)[number];

export const SERVICE_KINDS = [
  "storage",
  "pickup",
  "transload",
  "restock_rework",
  "labeling",
  "shrink_wrap",
] as const;
export type ServiceKind = (typeof SERVICE_KINDS)[number];

export const CARRIER_MODES = ["carrier", "driver", "self_pickup"] as const;
export type CarrierMode = (typeof CARRIER_MODES)[number];

export const CARGO_STATUSES = ["expected", "on_stock", "dispatched"] as const;
export type CargoStatus = (typeof CARGO_STATUSES)[number];

export const OPERATION_KINDS = [
  "unloading",
  "loading",
  "restack",
  "disposal",
  "transload",
  "consolidation",
  "deconsolidation",
  "wrapping",
] as const;
export type OperationKind = (typeof OPERATION_KINDS)[number];

export const NEXT_ACTION_KINDS = [
  "await_truck",
  "unloading",
  "loading",
  "consolidation",
  "dispatch",
  "deconsolidation",
  "delivery",
  "upload_photo",
  "confirm_bol",
  "book_delivery",
  "approve_delta",
  "pay_invoice",
] as const;
export type NextActionKind = (typeof NEXT_ACTION_KINDS)[number];

export const ALERT_KINDS = [
  "photo_missing",
  "qty_mismatch",
  "damaged_cargo",
  "late_arrival",
] as const;
export type AlertKind = (typeof ALERT_KINDS)[number];

export const TRAILER_TYPES = ["van_53", "reefer_53", "flatbed_48", "straight_26"] as const;
export type TrailerType = (typeof TRAILER_TYPES)[number];

export const SUPPLY_CATEGORIES = [
  "securement",
  "edge_protection",
  "wrap",
  "pallets",
  "labeling",
] as const;
export type SupplyCategory = (typeof SUPPLY_CATEGORIES)[number];

export const ACTIVITY_PERIODS = ["day", "week", "month", "quarter"] as const;
export type ActivityPeriod = (typeof ACTIVITY_PERIODS)[number];

export const ORDER_SEGMENTS = [
  "all",
  "cross_dock",
  "consolidation",
  "alerts",
  "drafts",
  "attention",
] as const;
export type OrderSegment = (typeof ORDER_SEGMENTS)[number];

export const DATE_PRESETS = ["today", "week", "30d", "all"] as const;
export type DatePreset = (typeof DATE_PRESETS)[number];

// ---------------------------------------------------------------------------------------------
// DTOs (§4)
// ---------------------------------------------------------------------------------------------

export interface UserRef {
  id: string;
  name: string;
  initials: string;
  role: UserRole;
  avatarColor: string;
}

export interface HubRef {
  id: string;
  code: string;
  name: string;
  province: string;
}

/** Aggregated per unit type (standard first, then xl); `actual` is null if all actuals are null. */
export interface CargoSummary {
  unitType: UnitType;
  declared: number;
  actual: number | null;
}

export interface SubOrderSummary {
  id: string;
  number: string;
  refNumber: string;
  /** Unit type with the largest declared quantity. */
  unitType: UnitType;
  declaredQty: number;
  actualQty: number | null;
  /** First open alert attached to this sub-order. */
  alert: { kind: AlertKind; message: string } | null;
}

export interface CarrierSummary {
  mode: CarrierMode;
  name: string | null;
  phone: string | null;
  driver: UserRef | null;
}

export interface NextAction {
  kind: NextActionKind;
  dueAt: string | null;
  /** Client-owned ("requires your action"); the API is the only place that decides it. */
  requiresClient: boolean;
}

export interface OpenAlert {
  id: string;
  kind: AlertKind;
  message: string;
  subOrderNumber: string | null;
  createdAt: string;
}

export interface InvoiceSummary {
  number: string;
  amountCents: number;
  issuedAt: string;
  paidAt: string | null;
}

export interface OrderListItem {
  id: string;
  number: string;
  type: OrderType;
  status: OrderStatus;
  services: ServiceKind[];
  refNumber: string | null;
  /** By position; [] for cross-dock. */
  subOrders: SubOrderSummary[];
  hub: HubRef;
  destinationHub: HubRef | null;
  scheduledAt: string | null;
  destination: string | null;
  destinationNote: string | null;
  /** [] when there is no cargo. */
  cargo: CargoSummary[];
  /** null when carrier_mode is NULL (drafts). */
  carrier: CarrierSummary | null;
  createdBy: UserRef;
  consolidatedTrailers: number | null;
  nextAction: NextAction | null;
  /** Newest first. */
  openAlerts: OpenAlert[];
  invoice: InvoiceSummary | null;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
}

export interface OrderDock {
  number: number;
  bay: string | null;
  assignedAt: string | null;
  hubDockCount: number;
}

export interface OrderDelta {
  unitType: UnitType;
  declared: number;
  actual: number;
  diff: number;
}

export interface OrderOperation {
  id: string;
  kind: OperationKind;
  billable: boolean;
  trailerNumber: string | null;
  qty: number;
  unitType: UnitType;
  rateCents: number;
  amountCents: number;
  appliedAt: string;
  commentsCount: number;
  photosCount: number;
}

export interface OrderSupply {
  id: string;
  sku: string;
  name: string;
  category: SupplyCategory;
  qty: number;
  unitPriceCents: number;
  lineTotalCents: number;
}

export interface OrderTotals {
  operationsCents: number;
  suppliesCents: number;
  totalCents: number;
}

export interface OrderDetail extends OrderListItem {
  company: { id: string; name: string };
  cargoStatus: CargoStatus;
  currentOperation: OperationKind | null;
  truckNumber: string | null;
  trailerNumber: string | null;
  trailerType: TrailerType | null;
  dock: OrderDock | null;
  assignee: UserRef | null;
  warehouseNote: string | null;
  photosCount: number;
  messages: { total: number; unread: number };
  /** Only unit types where actual ≠ null and actual ≠ declared. */
  deltas: OrderDelta[];
  /** appliedAt ASC. */
  operations: OrderOperation[];
  supplies: OrderSupply[];
  totals: OrderTotals;
}

// ---------------------------------------------------------------------------------------------
// Endpoint responses
// ---------------------------------------------------------------------------------------------

export interface MeResponse {
  user: UserRef & { email: string };
  company: { id: string; name: string; balanceCents: number };
}

export interface HubsResponse {
  items: HubRef[];
}

export interface OrdersPage {
  items: OrderListItem[];
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
  counts: Record<OrderSegment, number>;
}

export interface OrdersBoardColumn {
  status: OrderStatus;
  /** Full column count (items are capped at 20). */
  count: number;
  items: OrderListItem[];
}

export interface OrdersBoard {
  columns: OrdersBoardColumn[];
}

export interface DashboardAlertRef {
  orderNumber: string;
  kind: AlertKind;
  subOrderNumber: string | null;
}

export interface DashboardSummary {
  activeOrders: { count: number; createdThisWeek: number };
  completed: { last30d: number; previous30d: number };
  needAttention: {
    total: number;
    awaitingAction: number;
    alertOrders: number;
    /** ≤ 5, newest first. */
    alerts: DashboardAlertRef[];
  };
}

export interface RecentOrdersResponse {
  items: OrderListItem[];
}

export interface ActivityBucket {
  /** Local (APP_TIMEZONE) calendar date `YYYY-MM-DD` the bucket starts on. */
  start: string;
  completed: number;
  spendCents: number;
}

export interface ActivityResponse {
  period: ActivityPeriod;
  timezone: string;
  /** Oldest → newest; the last one is the current, partial bucket. */
  buckets: ActivityBucket[];
  totals: { completed: number; spendCents: number; avgOrderCents: number | null };
  /** Last complete bucket (`buckets.at(-2)`) vs the one before it, rounded %; null when that is 0. */
  comparison: { completedChangePct: number | null; spendChangePct: number | null };
  peak: { start: string; spendCents: number } | null;
}

// ---------------------------------------------------------------------------------------------
// Query params
// ---------------------------------------------------------------------------------------------

export type OrdersListParams = {
  segment?: OrderSegment;
  hub?: string;
  period?: DatePreset;
  status?: OrderStatus;
  q?: string;
  page?: number;
  pageSize?: number;
};

export type OrdersBoardParams = Omit<OrdersListParams, "status" | "page" | "pageSize">;

export type OrdersExportParams = Omit<OrdersListParams, "page" | "pageSize">;
