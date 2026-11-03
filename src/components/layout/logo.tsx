import { cn } from "@/components/ui/cn";

/** Wordmark "FREITTY" with the brand-red Y. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("text-[22px] font-extrabold tracking-[-0.5px] text-white", className)}>
      FREITT<span className="text-brand">Y</span>
    </span>
  );
}
