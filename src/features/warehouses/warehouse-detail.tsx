"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRightLeft, Pencil } from "lucide-react";
import { useMemo, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { RecordDetails } from "@/components/shared/record-details";
import { SectionHeader } from "@/components/shared/section-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { WarehouseFormDialog } from "@/features/warehouses/warehouse-form-dialog";
import { WarehouseTransferDialog } from "@/features/warehouses/warehouse-transfer-dialog";
import { formatCentavos } from "@/lib/currency";
import { balanceUnitCost } from "@/lib/inventory";
import { formatDate, formatDateTime, formatNumber, unitLabel } from "@/lib/format";
import { useDomainStore } from "@/stores/domain-store";
import { warehouseInventoryById, type WarehouseInventoryRow } from "@/stores/selectors";
import type { StockMovement } from "@/types/domain";

const subscribeToMount = () => () => {};
const movementLabels: Record<StockMovement["type"], string> = {
  "stock-in": "Stock in",
  "stock-out": "Stock out",
  transfer: "Transfer",
  adjustment: "Adjustment",
  return: "Return",
};

const inventoryColumns: DataTableColumn<WarehouseInventoryRow>[] = [
  {
    id: "material",
    header: "Material",
    className: "min-w-36",
    sortValue: ({ material }) => material.name,
    cell: ({ material }) => (
      <>
        <p className="font-semibold">{material.name}</p>
        <p className="font-mono text-xs text-muted-foreground">{material.sku}</p>
      </>
    ),
  },
  { id: "quantity", header: "On hand", align: "right", className: "whitespace-nowrap", sortValue: ({ balance }) => balance.quantity, cell: ({ balance, material }) => `${formatNumber(balance.quantity)} ${unitLabel(material.unit)}` },
  { id: "unit-value", header: "Avg. unit cost", align: "right", className: "whitespace-nowrap", cell: ({ material, balance }) => formatCentavos(balanceUnitCost(balance, material.unitCostCentavos)) },
  { id: "value", header: "Inventory value", align: "right", className: "whitespace-nowrap", sortValue: (row) => row.value, cell: (row) => formatCentavos(row.value) },
];

type HistoryRow = {
  movement: StockMovement;
  type: string;
  materialName: string;
  quantityLabel: string;
  counterpart?: string;
};
const historyColumns: DataTableColumn<HistoryRow>[] = [
  {
    id: "reference",
    header: "Transaction",
    className: "whitespace-nowrap",
    sortValue: ({ movement }) => Date.parse(movement.createdAt),
    cell: ({ movement, type }) => (
      <>
        <p className="font-mono text-xs">{movement.reference}</p>
        <p className="text-xs text-muted-foreground">{type}</p>
      </>
    ),
  },
  { id: "material", header: "Material", className: "min-w-36", cell: (row) => row.materialName },
  { id: "quantity", header: "Quantity", align: "right", className: "whitespace-nowrap", cell: (row) => row.quantityLabel },
  { id: "other-end", header: "Other warehouse", className: "min-w-28", cell: (row) => row.counterpart ?? "—" },
  { id: "date", header: "Date and time", className: "whitespace-nowrap", cell: ({ movement }) => formatDateTime(movement.createdAt) },
  { id: "remarks", header: "Remarks", className: "min-w-32", cell: ({ movement }) => movement.notes || movement.reason || "—" },
];

export function WarehouseDetail({ warehouseId }: { warehouseId: string }) {
  const warehouses = useDomainStore((state) => state.warehouses);
  const balances = useDomainStore((state) => state.balances);
  const materials = useDomainStore((state) => state.materials);
  const movements = useDomainStore((state) => state.stockMovements);
  const updateWarehouse = useDomainStore((state) => state.updateWarehouse);
  const transferInventory = useDomainStore((state) => state.transferInventory);
  const mounted = useSyncExternalStore(subscribeToMount, () => true, () => false);
  const [dialog, setDialog] = useState<"edit" | "transfer" | "status" | null>(null);
  const warehouse = warehouses.find((item) => item.id === warehouseId);
  const inventory = useMemo(() => warehouseInventoryById({ balances, materials }).get(warehouseId), [balances, materials, warehouseId]);
  const history = useMemo(() => {
    const materialsById = new Map(materials.map((item) => [item.id, item]));
    const warehouseNames = new Map(warehouses.map((item) => [item.id, item.name]));
    return movements
      .filter((movement) => movement.warehouseId === warehouseId || movement.destinationWarehouseId === warehouseId)
      .map((movement): HistoryRow => {
        const material = materialsById.get(movement.materialId);
        const incoming = movement.destinationWarehouseId === warehouseId;
        const counterpartId = incoming ? movement.warehouseId : movement.destinationWarehouseId;
        return {
          movement,
          type: movement.type === "transfer" ? (incoming ? "Transfer in" : "Transfer out") : movementLabels[movement.type],
          materialName: material?.name ?? "Unknown material",
          quantityLabel: material ? `${formatNumber(movement.quantity)} ${unitLabel(material.unit)}` : formatNumber(movement.quantity),
          counterpart: counterpartId ? warehouseNames.get(counterpartId) ?? "Unknown warehouse" : undefined,
        };
      })
      .sort((left, right) => Date.parse(right.movement.createdAt) - Date.parse(left.movement.createdAt));
  }, [materials, movements, warehouseId, warehouses]);
  const backLink = <Button asChild variant="outline" size="sm"><Link href="/warehouses"><ArrowLeft aria-hidden="true" /> Warehouses</Link></Button>;

  if (!mounted) return <PageContainer><LoadingState rows={6} /></PageContainer>;
  if (!warehouse) return (
    <PageContainer>
      <EmptyState title="Warehouse not found" description="This warehouse is not in the current browser's demo data." action={backLink} />
    </PageContainer>
  );

  const stock = inventory?.rows.filter(({ material, balance }) => material.status === "active" && balance.quantity > 0) ?? [];
  const destinations = warehouses.filter((item) => item.id !== warehouseId && item.status === "active");
  const active = warehouse.status === "active";
  const nextStatus = active ? "inactive" : "active";
  const statusLabel = active ? "Deactivate warehouse" : "Activate warehouse";
  const transferUnavailable = !active ? "Activate this warehouse to transfer stock."
    : stock.length === 0 ? "There is no transferable stock at this warehouse."
    : destinations.length === 0 ? "A second active warehouse is needed for transfers."
    : undefined;

  return (
    <PageContainer>
      <div className="mb-4">{backLink}</div>
      <PageHeader
        title={warehouse.name}
        description={`${warehouse.location} · ${warehouse.address}`}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => setDialog("edit")}><Pencil aria-hidden="true" /> Edit warehouse</Button>
            <Button size="sm" disabled={Boolean(transferUnavailable)} onClick={() => setDialog("transfer")}><ArrowRightLeft aria-hidden="true" /> Transfer stock</Button>
          </>
        }
      />
      {transferUnavailable && <p className="mt-2 text-sm text-muted-foreground">{transferUnavailable}</p>}
      <section aria-label="Warehouse profile" className="mt-6 rounded-card border border-border bg-card p-4 sm:p-5">
        <RecordDetails columns={3} items={[
          { label: "Warehouse code", value: warehouse.code, mono: true },
          { label: "Assigned manager", value: warehouse.managerName || "Unassigned" },
          { label: "Status", value: <StatusBadge status={active ? "Active" : "Inactive"} tone={active ? "success" : "neutral"} /> },
          { label: "Contact number", value: warehouse.contactNumber || "Not recorded" },
          { label: "Storage capacity", value: warehouse.storageCapacity || "Not recorded" },
          { label: "Date created", value: formatDate(warehouse.createdAt) },
        ]} />
        <div className="mt-4 border-t border-border pt-4">
          <Button variant={active ? "destructive" : "outline"} size="sm" onClick={() => setDialog("status")}>{statusLabel}</Button>
        </div>
      </section>
      <section className="mt-6 space-y-3" aria-label="Warehouse inventory">
        <SectionHeader title="Inventory" description={`Current inventory value: ${formatCentavos(inventory?.value ?? 0)}`} />
        <DataTable columns={inventoryColumns} data={inventory?.rows ?? []} getRowId={({ balance }) => balance.id} caption="Warehouse inventory" emptyTitle="No stock records" emptyDescription="Inventory for this warehouse will appear after stock is received." />
      </section>
      <section className="mt-6 space-y-3" aria-label="Warehouse transaction history">
        <SectionHeader title="Transaction history" description="Completed movements recorded at this warehouse, including incoming and outgoing transfers." />
        <DataTable columns={historyColumns} data={history} getRowId={({ movement }) => movement.id} caption="Warehouse transaction history" emptyTitle="No transactions yet" />
      </section>

      {dialog === "edit" && (
        <WarehouseFormDialog warehouse={warehouse} onClose={() => setDialog(null)} onSave={(values) => {
          const result = updateWarehouse(warehouseId, values);
          if (result.ok) toast.success("Warehouse updated");
          return result;
        }} />
      )}
      {dialog === "transfer" && (
        <WarehouseTransferDialog source={warehouse} stock={stock} warehouses={destinations} onClose={() => setDialog(null)} onTransfer={(values) => {
          const result = transferInventory(values);
          if (result.ok) toast.success("Stock transferred");
          return result;
        }} />
      )}
      {dialog === "status" && (
        <ConfirmDialog
          open
          onOpenChange={(open) => { if (!open) setDialog(null); }}
          title={statusLabel}
          description={active ? "This warehouse must hold no stock and have no open purchase orders before it can be deactivated." : "This warehouse will be available for new inventory operations."}
          confirmLabel={statusLabel}
          destructive={active}
          onConfirm={() => {
            const result = updateWarehouse(warehouseId, { status: nextStatus });
            if (result.ok) toast.success(active ? "Warehouse deactivated" : "Warehouse activated");
            else toast.error(result.error);
          }}
        />
      )}
    </PageContainer>
  );
}
