import type { StockMovement } from "@/types/domain";
import type { DomainData } from "@/types/state";
import { fail, succeed, type DomainResult } from "@/lib/result";
import { generateTransactionReference, generateId, nextSequence } from "@/lib/ids";
import { balanceUnitCost, calculateWeightedAverageCost } from "@/lib/inventory";
import {
  adjustBalance,
  allocateProjectStock,
  appendActivity,
  appendNotification,
  balanceFor,
  quantityAt,
  totalCost,
  type OperationContext,
} from "@/services/support";

/**
 * Inventory transactions.
 *
 * Every function validates the whole operation before touching state, so a
 * rejected request leaves the dataset exactly as it was; there is no partial
 * application to unwind.
 */

const YEAR = 2026;

function canValue(quantity: number, cents: number): boolean {
  return Number.isFinite(quantity) && Number.isSafeInteger(totalCost(quantity, cents));
}

function resultingCost(
  balance: ReturnType<typeof balanceFor>,
  fallback: number,
  quantity: number,
  cost: number,
): number | null {
  const current = balance?.quantity ?? 0;
  const next = current + quantity;
  if (!canValue(next, Math.max(balanceUnitCost(balance, fallback), cost))) return null;
  return calculateWeightedAverageCost({
    currentQuantity: current,
    currentUnitCostCentavos: balanceUnitCost(balance, fallback),
    incomingQuantity: quantity,
    incomingUnitCostCentavos: cost,
  });
}

function nextMovement(
  data: DomainData,
  input: Omit<StockMovement, "id" | "reference" | "createdAt" | "performedBy" | "totalCostCentavos">,
  ctx: OperationContext,
): StockMovement {
  const sequence = nextSequence(data.stockMovements.map((m) => m.reference));
  return {
    ...input,
    id: `mv-${String(sequence).padStart(5, "0")}`,
    reference: generateTransactionReference(sequence, YEAR),
    totalCostCentavos: totalCost(input.quantity, input.unitCostCentavos),
    performedBy: ctx.actor,
    createdAt: ctx.now,
  };
}

function assertMaterial(data: DomainData, materialId: string): string | null {
  const material = data.materials.find((item) => item.id === materialId);
  if (!material) return "Material not found";
  if (material.status === "discontinued") {
    return "Cannot transact a discontinued material";
  }
  return null;
}

function assertWarehouse(data: DomainData, warehouseId: string): string | null {
  const warehouse = data.warehouses.find((item) => item.id === warehouseId);
  if (!warehouse) return "Warehouse not found";
  if (warehouse.status === "inactive") return "Warehouse is inactive";
  return null;
}

export interface StockInInput {
  materialId: string;
  warehouseId: string;
  quantity: number;
  unitCostCentavos: number;
  reason?: string;
  notes?: string;
}

export function recordStockIn(
  data: DomainData,
  input: StockInInput,
  ctx: OperationContext,
): DomainResult<DomainData> {
  const materialError = assertMaterial(data, input.materialId);
  if (materialError) return fail(materialError);

  const warehouseError = assertWarehouse(data, input.warehouseId);
  if (warehouseError) return fail(warehouseError);

  if (!Number.isFinite(input.quantity) || input.quantity <= 0) {
    return fail("Quantity must be greater than zero");
  }

  const unitCost = input.unitCostCentavos;
  if (!Number.isSafeInteger(unitCost) || unitCost < 0) {
    return fail("Unit cost must be a non-negative whole number of centavos");
  }

  const material = data.materials.find((item) => item.id === input.materialId)!;
  const current = balanceFor(data, input.materialId, input.warehouseId);
  const currentQuantity = current?.quantity ?? 0;
  const nextUnitCost = resultingCost(current, material.unitCostCentavos, input.quantity, unitCost);
  if (nextUnitCost === null) return fail("Receipt would exceed supported inventory value");

  const balances = adjustBalance(
    data.balances,
    input.materialId,
    input.warehouseId,
    input.quantity,
    ctx.now,
    nextUnitCost,
  );

  const movement = nextMovement(
    data,
    {
      type: "stock-in",
      materialId: input.materialId,
      warehouseId: input.warehouseId,
      quantity: input.quantity,
      unitCostCentavos: unitCost,
      balanceAfter: currentQuantity + input.quantity,
      reason: input.reason ?? "Stock received",
      notes: input.notes,
    },
    ctx,
  );

  const warehouse = data.warehouses.find((item) => item.id === input.warehouseId)!;

  return succeed({
    ...data,
    balances,
    stockMovements: [...data.stockMovements, movement],
    activityLogs: appendActivity(data, {
      action: `Received ${material.name}`,
      entityType: "stock-movement",
      entityId: movement.id,
      description: `${movement.reference}: received ${input.quantity} ${material.unit} of ${material.name} at ${warehouse.name}.`,
      now: ctx.now,
      actor: ctx.actor,
    }),
  });
}

