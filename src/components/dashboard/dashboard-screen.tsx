"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Skeleton } from "@/components/ui/skeleton";
import { useMe } from "@/lib/api/hooks";
import { ActivityPanel } from "./activity-panel";
import { KpiCards } from "./kpi-cards";
import { RecentOrders } from "./recent-orders";

export function DashboardScreen() {
  const me = useMe();

  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/dashboard" }, { label: "Dashboard" }]} />
      <PageHeader
        title={
          me.data ? (
            <>
              Welcome, {me.data.user.name}{" "}
              <span role="img" aria-label="waving hand">
                👋
              </span>
            </>
          ) : me.isPending ? (
            <Skeleton className="h-[30px] w-56" />
          ) : (
            "Welcome"
          )
        }
      />
      <KpiCards />
      <RecentOrders />
      <ActivityPanel />
    </>
  );
}
