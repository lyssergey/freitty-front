import { fireEvent, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FR001676 } from "@/test/fixtures";
import { renderWithProviders } from "@/test/render";
import { OrdersTable } from "./orders-table";

const router = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

const open = vi.fn();

function renderRow() {
  renderWithProviders(<OrdersTable orders={[FR001676]} />);
  return screen.getByRole("row", { name: /FR001676/ });
}

beforeEach(() => {
  router.push.mockClear();
  open.mockClear();
  vi.stubGlobal("open", open);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("OrdersTable rows", () => {
  it("open the order on a plain click", () => {
    fireEvent.click(renderRow());
    expect(router.push).toHaveBeenCalledWith("/orders/FR001676");
    expect(open).not.toHaveBeenCalled();
  });

  it("open it in a new tab on Ctrl/Cmd-click", () => {
    const row = renderRow();
    fireEvent.click(row, { ctrlKey: true });
    fireEvent.click(row, { metaKey: true });
    expect(open).toHaveBeenCalledTimes(2);
    expect(open).toHaveBeenCalledWith("/orders/FR001676", "_blank", "noopener");
    expect(router.push).not.toHaveBeenCalled();
  });

  it("open it in a new tab on middle-click", () => {
    const row = renderRow();
    fireEvent(row, new MouseEvent("auxclick", { bubbles: true, button: 1 }));
    expect(open).toHaveBeenCalledWith("/orders/FR001676", "_blank", "noopener");
    expect(router.push).not.toHaveBeenCalled();
  });

  it("leave clicks on controls inside the row to them", () => {
    renderRow();
    fireEvent.click(screen.getByRole("button", { name: /reference numbers/ }), { ctrlKey: true });
    expect(open).not.toHaveBeenCalled();
    expect(router.push).not.toHaveBeenCalled();
  });
});
