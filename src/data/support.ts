/**
 * Shared helpers for the seed dataset. Timestamps are derived from a fixed
 * base date so the demo always renders the same history.
 */

/** 2026-01-05T08:00:00+08:00 — start of the demo timeline. */
export const BASE_TIMESTAMP = Date.parse("2026-01-05T08:00:00+08:00");

const MANILA_OFFSET_MS = 8 * 60 * 60 * 1000;

/** ISO timestamp `dayOffset` days after the base date, at the given clock time. */
export function isoAt(
  dayOffset: number,
  hour = 8,
  minute = 0,
): string {
  const utcMs =
    BASE_TIMESTAMP - MANILA_OFFSET_MS + dayOffset * 86_400_000 + hour * 3_600_000 + minute * 60_000;
  return new Date(utcMs).toISOString();
}

/** Calendar date `dayOffset` days after the base date, as YYYY-MM-DD. */
export function dateAt(dayOffset: number): string {
  return isoAt(dayOffset, 0).slice(0, 10);
}

/** Stable created/updated pair. */
export function audit(isoTimestamp: string): {
  createdAt: string;
  updatedAt: string;
} {
  return { createdAt: isoTimestamp, updatedAt: isoTimestamp };
}
