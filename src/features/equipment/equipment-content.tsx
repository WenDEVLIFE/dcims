"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { CheckCircle2, PackagePlus, Truck, Wrench } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { FilterDropdown } from "@/components/shared/filter-dropdown";
import { LoadingState } from "@/components/shared/loading-state";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { RecordDetails } from "@/components/shared/record-details";
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
import { AssignDialog } from "@/features/equipment/assign-dialog";
import {
  EquipmentFormDialog,
  type EquipmentFormValues,
} from "@/features/equipment/equipment-form-dialog";
import { MaintenanceDialog } from "@/features/equipment/maintenance-dialog";
import type { Equipment } from "@/types/domain";
import { formatCentavos } from "@/lib/currency";
import { formatDate, formatDateTime, formatNumber } from "@/lib/format";
import { useDomainStore } from "@/stores/domain-store";
import { EQUIPMENT_CONDITION_LABELS, EQUIPMENT_STATUS_LABELS } from "@/lib/status-labels";

const subscribeToMount = () => () => {};


export function EquipmentContent() {
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
  const [editing, setEditing] = useState<Equipment | null>(null);
  const [assignTarget, setAssignTarget] = useState<Equipment | null>(null);
  const [maintenanceTarget, setMaintenanceTarget] = useState<Equipment | null>(null);
  const [retireTarget, setRetireTarget] = useState<Equipment | null>(null);
  const [detailsTarget, setDetailsTarget] = useState<Equipment | null>(null);

  const categories = useMemo(
    () => [...new Set(state.equipment.map((asset) => asset.category))].sort(),
    [state.equipment],
  );

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return state.equipment
      .filter((asset) => {
        if (term && !`${asset.name} ${asset.assetCode} ${asset.category}`.toLowerCase().includes(term)) {
          return false;
        }
        if (statusFilter.length > 0 && !statusFilter.includes(asset.status)) return false;
        if (categoryFilter.length > 0 && !categoryFilter.includes(asset.category)) return false;
        return true;
      })
      .sort((left, right) => left.assetCode.localeCompare(right.assetCode));
  }, [state.equipment, search, statusFilter, categoryFilter]);

  const summary = useMemo(
    () => ({
      total: state.equipment.length,
      available: state.equipment.filter((asset) => asset.status === "available").length,
      assigned: state.equipment.filter((asset) => asset.status === "assigned").length,
      maintenance: state.equipment.filter((asset) => asset.status === "under-maintenance").length,
    }),
    [state.equipment],
  );

  function saveEquipment(values: EquipmentFormValues) {
    const result = editing
      ? state.updateEquipment(editing.id, values)
      : state.registerEquipment(values);
    if (!result.ok) return { ok: false as const, error: result.error };
    toast.success(editing ? "Equipment updated" : "Equipment registered");
    return { ok: true as const };
  }

  function assign(input: { projectId: string; assignedTo: string }) {
    if (!assignTarget) return { ok: false as const, error: "No equipment selected" };
    const result = state.assignEquipment({ equipmentId: assignTarget.id, ...input });
    if (!result.ok) return { ok: false as const, error: result.error };
    toast.success("Equipment assigned");
    return { ok: true as const };
  }

  function maintain(input: {
    description: string;
    costCentavos: number;
    performedBy: string;
    completed: boolean;
  }) {
    if (!maintenanceTarget) return { ok: false as const, error: "No equipment selected" };
    const result = state.recordEquipmentMaintenance({
      equipmentId: maintenanceTarget.id,
      ...input,
    });
    if (!result.ok) return { ok: false as const, error: result.error };
    toast.success("Maintenance recorded");
    return { ok: true as const };
  }

  function returnAsset(asset: Equipment) {
    const result = state.returnEquipment(asset.id);
    if (!result.ok) return toast.error(result.error);
    toast.success(`${asset.assetCode} returned to the warehouse`);
  }

  function retire(asset: Equipment) {
    const result = state.retireEquipment(asset.id);
    if (!result.ok) return toast.error(result.error);
    toast.success(`${asset.assetCode} retired`);
  }

  const columns: DataTableColumn<Equipment>[] = [
    {
      id: "asset",
      header: "Asset",
      sortValue: (row) => row.assetCode,
      cell: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.name}</p>
          <p className="font-mono text-[0.6875rem] text-muted-foreground">{row.assetCode}</p>
        </div>
      ),
    },
    {
      id: "category",
      header: "Category",
      sortValue: (row) => row.category,
      cell: (row) => <span className="text-muted-foreground">{row.category}</span>,
    },
    {
      id: "condition",
      header: "Condition",
      cell: (row) => <StatusBadge status={EQUIPMENT_CONDITION_LABELS[row.condition]} />,
    },
    {
      id: "project",
      header: "Assigned to",
      cell: (row) => (
        <span className="text-muted-foreground">
          {state.projects.find((project) => project.id === row.assignedProjectId)?.name ?? "—"}
        </span>
      ),
    },
    {
      id: "maintenance",
      header: "Next service",
      cell: (row) => (
        <span className="tabular-nums">
          {row.nextMaintenanceDate ? formatDate(row.nextMaintenanceDate) : "—"}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      sortValue: (row) => row.status,
      cell: (row) => <StatusBadge status={EQUIPMENT_STATUS_LABELS[row.status]} />,
    },
    {
      id: "actions",
      header: "",
      align: "right",
      cell: (row) => {
        const actions: RowAction[] = [
          { label: "Details", onSelect: () => setDetailsTarget(row) },
          {
            label: "Edit",
            onSelect: () => {
              setEditing(row);
              setFormOpen(true);
            },
          },
        ];

        if (row.status === "available") {
          actions.push({ label: "Assign to project", onSelect: () => setAssignTarget(row) });
        }
        if (row.status === "assigned") {
          actions.push({ label: "Return to warehouse", onSelect: () => returnAsset(row) });
        }
        if (row.status !== "retired") {
          actions.push({ label: "Record maintenance", onSelect: () => setMaintenanceTarget(row) });
        }
        if (row.status !== "retired") {
          actions.push({
            label: "Retire",
            destructive: true,
            onSelect: () => setRetireTarget(row),
          });
        }

        return <RowActions label={`Actions for ${row.assetCode}`} actions={actions} />;
      },
    },
  ];

  const header = (
    <PageHeader
      title="Equipment"
      description="Asset register with availability, assignment, and maintenance state."
      actions={
        <Button
          type="button"
          size="sm"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <PackagePlus aria-hidden="true" />
          Register equipment
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
        <StatCard label="Registered assets" value={formatNumber(summary.total)} hint="All statuses" icon={Truck} />
        <StatCard label="Available" value={formatNumber(summary.available)} hint="Ready for assignment" icon={CheckCircle2} />
        <StatCard label="Assigned" value={formatNumber(summary.assigned)} hint="Currently on site" icon={Wrench} />
        <StatCard label="Under maintenance" value={formatNumber(summary.maintenance)} hint="Temporarily unavailable" icon={Wrench} />
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput
            value={search}
            onValueChange={setSearch}
            label="Search equipment"
            placeholder="Search name, code, or category"
          />
          <FilterDropdown
            label="Status"
            selected={statusFilter}
            onChange={setStatusFilter}
            options={Object.entries(EQUIPMENT_STATUS_LABELS).map(([value, label]) => ({ value, label }))}
          />
          <FilterDropdown
            label="Category"
            selected={categoryFilter}
            onChange={setCategoryFilter}
            options={categories.map((category) => ({ value: category, label: category }))}
          />
        </div>

        <DataTable
          columns={columns}
          data={rows}
          getRowId={(row) => row.id}
          emptyTitle="No equipment matches"
          emptyDescription="Adjust the filters or register a new asset."
        />
      </div>

      <EquipmentFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        equipment={editing ?? undefined}
        onSubmit={saveEquipment}
      />

      <AssignDialog
        open={assignTarget !== null}
        onOpenChange={(open) => {
          if (!open) setAssignTarget(null);
        }}
        equipment={assignTarget}
        projects={state.projects}
        onSubmit={assign}
      />

      <MaintenanceDialog
        open={maintenanceTarget !== null}
        onOpenChange={(open) => {
          if (!open) setMaintenanceTarget(null);
        }}
        equipment={maintenanceTarget}
        onSubmit={maintain}
      />

      <ConfirmDialog
        open={retireTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRetireTarget(null);
        }}
        title="Retire equipment"
        description={
          retireTarget
            ? `${retireTarget.assetCode} will be removed from the available pool permanently. Assigned equipment must be returned first.`
            : ""
        }
        confirmLabel="Retire asset"
        destructive
        onConfirm={() => {
          if (retireTarget) retire(retireTarget);
          setRetireTarget(null);
        }}
      />

      <EquipmentDetailsDialog
        equipment={detailsTarget}
        onClose={() => setDetailsTarget(null)}
      />
    </PageContainer>
  );
}

