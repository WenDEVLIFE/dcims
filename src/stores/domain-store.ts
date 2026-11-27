"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { DemoData } from "@/schemas/import";
import { DEMO_DATA_VERSION, demoDataSchema, parseDemoData } from "@/schemas/import";
import type { DomainData } from "@/types/state";
import type {
  ApplicationSettings,
  ConstructionProject,
  Equipment,
  Material,
  MaterialUnit,
} from "@/types/domain";
import { fail, succeed, type DomainResult } from "@/lib/result";
import { normalizeInventoryCosts } from "@/lib/inventory";
import { initialDemoData } from "@/data/seed";
import * as catalog from "@/services/catalog.service";
import * as inventoryService from "@/services/inventory.service";
import * as requestService from "@/services/material-request.service";
import * as procurementService from "@/services/procurement.service";
import * as equipmentService from "@/services/equipment.service";
import type { OperationContext } from "@/services/support";

const STORE_NAME = "dcims-domain-v1";
const STORE_VERSION = 3;

function toDomainData(source: DemoData): DomainData {
  const { version: _version, exportedAt: _exportedAt, ...rest } = source;
  void _version;
  void _exportedAt;
  return structuredClone({ ...rest, ...normalizeInventoryCosts(rest) });
}

function seedState(): DomainData {
  return toDomainData(initialDemoData);
}

/** Schedule-based progress used only when migrating older saved projects. */
function progressFromSchedule(project: {
  startDate: string;
  targetEndDate: string;
  status: string;
}): number {
  if (project.status === "completed") return 100;
  if (project.status === "planned") return 0;

  const start = Date.parse(project.startDate);
  const end = Date.parse(project.targetEndDate);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 0;

  const ratio = (Date.now() - start) / (end - start);
  return Math.min(100, Math.max(0, Math.round(ratio * 100)));
}

interface DomainStore extends DomainData {
  /** True once LocalStorage rehydration has run. */
  hydrated: boolean;
  /** True when persisted data was invalid and replaced with the seed. */
  recovered: boolean;
  markHydrated: () => void;
  clearRecovered: () => void;

  // Catalogue
  createMaterial: (input: catalog.MaterialInput) => DomainResult<void>;
  updateMaterial: (id: string, patch: Partial<catalog.MaterialInput>) => DomainResult<void>;
  archiveMaterial: (id: string) => DomainResult<void>;
  createCategory: (input: catalog.CategoryInput) => DomainResult<void>;
  updateCategory: (
    id: string,
    input: Partial<catalog.CategoryInput>,
  ) => DomainResult<void>;
  archiveCategory: (id: string) => DomainResult<void>;
  createWarehouse: (input: catalog.WarehouseInput) => DomainResult<void>;
  updateWarehouse: (
    id: string,
    input: catalog.WarehousePatch,
  ) => DomainResult<void>;
  createProject: (input: catalog.ProjectInput) => DomainResult<void>;
  updateProject: (
    id: string,
    input: Partial<catalog.ProjectInput> & {
      status?: ConstructionProject["status"];
      progress?: number;
    },
  ) => DomainResult<void>;
  createSupplier: (input: catalog.SupplierInput) => DomainResult<void>;
  updateSupplier: (id: string, input: Partial<catalog.SupplierInput>) => DomainResult<void>;

  // Inventory
  recordStockIn: (input: inventoryService.StockInInput) => DomainResult<void>;
  recordStockOut: (input: inventoryService.StockOutInput) => DomainResult<void>;
  transferInventory: (input: inventoryService.TransferInput) => DomainResult<void>;
  recordAdjustment: (input: inventoryService.AdjustmentInput) => DomainResult<void>;
  recordReturn: (input: inventoryService.ReturnInput) => DomainResult<void>;
  recordMaterialConsumption: (
    input: inventoryService.ConsumptionInput,
  ) => DomainResult<void>;

  // Requests
  createMaterialRequest: (input: requestService.CreateRequestInput) => DomainResult<void>;
  approveMaterialRequest: (id: string) => DomainResult<void>;
  rejectMaterialRequest: (id: string, reason: string) => DomainResult<void>;
  fulfillMaterialRequest: (input: requestService.FulfillRequestInput) => DomainResult<void>;

