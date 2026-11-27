"use client";

import { Layers, Package, Plus, Shield, Wrench } from "lucide-react";
import { useMemo, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { DataTableToolbar } from "@/components/shared/data-table-toolbar";
import { FilterDropdown } from "@/components/shared/filter-dropdown";
import { LoadingState } from "@/components/shared/loading-state";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { RowActions } from "@/components/shared/row-actions";
import { SearchInput } from "@/components/shared/search-input";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CategoryFormDialog } from "@/features/categories/category-form-dialog";
import { formatCentavos } from "@/lib/currency";
import { formatNumber } from "@/lib/format";
import { useDomainStore } from "@/stores/domain-store";
import { categoryInventoryValues } from "@/stores/selectors";
import type { Material, MaterialCategory } from "@/types/domain";

const subscribeToMount = () => () => {};
const icons = { package: Package, layers: Layers, wrench: Wrench, shield: Shield };
const tones = {
  neutral: "bg-secondary text-secondary-foreground",
  orange: "bg-accent text-accent-foreground",
  blue: "bg-info-background text-info-foreground",
  green: "bg-success-background text-success-foreground",
};
const statusOptions = [
  { value: "active", label: "Active" },
  { value: "archived", label: "Archived" },
];

interface CategoryRow {
  category: MaterialCategory;
  materials: Material[];
  value: number;
}

type CategoryDialog =
  | { kind: "create" }
  | { kind: "edit" | "materials" | "archive"; id: string };

