"use client";

import { Download, Plus, SearchX } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useEffect } from "react";
import type { OrderSegment, OrdersPage } from "@/lib/api/types";
import { PageHeader } from "@/components/layout/page-header";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button, buttonClasses } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Tabs, type TabItem } from "@/components/ui/tabs";
import { useNotInDemo } from "@/components/ui/toast";
import { ordersExportUrl, useHubs, useOrders, useOrdersBoard } from "@/lib/api/hooks";
import { SEGMENT_LABEL } from "@/lib/domain/labels";
import {
  hasActiveFilters,
  toBoardParams,
  toExportParams,
  toListParams,
  type OrderFilters,
} from "@/lib/domain/order-filters";
import { useOrderFilters } from "@/lib/hooks/use-order-filters";
import { OrderCard, OrderCardSkeleton } from "./order-card";
import { OrdersBoard, OrdersBoardSkeleton } from "./orders-board";
import { OrdersPagination } from "./orders-pagination";
import { OrdersTable, OrdersTableSkeleton } from "./orders-table";
import { OrdersToolbar } from "./orders-toolbar";

const BASE_SEGMENTS: readonly OrderSegment[] = [
  "all",
  "cross_dock",
  "consolidation",
  "alerts",
  "drafts",
];

const PANEL_ID = "orders-panel";

function segmentTabs(segment: OrderSegment, counts: OrdersPage["counts"] | undefined) {
  // "Need attention" is reachable from the dashboard and only shown while it's selected.
  const segments =
    segment === "attention" ? [...BASE_SEGMENTS, "attention" as const] : BASE_SEGMENTS;
  return segments.map((value): TabItem<OrderSegment> => ({
    value,
    label: SEGMENT_LABEL[value],
    count: counts?.[value],
    urgent: value === "alerts" || value === "attention",
  }));
}

function NoResults({ filters, onReset }: { filters: OrderFilters; onReset: () => void }) {
  const filtered = hasActiveFilters(filters);
  return (
    <EmptyState
      icon={<SearchX />}
      title={filtered ? "No orders match these filters" : "No orders yet"}
      description={
        filtered
          ? "Try another hub, date range or status — or clear the search."
          : "Orders you create will show up here."
      }
      action={
        filtered && (
          <Button variant="secondary" size="sm" onClick={onReset}>
            Reset filters
          </Button>
        )
      }
    />
  );
}

/** Order list (mockup `#orderlist`): segment tabs, filters, cards / table / pipeline views. */
export function OrdersScreen() {
  const { filters, update, reset } = useOrderFilters();
  const notInDemo = useNotInDemo();
  const isBoard = filters.view === "board";

  // The board has no paging; there the list query only supplies the tab counts. It asks for the
  // same page 1 the cards and table show, so switching back to them is a cache hit.
  const list = useOrders(toListParams(isBoard ? { ...filters, page: 1 } : filters));
  const board = useOrdersBoard(toBoardParams(filters), { enabled: isBoard });
  const hubs = useHubs();

  // A stale link may point past the last page — snap back to it.
  const pageCount = list.data?.pageCount ?? 0;
  const outOfRange =
    !isBoard && !list.isPlaceholderData && pageCount > 0 && filters.page > pageCount;
  useEffect(() => {
    if (outOfRange) update({ page: pageCount }, { replace: true });
  }, [outOfRange, pageCount, update]);

  const activeQuery = isBoard ? board : list;
  const refreshing = activeQuery.isPlaceholderData;

  function renderContent() {
    if (isBoard) {
      if (board.isPending) return <OrdersBoardSkeleton />;
      if (board.isError) {
        return (
          <ErrorState
            title="Couldn't load the pipeline"
            error={board.error}
            onRetry={() => void board.refetch()}
            retrying={board.isFetching}
          />
        );
      }
      if (board.data.columns.every((column) => column.count === 0)) {
        return <NoResults filters={filters} onReset={reset} />;
      }
      return <OrdersBoard columns={board.data.columns} filters={filters} />;
    }

    if (list.isPending) {
      return filters.view === "table" ? (
        <OrdersTableSkeleton />
      ) : (
        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <OrderCardSkeleton key={i} variant="compact" />
          ))}
        </div>
      );
    }
    if (list.isError) {
      return (
        <ErrorState
          title="Couldn't load orders"
          error={list.error}
          onRetry={() => void list.refetch()}
          retrying={list.isFetching}
        />
      );
    }
    if (list.data.items.length === 0) {
      return outOfRange ? null : <NoResults filters={filters} onReset={reset} />;
    }

    return (
      <>
        {filters.view === "table" ? (
          <OrdersTable orders={list.data.items} />
        ) : (
          <div className="relative grid grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {list.data.items.map((order, index) => (
                <OrderCard key={order.id} order={order} variant="compact" index={index} />
              ))}
            </AnimatePresence>
          </div>
        )}
        <OrdersPagination
          page={list.data.page}
          pageSize={list.data.pageSize}
          total={list.data.total}
          pageCount={list.data.pageCount}
          onPageChange={(page) => update({ page })}
        />
      </>
    );
  }

  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/dashboard" }, { label: "Orders" }]} />
      <PageHeader
        title="All Orders"
        actions={
          <>
            <a
              href={ordersExportUrl(toExportParams(filters))}
              download
              className={buttonClasses({ variant: "secondary" })}
            >
              <Download aria-hidden />
              Export CSV
            </a>
            <Button onClick={notInDemo}>
              <Plus aria-hidden />
              New Order
            </Button>
          </>
        }
      />

      <Tabs
        className="mb-4"
        label="Order segments"
        layoutId="orders-segment"
        controls={PANEL_ID}
        items={segmentTabs(filters.segment, list.data?.counts)}
        value={filters.segment}
        onChange={(segment) => update({ segment })}
      />

      <OrdersToolbar filters={filters} hubs={hubs.data} onChange={update} />

      <section
        id={PANEL_ID}
        role="tabpanel"
        aria-labelledby={`orders-segment-${filters.segment}`}
        aria-busy={refreshing || undefined}
        className={cn("transition-opacity duration-200", refreshing && "opacity-60")}
      >
        <h2 className="sr-only">{SEGMENT_LABEL[filters.segment]} orders</h2>
        {renderContent()}
      </section>
    </>
  );
}
