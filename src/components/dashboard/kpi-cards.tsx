"use client";

import { MoveRight, Triangle, TriangleAlert } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import type { ReactNode } from "react";
import type { DashboardSummary } from "@/lib/api/types";
import { Card } from "@/components/ui/card";
import { cn } from "@/components/ui/cn";
import { CountUp } from "@/components/ui/count-up";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardSummary } from "@/lib/api/hooks";
import { ALERT_LABEL } from "@/lib/domain/labels";
import { ordersHref } from "@/lib/domain/order-filters";

const ACCENTS = {
  blue: "border-t-accent",
  green: "border-t-success",
} as const;

function FadeUp({
  index,
  className,
  children,
}: {
  index: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut", delay: index * 0.06 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Kpi({
  label,
  value,
  accent,
  trend,
}: {
  label: string;
  value: number;
  accent: keyof typeof ACCENTS;
  trend: ReactNode;
}) {
  return (
    <Card className={cn("h-full border-t-[3px] px-4 py-3.5", ACCENTS[accent])}>
      <p className="mb-1.5 text-2xs tracking-[0.05em] text-ink-muted uppercase">{label}</p>
      <p className="text-2xl leading-8 font-bold text-ink">
        <CountUp value={value} />
      </p>
      <p className="mt-1 flex items-center gap-1 text-2xs">{trend}</p>
    </Card>
  );
}

/** The mockup's solid "▲" / "▼" trend marker. */
function TrendTriangle({ down }: { down?: boolean }) {
  return (
    <Triangle
      aria-hidden
      className={cn("size-2.5 fill-current", down && "rotate-180")}
      strokeWidth={0}
    />
  );
}

function ActiveTrend({ createdThisWeek }: { createdThisWeek: number }) {
  if (createdThisWeek === 0) return <span className="text-ink-muted">No new orders this week</span>;
  return (
    <span className="inline-flex items-center gap-1 text-success-ink">
      <TrendTriangle />
      {createdThisWeek} this week
    </span>
  );
}

/** Rolling windows, so the wording names them (the activity chart compares calendar buckets). */
function CompletedTrend({ last30d, previous30d }: DashboardSummary["completed"]) {
  const diff = last30d - previous30d;
  if (diff === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-ink-muted">
        <MoveRight aria-hidden className="size-3.5" />
        same as previous 30 days
      </span>
    );
  }
  const up = diff > 0;
  return (
    <span className={cn("inline-flex items-center gap-1", up ? "text-success-ink" : "text-danger")}>
      <TrendTriangle down={!up} />
      {Math.abs(diff)} vs previous 30 days
    </span>
  );
}

function NeedAttentionCard({ data }: { data: DashboardSummary["needAttention"] }) {
  const [firstAlert] = data.alerts;
  const alertChip =
    data.alertOrders === 1 && firstAlert
      ? `1 · alert (${ALERT_LABEL[firstAlert.kind]} · ${firstAlert.orderNumber})`
      : `${data.alertOrders} · alerts`;

  // The counts cover orders of any date, so the list opens with "All time", not the last 30 days.
  return (
    <Link
      href={ordersHref({ segment: "attention", period: "all" })}
      className={cn(
        "group bg-attention-gradient relative block h-full rounded-card border border-t-[3px] border-line border-t-danger px-4 py-3.5",
        "transition-shadow duration-150 hover:shadow-card-hover",
      )}
    >
      <p className="mb-1.5 flex items-center gap-1.5 text-2xs tracking-[0.05em] text-brand-strong uppercase">
        <TriangleAlert aria-hidden className="size-3.5" />
        Need attention
      </p>
      <div className="mt-0.5 flex items-baseline gap-[18px]">
        <div>
          <p className="text-2xl leading-8 font-bold text-brand-strong">
            <CountUp value={data.total} />
          </p>
          <p className="text-3xs font-bold tracking-[0.06em] text-danger-ink uppercase">Total</p>
        </div>
        {data.total === 0 ? (
          <p className="text-xs font-semibold text-ink-muted">
            Nothing needs your action right now
          </p>
        ) : (
          <ul className="flex min-w-0 flex-1 flex-wrap gap-2">
            {data.awaitingAction > 0 && (
              <li className="rounded-lg bg-tone-orange px-2 py-[3px] text-2xs font-bold text-tone-orange-ink">
                {data.awaitingAction} · awaiting your action
              </li>
            )}
            {data.alertOrders > 0 && (
              <li className="rounded-lg bg-tone-rose px-2 py-[3px] text-2xs font-bold text-tone-rose-ink">
                {alertChip}
              </li>
            )}
          </ul>
        )}
      </div>
      {/* Bottom-right corner as in the mockup; next to the title on phones, where the chips wrap. */}
      <span className="absolute top-3.5 right-3 text-2xs font-extrabold text-brand-strong group-hover:underline sm:top-auto sm:bottom-2.5">
        Open list →
      </span>
    </Link>
  );
}

const GRID = "mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4";

/** Dashboard KPI row: Active, Completed (30 d) and Need Attention (spans two slots). */
export function KpiCards() {
  const summary = useDashboardSummary();

  if (summary.isPending) {
    return (
      <div aria-hidden className={GRID}>
        <Skeleton className="h-[106px] rounded-card" />
        <Skeleton className="h-[106px] rounded-card" />
        <Skeleton className="col-span-2 h-[106px] rounded-card" />
      </div>
    );
  }

  if (summary.isError) {
    return (
      <ErrorState
        className="mb-5"
        title="Couldn't load your key figures"
        error={summary.error}
        onRetry={() => void summary.refetch()}
        retrying={summary.isFetching}
      />
    );
  }

  const { activeOrders, completed, needAttention } = summary.data;

  return (
    <section aria-label="Key figures" className={GRID}>
      <FadeUp index={0}>
        <Kpi
          label="Active orders"
          value={activeOrders.count}
          accent="blue"
          trend={<ActiveTrend createdThisWeek={activeOrders.createdThisWeek} />}
        />
      </FadeUp>
      <FadeUp index={1}>
        <Kpi
          label="Completed (30 d)"
          value={completed.last30d}
          accent="green"
          trend={<CompletedTrend {...completed} />}
        />
      </FadeUp>
      <FadeUp index={2} className="col-span-2">
        <NeedAttentionCard data={needAttention} />
      </FadeUp>
    </section>
  );
}
