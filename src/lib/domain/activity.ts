/**
 * Labels for the "Your activity" charts. Buckets arrive as local calendar dates (`YYYY-MM-DD`,
 * already in the hub timezone), so they're treated as plain calendar days — no timezone math.
 *
 *   axis     day "28 Oct" · week "CW44" · month "Oct" · quarter "Q3 '26"
 *   tooltip  day "Wed, 28 Oct" · week "CW44 · 26 Oct – 1 Nov" · month "October 2026" · quarter "Q3 2026"
 */
import type { ActivityBucket, ActivityPeriod } from "@/lib/api/types";

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const MONTHS_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

const DAY_MS = 86_400_000;

/** `"2026-10-28"` → a Date at UTC midnight of that calendar day. */
export function parseLocalDate(key: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(key);
  if (!match) throw new Error(`Invalid local date: ${key}`);
  const [, y, m, d] = match;
  return new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
}

/** ISO-8601 week number (weeks start Monday; week 1 contains the year's first Thursday). */
export function isoWeek(key: string): number {
  const date = parseLocalDate(key);
  const weekday = (date.getUTCDay() + 6) % 7; // Mon = 0 … Sun = 6
  const thursday = new Date(date.getTime() + (3 - weekday) * DAY_MS);
  const firstThursdayYear = thursday.getUTCFullYear();
  const jan4 = new Date(Date.UTC(firstThursdayYear, 0, 4));
  const jan4Weekday = (jan4.getUTCDay() + 6) % 7;
  const week1Monday = jan4.getTime() - jan4Weekday * DAY_MS;
  return 1 + Math.floor((thursday.getTime() - week1Monday) / (7 * DAY_MS));
}

function dayMonth(date: Date): string {
  return `${date.getUTCDate()} ${MONTHS_SHORT[date.getUTCMonth()]}`;
}

function quarterOf(date: Date): number {
  return Math.floor(date.getUTCMonth() / 3) + 1;
}

/** Sparse axis label under a bar / point. */
export function bucketAxisLabel(period: ActivityPeriod, start: string): string {
  const date = parseLocalDate(start);
  switch (period) {
    case "day":
      return dayMonth(date);
    case "week":
      return `CW${isoWeek(start)}`;
    case "month":
      return MONTHS_SHORT[date.getUTCMonth()] ?? "";
    case "quarter":
      return `Q${quarterOf(date)} '${String(date.getUTCFullYear()).slice(-2)}`;
  }
}

/** Longer label for tooltips. */
export function bucketTooltipLabel(period: ActivityPeriod, start: string): string {
  const date = parseLocalDate(start);
  switch (period) {
    case "day":
      return `${WEEKDAYS[date.getUTCDay()]}, ${dayMonth(date)}`;
    case "week": {
      const end = new Date(date.getTime() + 6 * DAY_MS);
      return `CW${isoWeek(start)} · ${dayMonth(date)} – ${dayMonth(end)}`;
    }
    case "month":
      return `${MONTHS_LONG[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
    case "quarter":
      return `Q${quarterOf(date)} ${date.getUTCFullYear()}`;
  }
}

/**
 * Names the buckets the activity comparison is about: the last complete one vs the one before it
 * (the newest bucket is still running) — day "on 2 Nov vs 1 Nov", week "in CW44 vs CW43", month
 * "in Oct vs Sep", quarter "in Q3 '26 vs Q2 '26". Null with fewer than three buckets.
 */
export function comparedBuckets(
  period: ActivityPeriod,
  buckets: readonly Pick<ActivityBucket, "start">[],
): { change: string; previous: string } | null {
  const current = buckets.at(-2);
  const previous = buckets.at(-3);
  if (!current || !previous) return null;
  const preposition = period === "day" ? "on" : "in";
  const previousLabel = bucketAxisLabel(period, previous.start);
  return {
    change: `${preposition} ${bucketAxisLabel(period, current.start)} vs ${previousLabel}`,
    previous: `${preposition} ${previousLabel}`,
  };
}

/** Which bucket indexes get an axis label — about four, always including the first. */
export function axisTickIndexes(count: number, maxTicks = 4): number[] {
  if (count <= 0) return [];
  const step = Math.max(1, Math.ceil(count / maxTicks));
  const ticks: number[] = [];
  for (let i = 0; i < count; i += step) ticks.push(i);
  return ticks;
}