  // Procurement
  createPurchaseOrder: (input: procurementService.CreatePurchaseOrderInput) => DomainResult<void>;
  approvePurchaseOrder: (id: string) => DomainResult<void>;
  receivePurchaseOrder: (input: procurementService.ReceivePurchaseOrderInput) => DomainResult<void>;

  // Equipment
  registerEquipment: (input: equipmentService.RegisterEquipmentInput) => DomainResult<void>;
  assignEquipment: (input: equipmentService.AssignEquipmentInput) => DomainResult<void>;
  returnEquipment: (id: string) => DomainResult<void>;
  recordEquipmentMaintenance: (input: equipmentService.MaintenanceInput) => DomainResult<void>;

  // Settings and data lifecycle
  updateSettings: (settings: ApplicationSettings) => DomainResult<void>;
  resetDemoData: () => void;
  exportDemoData: () => DemoData;
  importDemoData: (raw: string) => DomainResult<void>;
}

export const useDomainStore = create<DomainStore>()(
  persist(
    (set, get) => {
      function context(): OperationContext {
        return {
          now: new Date().toISOString(),
          actor: get().settings.demoUser.name,
        };
      }

      function commit(
        result: DomainResult<DomainData>,
      ): DomainResult<void> {
        if (!result.ok) return result;
        set(result.data);
        return succeed(undefined);
      }

      return {
        ...seedState(),
        hydrated: false,
        recovered: false,
        markHydrated: () => {
          // Persisted data is untrusted: a tampered or truncated payload must
          // fall back to the seed instead of rendering a broken dataset.
          const state = get();
          const candidate = {
            version: DEMO_DATA_VERSION,
            exportedAt: new Date().toISOString(),
            categories: state.categories,
            materials: state.materials,
            warehouses: state.warehouses,
            stockMovements: state.stockMovements,
            balances: state.balances,
            projects: state.projects,
            projectMaterials: state.projectMaterials,
            materialConsumptions: state.materialConsumptions,
            materialRequests: state.materialRequests,
            equipment: state.equipment,
            equipmentAssignments: state.equipmentAssignments,
            maintenanceRecords: state.maintenanceRecords,
            suppliers: state.suppliers,
            purchaseOrders: state.purchaseOrders,
            activityLogs: state.activityLogs,
            notifications: state.notifications,
            settings: state.settings,
          };

          const parsed = demoDataSchema.safeParse(candidate);
          if (!parsed.success) {
            set({ ...seedState(), hydrated: true, recovered: true });
            return;
          }
          set({ ...normalizeInventoryCosts(parsed.data), hydrated: true });
        },
        clearRecovered: () => set({ recovered: false }),

        createMaterial: (input) =>
          commit(catalog.createMaterial(get(), input, context())),
        updateMaterial: (id, patch) =>
          commit(catalog.updateMaterial(get(), id, patch, context())),
        archiveMaterial: (id) => commit(catalog.archiveMaterial(get(), id, context())),
        createCategory: (input) =>
          commit(catalog.createCategory(get(), input, context())),
        updateCategory: (id, input) =>
          commit(catalog.updateCategory(get(), id, input, context())),
        archiveCategory: (id) =>
          commit(catalog.archiveCategory(get(), id, context())),
        createWarehouse: (input) =>
          commit(catalog.createWarehouse(get(), input, context())),
        updateWarehouse: (id, input) =>
          commit(catalog.updateWarehouse(get(), id, input, context())),
        createProject: (input) => commit(catalog.createProject(get(), input, context())),
        updateProject: (id, input) =>
          commit(catalog.updateProject(get(), id, input, context())),
        createSupplier: (input) =>
          commit(catalog.createSupplier(get(), input, context())),
        updateSupplier: (id, input) =>
          commit(catalog.updateSupplier(get(), id, input, context())),

        recordStockIn: (input) =>
          commit(inventoryService.recordStockIn(get(), input, context())),
        recordStockOut: (input) =>
          commit(inventoryService.recordStockOut(get(), input, context())),
        transferInventory: (input) =>
          commit(inventoryService.transferInventory(get(), input, context())),
        recordAdjustment: (input) =>
          commit(inventoryService.recordAdjustment(get(), input, context())),
        recordReturn: (input) =>
          commit(inventoryService.recordReturn(get(), input, context())),
        recordMaterialConsumption: (input) =>
          commit(inventoryService.recordMaterialConsumption(get(), input, context())),

        createMaterialRequest: (input) =>
          commit(requestService.createMaterialRequest(get(), input, context())),
        approveMaterialRequest: (id) =>
          commit(requestService.approveMaterialRequest(get(), id, context())),
        rejectMaterialRequest: (id, reason) =>
          commit(requestService.rejectMaterialRequest(get(), id, reason, context())),
        fulfillMaterialRequest: (input) =>
          commit(requestService.fulfillMaterialRequest(get(), input, context())),

        createPurchaseOrder: (input) =>
          commit(procurementService.createPurchaseOrder(get(), input, context())),
        approvePurchaseOrder: (id) =>
          commit(procurementService.approvePurchaseOrder(get(), id, context())),
        receivePurchaseOrder: (input) =>
          commit(procurementService.receivePurchaseOrder(get(), input, context())),

        registerEquipment: (input) =>
          commit(equipmentService.registerEquipment(get(), input, context())),
        assignEquipment: (input) =>
          commit(equipmentService.assignEquipment(get(), input, context())),
        returnEquipment: (id) =>
          commit(equipmentService.returnEquipment(get(), id, context())),
        recordEquipmentMaintenance: (input) =>
          commit(equipmentService.recordEquipmentMaintenance(get(), input, context())),

        updateSettings: (settings) => {
          if (!settings.company.name.trim()) {
            return fail("Company name is required");
          }
          set({ settings: { ...settings, updatedAt: new Date().toISOString() } });
          return succeed(undefined);
        },
        resetDemoData: () => set({ ...seedState(), recovered: false }),
        exportDemoData: () => {
          const state = get();
          return {
            version: DEMO_DATA_VERSION,
            exportedAt: new Date().toISOString(),
            categories: state.categories,
            materials: state.materials,
            warehouses: state.warehouses,
            stockMovements: state.stockMovements,
            balances: state.balances,
            projects: state.projects,
            projectMaterials: state.projectMaterials,
            materialConsumptions: state.materialConsumptions,
            materialRequests: state.materialRequests,
            equipment: state.equipment,
            equipmentAssignments: state.equipmentAssignments,
            maintenanceRecords: state.maintenanceRecords,
            suppliers: state.suppliers,
            purchaseOrders: state.purchaseOrders,
            activityLogs: state.activityLogs,
            notifications: state.notifications,
            settings: state.settings,
          };
        },
        importDemoData: (raw) => {
          const parsed = parseDemoData(raw);
          if (!parsed.success || !parsed.data) {
            return fail(parsed.errors?.join(" ") ?? "The file could not be read.");
          }
          set(toDomainData(parsed.data));
          return succeed(undefined);
        },
      };
    },
    {
      name: STORE_NAME,
      version: STORE_VERSION,
      // Transient flags must not be persisted alongside domain records.
      partialize: (state): DomainData => {
        const { hydrated: _hydrated, recovered: _recovered, ...domain } = state;
        void _hydrated;
        void _recovered;
        return domain as DomainData;
      },
      migrate: (persisted, version) => {
        // Version 1 lacks balance costs; backfill after validating the old data.
        if (version < 1) return seedState() as DomainStore;

        const previous = persisted as DomainStore;

        // Version 3 adds project progress. Saved demos get a schedule-derived
        // starting value instead of a hardcoded zero.
        if (version < 3) {
          return {
            ...previous,
            projects: (previous.projects ?? []).map((project) => ({
              ...project,
              progress:
                typeof project.progress === "number"
                  ? project.progress
                  : progressFromSchedule(project),
            })),
          } as DomainStore;
        }

        return previous;
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.markHydrated();
      },
    },
  ),
);

/** Material lookup used by forms and tables. */
export function findMaterial(
  materials: Material[],
  id: string,
): Material | undefined {
  return materials.find((material) => material.id === id);
}

export function findEquipment(
  equipment: Equipment[],
  id: string,
): Equipment | undefined {
  return equipment.find((asset) => asset.id === id);
}

export type { MaterialUnit };
