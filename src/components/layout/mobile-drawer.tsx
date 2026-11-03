"use client";

import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import { IconButton } from "@/components/ui/icon-button";

/** Id of the drawer panel, for the hamburger's `aria-controls`. */
export const MOBILE_NAV_ID = "mobile-navigation";

/** Tailwind's `lg`: from here on the sidebar is always visible and the drawer is hidden. */
const DESKTOP_QUERY = "(min-width: 64rem)";

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Slide-in navigation for < lg screens: modal (Tab cycles inside it, the page behind is `inert`
 * — see AppShell), closes on Escape / backdrop / navigation and when the window grows to `lg`.
 */
export function MobileDrawer({ open, onClose, children }: MobileDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab") keepFocusInside(event, panelRef.current);
    };
    // The drawer is `lg:hidden`: left open, it would keep the page scroll-locked and inert.
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const onBreakpoint = (event: MediaQueryListEvent) => {
      if (event.matches) onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onBreakpoint);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onBreakpoint);
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            id={MOBILE_NAV_ID}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className="absolute inset-y-0 left-0 w-sidebar max-w-[85vw] shadow-toast"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
          >
            {/* First in tab order (it gets the focus on open); positioned over the top-right. */}
            <IconButton
              ref={closeRef}
              label="Close navigation"
              onClick={onClose}
              className="absolute top-4 right-3 bg-sidebar-hover text-sidebar-ink hover:bg-sidebar-active hover:text-white"
            >
              <X aria-hidden />
            </IconButton>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/** Wraps Tab / Shift+Tab around the panel's first and last focusable elements. */
function keepFocusInside(event: KeyboardEvent, panel: HTMLElement | null) {
  const focusable = panel?.querySelectorAll<HTMLElement>("a[href], button:not(:disabled)");
  const first = focusable?.[0];
  const last = focusable?.[focusable.length - 1];
  if (!first || !last) return;
  const active = document.activeElement;
  if (event.shiftKey && (active === first || !panel?.contains(active))) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && (active === last || !panel?.contains(active))) {
    event.preventDefault();
    first.focus();
  }
}
