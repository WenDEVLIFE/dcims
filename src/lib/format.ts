import type { MaterialUnit } from "@/types/domain";

/**
 * Locale-aware formatters. All dates render in Asia/Manila regardless of the
 * viewer's timezone so a timestamp means the same thing everywhere.
 */

const DATE_FORMATTER = new Intl.DateTimeFormat("en-PH", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "Asia/Manila",
});

const TIME_FORMATTER = new Intl.DateTimeFormat("en-PH", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "Asia/Manila",
});

const NUMBER_FORMATTER = new Intl.NumberFormat("en-PH", {
  maximumFractionDigits: 3,
});

const UNIT_LABELS: Record<MaterialUnit, string> = {
  bag: "bags",
  piece: "pcs",
  "cubic-meter": "m³",
  "square-meter": "m²",
  kilogram: "kg",
  liter: "L",
  roll: "rolls",
  sheet: "sheets",
  length: "lengths",
  set: "sets",
};

function toDate(value: string | Date): Date | null {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** "Nov 25, 2026" */
export function formatDate(value: string | Date): string {
  const date = toDate(value);
  return date ? DATE_FORMATTER.format(date) : "—";
}

/** "1:30 PM" */
export function formatTime(value: string | Date): string {
  const date = toDate(value);
  return date ? TIME_FORMATTER.format(date) : "—";
}

/** "Nov 25, 2026, 1:30 PM" */
export function formatDateTime(value: string | Date): string {
  const date = toDate(value);
  return date
    ? `${DATE_FORMATTER.format(date)}, ${TIME_FORMATTER.format(date)}`
    : "—";
}

/** "1,250" / "2.75" */
export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "0";
  return NUMBER_FORMATTER.format(value);
}

/** "1,250 bags" */
export function formatQuantity(
  quantity: number,
  unit: MaterialUnit | string,
): string {
  const label =
    unit in UNIT_LABELS ? UNIT_LABELS[unit as MaterialUnit] : String(unit);
  return `${formatNumber(quantity)} ${label}`;
}

export function unitLabel(unit: MaterialUnit | string): string {
  return unit in UNIT_LABELS ? UNIT_LABELS[unit as MaterialUnit] : String(unit);
}
