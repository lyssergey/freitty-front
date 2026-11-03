import { describe, expect, it } from "vitest";
import {
  DRAFT_003,
  FR001668,
  FR001672,
  FR001674,
  FR001676,
  FR001681,
  MARKHAM,
  USER_6,
} from "@/test/fixtures";
import {
  destinationText,
  hubRoute,
  hubWithProvince,
  invoiceLabel,
  orderHref,
  orderSubtitle,
  palletsLabel,
  refCountLabel,
  userWithRole,
} from "./order-display";

describe("orderSubtitle", () => {
  it("names the first service of cross-dock orders", () => {
    expect(orderSubtitle(FR001681, "full")).toBe("Cross-Dock · Storage");
    expect(orderSubtitle(FR001672, "compact")).toBe("Cross-Dock · Pickup");
    expect(orderSubtitle({ ...FR001681, services: [] }, "full")).toBe("Cross-Dock");
  });

  it("counts consolidation sub-orders", () => {
    expect(orderSubtitle(FR001676, "full")).toBe("Consolidation · 3 sub-orders");
    expect(orderSubtitle(FR001676, "compact")).toBe("Consolidation · 3 sub");
    expect(orderSubtitle({ ...FR001674, subOrders: FR001674.subOrders.slice(0, 1) }, "full")).toBe(
      "Consolidation · 1 sub-order",
    );
  });

  it("marks drafts as incomplete", () => {
    expect(orderSubtitle(DRAFT_003, "full")).toBe("Consolidation · incomplete");
  });
});

describe("order display helpers", () => {
  it("shows the hub route", () => {
    expect(hubRoute(FR001676)).toBe("Markham");
    expect(hubRoute(FR001668)).toBe("Markham → Toronto");
    expect(hubWithProvince(MARKHAM)).toBe("Markham (ON)");
  });

  it("joins destination and note", () => {
    expect(destinationText(FR001681)).toBe("Detroit, MI · via External PDF");
    expect(destinationText(FR001676)).toBe("Toronto, ON");
    expect(destinationText(DRAFT_003)).toBe("—");
  });

  it("pluralizes counts", () => {
    expect(refCountLabel(3, "full")).toBe("3 refs");
    expect(refCountLabel(1, "full")).toBe("1 ref");
    expect(refCountLabel(4, "compact")).toBe("4");
    expect(palletsLabel(9)).toBe("9 pallets");
    expect(palletsLabel(1)).toBe("1 pallet");
  });

  it("formats people, invoices and links", () => {
    expect(userWithRole(USER_6)).toBe("User 6 (floor lead)");
    expect(invoiceLabel("001812")).toBe("#001812");
    expect(orderHref("FR001383")).toBe("/orders/FR001383");
  });
});
