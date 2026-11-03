import { Button } from "@/components/ui/button";

interface OrdersPaginationProps {
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}

/** "Showing 1–12 of 32" + ← Prev / Next →. */
export function OrdersPagination({
  page,
  pageSize,
  total,
  pageCount,
  onPageChange,
}: OrdersPaginationProps) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  return (
    <nav
      aria-label="Pagination"
      className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-ink-muted"
    >
      <p aria-live="polite">
        Showing {from}–{to} of {total}
      </p>
      <div className="flex gap-1">
        <Button
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          ← Prev
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          Next →
        </Button>
      </div>
    </nav>
  );
}
