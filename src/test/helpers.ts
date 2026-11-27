import { initialDemoData } from "@/data/seed";
import type { DomainData } from "@/types/state";

/**
 * Test helpers. Services are pure functions over DomainData, so each test gets
 * a fresh clone of the seed and no shared mutable state can leak between tests.
 */

export function seedData(): DomainData {
  const { version: _version, exportedAt: _exportedAt, ...rest } =
    structuredClone(initialDemoData);
  void _version;
  void _exportedAt;
  return rest;
}

export const ctx = {
  now: "2026-11-27T09:00:00.000Z",
  actor: "Test runner",
};

export function quantityAt(
  data: DomainData,
  materialId: string,
  warehouseId: string,
): number {
  return (
    data.balances.find(
      (balance) =>
        balance.materialId === materialId && balance.warehouseId === warehouseId,
    )?.quantity ?? 0
  );
}

export function totalQuantity(data: DomainData, materialId: string): number {
  return data.balances
    .filter((balance) => balance.materialId === materialId)
    .reduce((total, balance) => total + balance.quantity, 0);
}

/** A material/warehouse pair guaranteed to hold stock in the seed. */
export function stockedPair(data: DomainData): {
  materialId: string;
  warehouseId: string;
  quantity: number;
} {
  const balance = [...data.balances].sort(
    (left, right) => right.quantity - left.quantity,
  )[0];
  return {
    materialId: balance.materialId,
    warehouseId: balance.warehouseId,
    quantity: balance.quantity,
  };
}
