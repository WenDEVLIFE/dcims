/**
 * DCIMS domain models.
 *
 * Two conventions hold across every entity:
 * - Monetary values are integer centavos. Never store pesos in a field ending
 *   in `Centavos`.
 * - Dates use `YYYY-MM-DD`, timestamps use full ISO 8601 strings. Calendar
 *   dates are kept separate from instants so timezone conversion cannot shift
 *   a project's start date by a day.
 */

export type ID = string;
export type ISODate = string;
export type ISOTimestamp = string;
export type Centavos = number;

/* ------------------------------------------------------------------ */
/* Inventory                                                           */
/* ------------------------------------------------------------------ */

export const MATERIAL_STATUSES = ["active", "discontinued"] as const;
export type MaterialStatus = (typeof MATERIAL_STATUSES)[number];

export const MATERIAL_UNITS = [
  "bag",
  "piece",
  "cubic-meter",
  "square-meter",
  "kilogram",
  "liter",
  "roll",
  "sheet",
  "length",
  "set",
] as const;
export type MaterialUnit = (typeof MATERIAL_UNITS)[number];

export const STOCK_STATUSES = [
  "in-stock",
  "low-stock",
  "out-of-stock",
] as const;
export type StockStatus = (typeof STOCK_STATUSES)[number];

export const WAREHOUSE_STATUSES = ["active", "inactive"] as const;
export type WarehouseStatus = (typeof WAREHOUSE_STATUSES)[number];

export const STOCK_MOVEMENT_TYPES = [
  "stock-in",
  "stock-out",
  "transfer",
  "adjustment",
  "return",
] as const;
export type StockMovementType = (typeof STOCK_MOVEMENT_TYPES)[number];

