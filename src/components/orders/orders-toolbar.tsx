"use client";

import { Columns3, LayoutGrid, Rows3, X } from "lucide-react";
import type { ReactNode } from "react";
import type { DatePreset, HubRef, OrderStatus } from "@/lib/api/types";
import { ORDER_STATUSES } from "@/lib/api/types";
import { Segmented } from "@/components/ui/segmented";
import { Select, type SelectOption } from "@/components/ui/select";
import { DATE_PRESET_LABEL, ORDER_STATUS_META } from "@/lib/domain/labels";
import type { OrderFilters, OrderView } from "@/lib/domain/order-filters";

const ALL = "all";
const ANY = "any";

/** "Last 30 days" first — it's the default. */
const DATE_ORDER = ["30d", "today", "week", "all"] as const satisfies readonly DatePreset[];
const DATE_OPTIONS: SelectOption<DatePreset>[] = DATE_ORDER.map((preset) => ({
  value: preset,
  label: DATE_PRESET_LABEL[preset],
}));

const STATUS_OPTIONS: SelectOption<OrderStatus | typeof ANY>[] = [
  { value: ANY, label: "Any" },
  ...ORDER_STATUSES.map((status) => ({ value: status, label: ORDER_STATUS_META[status].label })),
];

const VIEW_OPTIONS = [
  { value: "cards", label: "Cards", icon: <LayoutGrid aria-hidden /> },
  { value: "table", label: "Table", icon: <Rows3 aria-hidden /> },
  { value: "board", label: "Pipeline", icon: <Columns3 aria-hidden /> },
] as const satisfies readonly { value: OrderView; label: string; icon: ReactNode }[];

interface OrdersToolbarProps {
  filters: OrderFilters;
  hubs: readonly HubRef[] | undefined;
  onChange: (patch: Partial<OrderFilters>) => void;
}

/** Filter row: Hub / Date / Status selects, the active search chip, and the view toggle. */
export function OrdersToolbar({ filters, hubs, onChange }: OrdersToolbarProps) {
  const isBoard = filters.view === "board";

  const hubOptions: SelectOption<string>[] = [
    { value: ALL, label: "All" },
    ...(hubs ?? []).map((hub) => ({ value: hub.code, label: hub.name })),
  ];
  // Keep a hub from the URL selectable while the hub list is still loading.
  if (filters.hub && !hubOptions.some((option) => option.value === filters.hub)) {
    hubOptions.push({ value: filters.hub, label: filters.hub });
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <Select
        label="Hub"
        value={filters.hub ?? ALL}
        options={hubOptions}
        onChange={(value) => onChange({ hub: value === ALL ? null : value })}
      />
      <Select
        label="Date"
        value={filters.period}
        options={DATE_OPTIONS}
        onChange={(period) => onChange({ period })}
      />
      <Select
        label="Status"
        value={isBoard ? ANY : (filters.status ?? ANY)}
        options={STATUS_OPTIONS}
        disabled={isBoard}
        title={isBoard ? "The pipeline already groups orders by status" : undefined}
        onChange={(value) => onChange({ status: value === ANY ? null : value })}
      />

      {filters.q && (
        <span className="inline-flex h-[30px] max-w-full items-center gap-1 rounded-full border border-accent/30 bg-accent-soft pr-1 pl-3 text-xs text-navy">
          <span className="truncate">
            Search: <strong className="font-semibold">“{filters.q}”</strong>
          </span>
          <button
            type="button"
            onClick={() => onChange({ q: "" })}
            aria-label={`Clear search “${filters.q}”`}
            className="grid size-6 shrink-0 place-items-center rounded-full text-accent transition-colors hover:bg-accent/15"
          >
            <X aria-hidden className="size-3.5" />
          </button>
        </span>
      )}

      <Segmented
        className="sm:ml-auto"
        label="View"
        layoutId="orders-view"
        options={VIEW_OPTIONS}
        value={filters.view}
        onChange={(view) => onChange({ view })}
      />
    </div>
  );
}