export interface StockOutInput {
  materialId: string;
  warehouseId: string;
  quantity: number;
  projectId?: string;
  reason?: string;
  notes?: string;
}

export function recordStockOut(
  data: DomainData,
  input: StockOutInput,
  ctx: OperationContext,
): DomainResult<DomainData> {
  const materialError = assertMaterial(data, input.materialId);
  if (materialError) return fail(materialError);

  const warehouseError = assertWarehouse(data, input.warehouseId);
  if (warehouseError) return fail(warehouseError);

  if (!Number.isFinite(input.quantity) || input.quantity <= 0) {
    return fail("Quantity must be greater than zero");
  }

  if (input.projectId && !data.projects.some((p) => p.id === input.projectId)) {
    return fail("Project not found");
  }

  const available = quantityAt(data, input.materialId, input.warehouseId);
  if (input.quantity > available) {
    return fail(
      `Insufficient stock: ${available} available in the selected warehouse`,
    );
  }

  const material = data.materials.find((item) => item.id === input.materialId)!;
  const unitCost = balanceUnitCost(balanceFor(data, input.materialId, input.warehouseId), material.unitCostCentavos);
  if (!canValue(input.quantity, unitCost)) return fail("Release would exceed supported inventory value");
  if (input.projectId) {
    const existing = data.projectMaterials.find((row) => row.projectId === input.projectId && row.materialId === input.materialId);
    if (!canValue((existing?.quantity ?? 0) + input.quantity, Math.max(unitCost, balanceUnitCost(existing, material.unitCostCentavos)))) {
      return fail("Release would exceed supported project inventory value");
    }
  }
  const movement = nextMovement(
    data,
    {
      type: "stock-out",
      materialId: input.materialId,
      warehouseId: input.warehouseId,
      projectId: input.projectId,
      quantity: input.quantity,
      unitCostCentavos: unitCost,
      balanceAfter: available - input.quantity,
      reason: input.reason ?? "Stock released",
      notes: input.notes,
    },
    ctx,
  );

  const balances = adjustBalance(
    data.balances,
    input.materialId,
    input.warehouseId,
    -input.quantity,
    ctx.now,
  );

  const projectMaterials = input.projectId
    ? allocateProjectStock(
        data.projectMaterials,
        input.projectId,
        input.materialId,
        input.quantity,
        unitCost,
        material.unitCostCentavos,
        ctx.now,
      )
    : data.projectMaterials;

  const warehouse = data.warehouses.find((item) => item.id === input.warehouseId)!;
  const remaining = available - input.quantity;

  let notifications = data.notifications;
  if (remaining <= 0) {
    notifications = appendNotification(
      { ...data, notifications },
      {
        type: "warning",
        title: "Out of stock",
        message: `${material.name} is now out of stock at ${warehouse.name}.`,
        now: ctx.now,
        link: "/materials",
      },
    );
  } else if (remaining <= material.reorderPoint) {
    notifications = appendNotification(
      { ...data, notifications },
      {
        type: "warning",
        title: "Low stock",
        message: `${material.name} is down to ${remaining} at ${warehouse.name}.`,
        now: ctx.now,
        link: "/materials",
      },
    );
  }

  return succeed({
    ...data,
    balances,
    projectMaterials,
    stockMovements: [...data.stockMovements, movement],
    notifications,
    activityLogs: appendActivity(data, {
      action: `Released ${material.name}`,
      entityType: "stock-movement",
      entityId: movement.id,
      description: `${movement.reference}: released ${input.quantity} ${material.unit} of ${material.name} from ${warehouse.name}.`,
      now: ctx.now,
      actor: ctx.actor,
    }),
  });
}

export interface TransferInput {
  materialId: string;
  sourceWarehouseId: string;
  destinationWarehouseId: string;
  quantity: number;
  notes?: string;
}

