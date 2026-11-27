import type { Centavos } from "@/types/domain";

/**
 * Purchase order arithmetic. Line totals are rounded once per line, then
 * summed, so a printed total always equals the sum of the printed lines.
 */

export interface PurchaseOrderLineInput {
  orderedQuantity: number;
  unitCostCentavos: Centavos;
}

export interface PurchaseOrderTotals {
  subtotalCentavos: Centavos;
  discountCentavos: Centavos;
  deliveryFeeCentavos: Centavos;
  totalCentavos: Centavos;
}

export function calculateLineTotal(line: PurchaseOrderLineInput): Centavos {
  const { orderedQuantity, unitCostCentavos } = line;
  if (!Number.isFinite(orderedQuantity) || orderedQuantity < 0) {
    throw new RangeError("orderedQuantity must be a finite non-negative number");
  }
  if (!Number.isFinite(unitCostCentavos) || unitCostCentavos < 0) {
    throw new RangeError("unitCostCentavos must be a finite non-negative number");
  }
  return Math.round(orderedQuantity * unitCostCentavos);
}

export function calculatePurchaseOrderTotals(
  lines: PurchaseOrderLineInput[],
  options: { discountCentavos?: Centavos; deliveryFeeCentavos?: Centavos } = {},
): PurchaseOrderTotals {
  const subtotalCentavos = lines.reduce(
    (total, line) => total + calculateLineTotal(line),
    0,
  );

  const rawDiscount = options.discountCentavos ?? 0;
  const rawDeliveryFee = options.deliveryFeeCentavos ?? 0;

  if (!Number.isFinite(rawDiscount) || rawDiscount < 0) {
    throw new RangeError("discountCentavos must be a finite non-negative number");
  }
  if (!Number.isFinite(rawDeliveryFee) || rawDeliveryFee < 0) {
    throw new RangeError("deliveryFeeCentavos must be a finite non-negative number");
  }

  // A discount larger than the subtotal would produce a negative payable
  // amount, which the demo never models.
  const discountCentavos = Math.min(rawDiscount, subtotalCentavos);
  const totalCentavos = Math.max(
    0,
    subtotalCentavos - discountCentavos + rawDeliveryFee,
  );

  return {
    subtotalCentavos,
    discountCentavos,
    deliveryFeeCentavos: rawDeliveryFee,
    totalCentavos,
  };
}
