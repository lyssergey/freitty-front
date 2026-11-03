import { describe, expect, it } from "vitest";
import { formatChangePct, formatMoney, formatMoneyWhole } from "./money";

describe("formatMoney", () => {
  it("formats cents as en-US dollars", () => {
    expect(formatMoney(50800)).toBe("$508.00");
    expect(formatMoney(123450)).toBe("$1,234.50");
    expect(formatMoney(125000)).toBe("$1,250.00");
    expect(formatMoney(0)).toBe("$0.00");
    expect(formatMoney(5)).toBe("$0.05");
  });

  it("keeps the sign for negative amounts", () => {
    expect(formatMoney(-2500)).toBe("-$25.00");
  });
});

describe("formatMoneyWhole", () => {
  it("rounds to whole dollars", () => {
    expect(formatMoneyWhole(123450)).toBe("$1,235");
    expect(formatMoneyWhole(1824000)).toBe("$18,240");
    expect(formatMoneyWhole(0)).toBe("$0");
  });
});

describe("formatChangePct", () => {
  it("signs positive changes", () => {
    expect(formatChangePct(18)).toBe("+18%");
    expect(formatChangePct(-5)).toBe("-5%");
    expect(formatChangePct(0)).toBe("0%");
  });
});
