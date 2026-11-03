import { describe, expect, it } from "vitest";
import {
  formatCountdown,
  formatDateTime,
  formatDayMonth,
  formatDayMonthTime,
  formatFullDate,
  isToday,
  localDateKey,
} from "./dates";

const MIN = 60_000;
const NOW = Date.parse("2026-04-17T13:00:00Z"); // 17 Apr 2026, 09:00 in Toronto (EDT)

describe("date formatting (America/Toronto, day-month order)", () => {
  it("formats card dates", () => {
    expect(formatDateTime("2026-04-12T13:00:00Z")).toBe("12 Apr, 09:00");
    expect(formatDayMonth("2026-04-12T13:00:00Z")).toBe("12 Apr");
  });

  it("formats detail and operation dates", () => {
    expect(formatFullDate("2026-04-17T13:00:00Z")).toBe("17 Apr 2026");
    expect(formatDayMonthTime("2026-04-17T12:55:00Z")).toBe("17 Apr · 08:55");
  });

  it("uses the hub timezone, not UTC (incl. winter time)", () => {
    // 03:30 UTC on the 18th is still the evening of the 17th in Toronto.
    expect(formatDateTime("2026-04-18T03:30:00Z")).toBe("17 Apr, 23:30");
    // EST (UTC−5) in January.
    expect(formatDateTime("2026-01-15T14:00:00Z")).toBe("15 Jan, 09:00");
  });

  it("uses a 24-hour clock with 00 at midnight", () => {
    expect(formatDateTime("2026-04-17T04:00:00Z")).toBe("17 Apr, 00:00");
    expect(formatDateTime("2026-04-17T21:30:00Z")).toBe("17 Apr, 17:30");
  });

  it("shows short English month names", () => {
    expect(formatDayMonth("2026-09-03T16:00:00Z")).toBe("3 Sep");
  });

  it("builds local calendar keys", () => {
    expect(localDateKey("2026-04-18T03:30:00Z")).toBe("2026-04-17");
    expect(localDateKey("2026-04-18T04:30:00Z")).toBe("2026-04-18");
  });
});

describe("isToday", () => {
  it("compares calendar days in Toronto", () => {
    expect(isToday("2026-04-17T10:30:00Z", NOW)).toBe(true);
    expect(isToday("2026-04-18T03:59:00Z", NOW)).toBe(true); // 23:59 local
    expect(isToday("2026-04-18T04:00:00Z", NOW)).toBe(false); // 00:00 next day
    expect(isToday("2026-04-16T13:00:00Z", NOW)).toBe(false);
  });
});

describe("formatCountdown", () => {
  const at = (minutes: number) => NOW + minutes * MIN;

  it("shows hours and minutes left", () => {
    expect(formatCountdown(at(134), NOW)).toEqual({ text: "2h 14m", overdue: false });
    expect(formatCountdown(at(90), NOW)).toEqual({ text: "1h 30m", overdue: false });
    expect(formatCountdown(at(60), NOW)).toEqual({ text: "1h 0m", overdue: false });
  });

  it("shows minutes under an hour and rounds the remainder up", () => {
    expect(formatCountdown(at(45), NOW).text).toBe("45m");
    expect(formatCountdown(NOW + 30_000, NOW).text).toBe("1m");
    expect(formatCountdown(at(133.9), NOW).text).toBe("2h 14m");
    expect(formatCountdown(NOW, NOW).text).toBe("now");
  });

  it("switches to days beyond 24 hours", () => {
    expect(formatCountdown(at(26 * 60), NOW).text).toBe("1d 2h");
    expect(formatCountdown(at(48 * 60), NOW).text).toBe("2d");
  });

  it("reports overdue actions", () => {
    expect(formatCountdown(at(-180), NOW)).toEqual({ text: "overdue 3h", overdue: true });
    expect(formatCountdown(at(-200), NOW).text).toBe("overdue 3h");
    expect(formatCountdown(at(-10), NOW).text).toBe("overdue 10m");
    expect(formatCountdown(NOW - 5_000, NOW).text).toBe("overdue 1m");
    expect(formatCountdown(at(-50 * 60), NOW).text).toBe("overdue 2d");
  });

  it("accepts ISO strings", () => {
    expect(formatCountdown("2026-04-17T15:14:00Z", "2026-04-17T13:00:00Z").text).toBe("2h 14m");
  });
});
