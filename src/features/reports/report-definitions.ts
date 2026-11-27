import type { DomainData } from "@/types/state";
import { formatCentavos } from "@/lib/currency";
import { formatDate, unitLabel } from "@/lib/format";

/**
 * Report definitions.
 *
 * Each report is a pure projection of domain state plus the active filters, so
 * a printed report and an exported CSV always describe exactly what is on
 * screen. Financial columns stay in centavos until formatting.
 */

export type ReportGroup = "Inventory" | "Construction" | "Procurement" | "Equipment";

export interface ReportColumn {
  key: string;
  header: string;
  align?: "left" | "right";
  format?: "text" | "number" | "currency" | "date" | "datetime";
}

export type ReportRow = Record<string, string | number>;

export interface ReportFilters {
  from?: string;
  to?: string;
  warehouseId?: string;
  projectId?: string;
  categoryId?: string;
}

export interface ReportDefinition {
  id: string;
  label: string;
  group: ReportGroup;
  description: string;
  columns: ReportColumn[];
  build: (state: DomainData, filters: ReportFilters) => ReportRow[];
}

function withinRange(timestamp: string, filters: ReportFilters): boolean {
  if (filters.from && timestamp.slice(0, 10) < filters.from) return false;
  if (filters.to && timestamp.slice(0, 10) > filters.to) return false;
  return true;
}

function materialName(state: DomainData, materialId: string): string {
  return state.materials.find((material) => material.id === materialId)?.name ?? "—";
}

function materialSku(state: DomainData, materialId: string): string {
  return state.materials.find((material) => material.id === materialId)?.sku ?? "—";
}

function warehouseName(state: DomainData, warehouseId: string): string {
  return state.warehouses.find((warehouse) => warehouse.id === warehouseId)?.name ?? "—";
}

function projectName(state: DomainData, projectId: string): string {
  return state.projects.find((project) => project.id === projectId)?.name ?? "—";
}

