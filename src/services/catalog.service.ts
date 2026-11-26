import type {
  ConstructionProject,
  Material,
  MaterialCategory,
  MaterialUnit,
  Supplier,
  Warehouse,
} from "@/types/domain";
import type { DomainData } from "@/types/state";
import { fail, succeed, type DomainResult } from "@/lib/result";
import {
  generateId,
  generateMaterialSku,
  generateProjectCode,
  generateSupplierCode,
  generateWarehouseCode,
  nextSequence,
} from "@/lib/ids";
import { appendActivity, type OperationContext } from "@/services/support";
import { categoryInputSchema, type CategoryInputValues } from "@/schemas/domain";

/** Master-data operations. These never touch balances or movements. */

export interface MaterialInput {
  name: string;
  categoryId: string;
  unit: MaterialUnit;
  unitCostCentavos: number;
  reorderPoint: number;
  description?: string;
}

export function createMaterial(
  data: DomainData,
  input: MaterialInput,
  ctx: OperationContext,
): DomainResult<DomainData> {
  if (!input.name.trim()) return fail("Material name is required");
  if (data.materials.some((item) => item.name.toLowerCase() === input.name.trim().toLowerCase())) {
    return fail("A material with this name already exists");
  }
  const category = data.categories.find((item) => item.id === input.categoryId);
  if (!category) return fail("Category not found");
  if (category.status === "archived") return fail("Choose an active category");
  if (!Number.isFinite(input.unitCostCentavos) || input.unitCostCentavos < 0) {
    return fail("Unit cost must be zero or greater");
  }
  if (!Number.isFinite(input.reorderPoint) || input.reorderPoint < 0) {
    return fail("Reorder point must be zero or greater");
  }

  const sequence = nextSequence(data.materials.map((item) => item.sku));
  const material: Material = {
    id: generateId(),
    sku: generateMaterialSku(sequence),
    name: input.name.trim(),
    categoryId: input.categoryId,
    unit: input.unit,
    description: input.description,
    unitCostCentavos: input.unitCostCentavos,
    reorderPoint: input.reorderPoint,
    status: "active",
    createdAt: ctx.now,
    updatedAt: ctx.now,
  };

  return succeed({
    ...data,
    materials: [material, ...data.materials],
    activityLogs: appendActivity(data, {
      action: "Material created",
      entityType: "material",
      entityId: material.id,
      description: `${material.sku} ${material.name} added to the catalogue.`,
      now: ctx.now,
      actor: ctx.actor,
    }),
  });
}

export function updateMaterial(
  data: DomainData,
  materialId: string,
  patch: Partial<MaterialInput>,
  ctx: OperationContext,
): DomainResult<DomainData> {
  const material = data.materials.find((item) => item.id === materialId);
  if (!material) return fail("Material not found");

  if (patch.name !== undefined && !patch.name.trim()) {
    return fail("Material name cannot be empty");
  }
  if (patch.categoryId !== undefined) {
    const category = data.categories.find((item) => item.id === patch.categoryId);
    if (!category) return fail("Category not found");
    if (category.status === "archived" && category.id !== material.categoryId) {
      return fail("Choose an active category");
    }
  }
  if (
    patch.unitCostCentavos !== undefined &&
    (!Number.isFinite(patch.unitCostCentavos) || patch.unitCostCentavos < 0)
  ) {
    return fail("Unit cost must be zero or greater");
  }
  if (
    patch.reorderPoint !== undefined &&
    (!Number.isFinite(patch.reorderPoint) || patch.reorderPoint < 0)
  ) {
    return fail("Reorder point must be zero or greater");
  }

  const updated: Material = {
    ...material,
    ...patch,
    name: patch.name?.trim() ?? material.name,
    updatedAt: ctx.now,
  };

  return succeed({
    ...data,
    materials: data.materials.map((item) => (item.id === materialId ? updated : item)),
    activityLogs: appendActivity(data, {
      action: "Material updated",
      entityType: "material",
      entityId: materialId,
      description: `${updated.sku} ${updated.name} updated.`,
      now: ctx.now,
      actor: ctx.actor,
    }),
  });
}

export function archiveMaterial(
  data: DomainData,
  materialId: string,
  ctx: OperationContext,
): DomainResult<DomainData> {
  const material = data.materials.find((item) => item.id === materialId);
  if (!material) return fail("Material not found");
  if (material.status === "discontinued") return fail("Material is already archived");

  const held = data.balances
    .filter((balance) => balance.materialId === materialId)
    .reduce((total, balance) => total + balance.quantity, 0);

  if (held > 0) {
    return fail(`Archive blocked: ${held} units are still on hand`);
  }

  return succeed({
    ...data,
    materials: data.materials.map((item) =>
      item.id === materialId
        ? { ...item, status: "discontinued", updatedAt: ctx.now }
        : item,
    ),
    activityLogs: appendActivity(data, {
      action: "Material archived",
      entityType: "material",
      entityId: materialId,
      description: `${material.sku} ${material.name} marked discontinued.`,
      now: ctx.now,
      actor: ctx.actor,
    }),
  });
}

