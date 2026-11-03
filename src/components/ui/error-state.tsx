import { RefreshCw, TriangleAlert } from "lucide-react";
import { isApiError } from "@/lib/api/client";
import { Button } from "./button";
import { cn } from "./cn";

interface ErrorStateProps {
  title?: string;
  error?: unknown;
  onRetry?: () => void;
  retrying?: boolean;
  className?: string;
}

function describe(error: unknown): string {
  if (isApiError(error)) {
    if (error.status === 0) return error.message;
    if (error.status >= 500) return "The server had a problem handling this request.";
    return error.message;
  }
  if (error instanceof Error && error.message) return error.message;
  return "Something unexpected happened.";
}

/** Failed request: what happened + a retry button. */
export function ErrorState({
  title = "Couldn't load this",
  error,
  onRetry,
  retrying,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-card border border-brand-line bg-brand-faint px-6 py-10 text-center",
        className,
      )}
    >
      <span className="mb-1 grid size-10 place-items-center rounded-full bg-brand-tint text-brand-strong">
        <TriangleAlert className="size-5" aria-hidden />
      </span>
      <p className="text-body font-semibold text-ink">{title}</p>
      <p className="max-w-md text-xs text-ink-muted">{describe(error)}</p>
      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          className="mt-2"
          onClick={onRetry}
          disabled={retrying}
        >
          <RefreshCw className={cn(retrying && "animate-spin")} aria-hidden />
          {retrying ? "Retrying…" : "Try again"}
        </Button>
      )}
    </div>
  );
}
