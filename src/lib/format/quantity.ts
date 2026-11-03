/**
 * Cargo quantity wording. An order's cargo is aggregated per unit type (standard, xl):
 *
 *   full    single "23 × Standard"   multi "15 × Std + 12 × XL"   mismatch "20 decl · 18 actual"
 *   compact single "23 × Std"        multi "15 Std + 12 XL"       mismatch "20 decl · 18 act"
 *
 * A mismatch means the warehouse counted something different from the BOL for any unit type.
 */
import type { CargoSummary, UnitType } from "@/lib/api/types";
import { UNIT_META } from "@/lib/domain/labels";

export type DisplayVariant = "full" | "compact";

export type QuantityView =
  | { kind: "none" }
  | { kind: "plain"; text: string }
  | { kind: "mismatch"; declared: string; actual: string };

const UNIT_ORDER: Record<UnitType, number> = { standard: 0, xl: 1 };

/** Standard first, then XL; empty lines dropped. */
export function normalizeCargo(cargo: readonly CargoSummary[]): CargoSummary[] {
  return cargo
    .filter((line) => line.declared > 0 || (line.actual ?? 0) > 0)
    .sort((a, b) => UNIT_ORDER[a.unitType] - UNIT_ORDER[b.unitType]);
}

export function totalDeclared(cargo: readonly CargoSummary[]): number {
  return cargo.reduce((sum, line) => sum + line.declared, 0);
}

/** Counted total; lines not counted yet fall back to their declared quantity. */
export function totalActual(cargo: readonly CargoSummary[]): number | null {
  if (cargo.every((line) => line.actual === null)) return null;
  return cargo.reduce((sum, line) => sum + (line.actual ?? line.declared), 0);
}

export function hasQuantityMismatch(cargo: readonly CargoSummary[]): boolean {
  return cargo.some((line) => line.actual !== null && line.actual !== line.declared);
}

export function describeQuantity(
  cargo: readonly CargoSummary[],
  variant: DisplayVariant,
): QuantityView {
  const lines = normalizeCargo(cargo);
  if (lines.length === 0) return { kind: "none" };

  if (hasQuantityMismatch(lines)) {
    return {
      kind: "mismatch",
      declared: `${totalDeclared(lines)} decl`,
      actual: `${totalActual(lines) ?? 0} ${variant === "full" ? "actual" : "act"}`,
    };
  }

  const [single] = lines;
  if (lines.length === 1 && single) {
    const unit = UNIT_META[single.unitType];
    return {
      kind: "plain",
      text: `${single.declared} × ${variant === "full" ? unit.long : unit.short}`,
    };
  }

  const joiner = variant === "full" ? " × " : " ";
  return {
    kind: "plain",
    text: lines
      .map((line) => `${line.declared}${joiner}${UNIT_META[line.unitType].short}`)
      .join(" + "),
  };
}

/** Plain-text form (e.g. for titles and tests). */
export function quantityText(cargo: readonly CargoSummary[], variant: DisplayVariant): string {
  const view = describeQuantity(cargo, variant);
  switch (view.kind) {
    case "none":
      return "—";
    case "plain":
      return view.text;
    case "mismatch":
      return `${view.declared} · ${view.actual}`;
  }
}

/** `"10 Std · 48×40"` — one cargo line with its pallet footprint. */
export function unitWithSize(unitType: UnitType, variant: "long" | "short" = "short"): string {
  const unit = UNIT_META[unitType];
  return `${variant === "long" ? unit.long : unit.short} · ${unit.size}`;
}

/** `"Standard (48×40)"` — operations table. */
export function unitLongWithSize(unitType: UnitType): string {
  const unit = UNIT_META[unitType];
  return `${unit.long} (${unit.size})`;
}

/** `"+2"`, `"-1"`. */
export function formatDelta(diff: number): string {
  return diff > 0 ? `+${diff}` : `${diff}`;
}