export type CategoryInput = CategoryInputValues;

function categoryNameExists(data: DomainData, name: string, exceptId?: string) {
  return data.categories.some(
    (category) =>
      category.id !== exceptId &&
      category.name.trim().toLowerCase() === name.toLowerCase(),
  );
}

export function createCategory(
  data: DomainData,
  input: CategoryInput,
  ctx: OperationContext,
): DomainResult<DomainData> {
  const parsed = categoryInputSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0].message);
  if (categoryNameExists(data, parsed.data.name)) return fail("A category with this name already exists");

  const category: MaterialCategory = {
    ...parsed.data,
    id: generateId(),
    code: `CAT-${String(nextSequence(data.categories.map((item) => item.code))).padStart(2, "0")}`,
    status: "active",
    createdAt: ctx.now,
    updatedAt: ctx.now,
  };

  return succeed({
    ...data,
    categories: [...data.categories, category],
    activityLogs: appendActivity(data, {
      action: "Category created",
      entityType: "category",
      entityId: category.id,
      description: `${category.name} added.`,
      now: ctx.now,
      actor: ctx.actor,
    }),
  });
}

export function updateCategory(
  data: DomainData,
  categoryId: string,
  input: Partial<CategoryInput>,
  ctx: OperationContext,
): DomainResult<DomainData> {
  const category = data.categories.find((item) => item.id === categoryId);
  if (!category) return fail("Category not found");
  const parsed = categoryInputSchema.safeParse({
    name: input.name ?? category.name,
    description: input.description ?? category.description,
    icon: input.icon ?? category.icon,
    color: input.color ?? category.color,
  });
  if (!parsed.success) return fail(parsed.error.issues[0].message);
  if (categoryNameExists(data, parsed.data.name, categoryId)) return fail("A category with this name already exists");
  const updated = { ...category, ...parsed.data, updatedAt: ctx.now };

  return succeed({
    ...data,
    categories: data.categories.map((item) =>
      item.id === categoryId ? updated : item,
    ),
    activityLogs: appendActivity(data, {
      action: "Category updated",
      entityType: "category",
      entityId: categoryId,
      description: `${updated.name} updated.`,
      now: ctx.now,
      actor: ctx.actor,
    }),
  });
}

export function archiveCategory(
  data: DomainData,
  categoryId: string,
  ctx: OperationContext,
): DomainResult<DomainData> {
  const category = data.categories.find((item) => item.id === categoryId);
  if (!category) return fail("Category not found");
  if (category.status === "archived") return fail("Category is already archived");
  if (data.materials.some((material) =>
    material.categoryId === categoryId && material.status === "active",
  )) {
    return fail("Move or archive the active materials before archiving this category");
  }

  return succeed({
    ...data,
    categories: data.categories.map((item) =>
      item.id === categoryId ? { ...item, status: "archived", updatedAt: ctx.now } : item,
    ),
    activityLogs: appendActivity(data, {
      action: "Category archived",
      entityType: "category",
      entityId: categoryId,
      description: `${category.name} archived.`,
      now: ctx.now,
      actor: ctx.actor,
    }),
  });
}

export function createWarehouse(
  data: DomainData,
  input: { name: string; location: string; address: string },
  ctx: OperationContext,
): DomainResult<DomainData> {
  if (!input.name.trim() || !input.location.trim() || !input.address.trim()) {
    return fail("Name, location, and address are required");
  }

  const warehouse: Warehouse = {
    id: generateId(),
    code: generateWarehouseCode(input.location, data.warehouses.length + 1),
    name: input.name.trim(),
    location: input.location.trim(),
    address: input.address.trim(),
    status: "active",
    createdAt: ctx.now,
    updatedAt: ctx.now,
  };

  return succeed({
    ...data,
    warehouses: [...data.warehouses, warehouse],
    activityLogs: appendActivity(data, {
      action: "Warehouse created",
      entityType: "warehouse",
      entityId: warehouse.id,
      description: `${warehouse.name} opened in ${warehouse.location}.`,
      now: ctx.now,
      actor: ctx.actor,
    }),
  });
}

export function updateWarehouse(
  data: DomainData,
  warehouseId: string,
  input: { name?: string; location?: string; address?: string; status?: Warehouse["status"] },
  ctx: OperationContext,
): DomainResult<DomainData> {
  const warehouse = data.warehouses.find((item) => item.id === warehouseId);
  if (!warehouse) return fail("Warehouse not found");

  if (input.status === "inactive") {
    const held = data.balances
      .filter((balance) => balance.warehouseId === warehouseId)
      .reduce((total, balance) => total + balance.quantity, 0);
    if (held > 0) return fail("Deactivate blocked: the warehouse still holds stock");
  }

  return succeed({
    ...data,
    warehouses: data.warehouses.map((item) =>
      item.id === warehouseId
        ? {
            ...item,
            name: input.name?.trim() ?? item.name,
            location: input.location?.trim() ?? item.location,
            address: input.address?.trim() ?? item.address,
            status: input.status ?? item.status,
            updatedAt: ctx.now,
          }
        : item,
    ),
  });
}

