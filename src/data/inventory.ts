import type {
  InventoryBalance,
  MaterialRequest,
  MaterialRequestItem,
  ProjectMaterial,
  PurchaseOrder,
  PurchaseOrderItem,
  StockMovement,
} from "@/types/domain";
import {
  generateMaterialRequestNumber,
  generatePurchaseOrderNumber,
  generateTransactionReference,
} from "@/lib/ids";
import { calculatePurchaseOrderTotals } from "@/lib/procurement";
import { createRng, SEED } from "@/data/prng";
import { isoAt } from "@/data/support";
import { materials } from "@/data/materials";
import { warehouses } from "@/data/warehouses";
import { projects } from "@/data/projects";
import { suppliers } from "@/data/suppliers";

/**
 * Builds the inventory history as one coherent sequence.
 *
 * Movements are the only source of truth: balances are computed by replaying
 * them, and every stock-out is generated only after confirming the source
 * warehouse actually holds the quantity. Requests and purchase orders are
 * created before the movements they cause, so a fulfilled request always has a
 * matching stock-out and a received line always has a matching stock-in.
 */

const YEAR = 2026;
const PERFORMER = "Demo user";

export interface InventorySeed {
  movements: StockMovement[];
  balances: InventoryBalance[];
  projectMaterials: ProjectMaterial[];
  materialRequests: MaterialRequest[];
  purchaseOrders: PurchaseOrder[];
}

function balanceKey(materialId: string, warehouseId: string): string {
  return `${materialId}::${warehouseId}`;
}

