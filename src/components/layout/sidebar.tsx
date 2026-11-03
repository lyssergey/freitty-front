"use client";

import { LayoutDashboard, Package, Plus, Settings, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { useNotInDemo } from "@/components/ui/toast";
import { useDashboardSummary } from "@/lib/api/hooks";
import { Logo } from "./logo";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Path prefix that marks the item active. */
  match: string;
}

const NAV: readonly NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, match: "/dashboard" },
  { href: "/orders", label: "Orders", icon: Package, match: "/orders" },
  { href: "/settings", label: "Settings", icon: Settings, match: "/settings" },
];

/** Dark navigation column (mockup `.fc-sidebar`), reused inside the mobile drawer. */
export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const summary = useDashboardSummary();
  const notInDemo = useNotInDemo();
  const attention = summary.data?.needAttention.total ?? 0;

  return (
    <div className="flex h-full flex-col bg-sidebar py-5 text-white">
      <Link
        href="/dashboard"
        onClick={onNavigate}
        className="mx-3 mb-4 self-start rounded px-2 pb-2"
        aria-label="Freitty — dashboard"
      >
        <Logo />
      </Link>

      <nav aria-label="Main">
        <ul>
          {NAV.map(({ href, label, icon: Icon, match }) => {
            const active = pathname === match || pathname.startsWith(`${match}/`);
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2.5 border-l-[3px] px-5 py-[11px] text-sm transition-colors",
                    "focus-visible:-outline-offset-2 focus-visible:outline-white",
                    active
                      ? "border-brand bg-sidebar-active font-semibold text-white"
                      : "border-transparent text-sidebar-ink hover:bg-sidebar-hover hover:text-white",
                  )}
                >
                  <Icon aria-hidden className={cn("size-4", !active && "opacity-70")} />
                  {label}
                  {href === "/orders" && attention > 0 && (
                    <span
                      className="ml-auto min-w-[18px] rounded-[10px] bg-brand px-1.5 py-0.5 text-center text-3xs leading-3.5 font-bold text-white tabular-nums"
                      aria-label={`${attention} need attention`}
                    >
                      {attention}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-5 border-t border-sidebar-line p-5">
        <Button className="w-full" onClick={notInDemo}>
          <Plus aria-hidden />
          New Order
        </Button>
      </div>
    </div>
  );
}
