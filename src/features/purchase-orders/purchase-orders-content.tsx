"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import type { DateRange } from "react-day-picker";
import { ClipboardCheck, PackageCheck, Plus, ShoppingCart, Truck } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { DateRangeFilter } from "@/components/shared/date-range-filter";
import { FilterDropdown } from "@/components/shared/filter-dropdown";
import { LoadingState } from "@/components/shared/loading-state";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { RowActions, type RowAction } from "@/components/shared/row-actions";
import { SearchInput } from "@/components/shared/search-input";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  PurchaseOrderFormDialog,
  type PurchaseOrderFormValues,
} from "@/features/purchase-orders/purchase-order-form-dialog";
import { ReceiveDialog } from "@/features/purchase-orders/receive-dialog";
import type { PurchaseOrder } from "@/types/domain";
import { formatCentavos } from "@/lib/currency";
import { formatDate, formatNumber } from "@/lib/format";
import { filterByDateRange } from "@/stores/selectors";
import { useDomainStore } from "@/stores/domain-store";

const subscribeToMount = () => () => {};

export function PurchaseOrdersContent() {
  const state = useDomainStore();
  const mounted = useSyncExternalStore(
    subscribeToMount,
    () => true,
    () => false,
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [supplierFilter, setSupplierFilter] = useState<string[]>([]);
  const [range, setRange] = useState<DateRange | undefined>(undefined);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PurchaseOrder | null>(null);
  const [receiveTarget, setReceiveTarget] = useState<PurchaseOrder | null>(null);
  const [cancelTarget, setCancelTarget] = useState<PurchaseOrder | null>(null);
  const [details, setDetails] = useState<PurchaseOrder | null>(null);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    const dated = filterByDateRange(state.purchaseOrders, (order) => order.createdAt, range);

    return dated
      .filter((order) => {
        const supplier = state.suppliers.find((entry) => entry.id === order.supplierId);
        if (
          term &&
          !`${order.reference} ${supplier?.name ?? ""}`.toLowerCase().includes(term)
        ) {
          return false;
        }
        if (statusFilter.length > 0 && !statusFilter.includes(order.status)) return false;
        if (supplierFilter.length > 0 && !supplierFilter.includes(order.supplierId)) return false;
        return true;
      })
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }, [state.purchaseOrders, state.suppliers, search, statusFilter, supplierFilter, range]);

  const summary = useMemo(
    () => ({
      total: state.purchaseOrders.length,
      awaitingApproval: state.purchaseOrders.filter((order) =>
        ["draft", "pending"].includes(order.status),
      ).length,
      inTransit: state.purchaseOrders.filter((order) =>
        ["approved", "ordered", "partially-received"].includes(order.status),
      ).length,
      received: state.purchaseOrders.filter((order) => order.status === "received").length,
      committed: state.purchaseOrders
        .filter((order) => order.status !== "cancelled")
        .reduce((total, order) => total + order.totalCentavos, 0),
    }),
    [state.purchaseOrders],
  );

  function saveOrder(values: PurchaseOrderFormValues) {
    const result = editing
      ? state.updatePurchaseOrder(editing.id, values)
      : state.createPurchaseOrder(values);
    if (!result.ok) return { ok: false as const, error: result.error };
    toast.success(editing ? "Draft updated" : "Purchase order drafted");
    return { ok: true as const };
  }

  function approve(order: PurchaseOrder) {
    const result = state.approvePurchaseOrder(order.id);
    if (!result.ok) return toast.error(result.error);
    toast.success(`${order.reference} approved`);
  }

  function markOrdered(order: PurchaseOrder) {
    const result = state.markPurchaseOrderOrdered(order.id);
    if (!result.ok) return toast.error(result.error);
    toast.success(`${order.reference} marked as ordered`);
  }

  function cancel(order: PurchaseOrder) {
    const result = state.cancelPurchaseOrder(order.id);
    if (!result.ok) return toast.error(result.error);
    toast.success(`${order.reference} cancelled`);
  }

  function receive(receipts: Record<string, number>) {
    if (!receiveTarget) return { ok: false as const, error: "No order selected" };
    const result = state.receivePurchaseOrder({
      orderId: receiveTarget.id,
      receipts,
    });
    if (!result.ok) return { ok: false as const, error: result.error };
    toast.success("Delivery received into stock");
    return { ok: true as const };
  }

  const columns: DataTableColumn<PurchaseOrder>[] = [
    {
      id: "reference",
      header: "Order",
      sortValue: (row) => row.reference,
      cell: (row) => (
        <div className="min-w-0">
          <p className="font-mono text-xs">{row.reference}</p>
          <p className="text-[0.6875rem] text-muted-foreground">
            {row.items.length} line{row.items.length === 1 ? "" : "s"}
          </p>
        </div>
      ),
    },
    {
      id: "supplier",
      header: "Supplier",
      sortValue: (row) =>
        state.suppliers.find((supplier) => supplier.id === row.supplierId)?.name ?? "",
      cell: (row) => (
        <span className="text-muted-foreground">
          {state.suppliers.find((supplier) => supplier.id === row.supplierId)?.name ?? "—"}
        </span>
      ),
    },
    {
      id: "ordered",
      header: "Ordered",
      cell: (row) => <span className="tabular-nums">{formatDate(row.createdAt)}</span>,
    },
    {
      id: "expected",
      header: "Delivery",
      cell: (row) => (
        <span className="tabular-nums">
          {row.expectedDeliveryDate ? formatDate(row.expectedDeliveryDate) : "—"}
        </span>
      ),
    },
    {
      id: "total",
      header: "Total",
      align: "right",
      sortValue: (row) => row.totalCentavos,
      cell: (row) => <span className="tabular-nums">{formatCentavos(row.totalCentavos)}</span>,
    },
    {
      id: "status",
      header: "Status",
      sortValue: (row) => row.status,
      cell: (row) => <StatusBadge status={labelForStatus(row.status)} />,
    },
    {
      id: "actions",
      header: "",
      align: "right",
      cell: (row) => {
        const actions: RowAction[] = [
          { label: "Details", onSelect: () => setDetails(row) },
        ];
        if (row.status === "draft") {
          actions.push({
            label: "Edit draft",
            onSelect: () => {
              setEditing(row);
              setFormOpen(true);
            },
          });
          actions.push({ label: "Approve", onSelect: () => approve(row) });
        }
        if (row.status === "pending") {
          actions.push({ label: "Approve", onSelect: () => approve(row) });
        }
        if (row.status === "approved") {
          actions.push({ label: "Mark as ordered", onSelect: () => markOrdered(row) });
        }
        if (["approved", "ordered", "partially-received"].includes(row.status)) {
          actions.push({ label: "Receive delivery", onSelect: () => setReceiveTarget(row) });
        }
        if (
          ["draft", "pending", "approved", "ordered"].includes(row.status)
        ) {
          actions.push({
            label: "Cancel order",
            destructive: true,
            onSelect: () => setCancelTarget(row),
          });
        }
        return <RowActions label={`Actions for ${row.reference}`} actions={actions} />;
      },
    },
  ];

  const header = (
    <PageHeader
      title="Purchase orders"
      description="Draft, approve, dispatch, and receive supplier deliveries into warehouse stock."
      actions={
        <Button
          type="button"
          size="sm"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus aria-hidden="true" />
          New order
        </Button>
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
        <StatCard label="Orders" value={formatNumber(summary.total)} hint="All statuses" icon={ShoppingCart} />
        <StatCard label="Awaiting approval" value={formatNumber(summary.awaitingApproval)} hint="Drafts and pending" icon={ClipboardCheck} />
        <StatCard label="In transit" value={formatNumber(summary.inTransit)} hint="Approved, ordered, or partially received" icon={Truck} />
        <StatCard label="Received" value={formatNumber(summary.received)} hint={`${formatCentavos(summary.committed)} committed`} icon={PackageCheck} />
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput
            value={search}
            onValueChange={setSearch}
            label="Search purchase orders"
            placeholder="Search reference or supplier"
          />
          <FilterDropdown
            label="Status"
            selected={statusFilter}
            onChange={setStatusFilter}
            options={STATUS_VALUES.map((status) => ({ value: status, label: labelForStatus(status) }))}
          />
          <FilterDropdown
            label="Supplier"
            selected={supplierFilter}
            onChange={setSupplierFilter}
            options={state.suppliers.map((supplier) => ({
              value: supplier.id,
              label: supplier.name,
            }))}
          />
          <DateRangeFilter value={range} onValueChange={setRange} label="Order date" />
        </div>

        <DataTable
          columns={columns}
          data={rows}
          getRowId={(row) => row.id}
          emptyTitle="No purchase orders match"
          emptyDescription="Adjust the filters or create a new order."
        />
      </div>

      <PurchaseOrderFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        suppliers={state.suppliers}
        warehouses={state.warehouses}
        materials={state.materials}
        order={editing ?? undefined}
        onSubmit={saveOrder}
      />

      <ReceiveDialog
        open={receiveTarget !== null}
        onOpenChange={(open) => {
          if (!open) setReceiveTarget(null);
        }}
        order={receiveTarget}
        materials={state.materials}
        onSubmit={receive}
      />

      <ConfirmDialog
        open={cancelTarget !== null}
        onOpenChange={(open) => {
          if (!open) setCancelTarget(null);
        }}
        title="Cancel purchase order"
        description={
          cancelTarget
            ? `${cancelTarget.reference} will be closed. Partially received orders cannot be cancelled because the delivered stock is already in inventory.`
            : ""
        }
        confirmLabel="Cancel order"
        destructive
        onConfirm={() => {
          if (cancelTarget) cancel(cancelTarget);
          setCancelTarget(null);
        }}
      />

      <OrderDetailsDialog order={details} onClose={() => setDetails(null)} />
    </PageContainer>
  );
}

