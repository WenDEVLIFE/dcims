import type { Centavos, StockStatus } from "@/types/domain";

/**
 * Inventory arithmetic. Every monetary result is integer centavos, and every
 * function rejects input the domain layer should have validated rather than
 * returning a plausible-looking wrong number.
 */

function assertFiniteNonNegative(value: number, label: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${label} must be a finite non-negative number`);
  }
}

/**
 * Weighted-average unit cost after receiving stock.
 *
 * (currentQty × currentCost + incomingQty × incomingCost) / totalQty
 */
export function calculateWeightedAverageCost(params: {
  currentQuantity: number;
  currentUnitCostCentavos: Centavos;
  incomingQuantity: number;
  incomingUnitCostCentavos: Centavos;
}): Centavos {
  const {
    currentQuantity,
    currentUnitCostCentavos,
    incomingQuantity,
    incomingUnitCostCentavos,
  } = params;

  assertFiniteNonNegative(currentQuantity, "currentQuantity");
  assertFiniteNonNegative(incomingQuantity, "incomingQuantity");
  assertFiniteNonNegative(currentUnitCostCentavos, "currentUnitCostCentavos");
  assertFiniteNonNegative(incomingUnitCostCentavos, "incomingUnitCostCentavos");

  const totalQuantity = currentQuantity + incomingQuantity;
  if (totalQuantity === 0) return 0;

  const totalValue =
    currentQuantity * currentUnitCostCentavos +
    incomingQuantity * incomingUnitCostCentavos;

  return Math.round(totalValue / totalQuantity);
}

/** Sum of quantity × unit cost across balances, in centavos. */
export function calculateInventoryValue(
  entries: Array<{ quantity: number; unitCostCentavos: Centavos }>,
): Centavos {
  return entries.reduce((total, entry) => {
    assertFiniteNonNegative(entry.quantity, "quantity");
    assertFiniteNonNegative(entry.unitCostCentavos, "unitCostCentavos");
    return total + Math.round(entry.quantity * entry.unitCostCentavos);
  }, 0);
}

/**
 * Stock health for one material in one place. Quantity at or below zero is out
 * of stock; at or below the reorder point is low.
 */
export function resolveStockStatus(
  quantity: number,
  reorderPoint: number,
): StockStatus {
  if (!Number.isFinite(quantity) || quantity <= 0) return "out-of-stock";
  const threshold = Number.isFinite(reorderPoint) ? reorderPoint : 0;
  return quantity <= threshold ? "low-stock" : "in-stock";
}

/** Clamps a requested deduction to what is actually available. */
export function availableToRelease(
  availableQuantity: number,
  requestedQuantity: number,
): number {
  assertFiniteNonNegative(availableQuantity, "availableQuantity");
  assertFiniteNonNegative(requestedQuantity, "requestedQuantity");
  return Math.min(availableQuantity, requestedQuantity);
}
