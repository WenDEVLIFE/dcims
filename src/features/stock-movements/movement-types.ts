import type { StockMovementType } from "@/types/domain";

export const movementLabels: Record<StockMovementType, string> = {
  "stock-in": "Stock in",
  "stock-out": "Stock out",
  transfer: "Transfer",
  adjustment: "Adjustment",
  return: "Material return",
};

export const movementActions: Record<StockMovementType, string> = {
  "stock-in": "Receive stock",
  "stock-out": "Release stock",
  transfer: "Transfer stock",
  adjustment: "Adjust stock",
  return: "Return material",
};