export interface MaterialCategory {
  id: ID;
  code: string;
  name: string;
  description?: string;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

export interface Material {
  id: ID;
  /** Deterministic identifier, e.g. MAT-0001. */
  sku: string;
  name: string;
  categoryId: ID;
  unit: MaterialUnit;
  description?: string;
  /** Weighted-average unit cost in centavos. */
  unitCostCentavos: Centavos;
  /** Quantity at or below which the material is considered low on stock. */
  reorderPoint: number;
  status: MaterialStatus;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

export interface Warehouse {
  id: ID;
  /** Deterministic identifier, e.g. WH-MATINA-01. */
  code: string;
  name: string;
  /** Area within Davao City, e.g. Matina. */
  location: string;
  address: string;
  status: WarehouseStatus;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

export interface InventoryBalance {
  id: ID;
  materialId: ID;
  warehouseId: ID;
  quantity: number;
  updatedAt: ISOTimestamp;
}

export interface StockMovement {
  id: ID;
  /** Deterministic reference, e.g. TXN-2026-0001. */
  reference: string;
  type: StockMovementType;
  materialId: ID;
  warehouseId: ID;
  /** Set for transfers only. */
  destinationWarehouseId?: ID;
  /** Set when the movement belongs to a project, e.g. stock-out or return. */
  projectId?: ID;
  quantity: number;
  /** Cost snapshot at the time of the movement, in centavos. */
  unitCostCentavos: Centavos;
  totalCostCentavos: Centavos;
  /** Source warehouse balance after the movement. */
  balanceAfter: number;
  reason?: string;
  notes?: string;
  performedBy: string;
  createdAt: ISOTimestamp;
}

/* ------------------------------------------------------------------ */
/* Projects                                                            */
/* ------------------------------------------------------------------ */

export const PROJECT_STATUSES = [
  "planned",
  "active",
  "on-hold",
  "completed",
  "cancelled",
] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export interface ConstructionProject {
  id: ID;
  /** Deterministic identifier, e.g. PRJ-2026-001. */
  code: string;
  name: string;
  location: string;
  client: string;
  status: ProjectStatus;
  startDate: ISODate;
  targetEndDate: ISODate;
  budgetCentavos: Centavos;
  managerName: string;
  description?: string;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

export interface ProjectMaterial {
  id: ID;
  projectId: ID;
  materialId: ID;
  /** Quantity currently held on site. */
  quantity: number;
  /** Cumulative quantity consumed by the project. */
  consumedQuantity: number;
  updatedAt: ISOTimestamp;
}

export interface MaterialConsumption {
  id: ID;
  projectId: ID;
  materialId: ID;
  quantity: number;
  unitCostCentavos: Centavos;
  totalCostCentavos: Centavos;
  /** Movement reference that produced this consumption. */
  reference: string;
  consumedAt: ISOTimestamp;
}

/* ------------------------------------------------------------------ */
/* Material requests                                                   */
/* ------------------------------------------------------------------ */

export const REQUEST_PRIORITIES = ["low", "normal", "high", "urgent"] as const;
export type RequestPriority = (typeof REQUEST_PRIORITIES)[number];

export const MATERIAL_REQUEST_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "partially-fulfilled",
  "fulfilled",
  "cancelled",
] as const;
export type MaterialRequestStatus = (typeof MATERIAL_REQUEST_STATUSES)[number];

export interface MaterialRequestItem {
  id: ID;
  materialId: ID;
  requestedQuantity: number;
  /** Zero until the request is approved. */
  approvedQuantity: number;
  /** Cumulative quantity released from the warehouse. */
  fulfilledQuantity: number;
  unitCostCentavos: Centavos;
}

export interface MaterialRequest {
  id: ID;
  /** Deterministic reference, e.g. REQ-2026-015. */
  reference: string;
  projectId: ID;
  requestedBy: string;
  priority: RequestPriority;
  status: MaterialRequestStatus;
  items: MaterialRequestItem[];
  notes?: string;
  requestedAt: ISOTimestamp;
  reviewedAt?: ISOTimestamp;
  reviewedBy?: string;
}

/* ------------------------------------------------------------------ */
/* Equipment                                                           */
/* ------------------------------------------------------------------ */

export const EQUIPMENT_CONDITIONS = ["good", "fair", "needs-repair"] as const;
export type EquipmentCondition = (typeof EQUIPMENT_CONDITIONS)[number];

export const EQUIPMENT_STATUSES = [
  "available",
  "assigned",
  "under-maintenance",
  "damaged",
  "retired",
] as const;
export type EquipmentStatus = (typeof EQUIPMENT_STATUSES)[number];

export interface Equipment {
  id: ID;
  /** Deterministic identifier, e.g. EQP-0008. */
  assetCode: string;
  name: string;
  category: string;
  status: EquipmentStatus;
  condition: EquipmentCondition;
  purchaseDate: ISODate;
  purchaseCostCentavos: Centavos;
  assignedProjectId?: ID;
  location: string;
  notes?: string;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

export interface EquipmentAssignment {
  id: ID;
  equipmentId: ID;
  projectId: ID;
  assignedTo: string;
  assignedAt: ISOTimestamp;
  returnedAt?: ISOTimestamp;
  notes?: string;
}

export interface MaintenanceRecord {
  id: ID;
  equipmentId: ID;
  description: string;
  costCentavos: Centavos;
  performedBy: string;
  startedAt: ISOTimestamp;
  completedAt?: ISOTimestamp;
  equipmentStatusAfter: EquipmentStatus;
}

/* ------------------------------------------------------------------ */
/* Procurement                                                         */
/* ------------------------------------------------------------------ */

export const SUPPLIER_STATUSES = ["active", "inactive"] as const;
export type SupplierStatus = (typeof SUPPLIER_STATUSES)[number];

export const PURCHASE_ORDER_STATUSES = [
  "draft",
  "pending",
  "approved",
  "ordered",
  "partially-received",
  "received",
  "cancelled",
] as const;
export type PurchaseOrderStatus = (typeof PURCHASE_ORDER_STATUSES)[number];

export interface Supplier {
  id: ID;
  /** Deterministic identifier, e.g. SUP-001. */
  code: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  status: SupplierStatus;
  paymentTerms?: string;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

export interface PurchaseOrderItem {
  id: ID;
  materialId: ID;
  orderedQuantity: number;
  receivedQuantity: number;
  unitCostCentavos: Centavos;
}

export interface PurchaseOrder {
  id: ID;
  /** Deterministic reference, e.g. PO-2026-001. */
  reference: string;
  supplierId: ID;
  warehouseId: ID;
  status: PurchaseOrderStatus;
  items: PurchaseOrderItem[];
  subtotalCentavos: Centavos;
  discountCentavos: Centavos;
  deliveryFeeCentavos: Centavos;
  totalCentavos: Centavos;
  expectedDeliveryDate?: ISODate;
  orderedAt?: ISOTimestamp;
  receivedAt?: ISOTimestamp;
  notes?: string;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

/* ------------------------------------------------------------------ */
/* Activity and notifications                                          */
/* ------------------------------------------------------------------ */

export const ACTIVITY_ENTITY_TYPES = [
  "material",
  "category",
  "warehouse",
  "stock-movement",
  "project",
  "material-request",
  "equipment",
  "supplier",
  "purchase-order",
  "settings",
] as const;
export type ActivityEntityType = (typeof ACTIVITY_ENTITY_TYPES)[number];

export interface ActivityLog {
  id: ID;
  /** Short verb phrase, e.g. "Received 120 bags of Portland cement". */
  action: string;
  entityType: ActivityEntityType;
  entityId: ID;
  description: string;
  performedBy: string;
  createdAt: ISOTimestamp;
}

export const NOTIFICATION_TYPES = ["info", "success", "warning", "error"] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export interface Notification {
  id: ID;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: ISOTimestamp;
  /** In-app route the notification refers to. */
  link?: string;
}

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */

export const DEMO_USER_ROLES = [
  "Warehouse supervisor",
  "Procurement officer",
  "Project engineer",
  "Inventory clerk",
] as const;
export type DemoUserRole = (typeof DEMO_USER_ROLES)[number];

export interface DemoUser {
  id: ID;
  name: string;
  role: DemoUserRole;
  email: string;
  initials: string;
}

export interface CompanyProfile {
  name: string;
  address: string;
  phone: string;
  email: string;
  logoPath: string;
}

export interface ApplicationSettings {
  company: CompanyProfile;
  locale: "en-PH";
  currency: "PHP";
  /** Default reorder point applied to new materials. */
  defaultReorderPoint: number;
  demoUser: DemoUser;
  notifications: {
    lowStock: boolean;
    pendingRequests: boolean;
    overduePurchaseOrders: boolean;
  };
  updatedAt: ISOTimestamp;
}
