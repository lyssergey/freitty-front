import type { CargoSummary } from "@/lib/api/types";
import { describeQuantity, type DisplayVariant } from "@/lib/format/quantity";

/** Q-ty value with the counted quantity highlighted in orange when it differs from the BOL. */
export function QuantityValue({
  cargo,
  variant,
}: {
  cargo: readonly CargoSummary[];
  variant: DisplayVariant;
}) {
  const view = describeQuantity(cargo, variant);
  switch (view.kind) {
    case "none":
      return <>—</>;
    case "plain":
      return <>{view.text}</>;
    case "mismatch":
      return (
        <>
          {view.declared} · <span className="text-attention">{view.actual}</span>
        </>
      );
  }
}
