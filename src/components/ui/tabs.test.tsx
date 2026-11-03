import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Tabs } from "./tabs";

const items = [
  { value: "all", label: "All", count: 27 },
  { value: "alerts", label: "Alerts", count: 2, urgent: true },
  { value: "drafts", label: "Drafts", count: undefined },
] as const;

describe("Tabs", () => {
  it("marks the active tab and renders counts", () => {
    render(<Tabs items={items} value="all" onChange={() => {}} label="Segments" layoutId="t" />);
    expect(screen.getByRole("tablist", { name: "Segments" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /All/ })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: /Alerts/ })).toHaveAttribute("aria-selected", "false");
    expect(screen.getByText("27")).toBeInTheDocument();
    expect(screen.getByText("2")).toHaveClass("bg-tone-red");
  });

  it("selects on click", async () => {
    const onChange = vi.fn();
    render(<Tabs items={items} value="all" onChange={onChange} label="Segments" layoutId="t" />);
    await userEvent.click(screen.getByRole("tab", { name: /Drafts/ }));
    expect(onChange).toHaveBeenCalledWith("drafts");
  });

  it("moves focus with arrow keys (roving tabindex)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Tabs items={items} value="all" onChange={onChange} label="Segments" layoutId="t" />);

    await user.tab();
    expect(screen.getByRole("tab", { name: /All/ })).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: /Alerts/ })).toHaveFocus();
    await user.keyboard("{End}");
    expect(screen.getByRole("tab", { name: /Drafts/ })).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: /All/ })).toHaveFocus();
    await user.keyboard("{ArrowLeft}{Enter}");
    expect(onChange).toHaveBeenCalledWith("drafts");
  });
});
