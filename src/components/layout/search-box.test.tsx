import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SearchBox } from "./search-box";

const nav = vi.hoisted(() => ({
  push: vi.fn(),
  pathname: "/dashboard",
  search: "",
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: nav.push }),
  usePathname: () => nav.pathname,
  useSearchParams: () => new URLSearchParams(nav.search),
}));

async function search(text: string) {
  const user = userEvent.setup();
  render(<SearchBox />);
  await user.type(screen.getByRole("searchbox", { name: "Search orders" }), `${text}{Enter}`);
}

beforeEach(() => {
  nav.push.mockClear();
});

describe("SearchBox", () => {
  it("searches all time when started outside the order list", async () => {
    nav.pathname = "/dashboard";
    nav.search = "";
    await search("FR001500");
    expect(nav.push).toHaveBeenCalledWith("/orders?period=all&q=FR001500");
  });

  it("opens the default list on an empty search outside it", async () => {
    nav.pathname = "/dashboard";
    nav.search = "";
    await search("  ");
    expect(nav.push).toHaveBeenCalledWith("/orders");
  });

  it("keeps the list's own filters on /orders", async () => {
    nav.pathname = "/orders";
    nav.search = "hub=MAR&period=week&page=3";
    await search(" REF-1013 ");
    expect(nav.push).toHaveBeenCalledWith("/orders?hub=MAR&period=week&q=REF-1013");
  });
});
