import { describe, expect, it } from "vitest";

import {
  approvePurchaseOrder,
  cancelPurchaseOrder,
  createPurchaseOrder,
  markPurchaseOrderOrdered,
  receivePurchaseOrder,
  updatePurchaseOrder,
} from "@/services/procurement.service";
import { calculatePurchaseOrderTotals } from "@/lib/procurement";
import { quantityAt, seedData } from "@/test/helpers";

const ctx = { now: "2026-11-27T09:00:00.000Z", actor: "Test runner" };

function draftInput(data: ReturnType<typeof seedData>) {
  const supplier = data.suppliers.find((entry) => entry.status === "active")!;
  const warehouse = data.warehouses[0];
  const [first, second] = data.materials;
  return {
    supplierId: supplier.id,
    warehouseId: warehouse.id,
    items: [
      { materialId: first.id, orderedQuantity: 10, unitCostCentavos: 12_500 },
      { materialId: second.id, orderedQuantity: 3, unitCostCentavos: 40_000 },
    ],
    discountCentavos: 5_000,
    deliveryFeeCentavos: 25_000,
    expectedDeliveryDate: "2026-12-20",
  };
}

describe("purchase order workflow", () => {
  it("computes line, subtotal, discount, delivery, and total", () => {
    const data = seedData();
    const input = draftInput(data);

    const result = createPurchaseOrder(data, input, ctx);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const order = result.data.purchaseOrders[0];
    const expected = calculatePurchaseOrderTotals(input.items, {
      discountCentavos: input.discountCentavos,
      deliveryFeeCentavos: input.deliveryFeeCentavos,
    });

    expect(order.status).toBe("draft");
    expect(order.subtotalCentavos).toBe(expected.subtotalCentavos);
    expect(order.deliveryFeeCentavos).toBe(expected.deliveryFeeCentavos);
    expect(order.totalCentavos).toBe(expected.totalCentavos);
    expect(order.reference).toMatch(/^PO-2026-\d{3}$/);
  });

  it("rejects an order from an inactive supplier", () => {
    const data = seedData();
    const inactive = data.suppliers.find((supplier) => supplier.status === "inactive")!;
    const input = { ...draftInput(data), supplierId: inactive.id };

    expect(createPurchaseOrder(data, input, ctx).ok).toBe(false);
  });

  it("approves a draft once, then marks it ordered", () => {
    const data = seedData();
    const created = createPurchaseOrder(data, draftInput(data), ctx);
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    const orderId = created.data.purchaseOrders[0].id;

    const approved = approvePurchaseOrder(created.data, orderId, ctx);
    expect(approved.ok).toBe(true);
    if (!approved.ok) return;
    expect(approved.data.purchaseOrders.find((o) => o.id === orderId)!.status).toBe("approved");

    expect(approvePurchaseOrder(approved.data, orderId, ctx).ok).toBe(false);

    const ordered = markPurchaseOrderOrdered(approved.data, orderId, ctx);
    expect(ordered.ok).toBe(true);
    if (!ordered.ok) return;
    expect(ordered.data.purchaseOrders.find((o) => o.id === orderId)!.status).toBe("ordered");
  });

  it("receives partially and increases stock without over-receiving", () => {
    const data = seedData();
    const order = data.purchaseOrders.find((entry) => entry.status === "ordered")!;
    const line = order.items[0];
    const before = quantityAt(data, line.materialId, order.warehouseId);
    const outstanding = line.orderedQuantity - line.receivedQuantity;
    const partial = Math.max(1, Math.floor(outstanding / 2));

    const received = receivePurchaseOrder(
      data,
      { orderId: order.id, receipts: { [line.id]: partial } },
      ctx,
    );
    expect(received.ok).toBe(true);
    if (!received.ok) return;

    expect(quantityAt(received.data, line.materialId, order.warehouseId)).toBe(
      before + partial,
    );
    const updated = received.data.purchaseOrders.find((entry) => entry.id === order.id)!;
    expect(["partially-received", "received"]).toContain(updated.status);

    const over = receivePurchaseOrder(
      received.data,
      { orderId: order.id, receipts: { [line.id]: line.orderedQuantity + 5 } },
      ctx,
    );
    expect(over.ok).toBe(false);
  });

  it("rejects receiving against a cancelled order", () => {
    const data = seedData();
    const cancelled = data.purchaseOrders.find((entry) => entry.status === "cancelled")!;
    const receipts = { [cancelled.items[0].id]: 1 };

    expect(receivePurchaseOrder(data, { orderId: cancelled.id, receipts }, ctx).ok).toBe(false);
  });

  it("rejects duplicate receiving on a completed order", () => {
    const data = seedData();
    const received = data.purchaseOrders.find((entry) => entry.status === "received")!;
    const receipts = { [received.items[0].id]: 1 };

    expect(receivePurchaseOrder(data, { orderId: received.id, receipts }, ctx).ok).toBe(false);
  });

  it("cancels drafts but not partially received orders", () => {
    const data = seedData();
    const draft = data.purchaseOrders.find((entry) => entry.status === "draft")!;
    expect(cancelPurchaseOrder(data, draft.id, ctx).ok).toBe(true);

    const partial = data.purchaseOrders.find(
      (entry) => entry.status === "partially-received",
    )!;
    expect(cancelPurchaseOrder(data, partial.id, ctx).ok).toBe(false);
  });

  it("edits drafts only", () => {
    const data = seedData();
    const draft = data.purchaseOrders.find((entry) => entry.status === "draft")!;
    const input = draftInput(data);

    const edited = updatePurchaseOrder(data, draft.id, input, ctx);
    expect(edited.ok).toBe(true);
    if (!edited.ok) return;
    const updated = edited.data.purchaseOrders.find((o) => o.id === draft.id)!;
    expect(updated.reference).toBe(draft.reference);
    expect(updated.supplierId).toBe(input.supplierId);

    const approved = data.purchaseOrders.find((entry) => entry.status === "approved")!;
    expect(updatePurchaseOrder(data, approved.id, input, ctx).ok).toBe(false);
  });
});
