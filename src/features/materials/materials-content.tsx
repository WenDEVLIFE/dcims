"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { Package, PackagePlus, AlertTriangle, Ban } from "lucide-react";
import { toast } from "sonner";

import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { DataTableToolbar } from "@/components/shared/data-table-toolbar";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ExportButton } from "@/components/shared/export-button";
import { FilterDropdown } from "@/components/shared/filter-dropdown";
import { LoadingState } from "@/components/shared/loading-state";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { RowActions } from "@/components/shared/row-actions";
import { SearchInput } from "@/components/shared/search-input";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { MaterialDetailsDialog } from "@/features/materials/material-details-dialog";
import { MaterialFormDialog } from "@/features/materials/material-form-dialog";
import type { MaterialInputValues } from "@/schemas/domain";
import type { StockStatus, Material } from "@/types/domain";
import { buildCsv, downloadCsv } from "@/lib/csv";
import { formatCentavos } from "@/lib/currency";
import { formatNumber, unitLabel } from "@/lib/format";
import { resolveStockStatus, summariseMaterialInventory } from "@/lib/inventory";
import { useDomainStore } from "@/stores/domain-store";

const PAGE_SIZE = 10;

interface MaterialRow {
  material: Material;
  categoryName: string;
  quantity: number;
  value: number;
  averageCost: number;
  stockStatus: StockStatus;
}

const subscribeToMount = () => () => {};

