"use client";

import { useCallback, useState, type ReactNode } from "react";
import { MobileDrawer } from "./mobile-drawer";
import { NavigationTracker } from "./navigation-tracker";
import { SidebarContent } from "./sidebar";
import { Topbar } from "./topbar";

/**
 * Cabinet chrome (mockup `.fc-shell`): a 220px dark sidebar + white topbar around the page.
 * Below `lg` the sidebar turns into a slide-in drawer opened from the topbar.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const openMenu = useCallback(() => setMenuOpen(true), []);

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[var(--spacing-sidebar)_minmax(0,1fr)]">
      <a
        href="#main"
        className="sr-only z-[80] rounded-md bg-ink px-3 py-2 text-body text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <NavigationTracker />

      {/* The dark column spans the full page; the navigation inside it stays pinned. */}
      <div className="hidden bg-sidebar lg:block">
        <aside aria-label="Sidebar" className="sticky top-0 h-dvh">
          <SidebarContent />
        </aside>
      </div>
      <MobileDrawer open={menuOpen} onClose={closeMenu}>
        <SidebarContent onNavigate={closeMenu} />
      </MobileDrawer>

      {/* While the drawer is open the page behind it can't be focused, clicked or read. */}
      <div className="flex min-w-0 flex-col" inert={menuOpen}>
        <Topbar menuOpen={menuOpen} onOpenMenu={openMenu} />
        <main id="main" tabIndex={-1} className="flex-1 px-4 py-5 outline-none sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
