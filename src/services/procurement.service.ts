import type { PurchaseOrder, PurchaseOrderItem } from "@/types/domain";
import type { DomainData } from "@/types/state";
import { fail, succeed, type DomainResult } from "@/lib/result";
import { generateId, generatePurchaseOrderNumber, nextSequence } from "@/lib/ids";
import { calculatePurchaseOrderTotals } from "@/lib/procurement";
import { recordStockIn } from "@/services/inventory.service";
import { appendActivity, type OperationContext } from "@/services/support";

/**
 * Purchase order lifecycle.
 *
 * Receiving is the only step that creates stock, and it reuses the inventory
 * service so weighted-average costing and movement records stay consistent with
 * every other stock-in path.
 */

const YEAR = 2026;

export interface CreatePurchaseOrderInput {
  supplierId: string;
  warehouseId: string;
  items: Array<{
    materialId: string;
    orderedQuantity: number;
    unitCostCentavos: number;
  }>;
  discountCentavos?: number;
  deliveryFeeCentavos?: number;
  expectedDeliveryDate?: string;
  notes?: string;
}

export function createPurchaseOrder(
  data: DomainData,
  input: CreatePurchaseOrderInput,
  ctx: OperationContext,
): DomainResult<DomainData> {
  const supplier = data.suppliers.find((item) => item.id === input.supplierId);
  if (!supplier) return fail("Supplier not found");
  if (supplier.status === "inactive") {
    return fail("Inactive suppliers cannot receive new orders");
  }

  const warehouse = data.warehouses.find((item) => item.id === input.warehouseId);
  if (!warehouse) return fail("Destination warehouse not found");
  if (warehouse.status === "inactive") return fail("Destination warehouse is inactive");

  if (input.items.length === 0) return fail("Add at least one material");

  const items: PurchaseOrderItem[] = [];
  for (const [index, line] of input.items.entries()) {
    const material = data.materials.find((item) => item.id === line.materialId);
    if (!material) return fail("One of the selected materials no longer exists");
    if (!Number.isFinite(line.orderedQuantity) || line.orderedQuantity <= 0) {
      return fail(`Ordered quantity for ${material.name} must be greater than zero`);
    }
    if (!Number.isSafeInteger(line.unitCostCentavos) || line.unitCostCentavos < 0) {
      return fail(`Unit cost for ${material.name} must be a non-negative whole number of centavos`);
    }

    items.push({
      id: `poi-${generateId().slice(0, 8)}-${index + 1}`,
      materialId: material.id,
      orderedQuantity: line.orderedQuantity,
      receivedQuantity: 0,
      unitCostCentavos: line.unitCostCentavos,
    });
  }

  const totals = calculatePurchaseOrderTotals(items, {
    discountCentavos: input.discountCentavos,
    deliveryFeeCentavos: input.deliveryFeeCentavos,
  });

  const sequence = nextSequence(data.purchaseOrders.map((order) => order.reference));
  const order: PurchaseOrder = {
    id: generateId(),
    reference: generatePurchaseOrderNumber(sequence, YEAR),
    supplierId: supplier.id,
    warehouseId: warehouse.id,
    status: "draft",
    items,
    ...totals,
    expectedDeliveryDate: input.expectedDeliveryDate,
    notes: input.notes,
    createdAt: ctx.now,
    updatedAt: ctx.now,
  };

  return succeed({
    ...data,
    purchaseOrders: [order, ...data.purchaseOrders],
    activityLogs: appendActivity(data, {
      action: "Purchase order created",
      entityType: "purchase-order",
      entityId: order.id,
      description: `${order.reference} drafted for ${supplier.name}.`,
      now: ctx.now,
      actor: ctx.actor,
    }),
  });
}

export function approvePurchaseOrder(
  data: DomainData,
  orderId: string,
  ctx: OperationContext,
): DomainResult<DomainData> {
  const order = data.purchaseOrders.find((entry) => entry.id === orderId);
  if (!order) return fail("Purchase order not found");
  if (!["draft", "pending"].includes(order.status)) {
    return fail(`Only draft or pending orders can be approved (current: ${order.status})`);
  }

  const updated: PurchaseOrder = {
    ...order,
    status: "approved",
    updatedAt: ctx.now,
  };

  return succeed({
    ...data,
    purchaseOrders: data.purchaseOrders.map((entry) =>
      entry.id === orderId ? updated : entry,
    ),
    activityLogs: appendActivity(data, {
      action: "Purchase order approved",
      entityType: "purchase-order",
      entityId: updated.id,
      description: `${updated.reference} approved for ${updated.items.length} line(s).`,
      now: ctx.now,
      actor: ctx.actor,
    }),
  });
}

export interface ReceivePurchaseOrderInput {
  orderId: string;
  /** Quantity received now, per purchase order item id. */
  receipts: Record<string, number>;
}

export function receivePurchaseOrder(
  data: DomainData,
  input: ReceivePurchaseOrderInput,
  ctx: OperationContext,
): DomainResult<DomainData> {
  const order = data.purchaseOrders.find((entry) => entry.id === input.orderId);
  if (!order) return fail("Purchase order not found");

  if (order.status === "cancelled") return fail("Cancelled orders cannot receive stock");
  if (order.status === "received") return fail("This order is already fully received");
  if (!["approved", "ordered", "partially-received"].includes(order.status)) {
    return fail(`Receive an approved or ordered purchase order (current: ${order.status})`);
  }

  const lines = Object.entries(input.receipts).filter(([, quantity]) => quantity > 0);
  if (lines.length === 0) return fail("Enter a received quantity for at least one line");

  let next = data;

  for (const [itemId, quantity] of lines) {
    const item = order.items.find((entry) => entry.id === itemId);
    if (!item) return fail("Unknown purchase order line");

    const outstanding = item.orderedQuantity - item.receivedQuantity;
    if (quantity > outstanding) {
      return fail(`Cannot receive ${quantity}: only ${outstanding} still outstanding`);
    }

    const received = recordStockIn(
      next,
      {
        materialId: item.materialId,
        warehouseId: order.warehouseId,
        quantity,
        unitCostCentavos: item.unitCostCentavos,
        reason: `Received against ${order.reference}`,
      },
      ctx,
    );

    if (!received.ok) return received;
    next = received.data;
  }

  const updatedItems = order.items.map((item) => {
    const quantity = input.receipts[item.id] ?? 0;
    return quantity > 0
      ? { ...item, receivedQuantity: item.receivedQuantity + quantity }
      : item;
  });

  const complete = updatedItems.every(
    (item) => item.receivedQuantity >= item.orderedQuantity,
  );

  const updatedOrder: PurchaseOrder = {
    ...order,
    items: updatedItems,
    status: complete ? "received" : "partially-received",
    orderedAt: order.orderedAt ?? ctx.now,
    receivedAt: complete ? ctx.now : order.receivedAt,
    updatedAt: ctx.now,
  };

  return succeed({
    ...next,
    purchaseOrders: next.purchaseOrders.map((entry) =>
      entry.id === order.id ? updatedOrder : entry,
    ),
    activityLogs: appendActivity(next, {
      action: complete ? "Purchase order received" : "Purchase order partially received",
      entityType: "purchase-order",
      entityId: order.id,
      description: `${order.reference}: ${lines.length} line(s) received into the destination warehouse.`,
      now: ctx.now,
      actor: ctx.actor,
    }),
  });
}
