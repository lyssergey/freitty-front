import { describe, expect, it } from "vitest";
import type { CargoSummary } from "@/lib/api/types";
import {
  describeQuantity,
  formatDelta,
  hasQuantityMismatch,
  quantityText,
  totalActual,
  totalDeclared,
  unitLongWithSize,
  unitWithSize,
} from "./quantity";

const std = (declared: number, actual: number | null = null): CargoSummary => ({
  unitType: "standard",
  declared,
  actual,
});
const xl = (declared: number, actual: number | null = null): CargoSummary => ({
  unitType: "xl",
  declared,
  actual,
});

describe("quantityText", () => {
  it("shows a dash when there is no cargo", () => {
    expect(quantityText([], "full")).toBe("—");
    expect(describeQuantity([], "compact")).toEqual({ kind: "none" });
  });

  it("uses the long unit name for a single type on full cards", () => {
    expect(quantityText([std(23)], "full")).toBe("23 × Standard");
    expect(quantityText([xl(10, 10)], "full")).toBe("10 × XL");
  });

  it("uses short units on compact cards", () => {
    expect(quantityText([std(23)], "compact")).toBe("23 × Std");
    expect(quantityText([xl(10)], "compact")).toBe("10 × XL");
  });

  it("joins mixed unit types, standard first", () => {
    expect(quantityText([std(15, 15), xl(12, 12)], "full")).toBe("15 × Std + 12 × XL");
    expect(quantityText([xl(12), std(15)], "compact")).toBe("15 Std + 12 XL");
  });

  it("flags declared vs counted mismatches", () => {
    expect(describeQuantity([std(20, 18)], "full")).toEqual({
      kind: "mismatch",
      declared: "20 decl",
      actual: "18 actual",
    });
    expect(quantityText([std(20, 18)], "compact")).toBe("20 decl · 18 act");
    expect(quantityText([std(10, 12)], "full")).toBe("10 decl · 12 actual");
  });

  it("totals mixed lines on mismatch, counting uncounted lines as declared", () => {
    expect(quantityText([std(15, 15), xl(3, 2)], "full")).toBe("18 decl · 17 actual");
    expect(quantityText([std(15, 14), xl(3)], "compact")).toBe("18 decl · 17 act");
  });

  it("treats a matching count as a plain quantity", () => {
    expect(quantityText([std(10, 10)], "full")).toBe("10 × Standard");
    expect(hasQuantityMismatch([std(10, 10), xl(2)])).toBe(false);
  });
});

describe("totals", () => {
  it("sums declared and actual", () => {
    expect(totalDeclared([std(15), xl(3)])).toBe(18);
    expect(totalActual([std(15), xl(3)])).toBeNull();
    expect(totalActual([std(15, 14), xl(3)])).toBe(17);
  });
});

describe("unit helpers", () => {
  it("describes pallet footprints", () => {
    expect(unitWithSize("standard")).toBe("Std · 48×40");
    expect(unitWithSize("xl", "long")).toBe("XL · 48×48");
    expect(unitWithSize("standard", "long")).toBe("Standard · 48×40");
    expect(unitLongWithSize("standard")).toBe("Standard (48×40)");
  });

  it("signs deltas", () => {
    expect(formatDelta(2)).toBe("+2");
    expect(formatDelta(-1)).toBe("-1");
  });
});