export function buildInventorySeed(): InventorySeed {
  const rng = createRng(SEED);
  const movements: StockMovement[] = [];
  const balances = new Map<string, number>();
  let movementSequence = 0;
  let day = 3;

  const balanceOf = (materialId: string, warehouseId: string) =>
    balances.get(balanceKey(materialId, warehouseId)) ?? 0;

  interface MovementInput {
    type: StockMovement["type"];
    materialId: string;
    warehouseId: string;
    destinationWarehouseId?: string;
    projectId?: string;
    quantity: number;
    unitCostCentavos: number;
    reason?: string;
    notes?: string;
  }

  function record(input: MovementInput): void {
    movementSequence += 1;
    day += 1;
    const totalCostCentavos = Math.round(input.quantity * input.unitCostCentavos);
    const sourceBefore = balanceOf(input.materialId, input.warehouseId);

    if (input.type === "stock-in") {
      balances.set(
        balanceKey(input.materialId, input.warehouseId),
        sourceBefore + input.quantity,
      );
    } else if (input.type === "stock-out") {
      balances.set(
        balanceKey(input.materialId, input.warehouseId),
        sourceBefore - input.quantity,
      );
    } else if (input.type === "transfer" && input.destinationWarehouseId) {
      balances.set(
        balanceKey(input.materialId, input.warehouseId),
        sourceBefore - input.quantity,
      );
      balances.set(
        balanceKey(input.materialId, input.destinationWarehouseId),
        balanceOf(input.materialId, input.destinationWarehouseId) + input.quantity,
      );
    }

    const created = movements[movements.length - 1];
    void created;

    movements.push({
      id: `mv-${String(movementSequence).padStart(5, "0")}`,
      reference: generateTransactionReference(movementSequence, YEAR),
      type: input.type,
      materialId: input.materialId,
      warehouseId: input.warehouseId,
      destinationWarehouseId: input.destinationWarehouseId,
      projectId: input.projectId,
      quantity: input.quantity,
      unitCostCentavos: input.unitCostCentavos,
      totalCostCentavos,
      balanceAfter: balanceOf(input.materialId, input.warehouseId),
      reason: input.reason,
      notes: input.notes,
      performedBy: PERFORMER,
      createdAt: isoAt(day, 7 + (movementSequence % 9), (movementSequence * 7) % 60),
    });
  }

  /* 1. Opening stock: every material lands in one or two warehouses. */
  for (const [index, material] of materials.entries()) {
    const hosting = rng.chance(0.55)
      ? rng.pickMany(warehouses, 2)
      : [warehouses[index % warehouses.length]];

    for (const warehouse of hosting) {
      const openingQuantity =
        material.reorderPoint * rng.int(2, 4) + rng.int(10, 90);
      // Costs drift a few percent around the catalogue price so weighted
      // averages are not simply the catalogue value.
      const unitCostCentavos = Math.round(
        material.unitCostCentavos * rng.float(0.96, 1.04, 3),
      );

      record({
        type: "stock-in",
        materialId: material.id,
        warehouseId: warehouse.id,
        quantity: openingQuantity,
        unitCostCentavos,
        reason: "Opening stock",
      });
    }
  }

  /* 2. Purchase orders, then the stock-in they produce. */
  const purchaseOrders: PurchaseOrder[] = [];
  const poStatuses: PurchaseOrder["status"][] = [
    "received",
    "received",
    "partially-received",
    "partially-received",
    "ordered",
    "ordered",
    "approved",
    "pending",
    "draft",
    "cancelled",
  ];

  const orderableSuppliers = suppliers.filter((supplier) => supplier.status === "active");

  poStatuses.forEach((status, index) => {
    const supplier = orderableSuppliers[index % orderableSuppliers.length];
    const warehouse = warehouses[index % warehouses.length];
    const lineMaterials = rng.pickMany(materials, rng.int(2, 4));

    const items: PurchaseOrderItem[] = lineMaterials.map((material, itemIndex) => {
      const orderedQuantity = material.reorderPoint > 40
        ? rng.int(20, 120)
        : rng.int(2, 40);
      const receivedRatio =
        status === "received" ? 1 : status === "partially-received" ? 0.5 : 0;
      const receivedQuantity = Math.round(orderedQuantity * receivedRatio);

      return {
        id: `poi-${index + 1}-${itemIndex + 1}`,
        materialId: material.id,
        orderedQuantity,
        receivedQuantity,
        unitCostCentavos: material.unitCostCentavos,
      };
    });

    const totals = calculatePurchaseOrderTotals(
      items.map((item) => ({
        orderedQuantity: item.orderedQuantity,
        unitCostCentavos: item.unitCostCentavos,
      })),
      {
        discountCentavos: index % 3 === 0 ? 150_000 : 0,
        deliveryFeeCentavos: 250_000,
      },
    );

    const orderedAt = ["ordered", "partially-received", "received"].includes(status)
      ? isoAt(20 + index * 6, 10, 0)
      : undefined;

    purchaseOrders.push({
      id: `po-${String(index + 1).padStart(3, "0")}`,
      reference: generatePurchaseOrderNumber(index + 1, YEAR),
      supplierId: supplier.id,
      warehouseId: warehouse.id,
      status,
      items,
      ...totals,
      expectedDeliveryDate: isoAt(36 + index * 6, 9, 0).slice(0, 10),
      orderedAt,
      receivedAt: status === "received" ? isoAt(48 + index * 6, 14, 0) : undefined,
      notes: index === 9 ? "Cancelled after supplier stock-out." : undefined,
      createdAt: isoAt(16 + index * 6, 9, 30),
      updatedAt: isoAt(20 + index * 6, 10, 0),
    });

    for (const item of items) {
      if (item.receivedQuantity <= 0) continue;
      record({
        type: "stock-in",
        materialId: item.materialId,
        warehouseId: warehouse.id,
        quantity: item.receivedQuantity,
        unitCostCentavos: item.unitCostCentavos,
        reason: `Received against ${generatePurchaseOrderNumber(index + 1, YEAR)}`,
      });
    }
  });

  /* 3. Material requests, then the stock-out that fulfils them. */
  const requestPlans: Array<{
    status: MaterialRequest["status"];
    priority: MaterialRequest["priority"];
  }> = [
    { status: "fulfilled", priority: "normal" },
    { status: "fulfilled", priority: "high" },
    { status: "fulfilled", priority: "normal" },
    { status: "fulfilled", priority: "urgent" },
    { status: "partially-fulfilled", priority: "high" },
    { status: "partially-fulfilled", priority: "normal" },
    { status: "approved", priority: "normal" },
    { status: "approved", priority: "urgent" },
    { status: "approved", priority: "low" },
    { status: "pending", priority: "normal" },
    { status: "pending", priority: "high" },
    { status: "pending", priority: "normal" },
    { status: "pending", priority: "low" },
    { status: "rejected", priority: "normal" },
    { status: "cancelled", priority: "low" },
  ];

  const operationalProjects = projects.filter((project) =>
    ["active", "on-hold"].includes(project.status),
  );

  const materialRequests: MaterialRequest[] = requestPlans.map((plan, index) => {
    const project = operationalProjects[index % operationalProjects.length];
    const lineMaterials = rng.pickMany(materials, rng.int(1, 3));

    const items: MaterialRequestItem[] = lineMaterials.map((material, itemIndex) => {
      const requestedQuantity = Math.max(
        1,
        Math.round(material.reorderPoint * rng.float(0.05, 0.18, 2)),
      );

      const isApproved = ["approved", "partially-fulfilled", "fulfilled"].includes(
        plan.status,
      );
      const approvedQuantity = isApproved ? requestedQuantity : 0;

      let fulfilledQuantity = 0;
      if (plan.status === "fulfilled") {
        fulfilledQuantity = approvedQuantity;
      } else if (plan.status === "partially-fulfilled") {
        fulfilledQuantity = Math.max(1, Math.floor(approvedQuantity * 0.5));
      }

      return {
        id: `mri-${index + 1}-${itemIndex + 1}`,
        materialId: material.id,
        requestedQuantity,
        approvedQuantity,
        fulfilledQuantity,
        unitCostCentavos: material.unitCostCentavos,
      };
    });

    const requestedAt = isoAt(58 + index * 3, 8, index * 4);
    const reviewedAt = isReviewFinished(plan.status)
      ? isoAt(59 + index * 3, 11, 0)
      : undefined;

    return {
      id: `req-${String(index + 1).padStart(4, "0")}`,
      reference: generateMaterialRequestNumber(index + 1, YEAR),
      projectId: project.id,
      requestedBy: project.managerName,
      priority: plan.priority,
      status: plan.status,
      items,
      notes: plan.status === "rejected" ? "Duplicated by a later request." : undefined,
      requestedAt,
      reviewedAt,
      reviewedBy: reviewedAt ? "Warehouse supervisor" : undefined,
    };
  });

  // Fulfilment stock-outs, only where a warehouse genuinely holds the stock.
  for (const request of materialRequests) {
    if (!["fulfilled", "partially-fulfilled"].includes(request.status)) continue;

    for (const item of request.items) {
      if (item.fulfilledQuantity <= 0) continue;

      const source = warehouses.find(
        (warehouse) => balanceOf(item.materialId, warehouse.id) >= item.fulfilledQuantity,
      );
      if (!source) {
        // Nothing to release: reduce the recorded fulfilment so the request
        // does not claim stock the ledger never issued.
        item.fulfilledQuantity = 0;
        continue;
      }

      record({
        type: "stock-out",
        materialId: item.materialId,
        warehouseId: source.id,
        projectId: request.projectId,
        quantity: item.fulfilledQuantity,
        unitCostCentavos: item.unitCostCentavos,
        reason: `Fulfilled ${request.reference}`,
      });
    }
  }

  /* 4. A few transfers, adjustments, and returns for history depth. */
  const transferPairs: Array<[number, number, number]> = [
    [0, 1, 12],
    [4, 2, 20],
    [11, 0, 15],
    [25, 1, 8],
  ];

  for (const [materialIndex, warehouseIndex, quantity] of transferPairs) {
    const material = materials[materialIndex];
    const source = warehouses[warehouseIndex];
    const destination = warehouses[(warehouseIndex + 1) % warehouses.length];
    if (balanceOf(material.id, source.id) < quantity) continue;

    record({
      type: "transfer",
      materialId: material.id,
      warehouseId: source.id,
      destinationWarehouseId: destination.id,
      quantity,
      unitCostCentavos: material.unitCostCentavos,
      reason: "Rebalanced stock between warehouses",
    });
  }

  record({
    type: "adjustment",
    materialId: materials[7].id,
    warehouseId: warehouses[0].id,
    quantity: 4,
    unitCostCentavos: materials[7].unitCostCentavos,
    reason: "Cycle count correction",
    notes: "Four lengths previously recorded in the wrong bin.",
  });

  record({
    type: "return",
    materialId: materials[12].id,
    warehouseId: warehouses[1].id,
    projectId: projects[1].id,
    quantity: 60,
    unitCostCentavos: materials[12].unitCostCentavos,
    reason: "Unused blocks returned from Mintal site",
  });

  // Drain the lowest-stock material completely so the demo shows a genuine
  // out-of-stock case. Stock status treats "no balance" as zero, and the
  // movement trail explains how it got there.
  const totals = materials.map((material) => ({
    material,
    total: warehouses.reduce(
      (sum, warehouse) => sum + balanceOf(material.id, warehouse.id),
      0,
    ),
  }));
  const drainCandidate = totals
    .filter((entry) => entry.total > 0)
    .sort((left, right) => left.total - right.total)[0];

  if (drainCandidate) {
    for (const warehouse of warehouses) {
      const available = balanceOf(drainCandidate.material.id, warehouse.id);
      if (available <= 0) continue;
      record({
        type: "stock-out",
        materialId: drainCandidate.material.id,
        warehouseId: warehouse.id,
        projectId: projects[1].id,
        quantity: available,
        unitCostCentavos: drainCandidate.material.unitCostCentavos,
        reason: "Issued to site until stock is replenished",
      });
    }
  }

  // Keep a few materials genuinely low on stock in aggregate. Stock-outs are
  // real movements, so the low state is explainable from the ledger and the
  // dashboard's low-stock tile has something true to show.
  const lowStockCandidates = totals
    .filter(
      (entry) =>
        entry.total > entry.material.reorderPoint &&
        entry.material.reorderPoint > 0,
    )
    .sort((left, right) => left.total - right.total)
    .slice(0, 3);

  for (const candidate of lowStockCandidates) {
    const target = Math.max(1, Math.floor(candidate.material.reorderPoint * 0.6));
    let surplus = candidate.total - target;

    for (const warehouse of warehouses) {
      if (surplus <= 0) break;
      const available = balanceOf(candidate.material.id, warehouse.id);
      if (available <= 0) continue;
      const release = Math.min(available, surplus);
      surplus -= release;
      record({
        type: "stock-out",
        materialId: candidate.material.id,
        warehouseId: warehouse.id,
        projectId: projects[0].id,
        quantity: release,
        unitCostCentavos: candidate.material.unitCostCentavos,
        reason: "Consumed on active site",
      });
    }
  }

  const inventoryBalances: InventoryBalance[] = [];
  for (const [key, quantity] of balances.entries()) {
    if (quantity <= 0) continue;
    const [materialId, warehouseId] = key.split("::");
    inventoryBalances.push({
      id: `bal-${materialId}-${warehouseId}`,
      materialId,
      warehouseId,
      quantity,
      updatedAt: isoAt(day, 18, 0),
    });
  }

  // On-site quantities are derived from the movements that put material there:
  // stock-outs add, returns subtract. No separate hand-written ledger exists.
  const projectMaterialQuantities = new Map<string, number>();
  for (const movement of movements) {
    if (!movement.projectId) continue;
    if (movement.type !== "stock-out" && movement.type !== "return") continue;
    const key = `${movement.projectId}::${movement.materialId}`;
    const delta =
      movement.type === "stock-out" ? movement.quantity : -movement.quantity;
    projectMaterialQuantities.set(
      key,
      (projectMaterialQuantities.get(key) ?? 0) + delta,
    );
  }

  const projectMaterials: ProjectMaterial[] = [];
  for (const [key, quantity] of projectMaterialQuantities.entries()) {
    if (quantity <= 0) continue;
    const [projectId, materialId] = key.split("::");
    projectMaterials.push({
      id: `pm-${projectId}-${materialId}`,
      projectId,
      materialId,
      quantity,
      consumedQuantity: 0,
      updatedAt: isoAt(day, 18, 0),
    });
  }

  return {
    movements,
    balances: inventoryBalances,
    projectMaterials,
    materialRequests,
    purchaseOrders,
  };
}

function isReviewFinished(status: MaterialRequest["status"]): boolean {
  return ["approved", "rejected", "partially-fulfilled", "fulfilled"].includes(
    status,
  );
}
