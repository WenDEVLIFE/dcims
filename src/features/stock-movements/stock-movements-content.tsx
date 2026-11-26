"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";

import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { DataTableToolbar } from "@/components/shared/data-table-toolbar";
import { ExportButton } from "@/components/shared/export-button";
import { FilterDropdown } from "@/components/shared/filter-dropdown";
import { LoadingState } from "@/components/shared/loading-state";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MovementFormDialog, type LocalMovement, type MovementValues } from "@/features/stock-movements/movement-form-dialog";
import { movementActions, movementLabels } from "@/features/stock-movements/movement-types";
import { WarehouseTransferDialog } from "@/features/warehouses/warehouse-transfer-dialog";
import { buildCsv, downloadCsv } from "@/lib/csv";
import { formatCentavos, parseAmountToCentavos } from "@/lib/currency";
import { formatDateTime, formatNumber, formatQuantity } from "@/lib/format";
import { fail } from "@/lib/result";
import { useDomainStore } from "@/stores/domain-store";
import { warehouseInventoryById } from "@/stores/selectors";
import { STOCK_MOVEMENT_TYPES, type StockMovement, type StockMovementType } from "@/types/domain";

const PAGE_SIZE = 15;
const subscribeToMount = () => () => {};
const movementOptions = STOCK_MOVEMENT_TYPES.map((value) => ({ value, label: movementLabels[value] }));
const manilaDate = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit" });

interface MovementRow {
  movement: StockMovement;
  material: string;
  quantity: string;
  unit: string;
  source?: string;
  destination?: string;
  project?: string;
  remarks: string;
}

const columns: DataTableColumn<MovementRow>[] = [
  {
    id: "reference",
    header: "Reference",
    className: "whitespace-nowrap",
    cell: ({ movement }) => <span className="font-mono text-xs">{movement.reference}</span>,
  },
  { id: "type", header: "Type", className: "whitespace-nowrap", cell: ({ movement }) => movementLabels[movement.type] },
  { id: "material", header: "Material", className: "min-w-36", cell: (row) => row.material },
  { id: "quantity", header: "Quantity", align: "right", className: "whitespace-nowrap", cell: (row) => row.quantity },
  { id: "cost", header: "Unit cost", align: "right", className: "whitespace-nowrap", cell: ({ movement }) => formatCentavos(movement.unitCostCentavos) },
  { id: "source", header: "Source warehouse", className: "min-w-36", cell: (row) => row.source ?? "—" },
  { id: "destination", header: "Destination warehouse", className: "min-w-36", cell: (row) => row.destination ?? "—" },
  { id: "project", header: "Project", className: "min-w-32", cell: (row) => row.project ?? "—" },
  { id: "timestamp", header: "Recorded", className: "whitespace-nowrap", cell: ({ movement }) => formatDateTime(movement.createdAt) },
  { id: "remarks", header: "Remarks", className: "min-w-36", cell: (row) => row.remarks || "—" },
];

