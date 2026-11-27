import { describe, expect, it } from "vitest";

import {
  recordAdjustment,
  recordReturn,
  recordStockIn,
  recordStockOut,
  transferInventory,
} from "@/services/inventory.service";
import { balanceUnitCost, calculateWeightedAverageCost } from "@/lib/inventory";
import { ctx, quantityAt, seedData, stockedPair, totalQuantity } from "@/test/helpers";

describe("inventory transactions", () => {
  it("increases quantity on stock-in", () => {
    const data = seedData();
    const pair = stockedPair(data);
    const before = quantityAt(data, pair.materialId, pair.warehouseId);

    const result = recordStockIn(
      data,
      {
        materialId: pair.materialId,
        warehouseId: pair.warehouseId,
        quantity: 25,
        unitCostCentavos: 10_000,
      },
      ctx,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(quantityAt(result.data, pair.materialId, pair.warehouseId)).toBe(before + 25);
  });

  it("decreases quantity on stock-out", () => {
    const data = seedData();
    const pair = stockedPair(data);
    const before = quantityAt(data, pair.materialId, pair.warehouseId);

    const result = recordStockOut(
      data,
      { materialId: pair.materialId, warehouseId: pair.warehouseId, quantity: 5 },
      ctx,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(quantityAt(result.data, pair.materialId, pair.warehouseId)).toBe(before - 5);
  });

  it("rejects zero and negative quantities", () => {
    const data = seedData();
    const pair = stockedPair(data);

    for (const quantity of [0, -3]) {
      const stockIn = recordStockIn(
        data,
        {
          materialId: pair.materialId,
          warehouseId: pair.warehouseId,
          quantity,
          unitCostCentavos: 1_000,
        },
        ctx,
      );
      const stockOut = recordStockOut(
        data,
        { materialId: pair.materialId, warehouseId: pair.warehouseId, quantity },
        ctx,
      );
      expect(stockIn.ok).toBe(false);
      expect(stockOut.ok).toBe(false);
    }
  });

  it("rejects stock-out beyond availability and leaves state untouched", () => {
    const data = seedData();
    const pair = stockedPair(data);
    const before = structuredClone(data.balances);

    const result = recordStockOut(
      data,
      {
        materialId: pair.materialId,
        warehouseId: pair.warehouseId,
        quantity: pair.quantity + 1,
      },
      ctx,
    );

    expect(result.ok).toBe(false);
    expect(data.balances).toEqual(before);
  });

  it("applies weighted-average cost to the warehouse balance on stock-in", () => {
    const data = seedData();
    const pair = stockedPair(data);
    const material = data.materials.find((item) => item.id === pair.materialId)!;
    const current = quantityAt(data, pair.materialId, pair.warehouseId);
    const currentCost = balanceUnitCost(
      data.balances.find(
        (balance) =>
          balance.materialId === pair.materialId &&
          balance.warehouseId === pair.warehouseId,
      ),
      material.unitCostCentavos,
    );

    const expected = calculateWeightedAverageCost({
      currentQuantity: current,
      currentUnitCostCentavos: currentCost,
      incomingQuantity: 10,
      incomingUnitCostCentavos: 50_000,
    });

    const result = recordStockIn(
      data,
      {
        materialId: pair.materialId,
        warehouseId: pair.warehouseId,
        quantity: 10,
        unitCostCentavos: 50_000,
      },
      ctx,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const updated = result.data.balances.find(
      (balance) =>
        balance.materialId === pair.materialId &&
        balance.warehouseId === pair.warehouseId,
    )!;
    expect(updated.unitCostCentavos).toBe(expected);
  });

  it("preserves total stock across a transfer", () => {
    const data = seedData();
    const pair = stockedPair(data);
    const destination = data.warehouses.find(
      (warehouse) => warehouse.id !== pair.warehouseId,
    )!;
    const before = totalQuantity(data, pair.materialId);

    const result = transferInventory(
      data,
      {
        materialId: pair.materialId,
        sourceWarehouseId: pair.warehouseId,
        destinationWarehouseId: destination.id,
        quantity: 4,
      },
      ctx,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(totalQuantity(result.data, pair.materialId)).toBe(before);
    expect(quantityAt(result.data, pair.materialId, destination.id)).toBeGreaterThan(0);
  });

  it("rejects a transfer to the same warehouse and an over-transfer", () => {
    const data = seedData();
    const pair = stockedPair(data);

    const sameWarehouse = transferInventory(
      data,
      {
        materialId: pair.materialId,
        sourceWarehouseId: pair.warehouseId,
        destinationWarehouseId: pair.warehouseId,
        quantity: 1,
      },
      ctx,
    );
    expect(sameWarehouse.ok).toBe(false);

    const other = data.warehouses.find((w) => w.id !== pair.warehouseId)!;
    const tooMuch = transferInventory(
      data,
      {
        materialId: pair.materialId,
        sourceWarehouseId: pair.warehouseId,
        destinationWarehouseId: other.id,
        quantity: pair.quantity + 1,
      },
      ctx,
    );
    expect(tooMuch.ok).toBe(false);
  });

  it("requires a reason for adjustments and rejects negative counts", () => {
    const data = seedData();
    const pair = stockedPair(data);

    const noReason = recordAdjustment(
      data,
      {
        materialId: pair.materialId,
        warehouseId: pair.warehouseId,
        countedQuantity: 1,
        reason: "   ",
      },
      ctx,
    );
    expect(noReason.ok).toBe(false);

    const negative = recordAdjustment(
      data,
      {
        materialId: pair.materialId,
        warehouseId: pair.warehouseId,
        countedQuantity: -1,
        reason: "Miscount",
      },
      ctx,
    );
    expect(negative.ok).toBe(false);
  });

  it("moves stock back to the warehouse on a return", () => {
    const data = seedData();
    const allocation = data.projectMaterials.find((entry) => entry.quantity > 2)!;
    const warehouse =
      data.balances.find((balance) => balance.materialId === allocation.materialId)
        ?.warehouseId ?? data.warehouses[0].id;
    const beforeProject = allocation.quantity;
    const beforeWarehouse = quantityAt(data, allocation.materialId, warehouse);

    const result = recordReturn(
      data,
      {
        materialId: allocation.materialId,
        projectId: allocation.projectId,
        warehouseId: warehouse,
        quantity: 2,
      },
      ctx,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(quantityAt(result.data, allocation.materialId, warehouse)).toBe(
      beforeWarehouse + 2,
    );
    const after = result.data.projectMaterials.find((entry) => entry.id === allocation.id);
    expect(after?.quantity ?? 0).toBe(beforeProject - 2);
  });

  it("rejects a return larger than the on-site quantity", () => {
    const data = seedData();
    const allocation = data.projectMaterials[0];

    const result = recordReturn(
      data,
      {
        materialId: allocation.materialId,
        projectId: allocation.projectId,
        warehouseId: data.warehouses[0].id,
        quantity: allocation.quantity + 1,
      },
      ctx,
    );

    expect(result.ok).toBe(false);
  });
});
