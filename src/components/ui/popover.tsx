"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { useIsClient } from "@/lib/hooks/use-is-client";
import { cn } from "./cn";

export interface PopoverTriggerProps {
  ref: RefObject<HTMLButtonElement | null>;
  "aria-expanded": boolean;
  "aria-controls": string;
  "aria-haspopup": "dialog";
  onClick: () => void;
}

interface PopoverProps {
  /** Renders the trigger button; spread the given props onto it. */
  trigger: (props: PopoverTriggerProps, open: boolean) => ReactNode;
  /** Accessible name of the popover panel. */
  label: string;
  children: ReactNode;
  align?: "start" | "end";
  className?: string;
}

const GAP = 6;
const MARGIN = 8;

/**
 * Click-to-open floating panel. Rendered in a portal with fixed positioning so it is never
 * clipped by scrolling tables or covered by neighbouring (transformed) cards; it follows the
 * trigger on scroll/resize and flips above when there's no room below. It stacks below the sticky
 * topbar (z-30), so it slides under it with the page instead of covering it. Escape, an outside
 * click or tabbing away closes it and returns focus to the trigger.
 */
export function Popover({ trigger, label, children, align = "start", className }: PopoverProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const isClient = useIsClient();

  const close = useCallback((restoreFocus: boolean) => {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  // Position against the trigger before paint, and keep following it.
  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const anchor = triggerRef.current;
      const panel = panelRef.current;
      if (!anchor || !panel) return;
      const rect = anchor.getBoundingClientRect();
      const { offsetWidth: width, offsetHeight: height } = panel;
      const viewportW = document.documentElement.clientWidth;
      const viewportH = window.innerHeight;

      let left = align === "start" ? rect.left : rect.right - width;
      left = Math.min(Math.max(MARGIN, left), viewportW - width - MARGIN);

      let top = rect.bottom + GAP;
      if (top + height > viewportH - MARGIN && rect.top - GAP - height > MARGIN) {
        top = rect.top - GAP - height;
      }
      panel.style.left = `${Math.round(left)}px`;
      panel.style.top = `${Math.round(top)}px`;
    };
    place();
    panelRef.current?.focus({ preventScroll: true });
    window.addEventListener("scroll", place, { capture: true, passive: true });
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, { capture: true });
      window.removeEventListener("resize", place);
    };
  }, [open, align]);

  // Close on outside pointer-down / Escape anywhere.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      close(false);
    };
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") close(true);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  function onPanelKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Tab") {
      event.preventDefault();
      close(true);
    }
  }

  const triggerProps: PopoverTriggerProps = {
    ref: triggerRef,
    "aria-expanded": open,
    "aria-controls": id,
    "aria-haspopup": "dialog",
    onClick: () => setOpen((value) => !value),
  };

  return (
    <>
      {trigger(triggerProps, open)}
      {isClient &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                ref={panelRef}
                id={id}
                role="dialog"
                aria-label={label}
                tabIndex={-1}
                onKeyDown={onPanelKeyDown}
                initial={{ opacity: 0, y: -4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98, transition: { duration: 0.12 } }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                style={{ position: "fixed", top: 0, left: 0 }}
                className={cn("z-20 origin-top outline-none", className)}
              >
                {children}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
