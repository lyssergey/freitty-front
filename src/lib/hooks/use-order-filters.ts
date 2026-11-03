"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import {
  DEFAULT_ORDER_FILTERS,
  applyFilterChange,
  parseOrderFilters,
  serializeOrderFilters,
  type OrderFilters,
} from "@/lib/domain/order-filters";

/**
 * Order-list filters backed by the URL. `update` merges a change (any filter change resets the
 * page) and pushes a new history entry, so Back/Forward walk through filter states.
 */
export function useOrderFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters = useMemo(() => parseOrderFilters(searchParams), [searchParams]);

  const navigate = useCallback(
    (next: OrderFilters, { scroll = false, replace = false } = {}) => {
      const qs = serializeOrderFilters(next).toString();
      const href = qs ? `${pathname}?${qs}` : pathname;
      if (replace) router.replace(href, { scroll });
      else router.push(href, { scroll });
    },
    [router, pathname],
  );

  const update = useCallback(
    (patch: Partial<OrderFilters>, options: { replace?: boolean } = {}) => {
      // Paging scrolls back to the top of the list; filters keep the scroll position.
      navigate(applyFilterChange(filters, patch), {
        scroll: patch.page !== undefined && !options.replace,
        replace: options.replace,
      });
    },
    [filters, navigate],
  );

  const reset = useCallback(() => {
    navigate({ ...DEFAULT_ORDER_FILTERS, view: filters.view });
  }, [filters.view, navigate]);

  return { filters, update, reset };
}
