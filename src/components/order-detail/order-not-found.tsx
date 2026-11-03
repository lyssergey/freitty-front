import { PackageX } from "lucide-react";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

/** API answered 404 — unknown number, or an order of another company. */
export function OrderNotFound({ number }: { number: string }) {
  return (
    <EmptyState
      className="mt-2"
      icon={<PackageX />}
      title={`Order ${number} not found`}
      description="Check the number — the order may have been deleted or belong to another company."
      action={
        <Link href="/orders" className={buttonClasses({ variant: "secondary", size: "sm" })}>
          ← Back to orders
        </Link>
      }
    />
  );
}
