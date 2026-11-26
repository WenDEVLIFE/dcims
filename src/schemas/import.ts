import { z } from "zod";

import {
  categorySchema,
  equipmentSchema,
  materialRequestSchema,
  materialSchema,
  purchaseOrderSchema,
  stockMovementSchema,
  supplierSchema,
  warehouseSchema,
  applicationSettingsSchema,
  timestampSchema,
  projectSchema,
} from "@/schemas/domain";

/**
 * Schema for a full demo-data backup. Import is the only path that accepts a
 * whole dataset, so it validates every collection before anything reaches the
 * store.
 */

export const DEMO_DATA_VERSION = 1;

export const demoDataSchema = z.object({
  version: z.literal(DEMO_DATA_VERSION),
  exportedAt: timestampSchema,
  categories: z.array(categorySchema),
  materials: z.array(materialSchema),
  warehouses: z.array(warehouseSchema),
  stockMovements: z.array(stockMovementSchema),
  projects: z.array(projectSchema),
  materialRequests: z.array(materialRequestSchema),
  equipment: z.array(equipmentSchema),
  suppliers: z.array(supplierSchema),
  purchaseOrders: z.array(purchaseOrderSchema),
  settings: applicationSettingsSchema,
});

export type DemoData = z.infer<typeof demoDataSchema>;

export interface ImportResult {
  success: boolean;
  data?: DemoData;
  /** Field-level messages, one per issue. */
  errors?: string[];
}

/** Validates untrusted JSON text without throwing. */
export function parseDemoData(raw: string): ImportResult {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return { success: false, errors: ["The file is not valid JSON."] };
  }

  const result = demoDataSchema.safeParse(json);
  if (!result.success) {
    return {
      success: false,
      errors: result.error.issues.map((issue) => {
        const path = issue.path.join(".");
        return path ? `${path}: ${issue.message}` : issue.message;
      }),
    };
  }

  return { success: true, data: result.data };
}