export function transferInventory(
  data: DomainData,
  input: TransferInput,
  ctx: OperationContext,
): DomainResult<DomainData> {
  const materialError = assertMaterial(data, input.materialId);
  if (materialError) return fail(materialError);

  if (input.sourceWarehouseId === input.destinationWarehouseId) {
    return fail("Source and destination warehouses must differ");
  }

  const sourceError = assertWarehouse(data, input.sourceWarehouseId);
  if (sourceError) return fail(sourceError);

  const destinationError = assertWarehouse(data, input.destinationWarehouseId);
  if (destinationError) return fail(destinationError);

  if (!Number.isFinite(input.quantity) || input.quantity <= 0) {
    return fail("Quantity must be greater than zero");
  }

  const available = quantityAt(data, input.materialId, input.sourceWarehouseId);
  if (input.quantity > available) {
    return fail(`Insufficient stock: ${available} available at the source`);
  }

  const material = data.materials.find((item) => item.id === input.materialId)!;
  const sourceCost = balanceUnitCost(balanceFor(data, input.materialId, input.sourceWarehouseId), material.unitCostCentavos);
  const destinationBalance = balanceFor(data, input.materialId, input.destinationWarehouseId);
  const destinationCost = resultingCost(destinationBalance, material.unitCostCentavos, input.quantity, sourceCost);
  if (destinationCost === null) return fail("Transfer would exceed supported inventory value");
  let balances = adjustBalance(
    data.balances,
    input.materialId,
    input.sourceWarehouseId,
    -input.quantity,
    ctx.now,
  );
  balances = adjustBalance(
    balances,
    input.materialId,
    input.destinationWarehouseId,
    input.quantity,
    ctx.now,
    destinationCost,
  );

  const movement = nextMovement(
    data,
    {
      type: "transfer",
      materialId: input.materialId,
      warehouseId: input.sourceWarehouseId,
      destinationWarehouseId: input.destinationWarehouseId,
      quantity: input.quantity,
      unitCostCentavos: sourceCost,
      balanceAfter: available - input.quantity,
      reason: "Warehouse transfer",
      notes: input.notes,
    },
    ctx,
  );

  const source = data.warehouses.find((w) => w.id === input.sourceWarehouseId)!;
  const destination = data.warehouses.find(
    (w) => w.id === input.destinationWarehouseId,
  )!;

  return succeed({
    ...data,
    balances,
    stockMovements: [...data.stockMovements, movement],
    activityLogs: appendActivity(data, {
      action: `Transferred ${material.name}`,
      entityType: "stock-movement",
      entityId: movement.id,
      description: `${movement.reference}: moved ${input.quantity} ${material.unit} from ${source.name} to ${destination.name}.`,
      now: ctx.now,
      actor: ctx.actor,
    }),
  });
}

export interface AdjustmentInput {
  materialId: string;
  warehouseId: string;
  countedQuantity: number;
  reason: string;
}

export function recordAdjustment(
  data: DomainData,
  input: AdjustmentInput,
  ctx: OperationContext,
): DomainResult<DomainData> {
  const materialError = assertMaterial(data, input.materialId);
  if (materialError) return fail(materialError);

  const warehouseError = assertWarehouse(data, input.warehouseId);
  if (warehouseError) return fail(warehouseError);

  if (!input.reason.trim()) return fail("An adjustment reason is required");
  if (input.reason.trim().length > 200) return fail("Adjustment reason must be 200 characters or fewer");

  if (!Number.isFinite(input.countedQuantity) || input.countedQuantity < 0) {
    return fail("Counted quantity cannot be negative");
  }

  const current = quantityAt(data, input.materialId, input.warehouseId);
  const delta = input.countedQuantity - current;
  if (delta === 0) return fail("Counted quantity matches the recorded balance");

  const material = data.materials.find((item) => item.id === input.materialId)!;
  const unitCost = balanceUnitCost(balanceFor(data, input.materialId, input.warehouseId), material.unitCostCentavos);
  if (!canValue(Math.max(input.countedQuantity, Math.abs(delta)), unitCost)) return fail("Adjustment would exceed supported inventory value");
  const balances = adjustBalance(
    data.balances,
    input.materialId,
    input.warehouseId,
    delta,
    ctx.now,
    unitCost,
  );

  const movement = nextMovement(
    data,
    {
      type: "adjustment",
      materialId: input.materialId,
      warehouseId: input.warehouseId,
      quantity: Math.abs(delta),
      unitCostCentavos: unitCost,
      balanceAfter: input.countedQuantity,
      reason: input.reason.trim(),
      notes: delta > 0 ? "Increase from cycle count" : "Decrease from cycle count",
    },
    ctx,
  );

  return succeed({
    ...data,
    balances,
    stockMovements: [...data.stockMovements, movement],
    activityLogs: appendActivity(data, {
      action: `Adjusted ${material.name}`,
      entityType: "stock-movement",
      entityId: movement.id,
      description: `${movement.reference}: counted ${input.countedQuantity} ${material.unit} (${delta > 0 ? "+" : ""}${delta}).`,
      now: ctx.now,
      actor: ctx.actor,
    }),
  });
}

export interface ReturnInput {
  materialId: string;
  projectId: string;
  warehouseId: string;
  quantity: number;
  notes?: string;
}