export function StockMovementsContent() {
  const movements = useDomainStore((state) => state.stockMovements);
  const materials = useDomainStore((state) => state.materials);
  const warehouses = useDomainStore((state) => state.warehouses);
  const projects = useDomainStore((state) => state.projects);
  const balances = useDomainStore((state) => state.balances);
  const allocations = useDomainStore((state) => state.projectMaterials);
  const mounted = useSyncExternalStore(subscribeToMount, () => true, () => false);
  const [dialog, setDialog] = useState<StockMovementType | null>(null);
  const [search, setSearch] = useState("");
  const [types, setTypes] = useState<string[]>([]);
  const [warehouseIds, setWarehouseIds] = useState<string[]>([]);
  const [materialIds, setMaterialIds] = useState<string[]>([]);
  const [projectIds, setProjectIds] = useState<string[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const activeMaterials = materials.filter((row) => row.status === "active");
  const activeWarehouses = warehouses.filter((row) => row.status === "active");
  const stock = useMemo(
    () => [...warehouseInventoryById({ balances, materials }).values()]
      .flatMap((summary) => summary.rows)
      .filter(({ balance, material }) => balance.quantity > 0 && material.status === "active"),
    [balances, materials],
  );

  const rows = useMemo(() => {
    const warehousesById = new Map(warehouses.map((row) => [row.id, row.name]));
    const materialsById = new Map(materials.map((row) => [row.id, row]));
    const projectsById = new Map(projects.map((row) => [row.id, row.name]));

    return [...movements].reverse().map((movement): MovementRow => {
      const material = materialsById.get(movement.materialId);
      const name = warehousesById.get(movement.warehouseId) ?? "Unknown warehouse";
      const adjustmentDecrease = movement.type === "adjustment" && movement.notes === "Decrease from cycle count";
      const location = movement.type === "stock-out" || movement.type === "transfer" || adjustmentDecrease;
      const transferDestination = movement.destinationWarehouseId
        ? warehousesById.get(movement.destinationWarehouseId) ?? "Unknown warehouse"
        : undefined;
      return {
        movement,
        material: material?.name ?? "Unknown material",
        quantity: material ? formatQuantity(movement.quantity, material.unit) : formatNumber(movement.quantity),
        unit: material?.unit ?? "",
        source: location ? name : undefined,
        destination: movement.type === "stock-in" || movement.type === "return" || (movement.type === "adjustment" && !adjustmentDecrease)
          ? name : transferDestination,
        project: movement.projectId ? projectsById.get(movement.projectId) ?? "Unknown project" : undefined,
        remarks: [movement.reason, movement.notes].filter(Boolean).join(" · "),
      };
    }).sort((a, b) => Date.parse(b.movement.createdAt) - Date.parse(a.movement.createdAt));
  }, [materials, movements, projects, warehouses]);

  const invalidDates = Boolean(from && to && from > to);
  const term = search.trim().toLowerCase();
  const filtered = invalidDates ? [] : rows.filter(({ movement }) => {
    const date = from || to ? manilaDate.format(new Date(movement.createdAt)) : "";
    return (!term || movement.reference.toLowerCase().includes(term)) &&
      (types.length === 0 || types.includes(movement.type)) &&
      (warehouseIds.length === 0 || warehouseIds.includes(movement.warehouseId) || warehouseIds.includes(movement.destinationWarehouseId ?? "")) &&
      (materialIds.length === 0 || materialIds.includes(movement.materialId)) &&
      (projectIds.length === 0 || projectIds.includes(movement.projectId ?? "")) &&
      (!from || date >= from) && (!to || date <= to);
  });
  const currentPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
  function updateFilter<T>(setter: (value: T) => void) {
    return (value: T) => { setter(value); setPage(1); };
  }

  function exportCsv() {
    downloadCsv("dcims-stock-movements", buildCsv(
      ["Reference", "Type", "Material", "Quantity", "Unit", "Unit cost (PHP)", "Source warehouse", "Destination warehouse", "Project", "Manila timestamp", "Performed by", "Remarks"],
      filtered.map(({ movement, material, unit, source, destination, project, remarks }) => [
        movement.reference, movementLabels[movement.type], material, movement.quantity, unit,
        (movement.unitCostCentavos / 100).toFixed(2), source, destination, project,
        formatDateTime(movement.createdAt), movement.performedBy, remarks,
      ]),
    ));
  }

  function save(kind: LocalMovement, values: MovementValues) {
    const state = useDomainStore.getState();
    const { materialId, warehouseId, quantity, projectId, notes, reason } = values;
    const common = { materialId, warehouseId, quantity, notes };
    if (kind === "stock-in") {
      const unitCostCentavos = parseAmountToCentavos(values.cost);
      return unitCostCentavos === null ? fail("Enter a valid unit cost") : state.recordStockIn({ ...common, unitCostCentavos });
    }
    if (kind === "stock-out") return state.recordStockOut({ ...common, projectId: projectId || undefined });
    if (kind === "return") return state.recordReturn({ ...common, projectId });
    const current = state.balances.find((row) => row.warehouseId === warehouseId && row.materialId === materialId)?.quantity ?? 0;
    const countedQuantity = current + (values.direction === "increase" ? quantity : -quantity);
    return state.recordAdjustment({ materialId, warehouseId, countedQuantity, reason });
  }

  return (
    <PageContainer>
      <PageHeader title="Stock movements" description="Record inventory changes and audit completed transactions. Corrections are separate movements." actions={<ExportButton onExport={exportCsv} disabled={!mounted || filtered.length === 0} />} />
      {!mounted ? <div className="mt-6"><LoadingState rows={8} /></div> : (
        <div className="mt-6 space-y-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard label="Completed movements" value={formatNumber(movements.length)} />
            <StatCard label="Stock receipts" value={formatNumber(movements.filter((row) => row.type === "stock-in").length)} />
            <StatCard label="Warehouse transfers" value={formatNumber(movements.filter((row) => row.type === "transfer").length)} />
          </div>
          <div className="flex flex-wrap gap-2 border-y border-border py-3" aria-label="Record a movement">
            {STOCK_MOVEMENT_TYPES.map((kind) => <Button key={kind} type="button" size="sm" variant={kind === "stock-in" ? "default" : "outline"} onClick={() => setDialog(kind)}>{movementActions[kind]}</Button>)}
          </div>
          <div className="space-y-3">
            <DataTableToolbar>
              <SearchInput value={search} onValueChange={updateFilter(setSearch)} label="Search transaction reference" placeholder="Search reference" />
              <FilterDropdown label="Type" selected={types} options={movementOptions} onChange={updateFilter(setTypes)} />
              <FilterDropdown label="Warehouse" selected={warehouseIds} options={warehouses.map((row) => ({ label: row.name, value: row.id }))} onChange={updateFilter(setWarehouseIds)} />
              <FilterDropdown label="Material" selected={materialIds} options={materials.map((row) => ({ label: row.name, value: row.id }))} onChange={updateFilter(setMaterialIds)} />
              <FilterDropdown label="Project" selected={projectIds} options={projects.map((row) => ({ label: row.name, value: row.id }))} onChange={updateFilter(setProjectIds)} />
            </DataTableToolbar>
            <div className="flex flex-wrap items-end gap-3">
              <label className="grid gap-1 text-xs font-medium">From date<Input type="date" value={from} max={to || undefined} aria-invalid={invalidDates} onChange={(event) => updateFilter(setFrom)(event.currentTarget.value)} /></label>
              <label className="grid gap-1 text-xs font-medium">Through date<Input type="date" value={to} min={from || undefined} aria-invalid={invalidDates} onChange={(event) => updateFilter(setTo)(event.currentTarget.value)} /></label>
              {(from || to) && <Button type="button" size="sm" variant="ghost" onClick={() => { setFrom(""); setTo(""); setPage(1); }}>Clear dates</Button>}
              {invalidDates && <p role="alert" className="text-sm text-error">The end date must be on or after the start date.</p>}
            </div>
            <DataTable columns={columns} data={filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)} getRowId={({ movement }) => movement.id} caption="Stock movement history" emptyTitle="No movements match" emptyDescription="Try another reference, date range, or filter." />
            <DataTablePagination page={currentPage} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />
          </div>
        </div>
      )}
      {dialog === "transfer" && <WarehouseTransferDialog warehouses={activeWarehouses} stock={stock} onClose={() => setDialog(null)} onTransfer={(values) => {
        const result = useDomainStore.getState().transferInventory(values);
        if (result.ok) { setPage(1); toast.success("Stock transferred"); }
        return result;
      }} />}
      {dialog && dialog !== "transfer" && <MovementFormDialog
        kind={dialog} materials={activeMaterials} warehouses={activeWarehouses} projects={projects} balances={balances} allocations={allocations} onClose={() => setDialog(null)} onSave={(values) => {
          const result = save(dialog, values);
          if (result.ok) { setPage(1); toast.success(`${movementLabels[dialog]} recorded`); }
          return result;
        }}
      />}
    </PageContainer>
  );
}
