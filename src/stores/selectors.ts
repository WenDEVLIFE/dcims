import type { Centavos } from "@/types/domain";
import type { DomainData } from "@/types/state";
import { calculateInventoryValue } from "@/lib/inventory";

/**
 * Derived selectors. Every dashboard figure comes from these functions, so a
 * number on screen can always be traced back to records.
 */

export interface DashboardStats {
  inventoryValueCentavos: Centavos;
  materialCount: number;
  warehouseCount: number;
  activeProjectCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  pendingRequestCount: number;
  openPurchaseOrderCount: number;
  availableEquipmentCount: number;
}

export function totalQuantityByMaterial(
  state: DomainData,
  materialId: string,
): number {
  return state.balances
    .filter((balance) => balance.materialId === materialId)
    .reduce((total, balance) => total + balance.quantity, 0);
}

export function inventoryValue(state: DomainData): Centavos {
  const entries = state.balances.flatMap((balance) => {
    const material = state.materials.find((item) => item.id === balance.materialId);
    if (!material) return [];
    return [
      {
        quantity: balance.quantity,
        unitCostCentavos: material.unitCostCentavos,
      },
    ];
  });

  return calculateInventoryValue(entries);
}

export function lowStockMaterials(state: DomainData) {
  return state.materials.filter((material) => {
    if (material.status === "discontinued") return false;
    const quantity = totalQuantityByMaterial(state, material.id);
    return quantity > 0 && quantity <= material.reorderPoint;
  });
}

export function outOfStockMaterials(state: DomainData) {
  return state.materials.filter((material) => {
    if (material.status === "discontinued") return false;
    return totalQuantityByMaterial(state, material.id) <= 0;
  });
}

export function selectDashboardStats(state: DomainData): DashboardStats {
  return {
    inventoryValueCentavos: inventoryValue(state),
    materialCount: state.materials.filter((material) => material.status === "active")
      .length,
    warehouseCount: state.warehouses.filter((warehouse) => warehouse.status === "active")
      .length,
    activeProjectCount: state.projects.filter((project) => project.status === "active")
      .length,
    lowStockCount: lowStockMaterials(state).length,
    outOfStockCount: outOfStockMaterials(state).length,
    pendingRequestCount: state.materialRequests.filter(
      (request) => request.status === "pending" || request.status === "approved",
    ).length,
    openPurchaseOrderCount: state.purchaseOrders.filter((order) =>
      ["pending", "approved", "ordered", "partially-received"].includes(order.status),
    ).length,
    availableEquipmentCount: state.equipment.filter(
      (asset) => asset.status === "available",
    ).length,
  };
}

export function balancesForMaterial(state: DomainData, materialId: string) {
  return state.balances.filter((balance) => balance.materialId === materialId);
}

export function movementsForMaterial(state: DomainData, materialId: string) {
  return state.stockMovements
    .filter((movement) => movement.materialId === materialId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function materialsByCategory(state: DomainData, categoryId: string) {
  return state.materials.filter((material) => material.categoryId === categoryId);
}
