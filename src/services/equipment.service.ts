import type {
  Equipment,
  EquipmentAssignment,
  MaintenanceRecord,
} from "@/types/domain";
import type { DomainData } from "@/types/state";
import { fail, succeed, type DomainResult } from "@/lib/result";
import { generateId, generateEquipmentAssetCode, nextSequence } from "@/lib/ids";
import { appendActivity, type OperationContext } from "@/services/support";

/**
 * Equipment rules: an asset can only be assigned while available, and a
 * damaged, retired, or maintenance asset can never be assigned.
 */

export interface RegisterEquipmentInput {
  name: string;
  category: string;
  condition: Equipment["condition"];
  purchaseDate: string;
  purchaseCostCentavos: number;
  location: string;
  notes?: string;
}

export function registerEquipment(
  data: DomainData,
  input: RegisterEquipmentInput,
  ctx: OperationContext,
): DomainResult<DomainData> {
  if (!input.name.trim()) return fail("Equipment name is required");
  if (!Number.isFinite(input.purchaseCostCentavos) || input.purchaseCostCentavos < 0) {
    return fail("Purchase cost must be zero or greater");
  }

  const sequence = nextSequence(data.equipment.map((asset) => asset.assetCode));
  const asset: Equipment = {
    id: generateId(),
    assetCode: generateEquipmentAssetCode(sequence),
    name: input.name.trim(),
    category: input.category.trim() || "General",
    status: "available",
    condition: input.condition,
    purchaseDate: input.purchaseDate,
    purchaseCostCentavos: input.purchaseCostCentavos,
    location: input.location.trim(),
    notes: input.notes,
    createdAt: ctx.now,
    updatedAt: ctx.now,
  };

  return succeed({
    ...data,
    equipment: [asset, ...data.equipment],
    activityLogs: appendActivity(data, {
      action: "Equipment registered",
      entityType: "equipment",
      entityId: asset.id,
      description: `${asset.assetCode} ${asset.name} added as available.`,
      now: ctx.now,
      actor: ctx.actor,
    }),
  });
}

export interface AssignEquipmentInput {
  equipmentId: string;
  projectId: string;
  assignedTo: string;
}

export function assignEquipment(
  data: DomainData,
  input: AssignEquipmentInput,
  ctx: OperationContext,
): DomainResult<DomainData> {
  const asset = data.equipment.find((entry) => entry.id === input.equipmentId);
  if (!asset) return fail("Equipment not found");

  const project = data.projects.find((entry) => entry.id === input.projectId);
  if (!project) return fail("Project not found");
  if (project.status === "completed" || project.status === "cancelled") {
    return fail("Cannot assign equipment to a completed or cancelled project");
  }

  if (asset.status === "assigned") {
    return fail("Equipment is already assigned to a project");
  }
  if (asset.status === "under-maintenance") {
    return fail("Equipment under maintenance cannot be assigned");
  }
  if (asset.status === "damaged") return fail("Damaged equipment cannot be assigned");
  if (asset.status === "retired") return fail("Retired equipment cannot be assigned");
  if (asset.condition === "needs-repair") {
    return fail("Equipment needing repair cannot be assigned");
  }

  if (!input.assignedTo.trim()) return fail("Assigned person is required");

  const assignment: EquipmentAssignment = {
    id: generateId(),
    equipmentId: asset.id,
    projectId: project.id,
    assignedTo: input.assignedTo.trim(),
    assignedAt: ctx.now,
  };

  return succeed({
    ...data,
    equipment: data.equipment.map((entry) =>
      entry.id === asset.id
        ? {
            ...entry,
            status: "assigned",
            assignedProjectId: project.id,
            location: project.location,
            updatedAt: ctx.now,
          }
        : entry,
    ),
    equipmentAssignments: [assignment, ...data.equipmentAssignments],
    activityLogs: appendActivity(data, {
      action: "Equipment assigned",
      entityType: "equipment",
      entityId: asset.id,
      description: `${asset.assetCode} assigned to ${project.name}.`,
      now: ctx.now,
      actor: ctx.actor,
    }),
  });
}

export function returnEquipment(
  data: DomainData,
  equipmentId: string,
  ctx: OperationContext,
): DomainResult<DomainData> {
  const asset = data.equipment.find((entry) => entry.id === equipmentId);
  if (!asset) return fail("Equipment not found");
  if (asset.status !== "assigned") return fail("Equipment is not currently assigned");

  const openAssignment = data.equipmentAssignments.find(
    (entry) => entry.equipmentId === equipmentId && !entry.returnedAt,
  );

  return succeed({
    ...data,
    equipment: data.equipment.map((entry) =>
      entry.id === equipmentId
        ? {
            ...entry,
            status: entry.condition === "needs-repair" ? "under-maintenance" : "available",
            assignedProjectId: undefined,
            location: "Central Warehouse",
            updatedAt: ctx.now,
          }
        : entry,
    ),
    equipmentAssignments: openAssignment
      ? data.equipmentAssignments.map((entry) =>
          entry.id === openAssignment.id ? { ...entry, returnedAt: ctx.now } : entry,
        )
      : data.equipmentAssignments,
    activityLogs: appendActivity(data, {
      action: "Equipment returned",
      entityType: "equipment",
      entityId: asset.id,
      description: `${asset.assetCode} returned to the warehouse.`,
      now: ctx.now,
      actor: ctx.actor,
    }),
  });
}

export interface MaintenanceInput {
  equipmentId: string;
  description: string;
  costCentavos: number;
  performedBy: string;
  completed: boolean;
}

export function recordEquipmentMaintenance(
  data: DomainData,
  input: MaintenanceInput,
  ctx: OperationContext,
): DomainResult<DomainData> {
  const asset = data.equipment.find((entry) => entry.id === input.equipmentId);
  if (!asset) return fail("Equipment not found");
  if (!input.description.trim()) return fail("Maintenance description is required");
  if (!Number.isFinite(input.costCentavos) || input.costCentavos < 0) {
    return fail("Maintenance cost must be zero or greater");
  }
  if (asset.status === "assigned" && !input.completed) {
    return fail("Return the equipment before starting maintenance");
  }

  const record: MaintenanceRecord = {
    id: generateId(),
    equipmentId: asset.id,
    description: input.description.trim(),
    costCentavos: input.costCentavos,
    performedBy: input.performedBy.trim() || ctx.actor,
    startedAt: ctx.now,
    completedAt: input.completed ? ctx.now : undefined,
    equipmentStatusAfter: input.completed
      ? asset.condition === "needs-repair"
        ? "damaged"
        : "available"
      : "under-maintenance",
  };

  return succeed({
    ...data,
    equipment: data.equipment.map((entry) =>
      entry.id === asset.id
        ? {
            ...entry,
            status: record.equipmentStatusAfter,
            updatedAt: ctx.now,
          }
        : entry,
    ),
    maintenanceRecords: [record, ...data.maintenanceRecords],
    activityLogs: appendActivity(data, {
      action: input.completed ? "Maintenance completed" : "Maintenance started",
      entityType: "equipment",
      entityId: asset.id,
      description: `${asset.assetCode}: ${record.description}`,
      now: ctx.now,
      actor: ctx.actor,
    }),
  });
}
