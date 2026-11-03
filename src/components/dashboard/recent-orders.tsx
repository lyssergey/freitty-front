"use client";

import { Inbox } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { OrderCard, OrderCardSkeleton } from "@/components/orders/order-card";
import { useRecentOrders } from "@/lib/api/hooks";

const LIMIT = 4;
const GRID = "grid grid-cols-1 gap-3.5 lg:grid-cols-2";

/** "Recent orders" — the latest non-draft orders as full cards. */
export function RecentOrders() {
  const recent = useRecentOrders(LIMIT);

  return (
    <section aria-labelledby="recent-orders-title" className="mb-6">
      <div className="mt-5 mb-3 flex items-center justify-between">
        <h2 id="recent-orders-title" className="text-base font-bold text-ink">
          Recent orders
        </h2>
        <Link href="/orders" className="text-xs font-semibold text-accent hover:underline">
          View all →
        </Link>
      </div>

      {recent.isPending ? (
        <div className={GRID}>
          {Array.from({ length: LIMIT }, (_, i) => (
            <OrderCardSkeleton key={i} variant="full" />
          ))}
        </div>
      ) : recent.isError ? (
        <ErrorState
          title="Couldn't load recent orders"
          error={recent.error}
          onRetry={() => void recent.refetch()}
          retrying={recent.isFetching}
        />
      ) : recent.data.length === 0 ? (
        <EmptyState
          icon={<Inbox />}
          title="No orders yet"
          description="Orders you create will show up here."
        />
      ) : (
        <div className={GRID}>
          {recent.data.map((order, index) => (
            <OrderCard key={order.id} order={order} variant="full" index={index} />
          ))}
        </div>
      )}
    </section>
  );
}
