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

/* ------------------------------------------------------------------ */
/* Dashboard analytics                                                 */
/* ------------------------------------------------------------------ */

/**
 * Months are derived from the dataset, not from the current clock, so the
 * dashboard renders identically on the server and after hydration.
 */
function recentMonths(state: DomainData, count: number): string[] {
  const latest = state.stockMovements.reduce(
    (max, movement) => (movement.createdAt > max ? movement.createdAt : max),
    state.stockMovements[0]?.createdAt ?? "2026-01-01T00:00:00.000Z",
  );

  const anchor = new Date(latest);
  const months: string[] = [];
  for (let offset = count - 1; offset >= 0; offset -= 1) {
    const date = new Date(
      Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth() - offset, 1),
    );
    months.push(
      `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`,
    );
  }
  return months;
}

export interface SeriesPoint {
  label: string;
  value: number;
}

/**
 * Transaction counts per month. Counts are used instead of summed quantities
 * because materials are measured in different units and cannot be added.
 */
export function monthlyMovementCounts(
  state: DomainData,
  monthCount = 6,
): SeriesPoint[] {
  const months = recentMonths(state, monthCount);

  return months.map((month) => {
    const label = new Intl.DateTimeFormat("en-PH", {
      month: "short",
      year: "2-digit",
      timeZone: "Asia/Manila",
    }).format(new Date(`${month}-01T00:00:00Z`));

    return {
      label,
      value: state.stockMovements.filter((movement) =>
        movement.createdAt.startsWith(month),
      ).length,
    };
  });
}

export function inventoryValueByCategory(state: DomainData): SeriesPoint[] {
  const totals = new Map<string, number>();

  for (const balance of state.balances) {
    const material = state.materials.find((item) => item.id === balance.materialId);
    if (!material) continue;
    const value = Math.round(balance.quantity * material.unitCostCentavos);
    totals.set(material.categoryId, (totals.get(material.categoryId) ?? 0) + value);
  }

  return [...totals.entries()]
    .map(([categoryId, value]) => ({
      label:
        state.categories.find((category) => category.id === categoryId)?.name ??
        "Uncategorised",
      value,
    }))
    .sort((left, right) => right.value - left.value);
}

export function inventoryValueByWarehouse(state: DomainData): SeriesPoint[] {
  const totals = new Map<string, number>();

  for (const balance of state.balances) {
    const material = state.materials.find((item) => item.id === balance.materialId);
    if (!material) continue;
    const value = Math.round(balance.quantity * material.unitCostCentavos);
    totals.set(balance.warehouseId, (totals.get(balance.warehouseId) ?? 0) + value);
  }

  return [...totals.entries()]
    .map(([warehouseId, value]) => ({
      label:
        state.warehouses.find((warehouse) => warehouse.id === warehouseId)?.name ??
        "Unknown",
      value,
    }))
    .sort((left, right) => right.value - left.value);
}

/** Project material spend, from stock-outs tagged with a project. */
export function projectExpenditure(state: DomainData): SeriesPoint[] {
  const totals = new Map<string, number>();

  for (const movement of state.stockMovements) {
    if (!movement.projectId) continue;
    if (movement.type !== "stock-out") continue;
    totals.set(
      movement.projectId,
      (totals.get(movement.projectId) ?? 0) + movement.totalCostCentavos,
    );
  }

  return [...totals.entries()]
    .map(([projectId, value]) => ({
      label:
        state.projects.find((project) => project.id === projectId)?.name ?? "Project",
      value,
    }))
    .sort((left, right) => right.value - left.value)
    .slice(0, 6);
}

export function procurementTrend(
  state: DomainData,
  monthCount = 6,
): SeriesPoint[] {
  const months = recentMonths(state, monthCount);

  return months.map((month) => {
    const label = new Intl.DateTimeFormat("en-PH", {
      month: "short",
      year: "2-digit",
      timeZone: "Asia/Manila",
    }).format(new Date(`${month}-01T00:00:00Z`));

    return {
      label,
      value: state.purchaseOrders
        .filter((order) => order.createdAt.startsWith(month))
        .reduce((total, order) => total + order.totalCentavos, 0),
    };
  });
}

export function filterByDateRange<T>(
  items: T[],
  getTimestamp: (item: T) => string,
  range: { from?: Date; to?: Date } | undefined,
): T[] {
  if (!range?.from) return items;

  const from = range.from.getTime();
  const to = range.to ? new Date(range.to).setHours(23, 59, 59, 999) : Infinity;

  return items.filter((item) => {
    const time = Date.parse(getTimestamp(item));
    return time >= from && time <= to;
  });
}

export function upcomingMaintenance(state: DomainData) {
  return state.maintenanceRecords
    .filter((record) => !record.completedAt)
    .sort((left, right) => right.startedAt.localeCompare(left.startedAt));
}

export function recentMovements(state: DomainData, limit = 6) {
  return [...state.stockMovements]
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, limit);
}

export function openRequests(state: DomainData) {
  return state.materialRequests.filter((request) =>
    ["pending", "approved", "partially-fulfilled"].includes(request.status),
  );
}

export function activeProjects(state: DomainData) {
  return state.projects.filter((project) => project.status === "active");
}

export function recentActivity(state: DomainData, limit = 6) {
  return [...state.activityLogs]
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, limit);
}
