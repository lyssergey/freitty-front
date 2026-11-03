import { describe, expect, it } from "vitest";
import {
  axisTickIndexes,
  bucketAxisLabel,
  bucketTooltipLabel,
  comparedBuckets,
  isoWeek,
} from "./activity";

describe("isoWeek", () => {
  it("numbers ISO weeks (Monday start, week with the first Thursday)", () => {
    expect(isoWeek("2026-10-26")).toBe(44);
    expect(isoWeek("2026-11-01")).toBe(44); // Sunday — same week
    expect(isoWeek("2026-11-02")).toBe(45);
  });

  it("handles year boundaries", () => {
    expect(isoWeek("2025-12-29")).toBe(1); // belongs to 2026-W01
    expect(isoWeek("2026-12-28")).toBe(53); // 2026 has 53 weeks
    expect(isoWeek("2027-01-01")).toBe(53);
    expect(isoWeek("2027-01-04")).toBe(1);
  });
});

describe("bucket labels", () => {
  it("labels the axis per period", () => {
    expect(bucketAxisLabel("day", "2026-10-28")).toBe("28 Oct");
    expect(bucketAxisLabel("week", "2026-10-26")).toBe("CW44");
    expect(bucketAxisLabel("month", "2026-10-01")).toBe("Oct");
    expect(bucketAxisLabel("quarter", "2026-07-01")).toBe("Q3 '26");
    expect(bucketAxisLabel("quarter", "2025-10-01")).toBe("Q4 '25");
  });

  it("gives tooltips more context", () => {
    expect(bucketTooltipLabel("day", "2026-10-28")).toBe("Wed, 28 Oct");
    expect(bucketTooltipLabel("week", "2026-10-26")).toBe("CW44 · 26 Oct – 1 Nov");
    expect(bucketTooltipLabel("month", "2026-10-01")).toBe("October 2026");
    expect(bucketTooltipLabel("quarter", "2026-07-01")).toBe("Q3 2026");
  });

  it("rejects malformed dates", () => {
    expect(() => bucketAxisLabel("day", "28/10/2026")).toThrow();
  });
});

describe("comparedBuckets", () => {
  const buckets = (...starts: string[]) => starts.map((start) => ({ start }));

  it("names the last complete bucket and the one before it, per period", () => {
    expect(
      comparedBuckets("month", buckets("2026-08-01", "2026-09-01", "2026-10-01", "2026-11-01")),
    ).toEqual({
      change: "in Oct vs Sep",
      previous: "in Sep",
    });
    expect(comparedBuckets("day", buckets("2026-11-01", "2026-11-02", "2026-11-03"))).toEqual({
      change: "on 2 Nov vs 1 Nov",
      previous: "on 1 Nov",
    });
    expect(comparedBuckets("week", buckets("2026-10-19", "2026-10-26", "2026-11-02"))?.change).toBe(
      "in CW44 vs CW43",
    );
    expect(
      comparedBuckets("quarter", buckets("2026-04-01", "2026-07-01", "2026-10-01"))?.change,
    ).toBe("in Q3 '26 vs Q2 '26");
  });

  it("returns null without two complete buckets", () => {
    expect(comparedBuckets("month", buckets("2026-10-01", "2026-11-01"))).toBeNull();
  });
});

describe("axisTickIndexes", () => {
  it("labels about four buckets, starting with the first", () => {
    expect(axisTickIndexes(12)).toEqual([0, 3, 6, 9]);
    expect(axisTickIndexes(14)).toEqual([0, 4, 8, 12]);
    expect(axisTickIndexes(6)).toEqual([0, 2, 4]);
    expect(axisTickIndexes(3)).toEqual([0, 1, 2]);
    expect(axisTickIndexes(0)).toEqual([]);
  });
});
