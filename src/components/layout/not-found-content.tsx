import { Compass } from "lucide-react";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";

/** Styled 404 body shared by the global and cabinet not-found pages. */
export function NotFoundContent() {
  return (
    <div className="mx-auto mt-10 flex max-w-md flex-col items-center gap-3 rounded-card border border-dashed border-line-strong bg-surface px-6 py-12 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-brand-soft text-brand">
        <Compass aria-hidden className="size-6" />
      </span>
      <p className="text-3xs font-bold tracking-[0.1em] text-brand uppercase">Error 404</p>
      <h1 className="text-title font-bold text-ink">Page not found</h1>
      <p className="text-body text-ink-muted">
        The page you&apos;re looking for doesn&apos;t exist or was moved.
      </p>
      <div className="mt-2 flex gap-2">
        <Link href="/dashboard" className={buttonClasses()}>
          Go to dashboard
        </Link>
        <Link href="/orders" className={buttonClasses({ variant: "secondary" })}>
          View orders
        </Link>
      </div>
    </div>
  );
}
