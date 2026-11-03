"use client";

import { Menu } from "lucide-react";
import type { OrderType } from "@/lib/api/types";
import { IconButton } from "@/components/ui/icon-button";
import { useNotInDemo } from "@/components/ui/toast";

const TITLES: Record<OrderType, string> = {
  cross_dock: "Cross-Dock management",
  consolidation: "Consolidation management",
};

/** Red "F" tile + "Cross-Dock management" title row. */
export function DetailHeader({ type, number }: { type: OrderType; number: string }) {
  const notInDemo = useNotInDemo();
  return (
    <div className="mb-3.5 flex items-center gap-3 border-b border-line pt-2 pb-3.5">
      <span
        aria-hidden
        className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand text-[22px] font-black text-white"
      >
        F
      </span>
      <h1 className="text-lg font-bold text-ink">
        {TITLES[type]}
        <span className="sr-only"> — order {number}</span>
      </h1>
      <IconButton label="Order menu" onClick={notInDemo} className="ml-auto bg-surface-sunken">
        <Menu aria-hidden />
      </IconButton>
    </div>
  );
}
