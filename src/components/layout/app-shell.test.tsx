import { act, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import { AppShell } from "./app-shell";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

/** jsdom has no matchMedia: a controllable `(min-width: 64rem)` query. */
function stubDesktopQuery() {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const query = {
    matches: false,
    addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) =>
      listeners.add(listener),
    removeEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) =>
      listeners.delete(listener),
  };
  vi.stubGlobal("matchMedia", (media: string) => ({ ...query, media }));
  return {
    growToDesktop() {
      query.matches = true;
      listeners.forEach((listener) => listener({ matches: true } as MediaQueryListEvent));
    },
  };
}

async function openDrawer() {
  const user = userEvent.setup();
  renderWithProviders(
    <AppShell>
      <p>Page content</p>
    </AppShell>,
  );
  const hamburger = screen.getByRole("button", { name: "Open navigation" });
  await user.click(hamburger);
  return { user, hamburger, dialog: screen.getByRole("dialog", { name: "Navigation" }) };
}

beforeEach(() => {
  // Summary / user queries stay pending: the shell renders its skeletons.
  vi.stubGlobal("fetch", () => new Promise(() => {}));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("AppShell mobile drawer", () => {
  it("is announced by the hamburger and makes the page behind it inert", async () => {
    stubDesktopQuery();
    const { hamburger, dialog } = await openDrawer();

    expect(hamburger).toHaveAttribute("aria-expanded", "true");
    expect(hamburger).toHaveAttribute("aria-controls", dialog.id);
    expect(screen.getByRole("main").parentElement).toHaveAttribute("inert");
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("keeps the focus inside, starting on the close button", async () => {
    stubDesktopQuery();
    const { user, dialog } = await openDrawer();
    const close = within(dialog).getByRole("button", { name: "Close navigation" });

    expect(close).toHaveFocus();
    expect(dialog.querySelector("a[href], button")).toBe(close);
    for (let i = 0; i < 8; i++) {
      await user.tab();
      expect(dialog).toContainElement(document.activeElement as HTMLElement);
    }
    close.focus();
    await user.tab({ shift: true });
    expect(within(dialog).getByRole("button", { name: "New Order" })).toHaveFocus();
  });

  it("gives the focus back to the hamburger on Escape", async () => {
    stubDesktopQuery();
    const { user, hamburger } = await openDrawer();

    await user.keyboard("{Escape}");

    expect(hamburger).toHaveAttribute("aria-expanded", "false");
    expect(hamburger).toHaveFocus();
  });

  it("closes when the window grows to the desktop layout", async () => {
    const media = stubDesktopQuery();
    const { hamburger } = await openDrawer();
    // From `lg` on the hamburger is hidden and can't take the focus back.
    vi.spyOn(hamburger, "focus").mockImplementation(() => {});

    act(() => media.growToDesktop());

    expect(hamburger).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("main").parentElement).not.toHaveAttribute("inert");
    expect(document.body.style.overflow).toBe("");
    expect(screen.getByRole("main")).toHaveFocus();
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });
});
