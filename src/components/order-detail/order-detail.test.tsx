import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { OrderDetail } from "@/lib/api/types";
import { FR001383 } from "@/test/fixtures";
import { renderWithProviders } from "@/test/render";
import { ActionBar } from "./action-bar";
import { DockCard } from "./dock-card";
import { OperationsTable } from "./operations-table";
import { OrderSummaryRow } from "./order-summary-row";
import { SuppliesTable } from "./supplies-table";

vi.mock("next/navigation", () => ({ useRouter: () => ({ back: vi.fn(), push: vi.fn() }) }));

/** Only FR001383 is a full detail fixture; the lifecycle variants are built from it. */
const ACTIVE = FR001383;

const DRAFT: OrderDetail = {
  ...FR001383,
  number: "DRAFT-003",
  status: "draft",
  services: [],
  refNumber: null,
  cargo: [],
  carrier: null,
  nextAction: null,
  cargoStatus: "expected",
  currentOperation: null,
  truckNumber: null,
  trailerNumber: null,
  trailerType: null,
  dock: null,
  assignee: null,
  warehouseNote: null,
  photosCount: 0,
  deltas: [],
  operations: [],
  supplies: [],
  totals: { operationsCents: 0, suppliesCents: 0, totalCents: 0 },
};

const IN_TRANSIT: OrderDetail = {
  ...FR001383,
  status: "in_transit",
  cargoStatus: "dispatched",
  currentOperation: null,
};

const CLOSED: OrderDetail = {
  ...FR001383,
  status: "closed",
  cargoStatus: "dispatched",
  currentOperation: null,
  nextAction: null,
  closedAt: "2026-04-17T12:00:00.000Z",
};

const button = (name: string | RegExp) => screen.queryByRole("button", { name });

describe("order summary row", () => {
  it("shows the cargo status only when there is submitted cargo", () => {
    const { unmount } = renderWithProviders(<OrderSummaryRow order={ACTIVE} />);
    expect(screen.getByText("On Stock")).toBeInTheDocument();
    unmount();

    renderWithProviders(<OrderSummaryRow order={DRAFT} />);
    expect(screen.queryByText("Expected")).not.toBeInTheDocument();
  });

  it("hides it for an active order without cargo", () => {
    renderWithProviders(<OrderSummaryRow order={{ ...ACTIVE, cargo: [] }} />);
    expect(screen.queryByText("On Stock")).not.toBeInTheDocument();
  });
});

describe("action bar", () => {
  it.each([
    ["draft", DRAFT, { bol: false, edit: "Continue editing" }],
    ["active", ACTIVE, { bol: true, edit: "Edit" }],
    ["closed", CLOSED, { bol: true, edit: null }],
  ] as const)("offers what a %s order allows", (_, order, expected) => {
    renderWithProviders(<ActionBar order={order} />);
    expect(button("BOL PDF") !== null).toBe(expected.bol);
    expect(button(/^(Edit|Continue editing)$/)?.textContent ?? null).toBe(expected.edit);
  });
});

describe("operations", () => {
  it("can be added and changed only while the order is active", () => {
    const { unmount } = renderWithProviders(<OperationsTable order={ACTIVE} />);
    expect(button("Operation")).toBeInTheDocument();
    expect(button("Delete unloading")).toBeInTheDocument();
    unmount();

    renderWithProviders(<OperationsTable order={DRAFT} />);
    expect(button("Operation")).not.toBeInTheDocument();
  });

  it("are read-only on a closed order, comments and photos still open", () => {
    renderWithProviders(<OperationsTable order={CLOSED} />);
    expect(button("Operation")).not.toBeInTheDocument();
    expect(button("Delete unloading")).not.toBeInTheDocument();
    expect(button("Duplicate unloading")).not.toBeInTheDocument();
    expect(button("4 photos of unloading")).toBeInTheDocument();
  });
});

describe("supplies", () => {
  it("can be picked from the draft on", () => {
    renderWithProviders(<SuppliesTable order={DRAFT} />);
    expect(button("Supply")).toBeInTheDocument();
  });

  it("are final on a closed order", () => {
    renderWithProviders(<SuppliesTable order={CLOSED} />);
    expect(button("Supply")).not.toBeInTheDocument();
    expect(button("Edit Straps 12")).not.toBeInTheDocument();
    expect(button("Remove Straps 12")).not.toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: "Action" })).not.toBeInTheDocument();
  });
});

describe("dock card", () => {
  it.each([
    ["a draft", DRAFT, "A dock is assigned after the order is submitted."],
    [
      "a ready order",
      { ...ACTIVE, status: "ready", dock: null },
      "No dock assigned yet — the hub assigns one when your truck is scheduled.",
    ],
    ["an order in transit", { ...IN_TRANSIT, dock: null }, "Cargo dispatched — no dock in use."],
    [
      "deconsolidated cargo",
      { ...ACTIVE, status: "deconsolidated", dock: null },
      "Cargo dispatched — no dock in use.",
    ],
    ["a closed order", { ...CLOSED, dock: null }, "No dock was assigned to this order."],
  ] as const)("explains a missing dock on %s", (_, order, text) => {
    renderWithProviders(<DockCard order={order} />);
    expect(screen.getByText(text)).toBeInTheDocument();
  });

  it("stops showing the trailer as docked once the cargo is dispatched", () => {
    const { unmount } = renderWithProviders(<DockCard order={ACTIVE} />);
    expect(screen.getByText("Trailer docked · loading")).toBeInTheDocument();
    unmount();

    renderWithProviders(<DockCard order={IN_TRANSIT} />);
    expect(screen.queryByText(/Trailer docked/)).not.toBeInTheDocument();
    expect(screen.getByText("Released · cargo dispatched")).toBeInTheDocument();
  });
});
