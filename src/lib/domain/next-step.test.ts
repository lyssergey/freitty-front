import { describe, expect, it } from "vitest";
import { DRAFT_003, FR001668, FR001672, FR001674, FR001676, FR001681 } from "@/test/fixtures";
import { resolveNextStep } from "./next-step";

describe("resolveNextStep", () => {
  it("asks to continue editing drafts", () => {
    expect(resolveNextStep(DRAFT_003)).toEqual({ kind: "draft" });
  });

  it("puts open alerts first, labelled by the pending action", () => {
    expect(resolveNextStep(FR001674)).toEqual({ kind: "alert", label: "Upload photo" });
  });

  it("falls back to the alert itself when no action is pending", () => {
    expect(resolveNextStep({ ...FR001674, nextAction: null })).toEqual({
      kind: "alert",
      label: "Photo missing",
    });
  });

  it("shows paid invoices on closed orders", () => {
    expect(resolveNextStep(FR001672)).toEqual({
      kind: "paid",
      amountCents: 50800,
      invoiceNumber: "001812",
    });
  });

  it("shows unpaid invoices as due", () => {
    const unpaid = { ...FR001672, invoice: { ...FR001672.invoice!, paidAt: null } };
    expect(resolveNextStep(unpaid)).toEqual({
      kind: "invoice_due",
      amountCents: 50800,
      invoiceNumber: "001812",
    });
  });

  it("says Closed when a closed order has no invoice", () => {
    expect(resolveNextStep(FR001668)).toEqual({ kind: "closed" });
  });

  it("returns the next action with its due time", () => {
    expect(resolveNextStep(FR001676)).toEqual({
      kind: "action",
      label: "Loading",
      dueAt: "2026-04-17T15:14:00.000Z",
      requiresClient: false,
    });
  });

  it("uses compact action labels on compact cards", () => {
    expect(resolveNextStep(FR001681, "compact")).toMatchObject({ label: "Await truck" });
    expect(resolveNextStep(FR001681, "full")).toMatchObject({ label: "Waiting for truck" });
  });

  it("returns none when nothing is pending", () => {
    expect(resolveNextStep({ ...FR001676, nextAction: null })).toEqual({ kind: "none" });
  });
});
