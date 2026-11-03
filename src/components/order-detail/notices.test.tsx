import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import type { NextAction, OrderDetail } from "@/lib/api/types";
import { NOT_IN_DEMO_MESSAGE } from "@/components/ui/toast";
import { FR001383, FR001674 } from "@/test/fixtures";
import { renderWithProviders } from "@/test/render";
import { OrderNotices } from "./notices";

const confirmBol: NextAction = {
  kind: "confirm_bol",
  dueAt: "2026-04-17T22:00:00.000Z",
  requiresClient: true,
};

function renderNotices(overrides: Partial<OrderDetail>) {
  renderWithProviders(<OrderNotices order={{ ...FR001383, ...overrides }} />);
}

describe("OrderNotices", () => {
  it("asks for the client's action when the order waits on it without an alert", async () => {
    const user = userEvent.setup();
    renderNotices({ nextAction: confirmBol, openAlerts: [] });

    expect(screen.getByText("Action needed:").closest("[role='note']")).toHaveTextContent(
      "Action needed: Confirm BOL — due 17 Apr, 18:00",
    );
    const buttons = screen.getAllByRole("button", { name: "Confirm BOL" });
    expect(buttons).toHaveLength(1);
    await user.click(buttons[0]!);
    expect(await screen.findByText(NOT_IN_DEMO_MESSAGE)).toBeInTheDocument();
    expect(screen.getByText("Read-only:")).toBeInTheDocument();
  });

  it("keeps the action on the alert, so its button appears once", () => {
    renderNotices({ nextAction: FR001674.nextAction, openAlerts: FR001674.openAlerts });

    expect(screen.getAllByRole("button", { name: "Upload photo" })).toHaveLength(1);
    expect(screen.getByRole("alert")).toHaveTextContent("Alert · photo missing (FR001674-2)");
    expect(screen.queryByText("Action needed:")).not.toBeInTheDocument();
  });

  it("says nothing extra for warehouse steps or orders that aren't active", () => {
    renderNotices({ openAlerts: [] });
    expect(screen.queryByText("Action needed:")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("ignores a client action on a closed order", () => {
    renderNotices({
      status: "closed",
      nextAction: { kind: "pay_invoice", dueAt: null, requiresClient: true },
      openAlerts: [],
    });
    expect(screen.queryByText("Action needed:")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
