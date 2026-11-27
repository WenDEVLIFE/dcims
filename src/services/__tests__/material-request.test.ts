import { describe, expect, it } from "vitest";

import {
  approveMaterialRequest,
  cancelMaterialRequest,
  createMaterialRequest,
  fulfillMaterialRequest,
  rejectMaterialRequest,
} from "@/services/material-request.service";
import { quantityAt, seedData, stockedPair, totalQuantity } from "@/test/helpers";

function pendingRequestId(data: ReturnType<typeof seedData>): string {
  return data.materialRequests.find((request) => request.status === "pending")!.id;
}

describe("material request workflow", () => {
  it("creates a pending request with a generated reference", () => {
    const data = seedData();
    const project = data.projects[0];
    const material = data.materials[0];

    const result = createMaterialRequest(
      data,
      {
        projectId: project.id,
        requestedBy: "Test runner",
        priority: "high",
        items: [{ materialId: material.id, requestedQuantity: 5 }],
        requiredDate: "2026-12-15",
      },
      ctxWith(),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const created = result.data.materialRequests[0];
    expect(created.status).toBe("pending");
    expect(created.reference).toMatch(/^REQ-2026-\d{3}$/);
    expect(created.requiredDate).toBe("2026-12-15");
  });

  it("rejects a request with no items or a zero quantity", () => {
    const data = seedData();
    const project = data.projects[0];
    const material = data.materials[0];

    const empty = createMaterialRequest(
      data,
      { projectId: project.id, requestedBy: "Test", priority: "normal", items: [] },
      ctxWith(),
    );
    expect(empty.ok).toBe(false);

    const zero = createMaterialRequest(
      data,
      {
        projectId: project.id,
        requestedBy: "Test",
        priority: "normal",
        items: [{ materialId: material.id, requestedQuantity: 0 }],
      },
      ctxWith(),
    );
    expect(zero.ok).toBe(false);
  });

  it("approves without deducting stock", () => {
    const data = seedData();
    const requestId = pendingRequestId(data);
    const beforeBalances = structuredClone(data.balances);
    const beforeTotal = totalQuantity(data, data.materialRequests.find((r) => r.id === requestId)!.items[0].materialId);

    const result = approveMaterialRequest(data, requestId, ctxWith());

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const approved = result.data.materialRequests.find((request) => request.id === requestId)!;
    expect(approved.status).toBe("approved");
    expect(approved.items[0].approvedQuantity).toBe(approved.items[0].requestedQuantity);
    expect(result.data.balances).toEqual(beforeBalances);
    expect(totalQuantity(result.data, approved.items[0].materialId)).toBe(beforeTotal);
  });

  it("rejects a request only with a reason", () => {
    const data = seedData();
    const requestId = pendingRequestId(data);

    expect(rejectMaterialRequest(data, requestId, "  ", ctxWith()).ok).toBe(false);
    const rejected = rejectMaterialRequest(data, requestId, "Duplicate request", ctxWith());
    expect(rejected.ok).toBe(true);
    if (!rejected.ok) return;
    expect(
      rejected.data.materialRequests.find((request) => request.id === requestId)!.status,
    ).toBe("rejected");
  });

  it("deducts stock on fulfilment and moves it on site", () => {
    const data = seedData();
    const approved = data.materialRequests.find((request) => request.status === "approved")!;
    const item = approved.items[0];
    const holding = data.balances.find(
      (balance) => balance.materialId === item.materialId && balance.quantity >= 1,
    )!;
    const before = quantityAt(data, item.materialId, holding.warehouseId);

    const result = fulfillMaterialRequest(
      data,
      {
        requestId: approved.id,
        warehouseId: holding.warehouseId,
        quantities: { [item.id]: 1 },
      },
      ctxWith(),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const after = result.data.materialRequests.find((request) => request.id === approved.id)!;
    expect(after.items[0].fulfilledQuantity).toBe(1);
    expect(quantityAt(result.data, item.materialId, holding.warehouseId)).toBe(before - 1);
  });

  it("supports partial fulfilment", () => {
    const data = seedData();
    const approved = data.materialRequests.find(
      (request) => request.status === "approved" && request.items[0].requestedQuantity > 2,
    )!;
    const item = approved.items[0];
    const pair = stockedPair(data);
    const warehouse = data.balances.find(
      (balance) => balance.materialId === item.materialId && balance.quantity > 1,
    );

    const result = fulfillMaterialRequest(
      data,
      {
        requestId: approved.id,
        warehouseId: warehouse?.warehouseId ?? pair.warehouseId,
        quantities: { [item.id]: 1 },
      },
      ctxWith(),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const after = result.data.materialRequests.find((request) => request.id === approved.id)!;
    expect(after.items[0].fulfilledQuantity).toBe(1);
    expect(after.items[0].fulfilledQuantity).toBeLessThan(after.items[0].approvedQuantity);
  });

  it("never exceeds the approved quantity", () => {
    const data = seedData();
    const approved = data.materialRequests.find((request) => request.status === "approved")!;
    const item = approved.items[0];
    const pair = stockedPair(data);

    const first = fulfillMaterialRequest(
      data,
      { requestId: approved.id, warehouseId: pair.warehouseId, quantities: { [item.id]: 999 } },
      ctxWith(),
    );
    expect(first.ok).toBe(true);
    if (!first.ok) return;

    const after = first.data.materialRequests.find((request) => request.id === approved.id)!;
    expect(after.items[0].fulfilledQuantity).toBeLessThanOrEqual(after.items[0].approvedQuantity);
  });

  it("cannot fulfil a rejected request or re-fulfil a completed one", () => {
    const data = seedData();
    const rejected = data.materialRequests.find((request) => request.status === "rejected")!;
    const pair = stockedPair(data);
    expect(
      fulfillMaterialRequest(data, { requestId: rejected.id, warehouseId: pair.warehouseId }, ctxWith()).ok,
    ).toBe(false);

    const fulfilled = data.materialRequests.find((request) => request.status === "fulfilled")!;
    expect(
      fulfillMaterialRequest(data, { requestId: fulfilled.id, warehouseId: pair.warehouseId }, ctxWith()).ok,
    ).toBe(false);
  });

  it("cancels pending and approved requests but not partially fulfilled ones", () => {
    const data = seedData();
    const pending = data.materialRequests.find((request) => request.status === "pending")!;
    expect(cancelMaterialRequest(data, pending.id, ctxWith()).ok).toBe(true);

    const partial = data.materialRequests.find(
      (request) => request.status === "partially-fulfilled",
    )!;
    expect(cancelMaterialRequest(data, partial.id, ctxWith()).ok).toBe(false);
  });
});

function ctxWith() {
  return { now: "2026-11-27T09:00:00.000Z", actor: "Test runner" };
}
