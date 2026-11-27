import { describe, expect, it } from "vitest";

import {
  assignEquipment,
  recordEquipmentMaintenance,
  registerEquipment,
  retireEquipment,
  returnEquipment,
} from "@/services/equipment.service";
import { seedData } from "@/test/helpers";

const ctx = { now: "2026-11-27T09:00:00.000Z", actor: "Test runner" };

describe("equipment lifecycle", () => {
  it("registers an asset as available with a generated code", () => {
    const data = seedData();

    const result = registerEquipment(
      data,
      {
        name: "Plate Compactor 3 HP",
        category: "Compaction",
        condition: "good",
        purchaseDate: "2026-10-01",
        purchaseCostCentavos: 4_200_000,
        location: "Central Warehouse",
      },
      ctx,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const created = result.data.equipment[0];
    expect(created.status).toBe("available");
    expect(created.assetCode).toMatch(/^EQP-\d{4}$/);
  });

  it("assigns available equipment and records the assignment", () => {
    const data = seedData();
    const asset = data.equipment.find((entry) => entry.status === "available")!;
    const project = data.projects.find((entry) => entry.status === "active")!;

    const result = assignEquipment(
      data,
      { equipmentId: asset.id, projectId: project.id, assignedTo: "Foreman" },
      ctx,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const updated = result.data.equipment.find((entry) => entry.id === asset.id)!;
    expect(updated.status).toBe("assigned");
    expect(updated.assignedProjectId).toBe(project.id);
    expect(result.data.equipmentAssignments.length).toBe(
      data.equipmentAssignments.length + 1,
    );
  });

  it("prevents double assignment", () => {
    const data = seedData();
    const assigned = data.equipment.find((entry) => entry.status === "assigned")!;
    const project = data.projects[0];

    expect(
      assignEquipment(
        data,
        { equipmentId: assigned.id, projectId: project.id, assignedTo: "Foreman" },
        ctx,
      ).ok,
    ).toBe(false);
  });

  it("refuses damaged, retired, and maintenance assets", () => {
    const data = seedData();
    const project = data.projects[0];

    for (const status of ["damaged", "retired", "under-maintenance"] as const) {
      const asset = data.equipment.find((entry) => entry.status === status);
      if (!asset) continue;
      expect(
        assignEquipment(
          data,
          { equipmentId: asset.id, projectId: project.id, assignedTo: "Foreman" },
          ctx,
        ).ok,
      ).toBe(false);
    }
  });

  it("returns equipment and closes the assignment", () => {
    const data = seedData();
    const assigned = data.equipment.find((entry) => entry.status === "assigned")!;

    const result = returnEquipment(data, assigned.id, ctx);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const updated = result.data.equipment.find((entry) => entry.id === assigned.id)!;
    expect(["available", "under-maintenance"]).toContain(updated.status);
    expect(updated.assignedProjectId).toBeUndefined();
  });

  it("blocks starting maintenance on assigned equipment", () => {
    const data = seedData();
    const assigned = data.equipment.find((entry) => entry.status === "assigned")!;

    expect(
      recordEquipmentMaintenance(
        data,
        {
          equipmentId: assigned.id,
          description: "Hydraulic service",
          costCentavos: 100_000,
          performedBy: "Vendor",
          completed: false,
        },
        ctx,
      ).ok,
    ).toBe(false);
  });

  it("moves an available asset into maintenance when work starts", () => {
    const data = seedData();
    const asset = data.equipment.find((entry) => entry.status === "available")!;

    const result = recordEquipmentMaintenance(
      data,
      {
        equipmentId: asset.id,
        description: "Annual service",
        costCentavos: 320_000,
        performedBy: "Vendor",
        completed: false,
      },
      ctx,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(
      result.data.equipment.find((entry) => entry.id === asset.id)!.status,
    ).toBe("under-maintenance");
  });

  it("refuses retiring assigned equipment but allows an available one", () => {
    const data = seedData();
    const assigned = data.equipment.find((entry) => entry.status === "assigned")!;
    expect(retireEquipment(data, assigned.id, ctx).ok).toBe(false);

    const available = data.equipment.find((entry) => entry.status === "available")!;
    const retired = retireEquipment(data, available.id, ctx);
    expect(retired.ok).toBe(true);
    if (!retired.ok) return;
    expect(
      retired.data.equipment.find((entry) => entry.id === available.id)!.status,
    ).toBe("retired");
  });
});
