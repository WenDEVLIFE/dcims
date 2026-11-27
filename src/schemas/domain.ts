import { z } from "zod";

import {
  ACTIVITY_ENTITY_TYPES,
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  CATEGORY_STATUSES,
  EQUIPMENT_CONDITIONS,
  EQUIPMENT_STATUSES,
  MATERIAL_REQUEST_STATUSES,
  MATERIAL_STATUSES,
  MATERIAL_UNITS,
  NOTIFICATION_TYPES,
  PROJECT_STATUSES,
  PURCHASE_ORDER_STATUSES,
  REQUEST_PRIORITIES,
  STOCK_MOVEMENT_TYPES,
  SUPPLIER_STATUSES,
  WAREHOUSE_STATUSES,
} from "@/types/domain";

/**
 * Validation schemas for untrusted input: form submissions, imported JSON, and
 * rehydrated LocalStorage. Domain actions must still enforce business rules —
 * these only guarantee shape and range.
 */

export const idSchema = z.string().min(1, "Required");

export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");

export const timestampSchema = z.string().refine(
  (value) => !Number.isNaN(Date.parse(value)),
  "Invalid timestamp",
);

/** Integer centavos; the only legal money representation. */
export const centavosSchema = z.number().int().nonnegative();

export const quantitySchema = z.number().positive("Must be greater than zero");

export const nonNegativeQuantitySchema = z.number().nonnegative();

