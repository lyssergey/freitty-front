import type { Metadata } from "next";
import { Suspense } from "react";
import { OrdersScreen } from "@/components/orders/orders-screen";
import { OrdersScreenFallback } from "@/components/orders/orders-screen-fallback";

export const metadata: Metadata = { title: "Orders" };

export default function OrdersPage() {
  // The list reads its filters from the URL (useSearchParams) — stream it behind a skeleton.
  return (
    <Suspense fallback={<OrdersScreenFallback />}>
      <OrdersScreen />
    </Suspense>
  );
}
