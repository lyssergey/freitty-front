"use client";

import { ChartColumn, Star, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { useState } from "react";
import type { ActivityPeriod, ActivityResponse } from "@/lib/api/types";
import { ACTIVITY_PERIODS } from "@/lib/api/types";
import { cn } from "@/components/ui/cn";
import { CountUp } from "@/components/ui/count-up";
import { ErrorState } from "@/components/ui/error-state";
import { Segmented } from "@/components/ui/segmented";
import { Skeleton } from "@/components/ui/skeleton";
import { useActivity } from "@/lib/api/hooks";
import { bucketAxisLabel, comparedBuckets } from "@/lib/domain/activity";
import { ACTIVITY_PERIOD_META } from "@/lib/domain/labels";
import { formatChangePct, formatMoney, formatMoneyWhole } from "@/lib/format/money";
import { ChartHeader, CompletedBarChart, SpendAreaChart } from "./charts";

const PERIOD_OPTIONS = ACTIVITY_PERIODS.map((period) => ({
  value: period,
  label: ACTIVITY_PERIOD_META[period].pill,
}));

function Insights({ data }: { data: ActivityResponse }) {
  const { noun } = ACTIVITY_PERIOD_META[data.period];
  const pct = data.comparison.completedChangePct;
  const compared = comparedBuckets(data.period, data.buckets);
  const down = pct !== null && pct < 0;
  const TrendIcon = down ? TrendingDown : TrendingUp;

  return (
    <ul className="mt-3.5 flex flex-wrap gap-x-4 gap-y-1.5 rounded-md bg-surface-slate px-3.5 py-2.5 text-xs text-slate-ink">
      <li className="inline-flex items-center gap-1.5">
        <TrendIcon aria-hidden className={cn("size-3.5", down ? "text-danger" : "text-success")} />
        {pct === null ? (
          <span>
            No completed orders {compared?.previous ?? `in the previous ${noun}`} to compare with
          </span>
        ) : (
          <span>
            <strong
              className={cn(down ? "text-danger" : pct > 0 ? "text-success-ink" : "text-ink")}
            >
              {formatChangePct(pct)}
            </strong>{" "}
            completed orders {compared?.change ?? `vs previous ${noun}`}
          </span>
        )}
      </li>
      <li className="inline-flex items-center gap-1.5">
        <Wallet aria-hidden className="size-3.5 text-brand" />
        <span>
          <strong className="text-brand">{formatMoneyWhole(data.totals.spendCents)}</strong> spent ·
          avg {data.totals.avgOrderCents === null ? "—" : formatMoney(data.totals.avgOrderCents)}
          /order
        </span>
      </li>
      {data.peak && (
        <li className="inline-flex items-center gap-1.5">
          <Star aria-hidden className="size-3.5 fill-warning text-warning" />
          <span>
            Best {noun}: {bucketAxisLabel(data.period, data.peak.start)} (peak spend{" "}
            {formatMoneyWhole(data.peak.spendCents)})
          </span>
        </li>
      )}
    </ul>
  );
}

function ActivityCharts({ data }: { data: ActivityResponse }) {
  const { caption } = ACTIVITY_PERIOD_META[data.period];
  return (
    <>
      <div className="grid gap-x-5 gap-y-6 md:grid-cols-2">
        <div>
          <ChartHeader
            title="Completed orders"
            total={<CountUp value={data.totals.completed} />}
            caption={caption}
            totalClassName="text-success"
          />
          <CompletedBarChart buckets={data.buckets} period={data.period} />
        </div>
        <div>
          <ChartHeader
            title="Spend"
            total={<CountUp value={data.totals.spendCents} format={formatMoneyWhole} />}
            caption={caption}
            totalClassName="text-brand"
          />
          <SpendAreaChart
            buckets={data.buckets}
            period={data.period}
            peakStart={data.peak?.start ?? null}
          />
        </div>
      </div>
      <Insights data={data} />
    </>
  );
}

/** "Your activity": completed orders + spend per day / ISO week / month / quarter. */
export function ActivityPanel() {
  const [period, setPeriod] = useState<ActivityPeriod>("month");
  const activity = useActivity(period);

  return (
    <section
      aria-labelledby="activity-title"
      className="rounded-card border border-line-cool bg-surface p-4 shadow-panel sm:p-5"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 id="activity-title" className="flex items-center gap-2 text-base font-bold text-ink">
          <ChartColumn aria-hidden className="size-4.5 text-accent" />
          Your activity
        </h2>
        <Segmented
          variant="pills"
          label="Activity period"
          layoutId="activity-period"
          options={PERIOD_OPTIONS}
          value={period}
          onChange={setPeriod}
        />
      </div>

      {activity.isPending ? (
        <div aria-hidden className="grid gap-5 md:grid-cols-2">
          <Skeleton className="h-[164px]" />
          <Skeleton className="h-[164px]" />
        </div>
      ) : activity.isError ? (
        <ErrorState
          title="Couldn't load your activity"
          error={activity.error}
          onRetry={() => void activity.refetch()}
          retrying={activity.isFetching}
        />
      ) : (
        <div
          aria-busy={activity.isPlaceholderData}
          className={cn(
            "transition-opacity duration-200",
            activity.isPlaceholderData && "opacity-60",
          )}
        >
          <ActivityCharts data={activity.data} />
        </div>
      )}
    </section>
  );
}