export interface ProjectInput {
  name: string;
  location: string;
  client: string;
  startDate: string;
  targetEndDate: string;
  budgetCentavos: number;
  managerName: string;
  description?: string;
}

export function createProject(
  data: DomainData,
  input: ProjectInput,
  ctx: OperationContext,
): DomainResult<DomainData> {
  if (!input.name.trim()) return fail("Project name is required");
  if (!input.client.trim()) return fail("Client is required");
  if (input.targetEndDate < input.startDate) {
    return fail("Target end date cannot precede the start date");
  }
  if (!Number.isFinite(input.budgetCentavos) || input.budgetCentavos < 0) {
    return fail("Budget must be zero or greater");
  }

  const sequence = nextSequence(data.projects.map((project) => project.code));
  const project: ConstructionProject = {
    id: generateId(),
    code: generateProjectCode(sequence, 2026),
    name: input.name.trim(),
    location: input.location.trim(),
    client: input.client.trim(),
    status: "planned",
    startDate: input.startDate,
    targetEndDate: input.targetEndDate,
    budgetCentavos: input.budgetCentavos,
    managerName: input.managerName.trim(),
    description: input.description,
    createdAt: ctx.now,
    updatedAt: ctx.now,
  };

  return succeed({
    ...data,
    projects: [project, ...data.projects],
    activityLogs: appendActivity(data, {
      action: "Project created",
      entityType: "project",
      entityId: project.id,
      description: `${project.code} ${project.name} created for ${project.client}.`,
      now: ctx.now,
      actor: ctx.actor,
    }),
  });
}

export function updateProject(
  data: DomainData,
  projectId: string,
  input: Partial<ProjectInput> & { status?: ConstructionProject["status"] },
  ctx: OperationContext,
): DomainResult<DomainData> {
  const project = data.projects.find((item) => item.id === projectId);
  if (!project) return fail("Project not found");

  const nextStart = input.startDate ?? project.startDate;
  const nextEnd = input.targetEndDate ?? project.targetEndDate;
  if (nextEnd < nextStart) {
    return fail("Target end date cannot precede the start date");
  }

  return succeed({
    ...data,
    projects: data.projects.map((item) =>
      item.id === projectId
        ? {
            ...item,
            ...input,
            name: input.name?.trim() ?? item.name,
            updatedAt: ctx.now,
          }
        : item,
    ),
    activityLogs: appendActivity(data, {
      action: "Project updated",
      entityType: "project",
      entityId: projectId,
      description: `${project.code} updated${input.status ? ` to ${input.status}` : ""}.`,
      now: ctx.now,
      actor: ctx.actor,
    }),
  });
}

export interface SupplierInput {
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  paymentTerms?: string;
  status?: Supplier["status"];
}

export function createSupplier(
  data: DomainData,
  input: SupplierInput,
  ctx: OperationContext,
): DomainResult<DomainData> {
  if (!input.name.trim()) return fail("Supplier name is required");
  if (!input.contactPerson.trim()) return fail("Contact person is required");
  if (!input.phone.trim()) return fail("Phone number is required");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.email)) {
    return fail("Enter a valid email address");
  }

  const sequence = nextSequence(data.suppliers.map((supplier) => supplier.code));
  const supplier: Supplier = {
    id: generateId(),
    code: generateSupplierCode(sequence),
    name: input.name.trim(),
    contactPerson: input.contactPerson.trim(),
    phone: input.phone.trim(),
    email: input.email.trim(),
    address: input.address.trim(),
    status: input.status ?? "active",
    paymentTerms: input.paymentTerms,
    createdAt: ctx.now,
    updatedAt: ctx.now,
  };

  return succeed({
    ...data,
    suppliers: [supplier, ...data.suppliers],
    activityLogs: appendActivity(data, {
      action: "Supplier created",
      entityType: "supplier",
      entityId: supplier.id,
      description: `${supplier.name} added as a supplier.`,
      now: ctx.now,
      actor: ctx.actor,
    }),
  });
}

export function updateSupplier(
  data: DomainData,
  supplierId: string,
  input: Partial<SupplierInput>,
  ctx: OperationContext,
): DomainResult<DomainData> {
  const supplier = data.suppliers.find((item) => item.id === supplierId);
  if (!supplier) return fail("Supplier not found");
  if (input.email !== undefined && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.email)) {
    return fail("Enter a valid email address");
  }

  return succeed({
    ...data,
    suppliers: data.suppliers.map((item) =>
      item.id === supplierId ? { ...item, ...input, updatedAt: ctx.now } : item,
    ),
    activityLogs: appendActivity(data, {
      action: "Supplier updated",
      entityType: "supplier",
      entityId: supplierId,
      description: `${supplier.name} updated.`,
      now: ctx.now,
      actor: ctx.actor,
    }),
  });
}
