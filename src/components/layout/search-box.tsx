"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { FormEvent } from "react";
import {
  SEARCH_MAX_LENGTH,
  applyFilterChange,
  normalizeSearch,
  ordersHref,
  parseOrderFilters,
} from "@/lib/domain/order-filters";
import { cn } from "@/components/ui/cn";

const PLACEHOLDER = "Search orders, invoices, documents…";

function SearchField({
  defaultValue,
  onSearch,
}: {
  defaultValue?: string;
  onSearch?: (value: string) => void;
}) {
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = new FormData(event.currentTarget).get("q");
    onSearch?.(typeof value === "string" ? value : "");
  }

  return (
    <form
      role="search"
      onSubmit={onSubmit}
      className={cn(
        "flex h-[34px] min-w-0 flex-1 items-center gap-2 rounded-lg bg-surface-muted px-3.5 text-body sm:max-w-[420px]",
        "focus-within:bg-surface focus-within:ring-2 focus-within:ring-accent/40",
      )}
    >
      <Search aria-hidden className="size-4 shrink-0 text-ink-muted" />
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        maxLength={SEARCH_MAX_LENGTH}
        placeholder={PLACEHOLDER}
        aria-label="Search orders"
        autoComplete="off"
        className="min-w-0 flex-1 bg-transparent text-ellipsis text-ink outline-none placeholder:text-ink-muted [&::-webkit-search-cancel-button]:hidden"
      />
    </form>
  );
}

/**
 * Topbar search. Submits to the order list: from any other page it searches all time
 * (`/orders?period=all&q=…`, not the list's default last 30 days; an empty search just opens
 * `/orders`); on the list itself it keeps the filters on screen and mirrors the active query
 * (remounted via `key` when the URL changes).
 */
export function SearchBox() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const onOrders = pathname === "/orders";
  const current = onOrders ? parseOrderFilters(searchParams) : null;

  function onSearch(raw: string) {
    const q = normalizeSearch(raw);
    if (current) router.push(ordersHref(applyFilterChange(current, { q })));
    else router.push(ordersHref(q ? { q, period: "all" } : {}));
  }

  return <SearchField key={current?.q ?? ""} defaultValue={current?.q} onSearch={onSearch} />;
}

/** Static stand-in while the URL-aware search box streams in (Suspense fallback). */
export function SearchBoxFallback() {
  return <SearchField />;
}
