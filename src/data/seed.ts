import type { DemoData } from "@/schemas/import";
import { DEMO_DATA_VERSION } from "@/schemas/import";
import { buildActivityLogs, buildNotifications } from "@/data/activity";
import { buildInventorySeed } from "@/data/inventory";
import { categories } from "@/data/categories";
import { equipment, equipmentAssignments, maintenanceRecords } from "@/data/equipment";
import { materials } from "@/data/materials";
import { projects } from "@/data/projects";
import { settings } from "@/data/settings";
import { suppliers } from "@/data/suppliers";
import { isoAt } from "@/data/support";
import { warehouses } from "@/data/warehouses";

/**
 * The single demo dataset. Everything is derived from fixed seeds, so this
 * module produces identical output on the server and the client.
 */

const inventory = buildInventorySeed();

export const initialDemoData: DemoData = {
  version: DEMO_DATA_VERSION,
  exportedAt: isoAt(120, 17, 0),
  categories,
  materials,
  warehouses,
  stockMovements: inventory.movements,
  balances: inventory.balances,
  projects,
  projectMaterials: inventory.projectMaterials,
  materialRequests: inventory.materialRequests,
  equipment,
  equipmentAssignments,
  maintenanceRecords,
  suppliers,
  purchaseOrders: inventory.purchaseOrders,
  activityLogs: buildActivityLogs(inventory),
  notifications: buildNotifications(inventory),
  settings,
};

/**
 * Cross-record checks that a schema cannot express. Returns human-readable
 * problems; an empty array means the dataset is internally consistent.
 */
export function findSeedIntegrityProblems(data: DemoData): string[] {
  const problems: string[] = [];

  const materialIds = new Set(data.materials.map((material) => material.id));
  const categoryIds = new Set(data.categories.map((category) => category.id));
  const warehouseIds = new Set(data.warehouses.map((warehouse) => warehouse.id));
  const projectIds = new Set(data.projects.map((project) => project.id));
  const supplierIds = new Set(data.suppliers.map((supplier) => supplier.id));
  const equipmentIds = new Set(data.equipment.map((asset) => asset.id));

  for (const material of data.materials) {
    if (!categoryIds.has(material.categoryId)) {
      problems.push(`Material ${material.sku} references a missing category`);
    }
  }

  // Unique SKUs and references are what make the demo data believable in tables.
  assertUnique(data.materials.map((material) => material.sku), "material SKU", problems);
  assertUnique(
    data.stockMovements.map((movement) => movement.reference),
    "movement reference",
    problems,
  );
  assertUnique(
    data.purchaseOrders.map((order) => order.reference),
    "purchase order reference",
    problems,
  );
  assertUnique(
    data.materialRequests.map((request) => request.reference),
    "material request reference",
    problems,
  );
  assertUnique(
    data.equipment.map((asset) => asset.assetCode),
    "equipment asset code",
    problems,
  );

  // Replay movements and compare with the stored balances.
  const derived = new Map<string, number>();
  const key = (materialId: string, warehouseId: string) => `${materialId}::${warehouseId}`;

  for (const movement of data.stockMovements) {
    if (!materialIds.has(movement.materialId)) {
      problems.push(`Movement ${movement.reference} references a missing material`);
    }
    if (!warehouseIds.has(movement.warehouseId)) {
      problems.push(`Movement ${movement.reference} references a missing warehouse`);
    }

    const sourceKey = key(movement.materialId, movement.warehouseId);
    const source = derived.get(sourceKey) ?? 0;

    if (movement.type === "stock-in") {
      derived.set(sourceKey, source + movement.quantity);
    } else if (movement.type === "stock-out") {
      derived.set(sourceKey, source - movement.quantity);
    } else if (movement.type === "transfer" && movement.destinationWarehouseId) {
      derived.set(sourceKey, source - movement.quantity);
      const destinationKey = key(movement.materialId, movement.destinationWarehouseId);
      derived.set(destinationKey, (derived.get(destinationKey) ?? 0) + movement.quantity);
    }

    const resulting = derived.get(sourceKey) ?? 0;
    if (resulting < 0) {
      problems.push(
        `Movement ${movement.reference} drives ${movement.materialId} negative at ${movement.warehouseId}`,
      );
    }
  }

  for (const balance of data.balances) {
    const expected = derived.get(key(balance.materialId, balance.warehouseId)) ?? 0;
    if (expected !== balance.quantity) {
      problems.push(
        `Balance for ${balance.materialId} at ${balance.warehouseId} is ${balance.quantity}, ledger says ${expected}`,
      );
    }
  }

  for (const allocation of data.projectMaterials) {
    if (!projectIds.has(allocation.projectId)) {
      problems.push(`Project material ${allocation.id} references a missing project`);
    }
    if (!materialIds.has(allocation.materialId)) {
      problems.push(`Project material ${allocation.id} references a missing material`);
    }
  }

  for (const request of data.materialRequests) {    if (!projectIds.has(request.projectId)) {
      problems.push(`Request ${request.reference} references a missing project`);
    }
    for (const item of request.items) {
      if (!materialIds.has(item.materialId)) {
        problems.push(`Request ${request.reference} references a missing material`);
      }
      if (item.fulfilledQuantity > item.approvedQuantity) {
        problems.push(`Request ${request.reference} over-fulfils an approved quantity`);
      }
    }
  }

  for (const order of data.purchaseOrders) {
    if (!supplierIds.has(order.supplierId)) {
      problems.push(`Order ${order.reference} references a missing supplier`);
    }
    if (!warehouseIds.has(order.warehouseId)) {
      problems.push(`Order ${order.reference} references a missing warehouse`);
    }
    for (const item of order.items) {
      if (item.receivedQuantity > item.orderedQuantity) {
        problems.push(`Order ${order.reference} received more than ordered`);
      }
    }

    const expectedSubtotal = order.items.reduce(
      (total, item) => total + Math.round(item.orderedQuantity * item.unitCostCentavos),
      0,
    );
    if (expectedSubtotal !== order.subtotalCentavos) {
      problems.push(`Order ${order.reference} subtotal does not match its lines`);
    }
    const expectedTotal = Math.max(
      0,
      order.subtotalCentavos - order.discountCentavos + order.deliveryFeeCentavos,
    );
    if (expectedTotal !== order.totalCentavos) {
      problems.push(`Order ${order.reference} total does not match subtotal, discount, and delivery`);
    }
  }

  for (const assignment of data.equipmentAssignments) {
    if (!equipmentIds.has(assignment.equipmentId)) {
      problems.push(`Assignment ${assignment.id} references missing equipment`);
    }
    if (!projectIds.has(assignment.projectId)) {
      problems.push(`Assignment ${assignment.id} references a missing project`);
    }
  }

  return problems;
}

/** Flags duplicate identifiers, which would break table keys and lookups. */
function assertUnique(
  values: string[],
  label: string,
  problems: string[],
): void {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) {
      problems.push(`Duplicate ${label}: ${value}`);
    }
    seen.add(value);
  }
}
