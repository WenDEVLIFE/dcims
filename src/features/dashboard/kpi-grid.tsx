import {
  AlertTriangle,
  ClipboardList,
  HardHat,
  Package,
  ShoppingCart,
  Warehouse,
  Wallet,
  Wrench,
} from "lucide-react";

import { StatCard } from "@/components/shared/stat-card";
import { formatCentavos } from "@/lib/currency";
import { formatNumber } from "@/lib/format";
import type { DashboardStats } from "@/stores/selectors";

interface KpiGridProps {
  stats: DashboardStats;
}

export function KpiGrid({ stats }: KpiGridProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Total inventory value"
        value={formatCentavos(stats.inventoryValueCentavos)}
        hint="Weighted-average cost of stock on hand"
        icon={Wallet}
      />
      <StatCard
        label="Registered materials"
        value={formatNumber(stats.materialCount)}
        hint="Active catalogue records"
        icon={Package}
      />
      <StatCard
        label="Active projects"
        value={formatNumber(stats.activeProjectCount)}
        hint="Sites currently consuming materials"
        icon={HardHat}
      />
      <StatCard
        label="Warehouses"
        value={formatNumber(stats.warehouseCount)}
        hint="Active storage locations"
        icon={Warehouse}
      />
      <StatCard
        label="Low-stock materials"
        value={formatNumber(stats.lowStockCount)}
        hint="At or below their reorder point"
        icon={AlertTriangle}
      />
      <StatCard
        label="Open material requests"
        value={formatNumber(stats.pendingRequestCount)}
        hint="Pending, approved, or partially fulfilled"
        icon={ClipboardList}
      />
      <StatCard
        label="Available equipment"
        value={formatNumber(stats.availableEquipmentCount)}
        hint="Ready for assignment"
        icon={Wrench}
      />
      <StatCard
        label="Outstanding purchase orders"
        value={formatNumber(stats.openPurchaseOrderCount)}
        hint="Awaiting approval or delivery"
        icon={ShoppingCart}
      />
    </div>
  );
}