export function MaterialsContent() {
  const state = useDomainStore();
  const mounted = useSyncExternalStore(
    subscribeToMount,
    () => true,
    () => false,
  );

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [warehouseFilter, setWarehouseFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const [details, setDetails] = useState<Material | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<Material | null>(null);

  const rows = useMemo<MaterialRow[]>(() => {
    return state.materials.map((material) => {
      const summary = summariseMaterialInventory(
        state.balances.filter((balance) => balance.materialId === material.id),
        material.unitCostCentavos,
      );

      return {
        material,
        categoryName:
          state.categories.find((category) => category.id === material.categoryId)
            ?.name ?? "Uncategorised",
        ...summary,
        stockStatus: resolveStockStatus(summary.quantity, material.reorderPoint),
      };
    });
  }, [state.materials, state.balances, state.categories]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return rows.filter((row) => {
      if (term && !`${row.material.name} ${row.material.sku}`.toLowerCase().includes(term)) {
        return false;
      }
      if (categoryFilter.length > 0 && !categoryFilter.includes(row.material.categoryId)) {
        return false;
      }
      if (statusFilter.length > 0 && !statusFilter.includes(row.stockStatus)) {
        return false;
      }
      if (warehouseFilter.length > 0) {
        const holdsStock = state.balances.some(
          (balance) =>
            balance.materialId === row.material.id &&
            balance.quantity > 0 &&
            warehouseFilter.includes(balance.warehouseId),
        );
        if (!holdsStock) return false;
      }
      return true;
    });
  }, [rows, search, categoryFilter, statusFilter, warehouseFilter, state.balances]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const summary = useMemo(() => {
    const value = rows.reduce(
      (total, row) => total + row.value,
      0,
    );
    return {
      total: rows.length,
      active: rows.filter((row) => row.material.status === "active").length,
      lowStock: rows.filter((row) => row.stockStatus === "low-stock").length,
      outOfStock: rows.filter((row) => row.stockStatus === "out-of-stock").length,
      value,
    };
  }, [rows]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(material: Material) {
    setEditing(material);
    setFormOpen(true);
  }

  function submitMaterial(values: MaterialInputValues) {
    const result = editing
      ? state.updateMaterial(editing.id, values)
      : state.createMaterial(values);

    if (!result.ok) return { ok: false as const, error: result.error };

    toast.success(editing ? "Material updated" : "Material created");
    setPage(1);
    return { ok: true as const };
  }

  function archive(material: Material) {
    const result = state.archiveMaterial(material.id);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(`${material.name} archived`);
  }

  function exportCsv() {
    if (filtered.length === 0) {
      toast.error("Nothing to export with the current filters");
      return;
    }

    const csv = buildCsv(
      ["SKU", "Name", "Category", "Unit", "Quantity", "Unit cost (PHP)", "Stock status"],
      filtered.map((row) => [
        row.material.sku,
        row.material.name,
        row.categoryName,
        unitLabel(row.material.unit),
        row.quantity,
        (row.averageCost / 100).toFixed(2),
        row.stockStatus,
      ]),
    );

    downloadCsv("dcims-materials", csv);
    toast.success(`Exported ${filtered.length} materials`);
  }

  const columns: DataTableColumn<MaterialRow>[] = [
    {
      id: "name",
      header: "Material",
      sortValue: (row) => row.material.name,
      cell: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.material.name}</p>
          <p className="font-mono text-[0.6875rem] text-muted-foreground">
            {row.material.sku}
          </p>
        </div>
      ),
    },
    {
      id: "category",
      header: "Category",
      sortValue: (row) => row.categoryName,
      cell: (row) => <span className="text-muted-foreground">{row.categoryName}</span>,
    },
    {
      id: "unit",
      header: "Unit",
      cell: (row) => <span className="text-muted-foreground">{unitLabel(row.material.unit)}</span>,
    },
    {
      id: "quantity",
      header: "On hand",
      align: "right",
      sortValue: (row) => row.quantity,
      cell: (row) => <span className="tabular-nums">{formatNumber(row.quantity)}</span>,
    },
    {
      id: "cost",
      header: "Avg cost",
      align: "right",
      sortValue: (row) => row.averageCost,
      cell: (row) => (
        <span className="tabular-nums">{formatCentavos(row.averageCost)}</span>
      ),
    },
    {
      id: "status",
      header: "Status",
      sortValue: (row) => row.stockStatus,
      cell: (row) =>
        row.material.status === "discontinued" ? (
          <StatusBadge status="Archived" tone="neutral" />
        ) : (
          <StatusBadge status={labelForStatus(row.stockStatus)} />
        ),
    },
    {
      id: "actions",
      header: "",
      align: "right",
      cell: (row) => (
        <RowActions
          label={`Actions for ${row.material.name}`}
          actions={[
            { label: "View details", onSelect: () => setDetails(row.material) },
            { label: "Edit", onSelect: () => openEdit(row.material) },
            {
              label: "Archive",
              destructive: true,
              disabled: row.material.status === "discontinued",
              onSelect: () => setArchiveTarget(row.material),
            },
          ]}
        />
      ),
    },
  ];

  const header = (
    <PageHeader
      title="Materials"
      description="Catalogue, stock levels, and weighted-average costs across all warehouses."
      actions={
        <>
          <ExportButton onExport={exportCsv} disabled={filtered.length === 0} />
          <Button type="button" size="sm" onClick={openCreate}>
            <PackagePlus aria-hidden="true" />
            Add material
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

  return (
    <PageContainer>
      {header}

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Materials" value={formatNumber(summary.total)} hint={`${summary.active} active`} icon={Package} />
        <StatCard label="Inventory value" value={formatCentavos(summary.value)} hint="Weighted-average cost" />
        <StatCard label="Low stock" value={formatNumber(summary.lowStock)} hint="At or below reorder point" icon={AlertTriangle} />
        <StatCard label="Out of stock" value={formatNumber(summary.outOfStock)} hint="No balance in any warehouse" icon={Ban} />
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <DataTableToolbar
          actions={
            <DataTablePagination
              page={currentPage}
              pageSize={PAGE_SIZE}
              total={filtered.length}
              onPageChange={setPage}
              className="sm:justify-end"
            />
          }
        >
          <SearchInput
            value={search}
            onValueChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            label="Search materials"
            placeholder="Search by name or SKU"
          />
          <FilterDropdown
            label="Category"
            selected={categoryFilter}
            onChange={(selected) => {
              setCategoryFilter(selected);
              setPage(1);
            }}
            options={state.categories.map((category) => ({
              value: category.id,
              label: category.name,
            }))}
          />
          <FilterDropdown
            label="Warehouse"
            selected={warehouseFilter}
            onChange={(selected) => {
              setWarehouseFilter(selected);
              setPage(1);
            }}
            options={state.warehouses.map((warehouse) => ({
              value: warehouse.id,
              label: warehouse.name,
            }))}
          />
          <FilterDropdown
            label="Stock"
            selected={statusFilter}
            onChange={(selected) => {
              setStatusFilter(selected);
              setPage(1);
            }}
            options={[
              { value: "in-stock", label: "In stock" },
              { value: "low-stock", label: "Low stock" },
              { value: "out-of-stock", label: "Out of stock" },
            ]}
          />
        </DataTableToolbar>

        <DataTable
          columns={columns}
          data={visible}
          getRowId={(row) => row.material.id}
          emptyTitle="No materials match"
          emptyDescription="Adjust the search or filters, or add a new material."
        />
      </div>

      <MaterialFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        categories={state.categories}
        material={editing ?? undefined}
        onSubmit={submitMaterial}
      />

      <MaterialDetailsDialog
        open={details !== null}
        onOpenChange={(open) => {
          if (!open) setDetails(null);
        }}
        material={details}
        balances={state.balances}
        warehouses={state.warehouses}
        movements={state.stockMovements}
      />

      <ConfirmDialog
        open={archiveTarget !== null}
        onOpenChange={(open) => {
          if (!open) setArchiveTarget(null);
        }}
        title="Archive material"
        description={
          archiveTarget
            ? `${archiveTarget.name} will stop appearing in request and order pickers. Materials with stock on hand cannot be archived.`
            : ""
        }
        confirmLabel="Archive material"
        destructive
        onConfirm={() => {
          if (archiveTarget) archive(archiveTarget);
          setArchiveTarget(null);
        }}
      />
    </PageContainer>
  );
}

function labelForStatus(status: StockStatus): string {
  if (status === "in-stock") return "In stock";
  if (status === "low-stock") return "Low stock";
  return "Out of stock";
}
