import type {
  ActivityLog,
  ActivityEntityType,
  Centavos,
  InventoryBalance,
  Notification,
} from "@/types/domain";
import type { DomainData } from "@/types/state";
import { generateId } from "@/lib/ids";
import { balanceUnitCost, calculateWeightedAverageCost } from "@/lib/inventory";

/**
 * Shared plumbing for domain services. Every helper returns new objects —
 * nothing here mutates the state it receives.
 */

export interface OperationContext {
  /** ISO timestamp supplied by the caller so operations stay testable. */
  now: string;
  actor: string;
}

export function balanceFor(
  data: DomainData,
  materialId: string,
  warehouseId: string,
): InventoryBalance | undefined {
  return data.balances.find(
    (balance) =>
      balance.materialId === materialId && balance.warehouseId === warehouseId,
  );
}

export function quantityAt(
  data: DomainData,
  materialId: string,
  warehouseId: string,
): number {
  return balanceFor(data, materialId, warehouseId)?.quantity ?? 0;
}

/** Returns balances with the given delta applied, dropping emptied rows. */
export function adjustBalance(
  balances: InventoryBalance[],
  materialId: string,
  warehouseId: string,
  delta: number,
  now: string,
  unitCostCentavos?: Centavos,
): InventoryBalance[] {
  const index = balances.findIndex(
    (balance) =>
      balance.materialId === materialId && balance.warehouseId === warehouseId,
  );

  if (index === -1) {
    if (delta <= 0) return balances;
    return [
      ...balances,
      {
        id: `bal-${materialId}-${warehouseId}`,
        materialId,
        warehouseId,
        quantity: delta,
        unitCostCentavos,
        updatedAt: now,
      },
    ];
  }

  const nextQuantity = balances[index].quantity + delta;
  if (nextQuantity <= 0) {
    return balances.filter((_, position) => position !== index);
  }

  return balances.map((balance, position) =>
    position === index
      ? { ...balance, quantity: nextQuantity, unitCostCentavos: unitCostCentavos ?? balance.unitCostCentavos, updatedAt: now }
      : balance,
  );
}

/** Adds stock at its carrying cost without rewriting consumption history. */
export function allocateProjectStock(
  allocations: DomainData["projectMaterials"],
  projectId: string,
  materialId: string,
  quantity: number,
  unitCostCentavos: Centavos,
  fallbackCost: Centavos,
  now: string,
): DomainData["projectMaterials"] {
  const existing = allocations.find((item) => item.projectId === projectId && item.materialId === materialId);
  if (!existing) return [...allocations, {
    id: `pm-${projectId}-${materialId}`,
    projectId, materialId, quantity, unitCostCentavos, consumedQuantity: 0, updatedAt: now,
  }];

  const updated = {
    ...existing,
    quantity: existing.quantity + quantity,
    unitCostCentavos: calculateWeightedAverageCost({
      currentQuantity: existing.quantity,
      currentUnitCostCentavos: balanceUnitCost(existing, fallbackCost),
      incomingQuantity: quantity,
      incomingUnitCostCentavos: unitCostCentavos,
    }),
    updatedAt: now,
  };
  return allocations.map((item) => item.id === existing.id ? updated : item);
}

export function appendActivity(
  data: DomainData,
  activity: {
    action: string;
    entityType: ActivityEntityType;
    entityId: string;
    description: string;
    now: string;
    actor: string;
  },
): ActivityLog[] {
  const entry: ActivityLog = {
    id: generateId(),
    action: activity.action,
    entityType: activity.entityType,
    entityId: activity.entityId,
    description: activity.description,
    performedBy: activity.actor,
    createdAt: activity.now,
  };
  return [entry, ...data.activityLogs];
}

/**
 * Appends a notification unless an identical unread one already exists.
 * Repeating the same operation must not stack duplicate alerts.
 */
export function appendNotification(
  data: DomainData,
  notification: {
    type: Notification["type"];
    title: string;
    message: string;
    now: string;
    link?: string;
  },
): Notification[] {
  const duplicate = data.notifications.some(
    (entry) =>
      !entry.read &&
      entry.title === notification.title &&
      entry.message === notification.message,
  );
  if (duplicate) return data.notifications;

  const entry: Notification = {
    id: generateId(),
    type: notification.type,
    title: notification.title,
    message: notification.message,
    read: false,
    createdAt: notification.now,
    link: notification.link,
  };
  return [entry, ...data.notifications].slice(0, 50);
}

export function totalCost(quantity: number, unitCostCentavos: Centavos): Centavos {
  return Math.round(quantity * unitCostCentavos);
}
