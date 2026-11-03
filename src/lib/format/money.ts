/** Money is integer cents on the wire; the UI shows en-US dollars. */

const USD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

const USD_WHOLE = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** `123450` → `"$1,234.50"`. */
export function formatMoney(cents: number): string {
  return USD.format(cents / 100);
}

/** `123450` → `"$1,235"` — for chart headers and summaries where cents are noise. */
export function formatMoneyWhole(cents: number): string {
  return USD_WHOLE.format(Math.round(cents / 100));
}

/** `18` → `"+18%"`, `-5` → `"-5%"`, `0` → `"0%"`. */
export function formatChangePct(pct: number): string {
  if (pct > 0) return `+${pct}%`;
  return `${pct}%`;
}
