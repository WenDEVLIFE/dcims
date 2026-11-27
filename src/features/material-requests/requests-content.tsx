"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { ClipboardList, CheckCircle2, Clock3, Truck, FolderPlus } from "lucide-react";
import { toast } from "sonner";

import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FulfillDialog } from "@/features/material-requests/fulfill-dialog";
import { RequestFormDialog } from "@/features/material-requests/request-form-dialog";
import type { MaterialRequest, RequestPriority } from "@/types/domain";
import { formatDate, formatNumber } from "@/lib/format";
import { useDomainStore } from "@/stores/domain-store";

const subscribeToMount = () => () => {};

const PRIORITY_LABELS: Record<RequestPriority, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
  urgent: "Urgent",
};

export function RequestsContent() {
  const state = useDomainStore();
  const mounted = useSyncExternalStore(
    subscribeToMount,
    () => true,
    () => false,
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<string[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [fulfilTarget, setFulfilTarget] = useState<MaterialRequest | null>(null);
  const [rejectTarget, setRejectTarget] = useState<MaterialRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [cancelTarget, setCancelTarget] = useState<MaterialRequest | null>(null);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return state.materialRequests
      .filter((request) => {
        const project = state.projects.find((entry) => entry.id === request.projectId);
        if (
          term &&
          !`${request.reference} ${project?.name ?? ""} ${request.requestedBy}`
            .toLowerCase()
            .includes(term)
        ) {
          return false;
        }
        if (statusFilter.length > 0 && !statusFilter.includes(request.status)) return false;
        if (priorityFilter.length > 0 && !priorityFilter.includes(request.priority)) return false;
        return true;
      })
      .sort((left, right) => right.requestedAt.localeCompare(left.requestedAt));
  }, [state.materialRequests, state.projects, search, statusFilter, priorityFilter]);

  const summary = useMemo(
    () => ({
      total: state.materialRequests.length,
      pending: state.materialRequests.filter((request) => request.status === "pending").length,
      approved: state.materialRequests.filter((request) =>
        ["approved", "partially-fulfilled"].includes(request.status),
      ).length,
      fulfilled: state.materialRequests.filter((request) => request.status === "fulfilled").length,
    }),
    [state.materialRequests],
  );

  function approve(request: MaterialRequest) {
    const result = state.approveMaterialRequest(request.id);
    if (!result.ok) return toast.error(result.error);
    toast.success(`${request.reference} approved — stock not yet deducted`);
  }

  function confirmReject() {
    if (!rejectTarget) return;
    const result = state.rejectMaterialRequest(rejectTarget.id, rejectReason);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(`${rejectTarget.reference} rejected`);
    setRejectTarget(null);
    setRejectReason("");
  }

  function cancel(request: MaterialRequest) {
    const result = state.cancelMaterialRequest(request.id);
    if (!result.ok) return toast.error(result.error);
    toast.success(`${request.reference} cancelled`);
  }

  function createRequest(input: {
    projectId: string;
    priority: RequestPriority;
    requiredDate: string;
    notes?: string;
    items: Array<{ materialId: string; requestedQuantity: number }>;
  }) {
    const result = state.createMaterialRequest({
      ...input,
      requestedBy: state.settings.demoUser.name,
    });
    if (!result.ok) return { ok: false as const, error: result.error };
    toast.success("Material request submitted");
    return { ok: true as const };
  }

  function fulfill(input: {
    warehouseId: string;
    quantities: Record<string, number>;
  }) {
    if (!fulfilTarget) return { ok: false as const, error: "No request selected" };
    const result = state.fulfillMaterialRequest({
      requestId: fulfilTarget.id,
      warehouseId: input.warehouseId,
      quantities: input.quantities,
    });
    if (!result.ok) return { ok: false as const, error: result.error };
    toast.success("Stock released to the project");
    return { ok: true as const };
  }

  const columns: DataTableColumn<MaterialRequest>[] = [
    {
      id: "reference",
      header: "Request",
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
      id: "project",
      header: "Project",
      sortValue: (row) =>
        state.projects.find((project) => project.id === row.projectId)?.name ?? "",
      cell: (row) => (
        <span className="text-muted-foreground">
          {state.projects.find((project) => project.id === row.projectId)?.name ?? "—"}
        </span>
      ),
    },
    {
      id: "priority",
      header: "Priority",
      sortValue: (row) => row.priority,
      cell: (row) => <span className="text-muted-foreground">{PRIORITY_LABELS[row.priority]}</span>,
    },
    {
      id: "requested",
      header: "Requested",
      cell: (row) => <span className="tabular-nums">{formatDate(row.requestedAt)}</span>,
    },
    {
      id: "required",
      header: "Required by",
      cell: (row) => (
        <span className="tabular-nums">
          {row.requiredDate ? formatDate(row.requiredDate) : "—"}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      sortValue: (row) => row.status,
      cell: (row) => <StatusBadge status={statusLabel(row.status)} />,
    },
    {
      id: "actions",
      header: "",
      align: "right",
      cell: (row) => {
        const actions: RowAction[] = [];
        if (row.status === "pending") {
          actions.push({ label: "Approve", onSelect: () => approve(row) });
          actions.push({ label: "Reject", onSelect: () => setRejectTarget(row) });
        }
        if (["approved", "partially-fulfilled"].includes(row.status)) {
          actions.push({ label: "Fulfil", onSelect: () => setFulfilTarget(row) });
        }
        if (["pending", "approved"].includes(row.status)) {
          actions.push({
            label: "Cancel request",
            destructive: true,
            onSelect: () => setCancelTarget(row),
          });
        }
        return actions.length > 0 ? (
          <RowActions label={`Actions for ${row.reference}`} actions={actions} />
        ) : null;
      },
    },
  ];

  const header = (
    <PageHeader
      title="Material requests"
      description="Site requests routed through approval and warehouse fulfilment."
      actions={
        <Button type="button" size="sm" onClick={() => setFormOpen(true)}>
          <FolderPlus aria-hidden="true" />
          New request
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
        <StatCard label="Requests" value={formatNumber(summary.total)} hint="All statuses" icon={ClipboardList} />
        <StatCard label="Pending review" value={formatNumber(summary.pending)} hint="Awaiting a decision" icon={Clock3} />
        <StatCard label="Awaiting fulfilment" value={formatNumber(summary.approved)} hint="Approved or partially released" icon={Truck} />
        <StatCard label="Fulfilled" value={formatNumber(summary.fulfilled)} hint="Fully released" icon={CheckCircle2} />
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput
            value={search}
            onValueChange={setSearch}
            label="Search requests"
            placeholder="Search reference or project"
          />
          <FilterDropdown
            label="Status"
            selected={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "pending", label: "Pending" },
              { value: "approved", label: "Approved" },
              { value: "partially-fulfilled", label: "Partially fulfilled" },
              { value: "fulfilled", label: "Fulfilled" },
              { value: "rejected", label: "Rejected" },
              { value: "cancelled", label: "Cancelled" },
            ]}
          />
          <FilterDropdown
            label="Priority"
            selected={priorityFilter}
            onChange={setPriorityFilter}
            options={[
              { value: "urgent", label: "Urgent" },
              { value: "high", label: "High" },
              { value: "normal", label: "Normal" },
              { value: "low", label: "Low" },
            ]}
          />
        </div>

        <DataTable
          columns={columns}
          data={rows}
          getRowId={(row) => row.id}
          emptyTitle="No requests match"
          emptyDescription="Adjust the filters or raise a new request."
        />
      </div>

      <RequestFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        projects={state.projects}
        materials={state.materials}
        onSubmit={createRequest}
      />

      <FulfillDialog
        open={fulfilTarget !== null}
        onOpenChange={(open) => {
          if (!open) setFulfilTarget(null);
        }}
        request={fulfilTarget}
        materials={state.materials}
        warehouses={state.warehouses}
        balances={state.balances}
        onSubmit={fulfill}
      />

      <Dialog
        open={rejectTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setRejectTarget(null);
            setRejectReason("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject {rejectTarget?.reference ?? "request"}</DialogTitle>
            <DialogDescription>
              A reason is required and is stored with the request.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reject-reason">Reason</Label>
            <Textarea
              id="reject-reason"
              rows={3}
              value={rejectReason}
              onChange={(event) => setRejectReason(event.currentTarget.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setRejectTarget(null)}>
              Cancel
            </Button>
            <Button type="button" onClick={confirmReject} disabled={!rejectReason.trim()}>
              Reject request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={cancelTarget !== null}
        onOpenChange={(open) => {
          if (!open) setCancelTarget(null);
        }}
        title="Cancel request"
        description={
          cancelTarget
            ? `${cancelTarget.reference} will be closed without releasing stock. This cannot be undone.`
            : ""
        }
        confirmLabel="Cancel request"
        destructive
        onConfirm={() => {
          if (cancelTarget) cancel(cancelTarget);
          setCancelTarget(null);
        }}
      />
    </PageContainer>
  );
}

function statusLabel(status: MaterialRequest["status"]): string {
  switch (status) {
    case "partially-fulfilled":
      return "Partially fulfilled";
    case "pending":
      return "Pending";
    case "approved":
      return "Approved";
    case "fulfilled":
      return "Fulfilled";
    case "rejected":
      return "Rejected";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
}
