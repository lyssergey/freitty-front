"use client";

import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { api, apiUrl } from "./client";
import { queryKeys } from "./query-keys";
import type {
  ActivityPeriod,
  ActivityResponse,
  DashboardSummary,
  HubsResponse,
  MeResponse,
  OrderDetail,
  OrdersBoard,
  OrdersBoardParams,
  OrdersExportParams,
  OrdersListParams,
  OrdersPage,
  RecentOrdersResponse,
} from "./types";

/** The demo user and their company (balance). Rarely changes. */
export function useMe() {
  return useQuery({
    queryKey: queryKeys.me(),
    queryFn: ({ signal }) => api.get<MeResponse>("/me", { signal }),
    staleTime: 5 * 60_000,
  });
}

/** Hubs for the hub filter. */
export function useHubs() {
  return useQuery({
    queryKey: queryKeys.hubs(),
    queryFn: ({ signal }) => api.get<HubsResponse>("/hubs", { signal }).then((r) => r.items),
    staleTime: 10 * 60_000,
  });
}

/** One page of orders plus per-segment counts. Keeps the previous page on screen while loading. */
export function useOrders(params: OrdersListParams, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.orders.list(params),
    queryFn: ({ signal }) => api.get<OrdersPage>("/orders", { params, signal }),
    placeholderData: keepPreviousData,
    enabled: options.enabled ?? true,
  });
}

/** Pipeline (kanban) columns — one per status, in lifecycle order. */
export function useOrdersBoard(params: OrdersBoardParams, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.orders.board(params),
    queryFn: ({ signal }) => api.get<OrdersBoard>("/orders/board", { params, signal }),
    placeholderData: keepPreviousData,
    enabled: options.enabled ?? true,
  });
}

function fetchOrder(number: string, signal?: AbortSignal) {
  return api.get<OrderDetail>(`/orders/${encodeURIComponent(number.trim().toUpperCase())}`, {
    signal,
  });
}

/** Full order detail by number (case-insensitive). 404 → `ApiError.isNotFound`. */
export function useOrder(number: string) {
  return useQuery({
    queryKey: queryKeys.orders.detail(number),
    queryFn: ({ signal }) => fetchOrder(number, signal),
    enabled: number.trim().length > 0,
  });
}

/** Warms the detail cache on card hover/focus so opening an order feels instant. */
export function usePrefetchOrder() {
  const queryClient = useQueryClient();
  return useCallback(
    (number: string) => {
      void queryClient.prefetchQuery({
        queryKey: queryKeys.orders.detail(number),
        queryFn: ({ signal }) => fetchOrder(number, signal),
        staleTime: 30_000,
      });
    },
    [queryClient],
  );
}

/** KPI cards + sidebar/bell attention badge. */
export function useDashboardSummary() {
  return useQuery({
    queryKey: queryKeys.dashboard.summary(),
    queryFn: ({ signal }) => api.get<DashboardSummary>("/dashboard/summary", { signal }),
  });
}

/** Latest non-draft orders for the dashboard. */
export function useRecentOrders(limit = 4) {
  return useQuery({
    queryKey: queryKeys.dashboard.recentOrders(limit),
    queryFn: ({ signal }) =>
      api
        .get<RecentOrdersResponse>("/dashboard/recent-orders", { params: { limit }, signal })
        .then((r) => r.items),
  });
}

/** Completed orders + spend per calendar bucket. Keeps the old chart while switching periods. */
export function useActivity(period: ActivityPeriod) {
  return useQuery({
    queryKey: queryKeys.dashboard.activity(period),
    queryFn: ({ signal }) =>
      api.get<ActivityResponse>("/dashboard/activity", { params: { period }, signal }),
    placeholderData: keepPreviousData,
  });
}

/** Same-origin CSV download URL for the current list filters. */
export function ordersExportUrl(params: OrdersExportParams): string {
  return apiUrl("/orders/export", params);
}
