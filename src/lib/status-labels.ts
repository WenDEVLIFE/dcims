import type {
  EquipmentCondition,
  EquipmentStatus,
  MaterialRequestStatus,
  ProjectStatus,
  PurchaseOrderStatus,
  StockStatus,
} from "@/types/domain";

/**
 * Single source of display labels for domain statuses.
 *
 * Badges, filters, and detail views all read from here so the same status can
 * never be called "Partially fulfilled" on one screen and "Partial" on another.
 */

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  planned: "Planned",
  active: "Active",
  "on-hold": "On hold",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const EQUIPMENT_STATUS_LABELS: Record<EquipmentStatus, string> = {
  available: "Available",
  assigned: "Assigned",
  "under-maintenance": "Under maintenance",
  damaged: "Damaged",
  retired: "Retired",
};

export const EQUIPMENT_CONDITION_LABELS: Record<EquipmentCondition, string> = {
  good: "Good",
  fair: "Fair",
  "needs-repair": "Needs repair",
};

export const PURCHASE_ORDER_STATUS_LABELS: Record<PurchaseOrderStatus, string> = {
  draft: "Draft",
  pending: "Pending",
  approved: "Approved",
  ordered: "Ordered",
  "partially-received": "Partially received",
  received: "Received",
  cancelled: "Cancelled",
};

export const REQUEST_STATUS_LABELS: Record<MaterialRequestStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  "partially-fulfilled": "Partially fulfilled",
  fulfilled: "Fulfilled",
  cancelled: "Cancelled",
};

export const STOCK_STATUS_LABELS: Record<StockStatus, string> = {
  "in-stock": "In stock",
  "low-stock": "Low stock",
  "out-of-stock": "Out of stock",
};

export const PROJECT_STATUS_OPTIONS = Object.entries(PROJECT_STATUS_LABELS).map(
  ([value, label]) => ({ value, label }),
);