export function CategoriesContent() {
  const categories = useDomainStore((state) => state.categories);
  const materials = useDomainStore((state) => state.materials);
  const balances = useDomainStore((state) => state.balances);
  const createCategory = useDomainStore((state) => state.createCategory);
  const updateCategory = useDomainStore((state) => state.updateCategory);
  const archiveCategory = useDomainStore((state) => state.archiveCategory);
  const mounted = useSyncExternalStore(subscribeToMount, () => true, () => false);
  const [search, setSearch] = useState("");
  const [statuses, setStatuses] = useState<string[]>([]);
  const [dialog, setDialog] = useState<CategoryDialog | null>(null);

  const rows = useMemo(() => {
    const values = categoryInventoryValues({ materials, balances });
    const groups = new Map<string, Material[]>();
    for (const material of materials) {
      const group = groups.get(material.categoryId);
      if (group) group.push(material);
      else groups.set(material.categoryId, [material]);
    }

    return categories.map((category) => ({
      category,
      materials: groups.get(category.id) ?? [],
      value: values.get(category.id) ?? 0,
    }));
  }, [categories, materials, balances]);

  const term = search.trim().toLowerCase();
  const filtered = rows.filter(({ category }) =>
    (statuses.length === 0 || statuses.includes(category.status ?? "active")) &&
    `${category.name} ${category.code} ${category.description ?? ""}`.toLowerCase().includes(term),
  );
  const selected = dialog && dialog.kind !== "create"
    ? rows.find((row) => row.category.id === dialog.id)
    : undefined;
  const closeDialog = () => setDialog(null);

  const columns: DataTableColumn<CategoryRow>[] = [
    {
      id: "category",
      header: "Category",
      className: "min-w-48",
      sortValue: ({ category }) => category.name,
      cell: ({ category }) => {
        const Icon = icons[category.icon ?? "package"];
        return (
          <div className="flex items-start gap-2.5">
            <span className={`grid size-8 shrink-0 place-items-center rounded-md ${tones[category.color ?? "neutral"]}`}>
              <Icon aria-hidden="true" className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="font-semibold break-words">{category.name}</p>
              <p className="font-mono text-xs text-muted-foreground">{category.code}</p>
              {category.description && (
                <p className="mt-1 break-words text-xs text-muted-foreground">{category.description}</p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      id: "materials",
      header: "Materials",
      align: "right",
      sortValue: (row) => row.materials.length,
      cell: (row) => formatNumber(row.materials.length),
    },
    {
      id: "value",
      header: "Inventory value",
      className: "whitespace-nowrap",
      align: "right",
      sortValue: (row) => row.value,
      cell: (row) => formatCentavos(row.value),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ category }) => category.status === "archived"
        ? <StatusBadge status="Archived" tone="neutral" />
        : <StatusBadge status="Active" tone="success" />,
    },
    {
      id: "actions",
      header: "Actions",
      align: "right",
      cell: ({ category, materials }) => {
        const hasActiveMaterials = materials.some((material) => material.status === "active");
        return (
          <RowActions
            label={`Actions for ${category.name}`}
            actions={[
              { label: "View materials", onSelect: () => setDialog({ kind: "materials", id: category.id }) },
              { label: "Edit", onSelect: () => setDialog({ kind: "edit", id: category.id }) },
              {
                label: hasActiveMaterials ? "Archive (active materials)" : "Archive",
                destructive: true,
                disabled: category.status === "archived" || hasActiveMaterials,
                onSelect: () => setDialog({ kind: "archive", id: category.id }),
              },
            ]}
          />
        );
      },
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Categories"
        description="Group related materials and review their inventory value across warehouses."
        actions={
          <Button size="sm" disabled={!mounted} onClick={() => setDialog({ kind: "create" })}>
            <Plus aria-hidden="true" />
            Add category
          </Button>
        }
      />
      <div className="mt-6 space-y-3">
        {!mounted ? <LoadingState rows={8} /> : (
          <>
            <DataTableToolbar>
              <SearchInput value={search} onValueChange={setSearch} label="Search categories" placeholder="Search by name or code" />
              <FilterDropdown label="Status" selected={statuses} onChange={setStatuses} options={statusOptions} />
            </DataTableToolbar>
            <DataTable
              caption="Material categories"
              columns={columns}
              data={filtered}
              getRowId={(row) => row.category.id}
              emptyTitle="No categories match"
              emptyDescription="Clear the filters or add a category to group related materials."
            />
          </>
        )}
      </div>

      {(dialog?.kind === "create" || (dialog?.kind === "edit" && selected)) && (
        <CategoryFormDialog
          category={selected?.category}
          onClose={closeDialog}
          onSave={(values) => {
            const result = selected ? updateCategory(selected.category.id, values) : createCategory(values);
            if (result.ok) toast.success(selected ? "Category updated" : "Category created");
            return result;
          }}
        />
      )}

      {dialog?.kind === "materials" && selected && (
        <Dialog open onOpenChange={(open) => { if (!open) closeDialog(); }}>
          <DialogContent className="max-h-[90dvh] overflow-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{selected.category.name}</DialogTitle>
              <DialogDescription>Materials assigned to {selected.category.code}.</DialogDescription>
            </DialogHeader>
            {selected.materials.length === 0 ? (
              <p className="text-sm text-muted-foreground">No materials are assigned to this category.</p>
            ) : (
              <ul className="divide-y divide-border">
                {selected.materials.map((material) => (
                  <li key={material.id} className="flex items-center justify-between gap-3 py-2">
                    <div className="min-w-0 break-words">
                      <p className="font-medium">{material.name}</p>
                      <p className="font-mono text-xs text-muted-foreground">{material.sku}</p>
                    </div>
                    {material.status === "discontinued" && <StatusBadge status="Archived" tone="neutral" />}
                  </li>
                ))}
              </ul>
            )}
          </DialogContent>
        </Dialog>
      )}

      {dialog?.kind === "archive" && selected && (
        <ConfirmDialog
          open
          onOpenChange={(open) => { if (!open) closeDialog(); }}
          title="Archive category"
          description={`${selected.category.name} will no longer be available for new material assignments. Existing records will remain linked.`}
          confirmLabel="Archive category"
          destructive
          onConfirm={() => {
            const result = archiveCategory(selected.category.id);
            if (result.ok) toast.success("Category archived");
            else toast.error(result.error);
          }}
        />
      )}
    </PageContainer>
  );
}
