import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DRAFT_003, FR001672, FR001674, FR001676, FR001679, FR001681, NOW } from "@/test/fixtures";
import { renderWithProviders } from "@/test/render";
import { OrderCard } from "./order-card";

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(NOW));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("OrderCard (full)", () => {
  it("shows the six dashboard fields and a live countdown", () => {
    renderWithProviders(<OrderCard order={FR001676} variant="full" />);
    const card = screen.getByRole("article", { name: "FR001676" });

    expect(within(card).getByRole("link", { name: "FR001676" })).toHaveAttribute(
      "href",
      "/orders/FR001676",
    );
    expect(card).toHaveTextContent("Consolidation · 3 sub-orders");
    expect(card).toHaveTextContent("12 Apr, 09:00");
    expect(card).toHaveTextContent("15 × Std + 12 × XL");
    expect(card).toHaveTextContent("Driver: User 5");
    expect(card).toHaveTextContent("Toronto, ON");
    expect(card).toHaveTextContent("2 consolidated");
    expect(card).toHaveTextContent("Next: Loading · 2h 14m");
    expect(within(card).getByText("In progress")).toBeInTheDocument();
  });

  it("spans the destination when there is no trailers row", () => {
    renderWithProviders(<OrderCard order={FR001681} variant="full" />);
    const card = screen.getByRole("article", { name: "FR001681" });
    expect(card).toHaveTextContent("Ref N:REF-1004");
    expect(card).toHaveTextContent("Detroit, MI · via External PDF");
    expect(card).toHaveTextContent("23 × Standard");
    expect(card).toHaveTextContent("Next: Waiting for truck");
    expect(card).not.toHaveTextContent("consolidated");
  });

  it("shows paid invoices with the invoice number", () => {
    renderWithProviders(<OrderCard order={FR001672} variant="full" />);
    const card = screen.getByRole("article", { name: "FR001672" });
    expect(card).toHaveTextContent("Next: Paid · $508.00 · #001812");
    expect(within(card).getByText("Completed")).toBeInTheDocument();
  });
});

describe("OrderCard (compact)", () => {
  it("flags open alerts and quantity mismatches", () => {
    renderWithProviders(<OrderCard order={FR001674} variant="compact" />);
    const card = screen.getByRole("article", { name: "FR001674" });
    expect(within(card).getByText("Alert")).toBeInTheDocument();
    expect(card).toHaveTextContent("20 decl · 18 act");
    expect(card).toHaveTextContent("Upload photo");
    expect(card).not.toHaveTextContent("Next: Upload photo");
    expect(card).toHaveTextContent("Consolidation · 2 sub");
  });

  it("renders drafts with a single delete action", () => {
    renderWithProviders(<OrderCard order={DRAFT_003} variant="compact" />);
    const card = screen.getByRole("article", { name: "DRAFT-003" });
    expect(card).toHaveTextContent("Consolidation · incomplete");
    expect(card).toHaveTextContent("Continue editing");
    expect(within(card).queryByText("Consolidation", { selector: "span" })).toBeNull();
    const buttons = within(card).getAllByRole("button");
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toHaveAccessibleName("Delete draft DRAFT-003");
  });

  it("opens the sub-order popover from the refs pill", async () => {
    const user = userEvent.setup();
    renderWithProviders(<OrderCard order={FR001674} variant="compact" />);

    const trigger = screen.getByRole("button", { name: /2 reference numbers/ });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await user.click(trigger);

    const popover = await screen.findByRole("dialog", { name: "Reference numbers of FR001674" });
    expect(popover).toHaveTextContent("FR001674-1");
    expect(popover).toHaveTextContent("REF-1006");
    expect(popover).toHaveTextContent("7 pallets");
    expect(popover).toHaveTextContent("photo missing");
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    await user.keyboard("{Escape}");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });

  it("shows a toast for actions outside the demo", async () => {
    const user = userEvent.setup();
    renderWithProviders(<OrderCard order={FR001676} variant="compact" />);
    await user.click(screen.getByRole("button", { name: "Chat — FR001676" }));
    expect(await screen.findByText("Not part of this demo yet")).toBeInTheDocument();
  });
});

describe("OrderCard next step owned by the client", () => {
  it("spells out the action and its countdown on full cards", () => {
    renderWithProviders(<OrderCard order={FR001679} variant="full" />);
    const card = screen.getByRole("article", { name: "FR001679" });
    expect(card).toHaveTextContent("Your action: Confirm BOL · 9h 0m");
    expect(card.querySelector(".lucide-hand")).not.toBeNull();
  });

  it("keeps compact lines short: hand icon and label, the prefix for screen readers", () => {
    renderWithProviders(<OrderCard order={FR001679} variant="compact" />);
    const card = screen.getByRole("article", { name: "FR001679" });
    expect(within(card).getByText("Your action:")).toHaveClass("sr-only");
    expect(card).toHaveTextContent("Your action: Confirm BOL");
    expect(card).not.toHaveTextContent("9h 0m");
    expect(card.querySelector(".lucide-hand")).not.toBeNull();
  });

  it("leaves warehouse steps as they were", () => {
    renderWithProviders(<OrderCard order={FR001676} variant="full" />);
    const card = screen.getByRole("article", { name: "FR001676" });
    expect(card).toHaveTextContent("Next: Loading · 2h 14m");
    expect(card).not.toHaveTextContent("Your action");
    expect(card.querySelector(".lucide-hand")).toBeNull();
  });
});
