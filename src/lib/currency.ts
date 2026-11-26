/**
 * Philippine peso helpers. Amounts are stored as integer centavos so financial
 * arithmetic never accumulates floating point error.
 *
 * Phase 05 extends this module with project costing and valuation helpers.
 */

const PHP_FORMATTER = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Formats integer centavos as a peso string, e.g. 125000 -> "₱1,250.00". */
export function formatCentavos(centavos: number): string {
  if (!Number.isFinite(centavos)) return PHP_FORMATTER.format(0);
  return PHP_FORMATTER.format(Math.round(centavos) / 100);
}

/** Formats a peso amount, e.g. 1250 -> "₱1,250.00". */
export function formatPesos(pesos: number): string {
  if (!Number.isFinite(pesos)) return PHP_FORMATTER.format(0);
  return PHP_FORMATTER.format(pesos);
}

/**
 * Parses user input into integer centavos. Accepts digits, commas, spaces, and
 * a single decimal separator; anything unparseable returns null so callers can
 * surface a validation error instead of silently storing zero.
 */
export function parseAmountToCentavos(input: string): number | null {
  const cleaned = input.replace(/[^\d.]/g, "");
  if (cleaned === "" || cleaned === ".") return null;

  const [wholePart = "", ...decimalParts] = cleaned.split(".");
  const whole = Number(wholePart === "" ? "0" : wholePart);
  if (!Number.isFinite(whole)) return null;

  const decimals = decimalParts.join("").slice(0, 2).padEnd(2, "0");
  const centavos = whole * 100 + Number(decimals);
  return Number.isFinite(centavos) ? Math.round(centavos) : null;
}

/** Converts integer centavos to a peso number for display-level math. */
export function centavosToPesos(centavos: number): number {
  return Math.round(centavos) / 100;
}
