/**
 * Order-list state lives in the URL (`/orders?segment=alerts&hub=MAR&page=2&view=table`), so a
 * filtered list can be shared, bookmarked and restored with Back. Parsing is forgiving — every
 * unknown or malformed value falls back to its default — and serializing omits defaults.
 */
import { z } from "zod";
import type {
  DatePreset,
  OrderSegment,
  OrderStatus,
  OrdersBoardParams,
  OrdersExportParams,
  OrdersListParams,
} from "@/lib/api/types";
import { DATE_PRESETS, ORDER_SEGMENTS, ORDER_STATUSES } from "@/lib/api/types";

export const ORDER_VIEWS = ["cards", "table", "board"] as const;
export type OrderView = (typeof ORDER_VIEWS)[number];

export const SEARCH_MAX_LENGTH = 64;

export interface OrderFilters {
  segment: OrderSegment;
  /** Hub code, e.g. `MAR`. */
  hub: string | null;
  period: DatePreset;
  status: OrderStatus | null;
  q: string;
  page: number;
  view: OrderView;
}

export const DEFAULT_ORDER_FILTERS: Readonly<OrderFilters> = Object.freeze({
  segment: "all",
  hub: null,
  period: "30d",
  status: null,
  q: "",
  page: 1,
  view: "cards",
});

/** Keys that narrow the result set; changing any of them goes back to page 1. */
const FILTER_KEYS = ["segment", "hub", "period", "status", "q"] as const;

/** Same format the API validates (`OrderFiltersQuery.hub`) — anything else falls back to "All". */
const HUB_CODE = /^[A-Z0-9]{2,8}$/;

/** Trim, collapse inner whitespace, cap at the API's 64 chars. */
export function normalizeSearch(value: string): string {
  return value.trim().replace(/\s+/g, " ").slice(0, SEARCH_MAX_LENGTH).trim();
}

const filtersSchema = z.object({
  segment: z.enum(ORDER_SEGMENTS).catch(DEFAULT_ORDER_FILTERS.segment),
  hub: z.string().trim().toUpperCase().regex(HUB_CODE).nullable().catch(null),
  period: z.enum(DATE_PRESETS).catch(DEFAULT_ORDER_FILTERS.period),
  status: z.enum(ORDER_STATUSES).nullable().catch(null),
  q: z.string().transform(normalizeSearch).catch(""),
  page: z.coerce.number().int().min(1).max(100_000).catch(1),
  view: z.enum(ORDER_VIEWS).catch(DEFAULT_ORDER_FILTERS.view),
});

/** Anything with `get(key)`: URLSearchParams, Next's ReadonlyURLSearchParams. */
export interface SearchParamsLike {
  get(name: string): string | null;
}

export function parseOrderFilters(params: SearchParamsLike): OrderFilters {
  return filtersSchema.parse({
    segment: params.get("segment"),
    hub: params.get("hub"),
    period: params.get("period"),
    status: params.get("status"),
    q: params.get("q"),
    page: params.get("page"),
    view: params.get("view"),
  });
}

/** Stable key order, defaults omitted. */
export function serializeOrderFilters(filters: Partial<OrderFilters>): URLSearchParams {
  const f = { ...DEFAULT_ORDER_FILTERS, ...filters };
  const params = new URLSearchParams();
  if (f.segment !== DEFAULT_ORDER_FILTERS.segment) params.set("segment", f.segment);
  if (f.hub) params.set("hub", f.hub);
  if (f.period !== DEFAULT_ORDER_FILTERS.period) params.set("period", f.period);
  if (f.status) params.set("status", f.status);
  const q = normalizeSearch(f.q);
  if (q) params.set("q", q);
  if (f.page > 1) params.set("page", String(f.page));
  if (f.view !== DEFAULT_ORDER_FILTERS.view) params.set("view", f.view);
  return params;
}

/** `/orders?…` for the given (partial) filters — used by links into the list. */
export function ordersHref(filters: Partial<OrderFilters> = {}): string {
  const qs = serializeOrderFilters(filters).toString();
  return qs ? `/orders?${qs}` : "/orders";
}

/** Merges a change into the current filters; any filter change resets the page to 1. */
export function applyFilterChange(
  current: OrderFilters,
  patch: Partial<OrderFilters>,
): OrderFilters {
  const next: OrderFilters = { ...current, ...patch };
  const filterChanged = FILTER_KEYS.some((key) => key in patch && patch[key] !== current[key]);
  if (filterChanged && patch.page === undefined) next.page = 1;
  return next;
}

/** True when anything besides the view/page differs from the defaults. */
export function hasActiveFilters(filters: OrderFilters): boolean {
  return FILTER_KEYS.some((key) => filters[key] !== DEFAULT_ORDER_FILTERS[key]);
}

function baseParams(filters: OrderFilters): OrdersBoardParams {
  const params: OrdersBoardParams = {};
  if (filters.segment !== DEFAULT_ORDER_FILTERS.segment) params.segment = filters.segment;
  if (filters.hub) params.hub = filters.hub;
  if (filters.period !== DEFAULT_ORDER_FILTERS.period) params.period = filters.period;
  if (filters.q) params.q = filters.q;
  return params;
}

/** `GET /api/orders` query (the board ignores status, so it isn't sent there). */
export function toListParams(filters: OrderFilters): OrdersListParams {
  const params: OrdersListParams = { ...baseParams(filters) };
  if (filters.status && filters.view !== "board") params.status = filters.status;
  if (filters.page > 1) params.page = filters.page;
  return params;
}

/** `GET /api/orders/board` query. */
export function toBoardParams(filters: OrderFilters): OrdersBoardParams {
  return baseParams(filters);
}

/** `GET /api/orders/export` query — exactly what's on screen. */
export function toExportParams(filters: OrderFilters): OrdersExportParams {
  const params: OrdersExportParams = { ...baseParams(filters) };
  if (filters.status && filters.view !== "board") params.status = filters.status;
  return params;
}
