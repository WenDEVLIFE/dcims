import { describe, expect, it } from "vitest";

import {
  recordMaterialConsumption,
  recordReturn,
} from "@/services/inventory.service";
import { calculateProjectMaterialCost, calculateRemainingBudget } from "@/lib/projects";
import { projectConsumptions, projectExpense } from "@/stores/selectors";
import { quantityAt, seedData } from "@/test/helpers";

const ctx = { now: "2026-11-27T09:00:00.000Z", actor: "Test runner" };

describe("project material handling", () => {
  it("allocates stock to a project when a request is released", () => {
    const data = seedData();
    expect(data.projectMaterials.length).toBeGreaterThan(0);
    for (const allocation of data.projectMaterials) {
      expect(data.projects.some((project) => project.id === allocation.projectId)).toBe(true);
      expect(data.materials.some((material) => material.id === allocation.materialId)).toBe(
        true,
      );
    }
  });

  it("deducts on-site quantity and records consumption cost", () => {
    const data = seedData();
    const allocation = data.projectMaterials.find((entry) => entry.quantity >= 2)!;
    const before = allocation.quantity;

    const result = recordMaterialConsumption(
      data,
      { projectId: allocation.projectId, materialId: allocation.materialId, quantity: 1 },
      ctx,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const updated = result.data.projectMaterials.find((entry) => entry.id === allocation.id)!;
    expect(updated.quantity).toBe(before - 1);
    expect(updated.consumedQuantity).toBe(allocation.consumedQuantity + 1);
    expect(result.data.materialConsumptions).toHaveLength(
      data.materialConsumptions.length + 1,
    );
  });

  it("prevents consuming more than is on site", () => {
    const data = seedData();
    const allocation = data.projectMaterials[0];

    const result = recordMaterialConsumption(
      data,
      {
        projectId: allocation.projectId,
        materialId: allocation.materialId,
        quantity: allocation.quantity + 1,
      },
      ctx,
    );

    expect(result.ok).toBe(false);
  });

  it("returns material from site to a warehouse", () => {
    const data = seedData();
    const allocation = data.projectMaterials.find((entry) => entry.quantity >= 2)!;
    const warehouse = data.warehouses[0];
    const beforeWarehouse = quantityAt(data, allocation.materialId, warehouse.id);

    const result = recordReturn(
      data,
      {
        materialId: allocation.materialId,
        projectId: allocation.projectId,
        warehouseId: warehouse.id,
        quantity: 1,
      },
      ctx,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(quantityAt(result.data, allocation.materialId, warehouse.id)).toBe(
      beforeWarehouse + 1,
    );
  });

  it("derives project expense only from consumption records", () => {
    const data = seedData();
    const projectId = data.projects[0].id;
    const expense = projectExpense(data, projectId);
    const expected = projectConsumptions(data, projectId).reduce(
      (total, entry) => total + entry.totalCostCentavos,
      0,
    );

    expect(expense).toBe(expected);
  });

  it("computes material cost and floors remaining budget at zero", () => {
    expect(
      calculateProjectMaterialCost([
        { quantity: 2, unitCostCentavos: 15_000 },
        { quantity: 1, unitCostCentavos: 5_000 },
      ]),
    ).toBe(35_000);

    expect(calculateRemainingBudget(100_000, 40_000)).toBe(60_000);
    expect(calculateRemainingBudget(100_000, 250_000)).toBe(0);
  });
});
