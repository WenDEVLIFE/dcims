import type { Centavos, InventoryBalance, StockStatus } from "@/types/domain";
import type { DomainData } from "@/types/state";

/** Legacy balances inherit the catalogue cost until normalized. */
export function balanceUnitCost(
  balance: { unitCostCentavos?: Centavos } | undefined,
  fallback: Centavos,
): Centavos {
  return balance?.unitCostCentavos ?? fallback;
}

/** Preserve legacy valuation while creating independent warehouse and project costs. */
export function normalizeInventoryCosts(data: DomainData): Pick<DomainData, "balances" | "projectMaterials"> {
  const costs = new Map(data.materials.map((material) => [material.id, material.unitCostCentavos]));
  const normalize = <T extends { materialId: string; unitCostCentavos?: Centavos }>(balance: T): T =>
    balance.unitCostCentavos === undefined
      ? { ...balance, unitCostCentavos: costs.get(balance.materialId) ?? 0 }
      : balance;
  return {
    balances: data.balances.map(normalize),
    projectMaterials: data.projectMaterials.map(normalize),
  };
}

export function summariseMaterialInventory(balances: InventoryBalance[], fallback: Centavos) {
  let quantity = 0;
  let value = 0;
  for (const balance of balances) {
    quantity += balance.quantity;
    value += Math.round(balance.quantity * balanceUnitCost(balance, fallback));
  }
  return { quantity, value, averageCost: quantity > 0 ? Math.round(value / quantity) : fallback };
}

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
