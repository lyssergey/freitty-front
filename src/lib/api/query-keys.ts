import type { ActivityPeriod, OrdersBoardParams, OrdersListParams } from "./types";

/**
 * Query-key factory — the one place keys are built, so invalidation and prefetching always hit
 * the same cache entries. Hierarchical: `["orders"]` invalidates every orders query.
 */
export const queryKeys = {
  me: () => ["me"] as const,
  hubs: () => ["hubs"] as const,
  orders: {
    all: () => ["orders"] as const,
    list: (params: OrdersListParams) => ["orders", "list", params] as const,
    board: (params: OrdersBoardParams) => ["orders", "board", params] as const,
    detail: (number: string) => ["orders", "detail", number.trim().toUpperCase()] as const,
  },
  dashboard: {
    all: () => ["dashboard"] as const,
    summary: () => ["dashboard", "summary"] as const,
    recentOrders: (limit: number) => ["dashboard", "recent-orders", limit] as const,
    activity: (period: ActivityPeriod) => ["dashboard", "activity", period] as const,
  },
};
