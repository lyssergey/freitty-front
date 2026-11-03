import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderOptions } from "@testing-library/react";
import { MotionConfig } from "motion/react";
import type { ReactElement, ReactNode } from "react";
import { ToastProvider } from "@/components/ui/toast";

/** Renders with the app's providers (fresh QueryClient per test, motion reduced). */
export function renderWithProviders(ui: ReactElement, options?: RenderOptions) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MotionConfig reducedMotion="always">
          <ToastProvider>{children}</ToastProvider>
        </MotionConfig>
      </QueryClientProvider>
    );
  }
  return { queryClient, ...render(ui, { wrapper: Wrapper, ...options }) };
}