export function recordReturn(
  data: DomainData,
  input: ReturnInput,
  ctx: OperationContext,
): DomainResult<DomainData> {
  const materialError = assertMaterial(data, input.materialId);
  if (materialError) return fail(materialError);

  const warehouseError = assertWarehouse(data, input.warehouseId);
  if (warehouseError) return fail(warehouseError);

  if (!Number.isFinite(input.quantity) || input.quantity <= 0) {
    return fail("Quantity must be greater than zero");
  }

  if (!data.projects.some((project) => project.id === input.projectId)) return fail("Project not found");
  const allocation = data.projectMaterials.find(
    (entry) =>
      entry.projectId === input.projectId && entry.materialId === input.materialId,
  );

  if (!allocation) return fail("The project holds no stock for this material");
  if (input.quantity > allocation.quantity) {
    return fail(
      `Only ${allocation.quantity} on site; cannot return ${input.quantity}`,
    );
  }

  const material = data.materials.find((item) => item.id === input.materialId)!;
  const unitCost = balanceUnitCost(allocation, material.unitCostCentavos);
  const destinationBalance = balanceFor(data, input.materialId, input.warehouseId);
  const destinationCost = resultingCost(destinationBalance, material.unitCostCentavos, input.quantity, unitCost);
  if (destinationCost === null) return fail("Return would exceed supported inventory value");
  const balances = adjustBalance(
    data.balances,
    input.materialId,
    input.warehouseId,
    input.quantity,
    ctx.now,
    destinationCost,
  );

  const projectMaterials = data.projectMaterials
    .map((entry) =>
      entry.id === allocation.id
        ? { ...entry, quantity: entry.quantity - input.quantity, updatedAt: ctx.now }
        : entry,
    );

  const current = quantityAt(data, input.materialId, input.warehouseId);
  const movement = nextMovement(
    data,
    {
      type: "return",
      materialId: input.materialId,
      warehouseId: input.warehouseId,
      projectId: input.projectId,
      quantity: input.quantity,
      unitCostCentavos: unitCost,
      balanceAfter: current + input.quantity,
      reason: "Material returned from site",
      notes: input.notes,
    },
    ctx,
  );

  return succeed({
    ...data,
    balances,
    projectMaterials,
    stockMovements: [...data.stockMovements, movement],
    activityLogs: appendActivity(data, {
      action: `Returned ${material.name}`,
      entityType: "stock-movement",
      entityId: movement.id,
      description: `${movement.reference}: returned ${input.quantity} ${material.unit} of ${material.name} to the warehouse.`,
      now: ctx.now,
      actor: ctx.actor,
    }),
  });
}

export interface ConsumptionInput {
  projectId: string;
  materialId: string;
  quantity: number;
  notes?: string;
}

/**
 * Records material actually used on site. On-site quantity decreases and the
 * consumption ledger grows; warehouse balances are untouched because the stock
 * already left the warehouse when it was released.
 */
export function recordMaterialConsumption(
  data: DomainData,
  input: ConsumptionInput,
  ctx: OperationContext,
): DomainResult<DomainData> {
  const project = data.projects.find((entry) => entry.id === input.projectId);
  if (!project) return fail("Project not found");
  if (!Number.isFinite(input.quantity) || input.quantity <= 0) {
    return fail("Consumed quantity must be greater than zero");
  }

  const allocation = data.projectMaterials.find(
    (entry) =>
      entry.projectId === input.projectId && entry.materialId === input.materialId,
  );
  if (!allocation) return fail("The project holds no stock for this material");
  if (input.quantity > allocation.quantity) {
    return fail(
      `Only ${allocation.quantity} on site; cannot consume ${input.quantity}`,
    );
  }

  const material = data.materials.find((entry) => entry.id === input.materialId);
  if (!material) return fail("Material not found");
  const unitCost = balanceUnitCost(allocation, material.unitCostCentavos);

  const projectMaterials = data.projectMaterials.map((entry) =>
    entry.id === allocation.id
      ? {
          ...entry,
          quantity: entry.quantity - input.quantity,
          consumedQuantity: entry.consumedQuantity + input.quantity,
          updatedAt: ctx.now,
        }
      : entry,
  );

  const consumption = {
    id: `cons-${generateId().slice(0, 8)}`,
    projectId: input.projectId,
    materialId: input.materialId,
    quantity: input.quantity,
    unitCostCentavos: unitCost,
    totalCostCentavos: totalCost(input.quantity, unitCost),
    reference: `CONS-${project.code}`,
    consumedAt: ctx.now,
  };

  return succeed({
    ...data,
    projectMaterials,
    materialConsumptions: [...data.materialConsumptions, consumption],
    activityLogs: appendActivity(data, {
      action: `Consumed ${material.name}`,
      entityType: "project",
      entityId: project.id,
      description: `${input.quantity} ${material.unit} of ${material.name} consumed at ${project.name}.`,
      now: ctx.now,
      actor: ctx.actor,
    }),
  });
}