const STATUS_VALUES: PurchaseOrder["status"][] = [
  "draft",
  "pending",
  "approved",
  "ordered",
  "partially-received",
  "received",
  "cancelled",
];

function labelForStatus(status: PurchaseOrder["status"]): string {
  switch (status) {
    case "partially-received":
      return "Partially received";
    case "draft":
      return "Draft";
    case "pending":
      return "Pending";
    case "approved":
      return "Approved";
    case "ordered":
      return "Ordered";
    case "received":
      return "Received";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
}

function OrderDetailsDialog({
  order,
  onClose,
}: {
  order: PurchaseOrder | null;
  onClose: () => void;
}) {
  const state = useDomainStore();
  if (!order) return null;

  const supplier = state.suppliers.find((entry) => entry.id === order.supplierId);
  const warehouse = state.warehouses.find((entry) => entry.id === order.warehouseId);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-mono text-base">{order.reference}</DialogTitle>
          <DialogDescription>
            {supplier?.name ?? "Supplier"} 鈫?{warehouse?.name ?? "Warehouse"} 路{" "}
            {labelForStatus(order.status)}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/60 text-left">
                <th scope="col" className="px-3 py-2 text-xs font-semibold text-muted-foreground">Material</th>
                <th scope="col" className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground">Ordered</th>
                <th scope="col" className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground">Received</th>
                <th scope="col" className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground">Unit cost</th>
                <th scope="col" className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground">Line total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => {
                const material = state.materials.find((entry) => entry.id === item.materialId);
                return (
                  <tr key={item.id} className="border-b border-border last:border-b-0">
                    <td className="px-3 py-2">{material?.name ?? "Material"}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{item.orderedQuantity}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{item.receivedQuantity}</td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {formatCentavos(item.unitCostCentavos)}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {formatCentavos(Math.round(item.orderedQuantity * item.unitCostCentavos))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-xs text-muted-foreground">Subtotal</dt>
            <dd className="tabular-nums">{formatCentavos(order.subtotalCentavos)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Discount</dt>
            <dd className="tabular-nums">−{formatCentavos(order.discountCentavos)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Delivery</dt>
            <dd className="tabular-nums">{formatCentavos(order.deliveryFeeCentavos)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Total</dt>
            <dd className="font-semibold tabular-nums">{formatCentavos(order.totalCentavos)}</dd>
          </div>
        </dl>
      </DialogContent>
    </Dialog>
  );
}
