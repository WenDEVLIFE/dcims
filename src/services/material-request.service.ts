import type { MaterialRequest, MaterialRequestItem } from "@/types/domain";
import type { DomainData } from "@/types/state";
import { fail, succeed, type DomainResult } from "@/lib/result";
import { generateId, generateMaterialRequestNumber, nextSequence } from "@/lib/ids";
import { generateTransactionReference } from "@/lib/ids";
import {
  adjustBalance,
  appendActivity,
  quantityAt,
  totalCost,
  type OperationContext,
} from "@/services/support";

/**
 * Material request workflow.
 *
 * Approval never moves stock. Fulfilment is the only step that deducts, and it
 * can never exceed the approved quantity or the warehouse's actual balance.
 */

const YEAR = 2026;

export interface CreateRequestInput {
  projectId: string;
  requestedBy: string;
  priority: MaterialRequest["priority"];
  items: Array<{ materialId: string; requestedQuantity: number }>;
  notes?: string;
}

export function createMaterialRequest(
  data: DomainData,
  input: CreateRequestInput,
  ctx: OperationContext,
): DomainResult<DomainData> {
  if (!data.projects.some((project) => project.id === input.projectId)) {
    return fail("Project not found");
  }
  if (input.items.length === 0) return fail("Add at least one material");

  const items: MaterialRequestItem[] = [];
  for (const [index, requested] of input.items.entries()) {
    const material = data.materials.find((item) => item.id === requested.materialId);
    if (!material) return fail("One of the selected materials no longer exists");
    if (material.status === "discontinued") {
      return fail(`${material.name} is discontinued and cannot be requested`);
    }
    if (!Number.isFinite(requested.requestedQuantity) || requested.requestedQuantity <= 0) {
      return fail(`Requested quantity for ${material.name} must be greater than zero`);
    }

    items.push({
      id: `mri-${generateId().slice(0, 8)}-${index + 1}`,
      materialId: material.id,
      requestedQuantity: requested.requestedQuantity,
      approvedQuantity: 0,
      fulfilledQuantity: 0,
      unitCostCentavos: material.unitCostCentavos,
    });
  }

  const sequence = nextSequence(data.materialRequests.map((request) => request.reference));
  const request: MaterialRequest = {
    id: generateId(),
    reference: generateMaterialRequestNumber(sequence, YEAR),
    projectId: input.projectId,
    requestedBy: input.requestedBy,
    priority: input.priority,
    status: "pending",
    items,
    notes: input.notes,
    requestedAt: ctx.now,
  };

  return succeed({
    ...data,
    materialRequests: [request, ...data.materialRequests],
    activityLogs: appendActivity(data, {
      action: "Material request submitted",
      entityType: "material-request",
      entityId: request.id,
      description: `${request.reference} submitted with ${items.length} material line(s).`,
      now: ctx.now,
      actor: ctx.actor,
    }),
  });
}

export function approveMaterialRequest(
  data: DomainData,
  requestId: string,
  ctx: OperationContext,
): DomainResult<DomainData> {
  const request = data.materialRequests.find((entry) => entry.id === requestId);
  if (!request) return fail("Request not found");
  if (request.status !== "pending") {
    return fail(`Only pending requests can be approved (current: ${request.status})`);
  }

  const updated: MaterialRequest = {
    ...request,
    status: "approved",
    reviewedAt: ctx.now,
    reviewedBy: ctx.actor,
    items: request.items.map((item) => ({
      ...item,
      approvedQuantity: item.requestedQuantity,
    })),
  };

  return succeed({
    ...data,
    materialRequests: data.materialRequests.map((entry) =>
      entry.id === requestId ? updated : entry,
    ),
    activityLogs: appendActivity(data, {
      action: "Material request approved",
      entityType: "material-request",
      entityId: updated.id,
      description: `${updated.reference} approved. Stock is not deducted until fulfilment.`,
      now: ctx.now,
      actor: ctx.actor,
    }),
  });
}

export function rejectMaterialRequest(
  data: DomainData,
  requestId: string,
  reason: string,
  ctx: OperationContext,
): DomainResult<DomainData> {
  const request = data.materialRequests.find((entry) => entry.id === requestId);
  if (!request) return fail("Request not found");
  if (request.status !== "pending") {
    return fail(`Only pending requests can be rejected (current: ${request.status})`);
  }
  if (!reason.trim()) return fail("A rejection reason is required");

  const updated: MaterialRequest = {
    ...request,
    status: "rejected",
    notes: reason,
    reviewedAt: ctx.now,
    reviewedBy: ctx.actor,
    items: request.items.map((item) => ({ ...item, approvedQuantity: 0 })),
  };

  return succeed({
    ...data,
    materialRequests: data.materialRequests.map((entry) =>
      entry.id === requestId ? updated : entry,
    ),
    activityLogs: appendActivity(data, {
      action: "Material request rejected",
      entityType: "material-request",
      entityId: updated.id,
      description: `${updated.reference} rejected: ${reason}`,
      now: ctx.now,
      actor: ctx.actor,
    }),
  });
}

