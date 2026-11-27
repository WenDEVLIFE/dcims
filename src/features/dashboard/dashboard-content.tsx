"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore, useState } from "react";
import type { DateRange } from "react-day-picker";
import { ArrowLeftRight, ClipboardPlus, PackagePlus } from "lucide-react";

import { DateRangeFilter } from "@/components/shared/date-range-filter";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { KpiGrid } from "@/features/dashboard/kpi-grid";
import {
  CategoryValueChart,
  MonthlyMovementChart,
  ProcurementTrendChart,
  ProjectExpenditureChart,
  WarehouseValueChart,
} from "@/features/dashboard/dashboard-charts";
import {
  ActiveProjects,
  LowStockAlerts,
  OpenRequests,
  RecentActivity,
  RecentMovements,
  UpcomingMaintenance,
} from "@/features/dashboard/dashboard-sections";
import { formatDate } from "@/lib/format";
import { useDomainStore } from "@/stores/domain-store";
import {
  activeProjects,
  filterByDateRange,
  inventoryValueByCategory,
  inventoryValueByWarehouse,
  lowStockMaterials,
  monthlyMovementCounts,
  openRequests,
  procurementTrend,
  projectExpenditure,
  recentActivity,
  recentMovements,
  selectDashboardStats,
  totalQuantityByMaterial,
  upcomingMaintenance,
} from "@/stores/selectors";

const subscribeToMount = () => () => {};

/**
 * The dashboard reads persisted state, so it renders a skeleton until the
 * client has mounted. That keeps server markup and the first client render
 * identical and avoids a hydration mismatch on stored data.
 */
export function DashboardContent() {
  const state = useDomainStore();
  const mounted = useSyncExternalStore(
    subscribeToMount,
    () => true,
    () => false,
  );
  const [range, setRange] = useState<DateRange | undefined>(undefined);

  // Declared before any early return so the hook order is stable across the
  // skeleton, empty, and loaded states.
  const derived = useMemo(() => {
    if (!mounted) return null;

    const filtered = {
      ...state,
      stockMovements: filterByDateRange(
        state.stockMovements,
        (movement) => movement.createdAt,
        range,
      ),
      purchaseOrders: filterByDateRange(
        state.purchaseOrders,
        (order) => order.createdAt,
        range,
      ),
      activityLogs: filterByDateRange(
        state.activityLogs,
        (log) => log.createdAt,
        range,
      ),
    };

    return {
      filtered,
      stats: selectDashboardStats(state),
      movementSeries: monthlyMovementCounts(filtered),
      categorySeries: inventoryValueByCategory(state),
      warehouseSeries: inventoryValueByWarehouse(state),
      projectSeries: projectExpenditure(state),
      procurementSeries: procurementTrend(filtered),
      lowStock: lowStockMaterials(state).map((material) => ({
        material,
        quantity: totalQuantityByMaterial(state, material.id),
      })),
    };
  }, [mounted, state, range]);

  const header = (
    <PageHeader
      title="Dashboard"
      description="Inventory position, open requests, and procurement activity across all three warehouses."
      actions={
        <>
          <DateRangeFilter value={range} onValueChange={setRange} />
          <Button asChild size="sm" variant="outline">
            <Link href="/stock-movements">
              <ArrowLeftRight aria-hidden="true" />
              Record movement
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/material-requests">
              <ClipboardPlus aria-hidden="true" />
              New request
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/materials">
              <PackagePlus aria-hidden="true" />
              Add material
            </Link>
          </Button>
        </>
      }
    />
  );

  if (!mounted) {
    return (
      <PageContainer>
        {header}
        <div className="mt-6">
          <LoadingState rows={8} />
        </div>
      </PageContainer>
    );
  }

  if (state.materials.length === 0) {
    return (
      <PageContainer>
        {header}
        <div className="mt-6">
          <EmptyState
            title="No demo data loaded"
            description="Reset the demo dataset from Settings to restore inventory, projects, and procurement records."
          />
        </div>
      </PageContainer>
    );
  }

  // One memo for every derived series. Without this, toggling a theme or
  // marking a notification read recomputed all five charts and the KPI set.
  // Unreachable after the guards above, but it keeps the type honest.
  if (!derived) return null;

  const { filtered, stats, lowStock } = derived;

  return (
    <PageContainer>
      {header}
      <p className="mt-3 text-[0.8125rem] text-muted-foreground">
        As of {formatDate(new Date())} · Asia/Manila
      </p>

      <div className="mt-6 flex flex-col gap-6">
        <KpiGrid stats={stats} />

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <MonthlyMovementChart data={derived.movementSeries} />
          <CategoryValueChart data={derived.categorySeries} />
          <WarehouseValueChart data={derived.warehouseSeries} />
          <ProjectExpenditureChart data={derived.projectSeries} />
          <div className="xl:col-span-2">
            <ProcurementTrendChart data={derived.procurementSeries} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <RecentMovements
            movements={recentMovements(filtered, 6)}
            materials={state.materials}
          />
          <LowStockAlerts items={lowStock.slice(0, 6)} />
          <OpenRequests
            requests={openRequests(state)}
            projects={state.projects}
          />
          <ActiveProjects projects={activeProjects(state)} />
          <RecentActivity logs={recentActivity(filtered, 6)} />
          <UpcomingMaintenance
            records={upcomingMaintenance(state)}
            equipment={state.equipment}
          />
        </div>
      </div>
    </PageContainer>
  );
}
