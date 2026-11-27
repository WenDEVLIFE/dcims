import type { Centavos } from "@/types/domain";

/**
 * Project costing. Consumption records already carry their cost snapshot, so
 * these helpers only aggregate; they never re-derive historical prices.
 */

export interface ConsumptionInput {
  quantity: number;
  unitCostCentavos: Centavos;
}

export function calculateProjectMaterialCost(
  consumptions: ConsumptionInput[],
): Centavos {
  return consumptions.reduce((total, entry) => {
    if (!Number.isFinite(entry.quantity) || entry.quantity < 0) {
      throw new RangeError("quantity must be a finite non-negative number");
    }
    if (!Number.isFinite(entry.unitCostCentavos) || entry.unitCostCentavos < 0) {
      throw new RangeError("unitCostCentavos must be a finite non-negative number");
    }
    return total + Math.round(entry.quantity * entry.unitCostCentavos);
  }, 0);
}

/** Remaining budget, never below zero. */
export function calculateRemainingBudget(
  budgetCentavos: Centavos,
  consumedCentavos: Centavos,
): Centavos {
  if (!Number.isFinite(budgetCentavos) || budgetCentavos < 0) {
    throw new RangeError("budgetCentavos must be a finite non-negative number");
  }
  if (!Number.isFinite(consumedCentavos) || consumedCentavos < 0) {
    throw new RangeError("consumedCentavos must be a finite non-negative number");
  }
  return Math.max(0, budgetCentavos - consumedCentavos);
}
