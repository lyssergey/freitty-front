import { describe, expect, it } from "vitest";
import {
  DEFAULT_ORDER_FILTERS,
  applyFilterChange,
  hasActiveFilters,
  ordersHref,
  parseOrderFilters,
  serializeOrderFilters,
  toBoardParams,
  toExportParams,
  toListParams,
  type OrderFilters,
} from "./order-filters";

const parse = (qs: string) => parseOrderFilters(new URLSearchParams(qs));

describe("parseOrderFilters", () => {
  it("returns defaults for an empty query", () => {
    expect(parse("")).toEqual(DEFAULT_ORDER_FILTERS);
  });

  it("reads every supported param", () => {
    expect(
      parse("segment=alerts&hub=MAR&period=week&status=in_progress&q=REF-1&page=3&view=table"),
    ).toEqual({
      segment: "alerts",
      hub: "MAR",
      period: "week",
      status: "in_progress",
      q: "REF-1",
      page: 3,
      view: "table",
    });
  });

  it("falls back to defaults for unknown or malformed values", () => {
    expect(
      parse("segment=bogus&hub=%3Cscript%3E&period=year&status=lost&page=-2&view=grid"),
    ).toEqual(DEFAULT_ORDER_FILTERS);
    expect(parse("page=abc").page).toBe(1);
    expect(parse("page=2.5").page).toBe(1);
    // The API only accepts 2–8 character hub codes (anything else would be a 400).
    expect(parse("hub=X").hub).toBeNull();
    expect(parse("hub=TOOLONGHUB").hub).toBeNull();
  });

  it("normalizes the hub code and the search text", () => {
    expect(parse("hub=mar").hub).toBe("MAR");
    expect(parse("q=%20%20FR001%20%20676%20").q).toBe("FR001 676");
    expect(parse(`q=${"x".repeat(100)}`).q).toHaveLength(64);
  });
});

describe("serializeOrderFilters", () => {
  it("omits defaults", () => {
    expect(serializeOrderFilters(DEFAULT_ORDER_FILTERS).toString()).toBe("");
  });

  it("writes non-default values in a stable order", () => {
    const filters: OrderFilters = {
      segment: "consolidation",
      hub: "TOR",
      period: "all",
      status: "closed",
      q: "Calgary",
      page: 2,
      view: "board",
    };
    expect(serializeOrderFilters(filters).toString()).toBe(
      "segment=consolidation&hub=TOR&period=all&status=closed&q=Calgary&page=2&view=board",
    );
  });

  it("round-trips through parse", () => {
    const qs = "segment=drafts&period=today&q=DRAFT&page=4";
    expect(serializeOrderFilters(parse(qs)).toString()).toBe(qs);
  });

  it("builds list links from partial filters", () => {
    expect(ordersHref()).toBe("/orders");
    expect(ordersHref({ segment: "attention" })).toBe("/orders?segment=attention");
    expect(ordersHref({ q: " FR001674 " })).toBe("/orders?q=FR001674");
  });

  it("keeps a non-default period in links (Need attention, searches from other pages)", () => {
    expect(ordersHref({ segment: "attention", period: "all" })).toBe(
      "/orders?segment=attention&period=all",
    );
    expect(ordersHref({ q: "FR001500", period: "all" })).toBe("/orders?period=all&q=FR001500");
  });
});

describe("applyFilterChange", () => {
  const onPage3: OrderFilters = { ...DEFAULT_ORDER_FILTERS, page: 3 };

  it("resets the page when a filter changes", () => {
    expect(applyFilterChange(onPage3, { segment: "alerts" }).page).toBe(1);
    expect(applyFilterChange(onPage3, { hub: "MAR" }).page).toBe(1);
    expect(applyFilterChange(onPage3, { period: "all" }).page).toBe(1);
    expect(applyFilterChange(onPage3, { status: "ready" }).page).toBe(1);
    expect(applyFilterChange(onPage3, { q: "REF" }).page).toBe(1);
  });

  it("keeps the page when switching views or re-selecting the same value", () => {
    expect(applyFilterChange(onPage3, { view: "table" }).page).toBe(3);
    expect(applyFilterChange(onPage3, { segment: "all" }).page).toBe(3);
  });

  it("applies an explicit page", () => {
    expect(applyFilterChange(onPage3, { page: 4 }).page).toBe(4);
  });
});

describe("API params", () => {
  const filters: OrderFilters = {
    segment: "alerts",
    hub: "MAR",
    period: "30d",
    status: "in_progress",
    q: "REF",
    page: 2,
    view: "cards",
  };

  it("never sends UI-only or default params", () => {
    expect(toListParams(filters)).toEqual({
      segment: "alerts",
      hub: "MAR",
      status: "in_progress",
      q: "REF",
      page: 2,
    });
    expect(toListParams(DEFAULT_ORDER_FILTERS)).toEqual({});
  });

  it("drops status on the board (columns are statuses)", () => {
    const board = { ...filters, view: "board" } as const;
    expect(toBoardParams(board)).toEqual({ segment: "alerts", hub: "MAR", q: "REF" });
    expect(toListParams(board)).toEqual({ segment: "alerts", hub: "MAR", q: "REF", page: 2 });
    expect(toExportParams(board)).not.toHaveProperty("status");
  });

  it("asks for the same first page on the board as in the cards (cache hit on switching)", () => {
    const noStatus: OrderFilters = { ...filters, status: null, page: 1 };
    expect(toListParams({ ...noStatus, view: "board" })).toEqual(
      toListParams({ ...noStatus, view: "cards" }),
    );
  });

  it("exports exactly the visible filters", () => {
    expect(toExportParams(filters)).toEqual({
      segment: "alerts",
      hub: "MAR",
      status: "in_progress",
      q: "REF",
    });
  });

  it("detects active filters", () => {
    expect(hasActiveFilters(DEFAULT_ORDER_FILTERS)).toBe(false);
    expect(hasActiveFilters({ ...DEFAULT_ORDER_FILTERS, view: "table", page: 2 })).toBe(false);
    expect(hasActiveFilters(filters)).toBe(true);
  });
});
