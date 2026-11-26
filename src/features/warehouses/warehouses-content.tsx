"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useMemo, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";

import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { DataTableToolbar } from "@/components/shared/data-table-toolbar";
import { FilterDropdown } from "@/components/shared/filter-dropdown";
import { LoadingState } from "@/components/shared/loading-state";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { WarehouseFormDialog } from "@/features/warehouses/warehouse-form-dialog";
import { formatCentavos } from "@/lib/currency";
import { formatNumber } from "@/lib/format";
import { useDomainStore } from "@/stores/domain-store";
import { warehouseInventoryById } from "@/stores/selectors";
import type { Warehouse } from "@/types/domain";

const subscribeToMount = () => () => {};
const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

type WarehouseRow = { warehouse: Warehouse; value: number; materialCount: number };
const columns: DataTableColumn<WarehouseRow>[] = [
  {
    id: "warehouse",
    header: "Warehouse",
    className: "min-w-44",
    sortValue: ({ warehouse }) => warehouse.name,
    cell: ({ warehouse }) => (
      <>
        <Link href={`/warehouses/${encodeURIComponent(warehouse.id)}`} className="rounded-sm font-semibold text-brand-text underline-offset-4 transition-colors hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none motion-reduce:transition-none">
          {warehouse.name}
        </Link>
        <p className="font-mono text-xs text-muted-foreground">{warehouse.code}</p>
      </>
    ),
  },
  {
    id: "location",
    header: "Location",
    className: "min-w-36",
    sortValue: ({ warehouse }) => warehouse.location,
    cell: ({ warehouse }) => (
      <>
        <p>{warehouse.location}</p>
        <p className="text-xs text-muted-foreground">{warehouse.address}</p>
      </>
    ),
  },
  { id: "manager", header: "Manager", cell: ({ warehouse }) => warehouse.managerName || "Unassigned" },
  { id: "materials", header: "Materials", align: "right", sortValue: (row) => row.materialCount, cell: (row) => formatNumber(row.materialCount) },
  { id: "value", header: "Inventory value", align: "right", className: "whitespace-nowrap", sortValue: (row) => row.value, cell: (row) => formatCentavos(row.value) },
  {
    id: "status",
    header: "Status",
    cell: ({ warehouse }) => warehouse.status === "active"
      ? <StatusBadge status="Active" tone="success" />
      : <StatusBadge status="Inactive" tone="neutral" />,
  },
];

export function WarehousesContent() {
  const warehouses = useDomainStore((state) => state.warehouses);
  const balances = useDomainStore((state) => state.balances);
  const materials = useDomainStore((state) => state.materials);
  const createWarehouse = useDomainStore((state) => state.createWarehouse);
  const mounted = useSyncExternalStore(subscribeToMount, () => true, () => false);
  const [search, setSearch] = useState("");
  const [statuses, setStatuses] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const inventory = useMemo(() => warehouseInventoryById({ balances, materials }), [balances, materials]);
  const rows = warehouses.map((warehouse) => {
    const summary = inventory.get(warehouse.id);
    return {
      warehouse,
      value: summary?.value ?? 0,
      materialCount: new Set(summary?.rows.map(({ material }) => material.id)).size,
    };
  });
  const term = search.trim().toLowerCase();
  const filtered = rows.filter(({ warehouse }) =>
    (statuses.length === 0 || statuses.includes(warehouse.status)) &&
    [warehouse.name, warehouse.code, warehouse.location, warehouse.address, warehouse.managerName].join(" ").toLowerCase().includes(term),
  );

  return (
    <PageContainer>
      <PageHeader
        title="Warehouses"
        description="Manage storage locations and track material balances across Davao."
        actions={<Button size="sm" disabled={!mounted} onClick={() => setCreating(true)}><Plus aria-hidden="true" /> Add warehouse</Button>}
      />
      {!mounted ? <div className="mt-6"><LoadingState rows={6} /></div> : (
        <div className="mt-6 space-y-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard label="Storage locations" value={formatNumber(warehouses.length)} />
            <StatCard label="Active warehouses" value={formatNumber(warehouses.filter((warehouse) => warehouse.status === "active").length)} />
            <StatCard label="Total inventory value" value={formatCentavos(rows.reduce((total, row) => total + row.value, 0))} />
          </div>
          <div className="space-y-3">
            <DataTableToolbar>
              <SearchInput value={search} onValueChange={setSearch} label="Search warehouses" placeholder="Search warehouse name, code, or area" />
              <FilterDropdown label="Status" selected={statuses} onChange={setStatuses} options={statusOptions} />
            </DataTableToolbar>
            <DataTable
              columns={columns}
              data={filtered}
              getRowId={({ warehouse }) => warehouse.id}
              caption="Warehouse catalogue"
              emptyTitle="No warehouses match"
              emptyDescription="Clear the search or status filter to see other warehouses."
            />
          </div>
        </div>
      )}
      {creating && (
        <WarehouseFormDialog
          onClose={() => setCreating(false)}
          onSave={(input) => {
            const result = createWarehouse(input);
            if (result.ok) toast.success("Warehouse added");
            return result;
          }}
        />
      )}
    </PageContainer>
  );
}
