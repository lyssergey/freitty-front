"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import type { OrderDetail } from "@/lib/api/types";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ErrorState } from "@/components/ui/error-state";
import { isApiError } from "@/lib/api/client";
import { useOrder } from "@/lib/api/hooks";
import { ActionBar } from "./action-bar";
import { DetailHeader } from "./detail-header";
import { DockCard } from "./dock-card";
import { MetaCard } from "./meta-card";
import { OperationsTable } from "./operations-table";
import { OrderDetailSkeleton } from "./order-detail-skeleton";
import { OrderNotFound } from "./order-not-found";
import { OrderNotices } from "./notices";
import { OrderSummaryRow } from "./order-summary-row";
import { OrderTotal } from "./order-total";
import { QuantityCards } from "./quantity-cards";
import { SubOrdersTable } from "./sub-orders-table";
import { SuppliesTable } from "./supplies-table";

/** Sections fade up one after another on first render. */
function Reveal({ index, children }: { index: number; children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut", delay: index * 0.05 }}
    >
      {children}
    </motion.div>
  );
}

function OrderDetailView({ order }: { order: OrderDetail }) {
  let index = 0;
  const next = () => index++;

  return (
    <>
      <DetailHeader type={order.type} number={order.number} />
      <Reveal index={next()}>
        <OrderSummaryRow order={order} />
        <ActionBar order={order} />
        <OrderNotices order={order} />
      </Reveal>
      <Reveal index={next()}>
        <MetaCard order={order} />
      </Reveal>
      <Reveal index={next()}>
        <div className="mb-4 grid gap-3.5 md:grid-cols-[300px_minmax(0,1fr)]">
          <DockCard order={order} />
          <QuantityCards order={order} />
        </div>
      </Reveal>
      {order.type === "consolidation" && (
        <Reveal index={next()}>
          <SubOrdersTable order={order} />
        </Reveal>
      )}
      <Reveal index={next()}>
        <OperationsTable order={order} />
      </Reveal>
      <Reveal index={next()}>
        <SuppliesTable order={order} />
      </Reveal>
      <Reveal index={next()}>
        <OrderTotal order={order} />
      </Reveal>
    </>
  );
}

/** Order detail (mockup `#crossdock`), for cross-dock, consolidation and draft orders. */
export function OrderDetailScreen({ number }: { number: string }) {
  const order = useOrder(number);

  return (
    <>
      <Breadcrumbs items={[{ label: "Orders", href: "/orders" }, { label: number }]} />
      {order.isPending ? (
        <OrderDetailSkeleton />
      ) : order.isError ? (
        isApiError(order.error) && order.error.isNotFound ? (
          <OrderNotFound number={number} />
        ) : (
          <ErrorState
            className="mt-2"
            title={`Couldn't load order ${number}`}
            error={order.error}
            onRetry={() => void order.refetch()}
            retrying={order.isFetching}
          />
        )
      ) : (
        <OrderDetailView order={order.data} />
      )}
    </>
  );
}
