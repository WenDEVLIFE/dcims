/**
 * Identifier and reference generators.
 *
 * Record references are deterministic: the caller supplies the sequence and
 * year, so seeded data reproduces byte-for-byte and tests can assert on exact
 * references. Only opaque entity ids use randomness.
 */

function padSequence(value: number, length: number): string {
  const safe = Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0;
  return String(safe).padStart(length, "0");
}

function slugify(value: string): string {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Opaque entity id. Uses Web Crypto when available. */
export function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** MAT-0001 */
export function generateMaterialSku(sequence: number): string {
  return `MAT-${padSequence(sequence, 4)}`;
}

/** EQP-0008 */
export function generateEquipmentAssetCode(sequence: number): string {
  return `EQP-${padSequence(sequence, 4)}`;
}

/** SUP-001 */
export function generateSupplierCode(sequence: number): string {
  return `SUP-${padSequence(sequence, 3)}`;
}

/** WH-MATINA-01 */
export function generateWarehouseCode(
  location: string,
  sequence: number,
): string {
  const slug = slugify(location) || "WAREHOUSE";
  return `WH-${slug}-${padSequence(sequence, 2)}`;
}

/** PRJ-2026-001 */
export function generateProjectCode(sequence: number, year: number): string {
  return `PRJ-${year}-${padSequence(sequence, 3)}`;
}

/** TXN-2026-0001 */
export function generateTransactionReference(
  sequence: number,
  year: number,
): string {
  return `TXN-${year}-${padSequence(sequence, 4)}`;
}

/** PO-2026-001 */
export function generatePurchaseOrderNumber(
  sequence: number,
  year: number,
): string {
  return `PO-${year}-${padSequence(sequence, 3)}`;
}

/** REQ-2026-015 */
export function generateMaterialRequestNumber(
  sequence: number,
  year: number,
): string {
  return `REQ-${year}-${padSequence(sequence, 3)}`;
}

/**
 * Next sequence for a collection of existing references, derived from the
 * numeric tail. Returns 1 for an empty collection.
 */
export function nextSequence(references: string[]): number {
  const highest = references.reduce((max, reference) => {
    const match = /(\d+)$/.exec(reference);
    if (!match) return max;
    const value = Number(match[1]);
    return Number.isFinite(value) ? Math.max(max, value) : max;
  }, 0);

  return highest + 1;
}
