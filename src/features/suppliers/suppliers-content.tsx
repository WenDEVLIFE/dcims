"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { Building2, CircleCheck, CircleSlash, Wallet } from "lucide-react";
import { toast } from "sonner";

import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { FilterDropdown } from "@/components/shared/filter-dropdown";
import { LoadingState } from "@/components/shared/loading-state";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { RecordDetails } from "@/components/shared/record-details";
import { RowActions } from "@/components/shared/row-actions";
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
  SupplierFormDialog,
  type SupplierFormValues,
} from "@/features/suppliers/supplier-form-dialog";
import type { Supplier } from "@/types/domain";
import { formatCentavos } from "@/lib/currency";
import { formatDate, formatNumber } from "@/lib/format";
import { useDomainStore } from "@/stores/domain-store";
import { supplierOverview } from "@/stores/selectors";

const subscribeToMount = () => () => {};

type SupplierRow = ReturnType<typeof supplierOverview>[number];

export function SuppliersContent() {
  const state = useDomainStore();
  const mounted = useSyncExternalStore(
    subscribeToMount,
    () => true,
    () => false,
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [details, setDetails] = useState<SupplierRow | null>(null);

  const overview = useMemo(() => supplierOverview(state), [state]);

  const allCategories = useMemo(
    () => [...new Set(overview.flatMap((entry) => entry.categories))].sort(),
    [overview],
  );

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return overview.filter((entry) => {
      const { supplier } = entry;
      if (
        term &&
        !`${supplier.name} ${supplier.contactPerson} ${supplier.email} ${supplier.code}`
          .toLowerCase()
          .includes(term)
      ) {
        return false;
      }
      if (statusFilter.length > 0 && !statusFilter.includes(supplier.status)) return false;
      if (
        categoryFilter.length > 0 &&
        !entry.categories.some((category) => categoryFilter.includes(category))
      ) {
        return false;
      }
      return true;
    });
  }, [overview, search, statusFilter, categoryFilter]);

  const summary = useMemo(
    () => ({
      total: state.suppliers.length,
      active: state.suppliers.filter((supplier) => supplier.status === "active").length,
      inactive: state.suppliers.filter((supplier) => supplier.status === "inactive").length,
      committed: overview.reduce((total, entry) => total + entry.committedCentavos, 0),
    }),
    [state.suppliers, overview],
  );

  function saveSupplier(values: SupplierFormValues) {
    const result = editing
      ? state.updateSupplier(editing.id, values)
      : state.createSupplier(values);
    if (!result.ok) return { ok: false as const, error: result.error };
    toast.success(editing ? "Supplier updated" : "Supplier created");
    return { ok: true as const };
  }

  const columns: DataTableColumn<SupplierRow>[] = [
    {
      id: "company",
      header: "Supplier",
      sortValue: (row) => row.supplier.name,
      cell: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.supplier.name}</p>
          <p className="font-mono text-[0.6875rem] text-muted-foreground">
            {row.supplier.code}
          </p>
        </div>
      ),
    },
    {
      id: "contact",
      header: "Contact",
      cell: (row) => (
        <div className="min-w-0">
          <p className="truncate text-muted-foreground">{row.supplier.contactPerson}</p>
          <p className="truncate text-[0.6875rem] text-muted-foreground">
            {row.supplier.phone}
          </p>
        </div>
      ),
    },
    {
      id: "categories",
      header: "Supplies",
      cell: (row) =>
        row.categories.length === 0 ? (
          <span className="text-muted-foreground">No orders yet</span>
        ) : (
          <span className="line-clamp-1 text-muted-foreground">
            {row.categories.join(", ")}
          </span>
        ),
    },
    {
      id: "terms",
      header: "Terms",
      cell: (row) => (
        <span className="text-muted-foreground">{row.supplier.paymentTerms ?? "—"}</span>
      ),
    },
    {
      id: "orders",
      header: "Orders",
      align: "right",
      sortValue: (row) => row.orders.length,
      cell: (row) => <span className="tabular-nums">{row.orders.length}</span>,
    },
    {
      id: "status",
      header: "Status",
      sortValue: (row) => row.supplier.status,
      cell: (row) => (
        <StatusBadge status={row.supplier.status === "active" ? "Active" : "Inactive"} />
      ),
    },
    {
      id: "actions",
      header: "",
      align: "right",
      cell: (row) => (
        <RowActions
          label={`Actions for ${row.supplier.name}`}
          actions={[
            { label: "Details", onSelect: () => setDetails(row) },
            {
              label: "Edit",
              onSelect: () => {
                setEditing(row.supplier);
                setFormOpen(true);
              },
            },
          ]}
        />
      ),
    },
  ];

  const header = (
    <PageHeader
      title="Suppliers"
      description="Davao suppliers and the materials they have actually been ordered."
      actions={
        <Button
          type="button"
          size="sm"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Building2 aria-hidden="true" />
          New supplier
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
        <StatCard label="Suppliers" value={formatNumber(summary.total)} hint="All records" icon={Building2} />
        <StatCard label="Active" value={formatNumber(summary.active)} hint="Eligible for purchase orders" icon={CircleCheck} />
        <StatCard label="Inactive" value={formatNumber(summary.inactive)} hint="Blocked from new orders" icon={CircleSlash} />
        <StatCard label="Committed spend" value={formatCentavos(summary.committed)} hint="Non-cancelled orders" icon={Wallet} />
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput
            value={search}
            onValueChange={setSearch}
            label="Search suppliers"
            placeholder="Search company, contact, or email"
          />
          <FilterDropdown
            label="Status"
            selected={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
          />
          <FilterDropdown
            label="Category"
            selected={categoryFilter}
            onChange={setCategoryFilter}
            options={allCategories.map((category) => ({ value: category, label: category }))}
          />
        </div>

        <DataTable
          columns={columns}
          data={rows}
          getRowId={(row) => row.supplier.id}
          emptyTitle="No suppliers match"
          emptyDescription="Adjust the filters or add a supplier."
        />
      </div>

      <SupplierFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        supplier={editing ?? undefined}
        onSubmit={saveSupplier}
      />

      <SupplierDetailsDialog entry={details} onClose={() => setDetails(null)} />
    </PageContainer>
  );
}

function SupplierDetailsDialog({
  entry,
  onClose,
}: {
  entry: SupplierRow | null;
  onClose: () => void;
}) {
  if (!entry) return null;
  const { supplier, orders, materials, categories, committedCentavos } = entry;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{supplier.name}</DialogTitle>
          <DialogDescription className="font-mono text-xs">{supplier.code}</DialogDescription>
        </DialogHeader>

        <RecordDetails
          columns={2}
          items={[
            { label: "Contact person", value: supplier.contactPerson },
            { label: "Phone", value: supplier.phone },
            { label: "Email", value: supplier.email },
            { label: "Payment terms", value: supplier.paymentTerms ?? "—" },
            { label: "Address", value: supplier.address },
            {
              label: "Status",
              value: supplier.status === "active" ? "Active" : "Inactive",
            },
          ]}
        />

        <div>
          <h3 className="text-sm font-semibold">Material categories supplied</h3>
          {categories.length === 0 ? (
            <p className="mt-1 text-[0.8125rem] text-muted-foreground">
              No purchase orders yet, so no supplied categories are known.
            </p>
          ) : (
            <p className="mt-1 text-[0.8125rem] text-muted-foreground">
              {categories.join(" · ")}
            </p>
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold">Supplied materials</h3>
          {materials.length === 0 ? (
            <p className="mt-1 text-[0.8125rem] text-muted-foreground">
              Nothing ordered from this supplier yet.
            </p>
          ) : (
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {materials.map((material) => (
                <li
                  key={material.id}
                  className="rounded-md border border-border px-2 py-1 text-xs"
                >
                  {material.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-sm font-semibold">Purchase order history</h3>
            <p className="text-xs text-muted-foreground tabular-nums">
              {formatCentavos(committedCentavos)} committed
            </p>
          </div>
          {orders.length === 0 ? (
            <p className="mt-1 text-[0.8125rem] text-muted-foreground">
              No orders recorded.
            </p>
          ) : (
            <ul className="mt-2 divide-y divide-border rounded-md border border-border">
              {orders.map((order) => (
                <li
                  key={order.id}
                  className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
                >
                  <div className="min-w-0">
                    <p className="font-mono text-xs">{order.reference}</p>
                    <p className="text-[0.6875rem] text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={order.status.replace("-", " ")} />
                    <span className="text-sm tabular-nums">
                      {formatCentavos(order.totalCentavos)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
