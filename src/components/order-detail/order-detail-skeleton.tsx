import { cn } from "@/components/ui/cn";
import { Skeleton } from "@/components/ui/skeleton";
import { QUANTITY_GRID, QUANTITY_NOTE_SPAN } from "./quantity-cards";

/** Same footprint as the detail page while it loads. */
export function OrderDetailSkeleton() {
  return (
    <div aria-hidden>
      <div className="mb-3.5 flex items-center gap-3 border-b border-line pt-2 pb-3.5">
        <Skeleton className="size-10 rounded-lg" />
        <Skeleton className="h-6 w-56" />
      </div>
      <div className="mb-3 flex flex-wrap items-center gap-2.5">
        <Skeleton className="h-8 w-9" />
        <Skeleton className="h-6 w-44" />
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-5 w-32 rounded-full" />
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-[34px] w-14" />
        ))}
      </div>
      <Skeleton className="mb-4 h-[200px] rounded-card" />
      <div className="mb-4 grid gap-3.5 md:grid-cols-[300px_minmax(0,1fr)]">
        <Skeleton className="h-[270px] rounded-card" />
        <div className={QUANTITY_GRID}>
          <Skeleton className="min-h-[96px] rounded-card" />
          <Skeleton className="min-h-[96px] rounded-card" />
          <Skeleton className={cn("min-h-[96px] rounded-card", QUANTITY_NOTE_SPAN)} />
        </div>
      </div>
      <Skeleton className="mb-3.5 h-[220px] rounded-card" />
      <Skeleton className="h-[200px] rounded-card" />
    </div>
  );
}