export interface FulfillRequestInput {
  requestId: string;
  warehouseId: string;
  /** Optional per-item quantities; omitted items are fulfilled as far as stock allows. */
  quantities?: Record<string, number>;
}

export function fulfillMaterialRequest(
  data: DomainData,
  input: FulfillRequestInput,
  ctx: OperationContext,
): DomainResult<DomainData> {
  const request = data.materialRequests.find((entry) => entry.id === input.requestId);
  if (!request) return fail("Request not found");
  if (!["approved", "partially-fulfilled"].includes(request.status)) {
    return fail(`Request cannot be fulfilled in status ${request.status}`);
  }
  if (!data.warehouses.some((warehouse) => warehouse.id === input.warehouseId)) {
    return fail("Warehouse not found");
  }

  let balances = data.balances;
  let projectMaterials = data.projectMaterials;
  const movements: DomainData["stockMovements"] = [];
  const released: string[] = [];
  let anyReleased = false;

  const updatedItems: MaterialRequestItem[] = request.items.map((item) => ({
    ...item,
  }));

  for (const item of updatedItems) {
    const outstanding = item.approvedQuantity - item.fulfilledQuantity;
    if (outstanding <= 0) continue;

    const material = data.materials.find((entry) => entry.id === item.materialId);
    if (!material) return fail("A requested material no longer exists");

    const available = quantityAt(
      { ...data, balances },
      item.materialId,
      input.warehouseId,
    );
    const requested = input.quantities?.[item.id] ?? outstanding;
    const release = Math.min(outstanding, available, Math.max(0, requested));
    if (release <= 0) continue;

    balances = adjustBalance(
      balances,
      item.materialId,
      input.warehouseId,
      -release,
      ctx.now,
    );

    const existingAllocation = projectMaterials.find(
      (entry) =>
        entry.projectId === request.projectId &&
        entry.materialId === item.materialId,
    );
    projectMaterials = existingAllocation
      ? projectMaterials.map((entry) =>
          entry.id === existingAllocation.id
            ? { ...entry, quantity: entry.quantity + release, updatedAt: ctx.now }
            : entry,
        )
      : [
          ...projectMaterials,
          {
            id: `pm-${request.projectId}-${item.materialId}`,
            projectId: request.projectId,
            materialId: item.materialId,
            quantity: release,
            consumedQuantity: 0,
            updatedAt: ctx.now,
          },
        ];

    const sequence = nextSequence([
      ...data.stockMovements.map((movement) => movement.reference),
      ...movements.map((movement) => movement.reference),
    ]);

    movements.push({
      id: `mv-${String(sequence).padStart(5, "0")}`,
      reference: generateTransactionReference(sequence, YEAR),
      type: "stock-out",
      materialId: item.materialId,
      warehouseId: input.warehouseId,
      projectId: request.projectId,
      quantity: release,
      unitCostCentavos: item.unitCostCentavos,
      totalCostCentavos: totalCost(release, item.unitCostCentavos),
      // Balances are already updated, so this is the post-deduction figure.
      balanceAfter: quantityAt(
        { ...data, balances },
        item.materialId,
        input.warehouseId,
      ),
      reason: `Fulfilled ${request.reference}`,
      performedBy: ctx.actor,
      createdAt: ctx.now,
    });

    item.fulfilledQuantity += release;
    anyReleased = true;
    released.push(`${release} ${material.unit} of ${material.name}`);
  }

  if (!anyReleased) {
    return fail("No stock available in the selected warehouse for this request");
  }

  const fullyFulfilled = updatedItems.every(
    (item) => item.fulfilledQuantity >= item.approvedQuantity,
  );

  const updatedRequest: MaterialRequest = {
    ...request,
    items: updatedItems,
    status: fullyFulfilled ? "fulfilled" : "partially-fulfilled",
  };

  return succeed({
    ...data,
    balances,
    projectMaterials,
    stockMovements: [...data.stockMovements, ...movements],
    materialRequests: data.materialRequests.map((entry) =>
      entry.id === request.id ? updatedRequest : entry,
    ),
    activityLogs: appendActivity(data, {
      action: "Material request fulfilled",
      entityType: "material-request",
      entityId: request.id,
      description: `${request.reference} released ${released.join(", ")}.`,
      now: ctx.now,
      actor: ctx.actor,
    }),
  });
}