export const REPORTS: ReportDefinition[] = [
  {
    id: "inventory-summary",
    label: "Inventory summary",
    group: "Inventory",
    description: "Every material with its on-hand quantity, unit cost, and valuation.",
    columns: [
      { key: "sku", header: "SKU" },
      { key: "material", header: "Material" },
      { key: "category", header: "Category" },
      { key: "quantity", header: "On hand", align: "right", format: "number" },
      { key: "unitCostCentavos", header: "Avg cost", align: "right", format: "currency" },
      { key: "valueCentavos", header: "Value", align: "right", format: "currency" },
    ],
    build: (state, filters) =>
      state.materials
        .filter(
          (material) =>
            !filters.categoryId || material.categoryId === filters.categoryId,
        )
        .map((material) => {
          const balances = state.balances.filter(
            (balance) =>
              balance.materialId === material.id &&
              (!filters.warehouseId || balance.warehouseId === filters.warehouseId),
          );
          const quantity = balances.reduce((total, balance) => total + balance.quantity, 0);
          return {
            sku: material.sku,
            material: material.name,
            category:
              state.categories.find((category) => category.id === material.categoryId)
                ?.name ?? "—",
            quantity,
            unitCostCentavos: material.unitCostCentavos,
            valueCentavos: Math.round(quantity * material.unitCostCentavos),
          };
        }),
  },
  {
    id: "inventory-valuation",
    label: "Inventory valuation by category",
    group: "Inventory",
    description: "Capital tied up per material category.",
    columns: [
      { key: "category", header: "Category" },
      { key: "materials", header: "Materials", align: "right", format: "number" },
      { key: "quantityValue", header: "Total value", align: "right", format: "currency" },
    ],
    build: (state) =>
      state.categories.map((category) => {
        const materials = state.materials.filter(
          (material) => material.categoryId === category.id,
        );
        const value = materials.reduce((total, material) => {
          const quantity = state.balances
            .filter((balance) => balance.materialId === material.id)
            .reduce((sum, balance) => sum + balance.quantity, 0);
          return total + Math.round(quantity * material.unitCostCentavos);
        }, 0);
        return {
          category: category.name,
          materials: materials.length,
          quantityValue: value,
        };
      }),
  },
  {
    id: "low-stock",
    label: "Low-stock report",
    group: "Inventory",
    description: "Materials at or below their reorder point but still on hand.",
    columns: [
      { key: "sku", header: "SKU" },
      { key: "material", header: "Material" },
      { key: "quantity", header: "On hand", align: "right", format: "number" },
      { key: "reorderPoint", header: "Reorder point", align: "right", format: "number" },
    ],
    build: (state) =>
      state.materials.flatMap((material) => {
        const quantity = state.balances
          .filter((balance) => balance.materialId === material.id)
          .reduce((total, balance) => total + balance.quantity, 0);
        if (quantity <= 0 || quantity > material.reorderPoint) return [];
        return [
          {
            sku: material.sku,
            material: material.name,
            quantity,
            reorderPoint: material.reorderPoint,
          },
        ];
      }),
  },
  {
    id: "out-of-stock",
    label: "Out-of-stock report",
    group: "Inventory",
    description: "Materials with no balance in any warehouse.",
    columns: [
      { key: "sku", header: "SKU" },
      { key: "material", header: "Material" },
      { key: "reorderPoint", header: "Reorder point", align: "right", format: "number" },
    ],
    build: (state) =>
      state.materials.flatMap((material) => {
        const quantity = state.balances
          .filter((balance) => balance.materialId === material.id)
          .reduce((total, balance) => total + balance.quantity, 0);
        if (quantity > 0) return [];
        return [
          {
            sku: material.sku,
            material: material.name,
            reorderPoint: material.reorderPoint,
          },
        ];
      }),
  },
  {
    id: "warehouse-inventory",
    label: "Warehouse inventory",
    group: "Inventory",
    description: "Per-warehouse balances with valuation.",
    columns: [
      { key: "warehouse", header: "Warehouse" },
      { key: "sku", header: "SKU" },
      { key: "material", header: "Material" },
      { key: "quantity", header: "Quantity", align: "right", format: "number" },
      { key: "valueCentavos", header: "Value", align: "right", format: "currency" },
    ],
    build: (state, filters) =>
      state.balances
        .filter((balance) => !filters.warehouseId || balance.warehouseId === filters.warehouseId)
        .map((balance) => {
          const material = state.materials.find((item) => item.id === balance.materialId);
          return {
            warehouse: warehouseName(state, balance.warehouseId),
            sku: material?.sku ?? "—",
            material: material?.name ?? "—",
            quantity: balance.quantity,
            valueCentavos: Math.round(balance.quantity * (material?.unitCostCentavos ?? 0)),
          };
        }),
  },
  {
    id: "stock-movements",
    label: "Stock movement report",
    group: "Inventory",
    description: "Transaction history within the selected period.",
    columns: [
      { key: "reference", header: "Reference" },
      { key: "createdAt", header: "Date", format: "date" },
      { key: "type", header: "Type" },
      { key: "material", header: "Material" },
      { key: "warehouse", header: "Warehouse" },
      { key: "quantity", header: "Quantity", align: "right", format: "number" },
      { key: "totalCostCentavos", header: "Cost", align: "right", format: "currency" },
    ],
    build: (state, filters) =>
      state.stockMovements
        .filter(
          (movement) =>
            withinRange(movement.createdAt, filters) &&
            (!filters.warehouseId || movement.warehouseId === filters.warehouseId),
        )
        .map((movement) => ({
          reference: movement.reference,
          createdAt: movement.createdAt,
          type: movement.type,
          material: materialName(state, movement.materialId),
          warehouse: warehouseName(state, movement.warehouseId),
          quantity: movement.quantity,
          totalCostCentavos: movement.totalCostCentavos,
        })),
  },
  {
    id: "project-allocation",
    label: "Project material allocations",
    group: "Construction",
    description: "Material currently held on each site.",
    columns: [
      { key: "project", header: "Project" },
      { key: "sku", header: "SKU" },
      { key: "material", header: "Material" },
      { key: "quantity", header: "On site", align: "right", format: "number" },
      { key: "consumedQuantity", header: "Consumed", align: "right", format: "number" },
    ],
    build: (state, filters) =>
      state.projectMaterials
        .filter((entry) => !filters.projectId || entry.projectId === filters.projectId)
        .map((entry) => ({
          project: projectName(state, entry.projectId),
          sku: materialSku(state, entry.materialId),
          material: materialName(state, entry.materialId),
          quantity: entry.quantity,
          consumedQuantity: entry.consumedQuantity,
        })),
  },
  {
    id: "project-consumption",
    label: "Project material consumption",
    group: "Construction",
    description: "Recorded consumption with cost, within the selected period.",
    columns: [
      { key: "project", header: "Project" },
      { key: "material", header: "Material" },
      { key: "quantity", header: "Quantity", align: "right", format: "number" },
      { key: "totalCostCentavos", header: "Cost", align: "right", format: "currency" },
      { key: "consumedAt", header: "Recorded", format: "date" },
    ],
    build: (state, filters) =>
      state.materialConsumptions
        .filter(
          (entry) =>
            withinRange(entry.consumedAt, filters) &&
            (!filters.projectId || entry.projectId === filters.projectId),
        )
        .map((entry) => ({
          project: projectName(state, entry.projectId),
          material: materialName(state, entry.materialId),
          quantity: entry.quantity,
          totalCostCentavos: entry.totalCostCentavos,
          consumedAt: entry.consumedAt,
        })),
  },
  {
    id: "project-budget",
    label: "Project material budget",
    group: "Construction",
    description: "Budget, recorded spend, and remaining allowance per project.",
    columns: [
      { key: "project", header: "Project" },
      { key: "status", header: "Status" },
      { key: "budgetCentavos", header: "Budget", align: "right", format: "currency" },
      { key: "spendCentavos", header: "Spend", align: "right", format: "currency" },
      { key: "remainingCentavos", header: "Remaining", align: "right", format: "currency" },
      { key: "usedPercent", header: "Used %", align: "right", format: "number" },
    ],
    build: (state, filters) =>
      state.projects
        .filter((project) => !filters.projectId || project.id === filters.projectId)
        .map((project) => {
          const spend = state.materialConsumptions
            .filter((entry) => entry.projectId === project.id)
            .reduce((total, entry) => total + entry.totalCostCentavos, 0);
          return {
            project: project.name,
            status: project.status,
            budgetCentavos: project.budgetCentavos,
            spendCentavos: spend,
            remainingCentavos: Math.max(0, project.budgetCentavos - spend),
            usedPercent:
              project.budgetCentavos === 0
                ? 0
                : Math.round((spend / project.budgetCentavos) * 100),
          };
        }),
  },
  {
    id: "request-fulfillment",
    label: "Material request fulfilment",
    group: "Construction",
    description: "Requested versus approved and released quantities per request.",
    columns: [
      { key: "reference", header: "Reference" },
      { key: "project", header: "Project" },
      { key: "status", header: "Status" },
      { key: "requested", header: "Requested", align: "right", format: "number" },
      { key: "approved", header: "Approved", align: "right", format: "number" },
      { key: "fulfilled", header: "Fulfilled", align: "right", format: "number" },
    ],
    build: (state, filters) =>
      state.materialRequests
        .filter(
          (request) =>
            withinRange(request.requestedAt, filters) &&
            (!filters.projectId || request.projectId === filters.projectId),
        )
        .map((request) => ({
          reference: request.reference,
          project: projectName(state, request.projectId),
          status: request.status,
          requested: request.items.reduce((total, item) => total + item.requestedQuantity, 0),
          approved: request.items.reduce((total, item) => total + item.approvedQuantity, 0),
          fulfilled: request.items.reduce((total, item) => total + item.fulfilledQuantity, 0),
        })),
  },
  {
    id: "po-summary",
    label: "Purchase order summary",
    group: "Procurement",
    description: "Orders with supplier, status, and value.",
    columns: [
      { key: "reference", header: "Reference" },
      { key: "supplier", header: "Supplier" },
      { key: "status", header: "Status" },
      { key: "createdAt", header: "Ordered", format: "date" },
      { key: "totalCentavos", header: "Total", align: "right", format: "currency" },
    ],
    build: (state, filters) =>
      state.purchaseOrders
        .filter((order) => withinRange(order.createdAt, filters))
        .map((order) => ({
          reference: order.reference,
          supplier:
            state.suppliers.find((supplier) => supplier.id === order.supplierId)?.name ?? "—",
          status: order.status,
          createdAt: order.createdAt,
          totalCentavos: order.totalCentavos,
        })),
  },
  {
    id: "procurement-expenditure",
    label: "Procurement expenditure",
    group: "Procurement",
    description: "Committed value by month, excluding cancelled orders.",
    columns: [
      { key: "month", header: "Month" },
      { key: "orders", header: "Orders", align: "right", format: "number" },
      { key: "totalCentavos", header: "Committed", align: "right", format: "currency" },
    ],
    build: (state, filters) => {
      const months = new Map<string, { orders: number; total: number }>();
      for (const order of state.purchaseOrders) {
        if (order.status === "cancelled") continue;
        if (!withinRange(order.createdAt, filters)) continue;
        const month = order.createdAt.slice(0, 7);
        const current = months.get(month) ?? { orders: 0, total: 0 };
        months.set(month, {
          orders: current.orders + 1,
          total: current.total + order.totalCentavos,
        });
      }
      return [...months.entries()]
        .sort(([left], [right]) => right.localeCompare(left))
        .map(([month, value]) => ({
          month,
          orders: value.orders,
          totalCentavos: value.total,
        }));
    },
  },
  {
    id: "supplier-history",
    label: "Supplier purchase history",
    group: "Procurement",
    description: "Order value committed per supplier.",
    columns: [
      { key: "supplier", header: "Supplier" },
      { key: "status", header: "Status" },
      { key: "orders", header: "Orders", align: "right", format: "number" },
      { key: "committedCentavos", header: "Committed", align: "right", format: "currency" },
    ],
    build: (state) =>
      state.suppliers.map((supplier) => {
        const orders = state.purchaseOrders.filter(
          (order) => order.supplierId === supplier.id && order.status !== "cancelled",
        );
        return {
          supplier: supplier.name,
          status: supplier.status,
          orders: orders.length,
          committedCentavos: orders.reduce((total, order) => total + order.totalCentavos, 0),
        };
      }),
  },
  {
    id: "outstanding-delivery",
    label: "Outstanding deliveries",
    group: "Procurement",
    description: "Lines still owed by suppliers.",
    columns: [
      { key: "reference", header: "Reference" },
      { key: "supplier", header: "Supplier" },
      { key: "material", header: "Material" },
      { key: "outstanding", header: "Outstanding", align: "right", format: "number" },
      { key: "expected", header: "Expected", format: "date" },
    ],
    build: (state) =>
      state.purchaseOrders.flatMap((order) => {
        if (!["approved", "ordered", "partially-received"].includes(order.status)) return [];
        return order.items.flatMap((item) => {
          const outstanding = item.orderedQuantity - item.receivedQuantity;
          if (outstanding <= 0) return [];
          return [
            {
              reference: order.reference,
              supplier:
                state.suppliers.find((supplier) => supplier.id === order.supplierId)?.name ??
                "—",
              material: materialName(state, item.materialId),
              outstanding,
              expected: order.expectedDeliveryDate ?? "",
            },
          ];
        });
      }),
  },
  {
    id: "equipment-availability",
    label: "Equipment availability",
    group: "Equipment",
    description: "Current status and location of every asset.",
    columns: [
      { key: "assetCode", header: "Asset" },
      { key: "name", header: "Equipment" },
      { key: "category", header: "Category" },
      { key: "status", header: "Status" },
      { key: "location", header: "Location" },
    ],
    build: (state) =>
      state.equipment.map((asset) => ({
        assetCode: asset.assetCode,
        name: asset.name,
        category: asset.category,
        status: asset.status,
        location: asset.location,
      })),
  },
  {
    id: "equipment-assignment",
    label: "Equipment assignments",
    group: "Equipment",
    description: "Assignment history with return state.",
    columns: [
      { key: "assetCode", header: "Asset" },
      { key: "equipment", header: "Equipment" },
      { key: "project", header: "Project" },
      { key: "assignedTo", header: "Received by" },
      { key: "assignedAt", header: "Assigned", format: "date" },
      { key: "returnedAt", header: "Returned", format: "date" },
    ],
    build: (state, filters) =>
      state.equipmentAssignments
        .filter(
          (assignment) =>
            withinRange(assignment.assignedAt, filters) &&
            (!filters.projectId || assignment.projectId === filters.projectId),
        )
        .map((assignment) => {
          const asset = state.equipment.find((entry) => entry.id === assignment.equipmentId);
          return {
            assetCode: asset?.assetCode ?? "—",
            equipment: asset?.name ?? "—",
            project: projectName(state, assignment.projectId),
            assignedTo: assignment.assignedTo,
            assignedAt: assignment.assignedAt,
            returnedAt: assignment.returnedAt ?? "",
          };
        }),
  },
  {
    id: "equipment-utilization",
    label: "Equipment utilization",
    group: "Equipment",
    description: "Share of each category currently assigned to a site.",
    columns: [
      { key: "category", header: "Category" },
      { key: "total", header: "Assets", align: "right", format: "number" },
      { key: "assigned", header: "Assigned", align: "right", format: "number" },
      { key: "utilization", header: "Utilization %", align: "right", format: "number" },
    ],
    build: (state) => {
      const categories = [...new Set(state.equipment.map((asset) => asset.category))].sort();
      return categories.map((category) => {
        const assets = state.equipment.filter((asset) => asset.category === category);
        const assigned = assets.filter((asset) => asset.status === "assigned").length;
        return {
          category,
          total: assets.length,
          assigned,
          utilization: assets.length === 0 ? 0 : Math.round((assigned / assets.length) * 100),
        };
      });
    },
  },
  {
    id: "equipment-maintenance",
    label: "Equipment maintenance",
    group: "Equipment",
    description: "Maintenance records and cost, within the selected period.",
    columns: [
      { key: "assetCode", header: "Asset" },
      { key: "equipment", header: "Equipment" },
      { key: "description", header: "Work performed" },
      { key: "costCentavos", header: "Cost", align: "right", format: "currency" },
      { key: "startedAt", header: "Started", format: "date" },
      { key: "completedAt", header: "Completed", format: "date" },
    ],
    build: (state, filters) =>
      state.maintenanceRecords
        .filter((record) => withinRange(record.startedAt, filters))
        .map((record) => {
          const asset = state.equipment.find((entry) => entry.id === record.equipmentId);
          return {
            assetCode: asset?.assetCode ?? "—",
            equipment: asset?.name ?? "—",
            description: record.description,
            costCentavos: record.costCentavos,
            startedAt: record.startedAt,
            completedAt: record.completedAt ?? "",
          };
        }),
  },
];

export function formatCell(
  value: string | number,
  format: ReportColumn["format"],
): string {
  if (value === "" || value === undefined || value === null) return "—";
  switch (format) {
    case "currency":
      return formatCentavos(Number(value));
    case "number":
      return String(value);
    case "date":
      return formatDate(String(value));
    case "datetime":
      return formatDate(String(value));
    default:
      return String(value);
  }
}

export function summarize(
  rows: ReportRow[],
  columns: ReportColumn[],
): Array<{ header: string; value: string }> {
  return columns
    .filter((column) => column.format === "currency" || column.format === "number")
    .map((column) => {
      const total = rows.reduce((sum, row) => sum + (Number(row[column.key]) || 0), 0);
      return {
        header: column.header,
        value: column.format === "currency" ? formatCentavos(total) : String(total),
      };
    });
}

export { unitLabel };
