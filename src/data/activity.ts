import type { ActivityLog, Notification } from "@/types/domain";
import { isoAt } from "@/data/support";
import { materials } from "@/data/materials";
import { warehouses } from "@/data/warehouses";
import { equipment } from "@/data/equipment";
import type { InventorySeed } from "@/data/inventory";

/**
 * Activity entries are derived from records that already exist, so the log can
 * never describe an operation the dataset does not contain.
 */

const PERFORMER = "Demo user";

export function buildActivityLogs(seed: InventorySeed): ActivityLog[] {
  const logs: ActivityLog[] = [];

  // Recent movements, newest last in the array so the feed reads newest first
  // after sorting. Only the last 24 keep the log readable.
  const recentMovements = seed.movements.slice(-24);

  recentMovements.forEach((movement, index) => {
    const material = materials.find((item) => item.id === movement.materialId);
    const warehouse = warehouses.find((item) => item.id === movement.warehouseId);
    if (!material || !warehouse) return;

    const verbByType: Record<string, string> = {
      "stock-in": "Received",
      "stock-out": "Released",
      transfer: "Transferred",
      adjustment: "Adjusted",
      return: "Returned",
    };

    logs.push({
      id: `act-mv-${index + 1}`,
      action: `${verbByType[movement.type] ?? "Moved"} ${material.name}`,
      entityType: "stock-movement",
      entityId: movement.id,
      description: `${movement.reference}: ${movement.quantity} ${material.unit} of ${material.name} at ${warehouse.name}.`,
      performedBy: movement.performedBy,
      createdAt: movement.createdAt,
    });
  });

  seed.materialRequests.slice(-4).forEach((request, index) => {
    logs.push({
      id: `act-req-${index + 1}`,
      action: `Material request ${request.status.replace("-", " ")}`,
      entityType: "material-request",
      entityId: request.id,
      description: `${request.reference} is ${request.status} for project ${request.projectId}.`,
      performedBy: request.reviewedBy ?? request.requestedBy,
      createdAt: request.reviewedAt ?? request.requestedAt,
    });
  });

  seed.purchaseOrders.slice(-4).forEach((order, index) => {
    logs.push({
      id: `act-po-${index + 1}`,
      action: `Purchase order ${order.status.replace("-", " ")}`,
      entityType: "purchase-order",
      entityId: order.id,
      description: `${order.reference} moved to ${order.status}.`,
      performedBy: PERFORMER,
      createdAt: order.updatedAt,
    });
  });

  equipment.slice(0, 2).forEach((asset, index) => {
    logs.push({
      id: `act-eqp-${index + 1}`,
      action: `Equipment ${asset.status.replace("-", " ")}`,
      entityType: "equipment",
      entityId: asset.id,
      description: `${asset.assetCode} ${asset.name} is ${asset.status} at ${asset.location}.`,
      performedBy: PERFORMER,
      createdAt: asset.updatedAt,
    });
  });

  return logs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/**
 * Notifications reference conditions the demo data actually satisfies: low
 * stock comes from real balances, pending requests from real request records.
 */
export function buildNotifications(seed: InventorySeed): Notification[] {
  // Low stock compares against each material's own reorder point, so the
  // notification matches what the materials table will show.
  const lowStock = seed.balances
    .filter((balance) => {
      const material = materials.find((item) => item.id === balance.materialId);
      return material ? balance.quantity <= material.reorderPoint : false;
    })
    .slice(0, 4);

  const notifications: Notification[] = lowStock.map((balance, index) => {
    const material = materials.find((item) => item.id === balance.materialId);
    return {
      id: `notif-${String(index + 1).padStart(3, "0")}`,
      type: "warning",
      title: "Low stock",
      message: `${material?.name ?? "Material"} is down to ${balance.quantity} units.`,
      read: index !== 0,
      createdAt: isoAt(96 + index, 8, 15),
      link: "/materials",
    };
  });

  const pending = seed.materialRequests.filter((request) => request.status === "pending");
  if (pending.length > 0) {
    notifications.push({
      id: "notif-010",
      type: "info",
      title: "Requests awaiting review",
      message: `${pending.length} material requests are pending approval.`,
      read: false,
      createdAt: isoAt(99, 9, 45),
      link: "/material-requests",
    });
  }

  return notifications;
}
