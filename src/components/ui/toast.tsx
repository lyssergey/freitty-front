"use client";

import { CircleCheck, Info } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type ToastTone = "info" | "success";

interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastApi {
  toast: (message: string, options?: { tone?: ToastTone; durationMs?: number }) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const MAX_VISIBLE = 3;

/**
 * Tiny toast stack (bottom centre, polite live region) with motion enter/exit. A message that is
 * still on screen (an unimplemented button clicked twice) restarts its timer instead of stacking.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  // Mirrors `toasts` synchronously, so back-to-back calls see each other before a re-render.
  const visible = useRef<ToastItem[]>([]);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const nextId = useRef(0);

  const show = useCallback((next: ToastItem[]) => {
    visible.current = next;
    setToasts(next);
  }, []);

  const dismiss = useCallback(
    (id: number) => {
      clearTimeout(timers.current.get(id));
      timers.current.delete(id);
      show(visible.current.filter((t) => t.id !== id));
    },
    [show],
  );

  const toast = useCallback<ToastApi["toast"]>(
    (message, options = {}) => {
      const tone = options.tone ?? "info";
      const same = visible.current.find((t) => t.message === message && t.tone === tone);
      const id = same?.id ?? ++nextId.current;
      clearTimeout(timers.current.get(id));
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), options.durationMs ?? 2600),
      );
      if (!same) show([...visible.current.slice(-(MAX_VISIBLE - 1)), { id, message, tone }]);
    },
    [dismiss, show],
  );

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((timer) => clearTimeout(timer));
  }, []);

  const api = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext value={api}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[70] flex flex-col items-center gap-2 sm:bottom-6"
      >
        <AnimatePresence initial={false}>
          {toasts.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96, transition: { duration: 0.15 } }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.3 }}
              className="pointer-events-auto flex max-w-sm items-center gap-2.5 rounded-lg bg-ink px-3.5 py-2.5 text-body font-medium text-white shadow-toast"
            >
              {item.tone === "success" ? (
                <CircleCheck className="size-4 shrink-0 text-tone-green" aria-hidden />
              ) : (
                <Info className="size-4 shrink-0 text-sidebar-ink" aria-hidden />
              )}
              <span>{item.message}</span>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                className="ml-1 rounded px-1 text-2xs font-semibold text-sidebar-ink hover:text-white"
              >
                Dismiss
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext>
  );
}

export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error("useToast must be used inside <ToastProvider>");
  return api;
}

export const NOT_IN_DEMO_MESSAGE = "Not part of this demo yet";

/** Click handler for actions outside the demo's scope (New Order, Top up, BOL PDF, …). */
export function useNotInDemo(): () => void {
  const { toast } = useToast();
  return useCallback(() => toast(NOT_IN_DEMO_MESSAGE), [toast]);
}