export const materialSchema = z.object({
  id: idSchema,
  sku: z.string().min(1),
  name: z.string().min(1, "Material name is required").max(120),
  categoryId: idSchema,
  unit: z.enum(MATERIAL_UNITS),
  description: z.string().max(500).optional(),
  unitCostCentavos: centavosSchema,
  reorderPoint: nonNegativeQuantitySchema,
  status: z.enum(MATERIAL_STATUSES),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export const categoryInputSchema = z.object({
  name: z.string().trim().min(1, "Category name is required").max(80),
  description: z.string().trim().max(300).optional(),
  icon: z.enum(CATEGORY_ICONS).optional(),
  color: z.enum(CATEGORY_COLORS).optional(),
});

export type CategoryInputValues = z.infer<typeof categoryInputSchema>;

export const categorySchema = categoryInputSchema.extend({
  id: idSchema,
  code: z.string().min(1),
  status: z.enum(CATEGORY_STATUSES).optional(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export const warehouseInputSchema = z.object({
  name: z.string().trim().min(1, "Warehouse name is required").max(80),
  location: z.string().trim().min(1, "Location is required").max(80),
  address: z.string().trim().min(1, "Address is required").max(200),
  managerName: z.string().trim().max(80).optional(),
  contactNumber: z.string().trim().max(30).optional(),
  storageCapacity: z.string().trim().max(80).optional(),
});

export type WarehouseInputValues = z.infer<typeof warehouseInputSchema>;

export const warehouseSchema = warehouseInputSchema.extend({
  id: idSchema,
  code: z.string().min(1),
  status: z.enum(WAREHOUSE_STATUSES),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export const warehouseTransferInputSchema = z.object({
  sourceWarehouseId: z.string().min(1, "Choose a source warehouse"),
  materialId: z.string().min(1, "Choose a material"),
  destinationWarehouseId: z.string().min(1, "Choose a destination warehouse"),
  quantity: z.number().positive("Enter a quantity greater than zero"),
  notes: z.string().trim().max(300).optional(),
}).refine((input) => input.sourceWarehouseId !== input.destinationWarehouseId, {
  path: ["destinationWarehouseId"],
  message: "Source and destination warehouses must differ",
});

export type WarehouseTransferValues = z.infer<typeof warehouseTransferInputSchema>;

export const stockMovementSchema = z
  .object({
    id: idSchema,
    reference: z.string().min(1),
    type: z.enum(STOCK_MOVEMENT_TYPES),
    materialId: idSchema,
    warehouseId: idSchema,
    destinationWarehouseId: idSchema.optional(),
    projectId: idSchema.optional(),
    quantity: quantitySchema,
    unitCostCentavos: centavosSchema,
    totalCostCentavos: centavosSchema,
    balanceAfter: nonNegativeQuantitySchema,
    reason: z.string().max(200).optional(),
    notes: z.string().max(500).optional(),
    performedBy: z.string().min(1),
    createdAt: timestampSchema,
  })
  .refine(
    (movement) =>
      movement.type !== "transfer" ||
      (movement.destinationWarehouseId !== undefined &&
        movement.destinationWarehouseId !== movement.warehouseId),
    {
      message: "A transfer needs a destination warehouse different from the source",
      path: ["destinationWarehouseId"],
    },
  );

export const projectSchema = z
  .object({
    id: idSchema,
    code: z.string().min(1),
    name: z.string().min(1, "Project name is required").max(120),
    location: z.string().min(1).max(120),
    client: z.string().min(1).max(120),
    status: z.enum(PROJECT_STATUSES),
    progress: z.number().min(0).max(100),
    startDate: isoDateSchema,
    targetEndDate: isoDateSchema,
    budgetCentavos: centavosSchema,
    managerName: z.string().min(1).max(120),
    description: z.string().max(500).optional(),
    createdAt: timestampSchema,
    updatedAt: timestampSchema,
  })
  .refine((project) => project.targetEndDate >= project.startDate, {
    message: "Target end date cannot precede the start date",
    path: ["targetEndDate"],
  });

export const materialRequestItemSchema = z.object({
  id: idSchema,
  materialId: idSchema,
  requestedQuantity: quantitySchema,
  approvedQuantity: nonNegativeQuantitySchema,
  fulfilledQuantity: nonNegativeQuantitySchema,
  unitCostCentavos: centavosSchema,
});

export const materialRequestSchema = z.object({
  id: idSchema,
  reference: z.string().min(1),
  projectId: idSchema,
  requestedBy: z.string().min(1),
  priority: z.enum(REQUEST_PRIORITIES),
  status: z.enum(MATERIAL_REQUEST_STATUSES),
  items: z.array(materialRequestItemSchema).min(1, "Add at least one material"),
  notes: z.string().max(500).optional(),
  requestedAt: timestampSchema,
  requiredDate: isoDateSchema.optional(),
  reviewedAt: timestampSchema.optional(),
  reviewedBy: z.string().min(1).optional(),
});

export const equipmentSchema = z.object({
  id: idSchema,
  assetCode: z.string().min(1),
  name: z.string().min(1, "Equipment name is required").max(120),
  category: z.string().min(1).max(80),
  status: z.enum(EQUIPMENT_STATUSES),
  condition: z.enum(EQUIPMENT_CONDITIONS),
  purchaseDate: isoDateSchema,
  purchaseCostCentavos: centavosSchema,
  assignedProjectId: idSchema.optional(),
  location: z.string().min(1).max(120),
  notes: z.string().max(500).optional(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export const supplierSchema = z.object({
  id: idSchema,
  code: z.string().min(1),
  name: z.string().min(1, "Supplier name is required").max(120),
  contactPerson: z.string().min(1, "Contact person is required").max(120),
  phone: z.string().min(1, "Phone is required").max(40),
  email: z.email("Enter a valid email address"),
  address: z.string().min(1, "Address is required").max(200),
  status: z.enum(SUPPLIER_STATUSES),
  paymentTerms: z.string().max(80).optional(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export const purchaseOrderItemSchema = z.object({
  id: idSchema,
  materialId: idSchema,
  orderedQuantity: quantitySchema,
  receivedQuantity: nonNegativeQuantitySchema,
  unitCostCentavos: centavosSchema,
});

export const purchaseOrderSchema = z.object({
  id: idSchema,
  reference: z.string().min(1),
  supplierId: idSchema,
  warehouseId: idSchema,
  status: z.enum(PURCHASE_ORDER_STATUSES),
  items: z.array(purchaseOrderItemSchema).min(1, "Add at least one material"),
  subtotalCentavos: centavosSchema,
  discountCentavos: centavosSchema,
  deliveryFeeCentavos: centavosSchema,
  totalCentavos: centavosSchema,
  expectedDeliveryDate: isoDateSchema.optional(),
  orderedAt: timestampSchema.optional(),
  receivedAt: timestampSchema.optional(),
  notes: z.string().max(500).optional(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export const companyProfileSchema = z.object({
  name: z.string().min(1, "Company name is required").max(120),
  address: z.string().min(1, "Address is required").max(200),
  phone: z.string().min(1, "Phone is required").max(40),
  email: z.email("Enter a valid email address"),
  logoPath: z.string().min(1),
});

export const demoUserSchema = z.object({
  id: idSchema,
  name: z.string().min(1).max(120),
  role: z.string().min(1).max(80),
  email: z.email("Enter a valid email address"),
  initials: z.string().min(1).max(3),
});

export const applicationSettingsSchema = z.object({
  company: companyProfileSchema,
  locale: z.literal("en-PH"),
  currency: z.literal("PHP"),
  defaultReorderPoint: nonNegativeQuantitySchema,
  demoUser: demoUserSchema,
  notifications: z.object({
    lowStock: z.boolean(),
    pendingRequests: z.boolean(),
    overduePurchaseOrders: z.boolean(),
  }),
  updatedAt: timestampSchema,
});

export const materialConsumptionSchema = z.object({
  id: idSchema,
  projectId: idSchema,
  materialId: idSchema,
  quantity: quantitySchema,
  unitCostCentavos: centavosSchema,
  totalCostCentavos: centavosSchema,
  reference: z.string().min(1),
  consumedAt: timestampSchema,
});

export const projectMaterialSchema = z.object({
  id: idSchema,
  projectId: idSchema,
  materialId: idSchema,
  quantity: nonNegativeQuantitySchema,
  unitCostCentavos: centavosSchema.optional(),
  consumedQuantity: nonNegativeQuantitySchema,
  updatedAt: timestampSchema,
});

export const inventoryBalanceSchema = z.object({
  id: idSchema,
  materialId: idSchema,
  warehouseId: idSchema,
  quantity: nonNegativeQuantitySchema,
  unitCostCentavos: centavosSchema.optional(),
  updatedAt: timestampSchema,
});

export const equipmentAssignmentSchema = z.object({
  id: idSchema,
  equipmentId: idSchema,
  projectId: idSchema,
  assignedTo: z.string().min(1).max(120),
  assignedAt: timestampSchema,
  returnedAt: timestampSchema.optional(),
  notes: z.string().max(500).optional(),
});

export const maintenanceRecordSchema = z.object({
  id: idSchema,
  equipmentId: idSchema,
  description: z.string().min(1).max(300),
  costCentavos: centavosSchema,
  performedBy: z.string().min(1).max(120),
  startedAt: timestampSchema,
  completedAt: timestampSchema.optional(),
  equipmentStatusAfter: z.enum(EQUIPMENT_STATUSES),
});

export const activityLogSchema = z.object({
  id: idSchema,
  action: z.string().min(1).max(160),
  entityType: z.enum(ACTIVITY_ENTITY_TYPES),
  entityId: idSchema,
  description: z.string().min(1).max(500),
  performedBy: z.string().min(1).max(120),
  createdAt: timestampSchema,
});

export const notificationSchema = z.object({
  id: idSchema,
  type: z.enum(NOTIFICATION_TYPES),
  title: z.string().min(1).max(120),
  message: z.string().min(1).max(300),
  read: z.boolean(),
  createdAt: timestampSchema,
  link: z.string().max(200).optional(),
});

/** Form-level input that omits server-owned identifiers and timestamps. */
export const materialInputSchema = z.object({
  name: z.string().min(1, "Material name is required").max(120),
  categoryId: z.string().min(1, "Choose a category"),
  unit: z.enum(MATERIAL_UNITS),
  unitCostCentavos: z.number().int().nonnegative(),
  reorderPoint: z.number().nonnegative(),
  description: z.string().max(500).optional(),
});

export type MaterialInputValues = z.infer<typeof materialInputSchema>;

export const projectInputSchema = z
  .object({
    name: z.string().min(1, "Project name is required").max(120),
    location: z.string().min(1, "Location is required").max(120),
    client: z.string().min(1, "Client is required").max(120),
    managerName: z.string().min(1, "Project manager is required").max(120),
    startDate: isoDateSchema,
    targetEndDate: isoDateSchema,
    budgetCentavos: z.number().int().nonnegative(),
    description: z.string().max(500).optional(),
  })
  .refine((values) => values.targetEndDate >= values.startDate, {
    message: "Target end date cannot precede the start date",
    path: ["targetEndDate"],
  });

export type ProjectInputValues = z.infer<typeof projectInputSchema>;

export const materialFormSchema = materialSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const supplierFormSchema = supplierSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type MaterialFormValues = z.infer<typeof materialFormSchema>;
export type SupplierFormValues = z.infer<typeof supplierFormSchema>;
