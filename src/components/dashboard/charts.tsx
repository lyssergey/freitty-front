"use client";

import { motion } from "motion/react";
import { useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import type { ActivityBucket, ActivityPeriod } from "@/lib/api/types";
import { cn } from "@/components/ui/cn";
import { axisTickIndexes, bucketAxisLabel, bucketTooltipLabel } from "@/lib/domain/activity";
import { formatMoney } from "@/lib/format/money";
import { useElementWidth } from "@/lib/hooks/use-element-width";

const HEIGHT = 128;
const TOP = 10;
const AXIS = 18;
const PLOT_H = HEIGHT - TOP - AXIS;
const BASELINE = TOP + PLOT_H;
const GRID_LEVELS = [0.25, 0.5, 0.75];

interface Geometry {
  width: number;
  slot: number;
  /** Centre x of bucket `i`. */
  cx: (index: number) => number;
  active: number | null;
}

interface ChartFrameProps {
  /** Accessible summary of the chart. */
  label: string;
  buckets: readonly ActivityBucket[];
  period: ActivityPeriod;
  /** Tooltip value line for a bucket. */
  formatValue: (bucket: ActivityBucket) => string;
  /** Top y of the mark for a bucket — the tooltip sits above it. */
  anchorY: (index: number) => number;
  /** sr-only table column header for the value. */
  valueHeader: string;
  children: (geometry: Geometry) => ReactNode;
}

/**
 * Shared chart chrome: measures its width (crisp SVG at any size), draws grid lines and sparse
 * axis labels, and handles hover + keyboard exploration (←/→) with a tooltip. Screen readers
 * get a hidden data table instead of the SVG.
 */
function ChartFrame({
  label,
  buckets,
  period,
  formatValue,
  anchorY,
  valueHeader,
  children,
}: ChartFrameProps) {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const count = buckets.length;
  const slot = count > 0 ? width / count : 0;
  const cx = (index: number) => index * slot + slot / 2;

  function indexAt(event: PointerEvent<HTMLDivElement>): number | null {
    if (!slot) return null;
    const x = event.clientX - event.currentTarget.getBoundingClientRect().left;
    return Math.min(count - 1, Math.max(0, Math.floor(x / slot)));
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const step = event.key === "ArrowRight" ? 1 : -1;
    setActive((current) =>
      Math.min(count - 1, Math.max(0, (current ?? (step > 0 ? -1 : count)) + step)),
    );
  }

  const activeBucket = active !== null ? buckets[active] : undefined;
  const tooltipLeft =
    active !== null ? Math.min(Math.max(cx(active), 64), Math.max(64, width - 64)) : 0;

  return (
    <>
      <div
        ref={ref}
        role="img"
        aria-label={label}
        tabIndex={0}
        onPointerMove={(event) => setActive(indexAt(event))}
        onPointerLeave={() => setActive(null)}
        onKeyDown={onKeyDown}
        onBlur={() => setActive(null)}
        className="relative touch-pan-y rounded-md focus-visible:outline-offset-4"
        style={{ height: HEIGHT }}
      >
        {width > 0 && (
          <svg width={width} height={HEIGHT} aria-hidden className="block overflow-visible">
            {GRID_LEVELS.map((level) => (
              <line
                key={level}
                x1={0}
                x2={width}
                y1={TOP + PLOT_H * level}
                y2={TOP + PLOT_H * level}
                stroke="var(--color-chart-grid)"
              />
            ))}
            {active !== null && (
              <line
                x1={cx(active)}
                x2={cx(active)}
                y1={TOP - 4}
                y2={BASELINE}
                stroke="var(--color-line-cool)"
                strokeDasharray="3 3"
              />
            )}
            {children({ width, slot, cx, active })}
            {axisTickIndexes(count).map((index) => {
              const bucket = buckets[index];
              if (!bucket) return null;
              return (
                <text
                  key={bucket.start}
                  x={cx(index)}
                  y={HEIGHT - 5}
                  fontSize={9}
                  textAnchor="middle"
                  fill="var(--color-chart-axis)"
                >
                  {bucketAxisLabel(period, bucket.start)}
                </text>
              );
            })}
          </svg>
        )}

        {activeBucket && active !== null && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-md bg-ink px-2.5 py-1.5 text-center whitespace-nowrap shadow-toast"
            style={{ left: tooltipLeft, top: anchorY(active) - 8 }}
          >
            <p className="text-3xs text-slate-faint">
              {bucketTooltipLabel(period, activeBucket.start)}
              {active === count - 1 && " · so far"}
            </p>
            <p className="text-xs font-bold text-white">{formatValue(activeBucket)}</p>
          </div>
        )}
      </div>

      {/* `sr-only` goes on a wrapper: a table box ignores the 1px size/overflow clip, so on the
          table itself it would still stretch the page's scroll height. */}
      <div className="sr-only">
        <table>
          <caption>{label}</caption>
          <thead>
            <tr>
              <th scope="col">Period</th>
              <th scope="col">{valueHeader}</th>
            </tr>
          </thead>
          <tbody>
            {buckets.map((bucket) => (
              <tr key={bucket.start}>
                <th scope="row">{bucketTooltipLabel(period, bucket.start)}</th>
                <td>{formatValue(bucket)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

interface ChartProps {
  buckets: readonly ActivityBucket[];
  period: ActivityPeriod;
}

/** Completed orders per bucket — green bars that grow in, older buckets lighter. */
export function CompletedBarChart({ buckets, period }: ChartProps) {
  const max = Math.max(1, ...buckets.map((b) => b.completed));
  const barHeight = (index: number) => ((buckets[index]?.completed ?? 0) / max) * PLOT_H;
  const lastIndex = buckets.length - 1;

  return (
    <ChartFrame
      label={`Completed orders per ${period}, ${buckets.length} periods`}
      buckets={buckets}
      period={period}
      valueHeader="Completed orders"
      formatValue={(b) => `${b.completed} completed`}
      anchorY={(index) => BASELINE - barHeight(index)}
    >
      {({ slot, cx, active }) => {
        const barWidth = Math.max(4, Math.min(28, slot * 0.62));
        return buckets.map((bucket, index) => {
          const height = barHeight(index);
          const ramp = 0.3 + 0.7 * (lastIndex > 0 ? index / lastIndex : 1);
          return (
            <motion.rect
              key={bucket.start}
              x={cx(index) - barWidth / 2}
              width={barWidth}
              rx={3}
              fill="var(--color-chart-completed)"
              initial={{ height: 0, y: BASELINE }}
              animate={{ height, y: BASELINE - height }}
              transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.03 }}
              opacity={active === null || active === index ? ramp : ramp * 0.45}
            />
          );
        });
      }}
    </ChartFrame>
  );
}

/**
 * Spend per bucket — red area + line that draws in, with the peak bucket highlighted. The last
 * bucket is the period in progress, so the segment into it is dashed rather than read as a drop.
 */
export function SpendAreaChart({
  buckets,
  period,
  peakStart,
}: ChartProps & { peakStart: string | null }) {
  const max = Math.max(1, ...buckets.map((b) => b.spendCents));
  const y = (index: number) => BASELINE - ((buckets[index]?.spendCents ?? 0) / max) * PLOT_H * 0.92;
  const drawKey = `${period}-${buckets[0]?.start ?? ""}-${buckets.length}`;

  return (
    <ChartFrame
      label={`Spend per ${period}, ${buckets.length} periods (the last one is still in progress)`}
      buckets={buckets}
      period={period}
      valueHeader="Spend"
      formatValue={(b) => formatMoney(b.spendCents)}
      anchorY={(index) => y(index) - 4}
    >
      {({ cx, active }) => {
        if (buckets.length === 0) return null;
        const points = buckets.map((_, index) => `${cx(index).toFixed(1)},${y(index).toFixed(1)}`);
        const path = (from: number, to?: number) => `M ${points.slice(from, to).join(" L ")}`;
        const last = points.length - 1;
        const area = `${path(0)} L ${cx(last).toFixed(1)},${BASELINE} L ${cx(0).toFixed(1)},${BASELINE} Z`;
        const stroke = {
          fill: "none",
          stroke: "var(--color-chart-spend)",
          strokeWidth: 2,
          strokeLinecap: "round",
          strokeLinejoin: "round",
        } as const;
        return (
          <g key={drawKey}>
            <motion.path
              d={area}
              fill="var(--color-chart-spend)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.12 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            />
            {last > 1 && (
              <motion.path
                d={path(0, last)}
                {...stroke}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
            )}
            {last > 0 && (
              <motion.path
                d={path(last - 1)}
                {...stroke}
                strokeDasharray="4 4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25, delay: 0.8 }}
              />
            )}
            {buckets.map((bucket, index) => {
              const isPeak = bucket.start === peakStart;
              const isActive = active === index;
              return (
                <motion.circle
                  key={bucket.start}
                  cx={cx(index)}
                  cy={y(index)}
                  fill="var(--color-chart-spend)"
                  stroke="var(--color-surface)"
                  strokeWidth={isPeak || isActive ? 2 : 0}
                  initial={{ r: 0 }}
                  animate={{ r: isActive ? 5 : isPeak ? 4.5 : 3 }}
                  transition={{ duration: 0.25, delay: isActive ? 0 : 0.4 + index * 0.03 }}
                />
              );
            })}
          </g>
        );
      }}
    </ChartFrame>
  );
}

/** Header of one chart: "COMPLETED ORDERS ··· 24 last 12 months". */
export function ChartHeader({
  title,
  total,
  caption,
  totalClassName,
}: {
  title: string;
  total: ReactNode;
  caption: string;
  totalClassName: string;
}) {
  return (
    <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3">
      <h3 className="text-xs font-semibold tracking-[0.04em] text-slate uppercase">{title}</h3>
      <p className={cn("text-xl font-extrabold", totalClassName)}>
        {total} <span className="text-2xs font-semibold text-slate">{caption}</span>
      </p>
    </div>
  );
}
