import type { CarrierSummary } from "@/lib/api/types";
import type { DisplayVariant } from "./quantity";

/**
 * Who moves the cargo:
 *   carrier     → carrier name ("Schneider")
 *   driver      → "Driver: User 5"  (compact "User 5")
 *   self_pickup → "Self pickup"     (compact "Self")
 *   none        → "—"
 */
export function formatCarrier(
  carrier: CarrierSummary | null,
  variant: DisplayVariant = "full",
): string {
  if (!carrier) return "—";
  switch (carrier.mode) {
    case "carrier":
      return carrier.name ?? "—";
    case "driver": {
      const name = carrier.driver?.name ?? carrier.name;
      if (!name) return "Driver";
      return variant === "full" ? `Driver: ${name}` : name;
    }
    case "self_pickup":
      return variant === "full" ? "Self pickup" : "Self";
  }
}