function EquipmentDetailsDialog({
  equipment,
  onClose,
}: {
  equipment: Equipment | null;
  onClose: () => void;
}) {
  const state = useDomainStore();
  if (!equipment) return null;

  const assignments = state.equipmentAssignments
    .filter((assignment) => assignment.equipmentId === equipment.id)
    .sort((left, right) => right.assignedAt.localeCompare(left.assignedAt));
  const maintenance = state.maintenanceRecords
    .filter((record) => record.equipmentId === equipment.id)
    .sort((left, right) => right.startedAt.localeCompare(left.startedAt));

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{equipment.name}</DialogTitle>
          <DialogDescription className="font-mono text-xs">
            {equipment.assetCode}
          </DialogDescription>
        </DialogHeader>

        <RecordDetails
          columns={2}
          items={[
            { label: "Category", value: equipment.category },
            { label: "Condition", value: EQUIPMENT_CONDITION_LABELS[equipment.condition] },
            { label: "Status", value: EQUIPMENT_STATUS_LABELS[equipment.status] },
            { label: "Location", value: equipment.location },
            { label: "Purchase date", value: formatDate(equipment.purchaseDate) },
            { label: "Purchase cost", value: formatCentavos(equipment.purchaseCostCentavos) },
            {
              label: "Next maintenance",
              value: equipment.nextMaintenanceDate
                ? formatDate(equipment.nextMaintenanceDate)
                : "Not scheduled",
            },
          ]}
        />

        <div>
          <h3 className="text-sm font-semibold">Assignment history</h3>
          {assignments.length === 0 ? (
            <p className="mt-1 text-[0.8125rem] text-muted-foreground">Never assigned.</p>
          ) : (
            <ul className="mt-2 flex flex-col gap-1.5">
              {assignments.map((assignment) => (
                <li key={assignment.id} className="text-[0.8125rem]">
                  {formatDateTime(assignment.assignedAt)} ·{" "}
                  {assignment.returnedAt ? "returned" : "on site"} · {assignment.assignedTo}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold">Maintenance history</h3>
          {maintenance.length === 0 ? (
            <p className="mt-1 text-[0.8125rem] text-muted-foreground">No records.</p>
          ) : (
            <ul className="mt-2 flex flex-col gap-1.5">
              {maintenance.map((record) => (
                <li key={record.id} className="text-[0.8125rem]">
                  {formatDate(record.startedAt)} · {record.description} ·{" "}
                  {formatCentavos(record.costCentavos)}
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

