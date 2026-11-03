"use client";

import { Bell, CircleHelp, CreditCard, Menu } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/components/ui/cn";
import { IconButton } from "@/components/ui/icon-button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotInDemo } from "@/components/ui/toast";
import { useDashboardSummary, useMe } from "@/lib/api/hooks";
import { ordersHref } from "@/lib/domain/order-filters";
import { formatMoney } from "@/lib/format/money";
import { MOBILE_NAV_ID } from "./mobile-drawer";
import { SearchBox, SearchBoxFallback } from "./search-box";

function BalancePill() {
  const me = useMe();
  const notInDemo = useNotInDemo();

  if (me.isPending) return <Skeleton className="hidden h-8 w-40 rounded-full md:block" />;
  if (!me.data) return null;

  return (
    <button
      type="button"
      onClick={notInDemo}
      title="Current balance — top up in Billing"
      className={cn(
        "hidden h-8 items-center gap-1.5 rounded-full border border-brand-line bg-brand-soft px-3 text-xs font-bold whitespace-nowrap text-brand-strong md:inline-flex",
        "transition-colors hover:bg-brand-tint",
      )}
    >
      <CreditCard aria-hidden className="size-3.5" />
      <span className="tabular-nums">{formatMoney(me.data.company.balanceCents)}</span>
      <span className="text-3xs font-semibold text-danger">Top up →</span>
    </button>
  );
}

function NotificationsBell() {
  const summary = useDashboardSummary();
  const attention = summary.data?.needAttention.total ?? 0;
  const label =
    attention > 0
      ? `Notifications: ${attention} order${attention === 1 ? "" : "s"} need${attention === 1 ? "s" : ""} attention`
      : "Notifications";

  // Same all-time list as the dashboard's Need-attention card (the count isn't date-scoped).
  return (
    <Link
      href={ordersHref({ segment: "attention", period: "all" })}
      aria-label={label}
      title={label}
      className="relative inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-ink-subtle transition-colors hover:bg-line hover:text-ink"
    >
      <Bell aria-hidden className="size-4" />
      {attention > 0 && (
        <span
          aria-hidden
          className="absolute top-1.5 right-2 size-2 rounded-full border-2 border-surface bg-brand"
        />
      )}
    </Link>
  );
}

function UserChip() {
  const me = useMe();
  if (me.isPending) return <Skeleton className="h-9 w-9 rounded-full sm:w-24" />;
  const user = me.data?.user;
  return (
    <div
      className="flex h-9 shrink-0 items-center gap-2.5 rounded-full bg-surface-muted py-1 pr-1 pl-1 sm:pr-3"
      title={user ? `${user.name} · ${me.data?.company.name}` : undefined}
    >
      <Avatar initials={user?.initials ?? "?"} size={28} className="text-2xs font-bold" />
      <span className="hidden text-body font-semibold text-ink sm:inline">{user?.name ?? "—"}</span>
    </div>
  );
}

/** White top bar (mockup `.fc-topbar`): search, balance, notifications, help, user. */
export function Topbar({ menuOpen, onOpenMenu }: { menuOpen: boolean; onOpenMenu: () => void }) {
  const notInDemo = useNotInDemo();

  return (
    <header className="sticky top-0 z-30 flex h-[61px] items-center gap-2 border-b border-line bg-surface px-4 sm:gap-4 sm:px-6">
      <IconButton
        label="Open navigation"
        aria-expanded={menuOpen}
        aria-controls={MOBILE_NAV_ID}
        className="lg:hidden"
        onClick={onOpenMenu}
      >
        <Menu aria-hidden />
      </IconButton>
      <Suspense fallback={<SearchBoxFallback />}>
        <SearchBox />
      </Suspense>
      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        <BalancePill />
        <NotificationsBell />
        <IconButton label="Help" onClick={notInDemo} className="hidden sm:inline-flex">
          <CircleHelp aria-hidden />
        </IconButton>
        <UserChip />
      </div>
    </header>
  );
}
