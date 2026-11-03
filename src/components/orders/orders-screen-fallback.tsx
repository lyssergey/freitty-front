import { PageHeader } from "@/components/layout/page-header";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderCardSkeleton } from "./order-card";

/** Server-rendered skeleton of the order list while the URL-driven screen hydrates. */
export function OrdersScreenFallback() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/dashboard" }, { label: "Orders" }]} />
      <PageHeader title="All Orders" />
      <Skeleton className="mb-4 h-[42px]" />
      <Skeleton className="mb-4 h-8 w-80" />
      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <OrderCardSkeleton key={i} variant="compact" />
        ))}
      </div>
    </>
  );
}
