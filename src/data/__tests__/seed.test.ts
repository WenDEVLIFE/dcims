import { describe, expect, it } from "vitest";

import { findSeedIntegrityProblems, initialDemoData } from "@/data/seed";
import { parseDemoData } from "@/schemas/import";

describe("seed dataset and persistence contracts", () => {
  it("has no cross-record integrity problems", () => {
    expect(findSeedIntegrityProblems(initialDemoData)).toEqual([]);
  });

  it("meets the documented seed minimums", () => {
    expect(initialDemoData.materials.length).toBeGreaterThanOrEqual(50);
    expect(initialDemoData.categories.length).toBeGreaterThanOrEqual(10);
    expect(initialDemoData.warehouses).toHaveLength(3);
    expect(initialDemoData.projects).toHaveLength(6);
    expect(initialDemoData.suppliers.length).toBeGreaterThanOrEqual(12);
    expect(initialDemoData.equipment.length).toBeGreaterThanOrEqual(20);
    expect(initialDemoData.stockMovements.length).toBeGreaterThanOrEqual(40);
    expect(initialDemoData.materialRequests.length).toBeGreaterThanOrEqual(15);
    expect(initialDemoData.purchaseOrders.length).toBeGreaterThanOrEqual(10);
    expect(initialDemoData.activityLogs.length).toBeGreaterThanOrEqual(30);
  });

  it("never derives a negative balance from the ledger", () => {
    const derived = new Map<string, number>();
    for (const movement of initialDemoData.stockMovements) {
      const key = `${movement.materialId}::${movement.warehouseId}`;
      const current = derived.get(key) ?? 0;
      const next =
        movement.type === "stock-in"
          ? current + movement.quantity
          : movement.type === "stock-out"
            ? current - movement.quantity
            : movement.type === "transfer"
              ? current - movement.quantity
              : current;
      derived.set(key, next);
      expect(next).toBeGreaterThanOrEqual(0);
    }
  });

  it("round-trips an export through the import parser", () => {
    const json = JSON.stringify(initialDemoData);
    const parsed = parseDemoData(json);

    expect(parsed.success).toBe(true);
    expect(parsed.data?.materials.length).toBe(initialDemoData.materials.length);
    expect(parsed.data?.stockMovements.length).toBe(
      initialDemoData.stockMovements.length,
    );
    expect(findSeedIntegrityProblems(parsed.data!)).toEqual([]);
  });

  it("rejects a wrong schema version", () => {
    const tampered = { ...initialDemoData, version: 99 };
    const parsed = parseDemoData(JSON.stringify(tampered));

    expect(parsed.success).toBe(false);
    expect(parsed.errors?.length).toBeGreaterThan(0);
  });

  it("rejects malformed JSON and missing collections", () => {
    expect(parseDemoData("{ not json").success).toBe(false);

    const { balances: _omitted, ...withoutBalances } = initialDemoData;
    void _omitted;
    expect(parseDemoData(JSON.stringify(withoutBalances)).success).toBe(false);
  });

  it("rejects a record with a broken reference", () => {
    const tampered = structuredClone(initialDemoData);
    tampered.stockMovements[0] = {
      ...tampered.stockMovements[0],
      materialId: "mat-does-not-exist",
    };

    expect(findSeedIntegrityProblems(tampered).length).toBeGreaterThan(0);
  });
});
