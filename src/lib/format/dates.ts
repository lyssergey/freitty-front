/**
 * Business dates are shown in the hub timezone (America/Toronto) with day-month order
 * ("12 Apr, 09:00"), regardless of the viewer's own timezone. Parts come from Intl and are
 * assembled by hand so the output doesn't depend on ICU locale quirks (en-GB "Sept").
 */

/**
 * Must match the API's `APP_TIMEZONE` (freitty-api env, default America/Toronto): the API puts
 * "today" / "this week", the activity buckets and the CSV dates in that zone. Change both together.
 */
export const APP_TIMEZONE = "America/Toronto";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const partsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: APP_TIMEZONE,
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const keyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: APP_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export type DateInput = string | number | Date;

function toDate(value: DateInput): Date {
  return value instanceof Date ? value : new Date(value);
}

interface ZonedParts {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
}

function zonedParts(value: DateInput): ZonedParts {
  const parts: ZonedParts = { year: "", month: "", day: "", hour: "", minute: "" };
  for (const part of partsFormatter.formatToParts(toDate(value))) {
    if (part.type in parts) parts[part.type as keyof ZonedParts] = part.value;
  }
  return parts;
}

/** `"12 Apr, 09:00"` — order cards (full). */
export function formatDateTime(value: DateInput): string {
  const p = zonedParts(value);
  return `${p.day} ${p.month}, ${p.hour}:${p.minute}`;
}

/** `"12 Apr"` — compact cards, tables. */
export function formatDayMonth(value: DateInput): string {
  const p = zonedParts(value);
  return `${p.day} ${p.month}`;
}

/** `"17 Apr 2026"` — order detail. */
export function formatFullDate(value: DateInput): string {
  const p = zonedParts(value);
  return `${p.day} ${p.month} ${p.year}`;
}

/** `"17 Apr · 08:55"` — operations table. */
export function formatDayMonthTime(value: DateInput): string {
  const p = zonedParts(value);
  return `${p.day} ${p.month} · ${p.hour}:${p.minute}`;
}

/** Local calendar day in the app timezone, `"2026-04-17"`. */
export function localDateKey(value: DateInput): string {
  return keyFormatter.format(toDate(value));
}

/** Same calendar day as `now` in the app timezone. */
export function isToday(value: DateInput, now: DateInput): boolean {
  return localDateKey(value) === localDateKey(now);
}

export interface Countdown {
  text: string;
  overdue: boolean;
}

/**
 * Time left until `due`: `"45m"`, `"2h 14m"`, `"1d 4h"`; past due: `"overdue 25m"`,
 * `"overdue 3h"`, `"overdue 2d"`. Remaining time rounds up (a countdown never shows 0 early).
 */
export function formatCountdown(due: DateInput, now: DateInput): Countdown {
  const diff = toDate(due).getTime() - toDate(now).getTime();

  if (diff >= 0) {
    const totalMinutes = Math.ceil(diff / MINUTE);
    if (totalMinutes === 0) return { text: "now", overdue: false };
    if (totalMinutes < 60) return { text: `${totalMinutes}m`, overdue: false };
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours < 24) return { text: `${hours}h ${minutes}m`, overdue: false };
    const days = Math.floor(hours / 24);
    const restHours = hours % 24;
    return { text: restHours ? `${days}d ${restHours}h` : `${days}d`, overdue: false };
  }

  const late = -diff;
  if (late < HOUR)
    return { text: `overdue ${Math.max(1, Math.floor(late / MINUTE))}m`, overdue: true };
  if (late < DAY) return { text: `overdue ${Math.floor(late / HOUR)}h`, overdue: true };
  return { text: `overdue ${Math.floor(late / DAY)}d`, overdue: true };
}
