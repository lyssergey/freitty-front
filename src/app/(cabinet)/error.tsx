"use client";

import { ErrorState } from "@/components/ui/error-state";

/** Error boundary for every cabinet page — keeps the shell, offers a retry. */
export default function CabinetError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorState className="mt-4" title="Something went wrong" error={error} onRetry={reset} />;
}
