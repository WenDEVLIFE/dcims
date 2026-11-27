"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { ClipboardList, PackageMinus } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/shared/empty-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConsumptionDialog } from "@/features/projects/consumption-dialog";
import { ProjectFormDialog } from "@/features/projects/project-form-dialog";
import type { ProjectInputValues } from "@/schemas/domain";
import type { ConstructionProject, ProjectStatus } from "@/types/domain";
import { formatCentavos } from "@/lib/currency";
import { formatDate, formatDateTime, formatQuantity } from "@/lib/format";
import { useDomainStore } from "@/stores/domain-store";
import {
  projectActivity,
  projectAllocations,
  projectBudgetSummary,
  projectById,
  projectConsumptions,
  projectEquipment,
  projectRequests,
} from "@/stores/selectors";

const STATUS_OPTIONS: Array<{ value: ProjectStatus; label: string }> = [
  { value: "planned", label: "Planned" },
  { value: "active", label: "Active" },
  { value: "on-hold", label: "On hold" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const subscribeToMount = () => () => {};

export function ProjectDetailContent({ projectId }: { projectId: string }) {
  const state = useDomainStore();
  const mounted = useSyncExternalStore(
    subscribeToMount,
    () => true,
    () => false,
  );

  const [editOpen, setEditOpen] = useState(false);
  const [consumptionOpen, setConsumptionOpen] = useState(false);
  const [progressDraft, setProgressDraft] = useState("");

  const project = projectById(state, projectId);
  const allocations = useMemo(() => projectAllocations(state, projectId), [state, projectId]);
  const consumptions = useMemo(() => projectConsumptions(state, projectId), [state, projectId]);
  const requests = useMemo(() => projectRequests(state, projectId), [state, projectId]);
  const equipment = useMemo(() => projectEquipment(state, projectId), [state, projectId]);
  const activity = useMemo(() => projectActivity(state, projectId), [state, projectId]);
  const budget = projectBudgetSummary(state, projectId);

  if (!mounted) {
    return (
      <PageContainer>
        <LoadingState rows={6} />
      </PageContainer>
    );
  }

  if (!project) {
    return (
      <PageContainer>
        <EmptyState
          title="Project not found"
          description="This project no longer exists in the current dataset."
          action={
            <Button asChild size="sm" variant="outline">
              <Link href="/projects">Back to projects</Link>
            </Button>
          }
        />
      </PageContainer>
    );
  }

  function changeStatus(status: ProjectStatus) {
    const result = state.updateProject(projectId, { status });
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Project status updated");
  }

  function saveProgress() {
    const value = Number(progressDraft);
    const result = state.updateProject(projectId, { progress: value });
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Progress updated");
    setProgressDraft("");
  }

  function submitProject(values: ProjectInputValues) {
    const result = state.updateProject(projectId, values);
    if (!result.ok) return { ok: false as const, error: result.error };
    toast.success("Project updated");
    return { ok: true as const };
  }

  function submitConsumption(input: { materialId: string; quantity: number }) {
    const result = state.recordMaterialConsumption({
      projectId,
      materialId: input.materialId,
      quantity: input.quantity,
    });
    if (!result.ok) return { ok: false as const, error: result.error };
    toast.success("Consumption recorded");
    return { ok: true as const };
  }

  return (
    <PageContainer>
      <PageHeader
        title={project.name}
        description={`${project.code} 璺?${project.location} 璺?${project.client}`}
        actions={
          <>
            <Button asChild size="sm" variant="ghost">
              <Link href="/projects">Back</Link>
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setEditOpen(true)}>
              Edit project
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => setConsumptionOpen(true)}
              disabled={allocations.length === 0}
            >
              <PackageMinus aria-hidden="true" />
              Record consumption
            </Button>
          </>
        }
      />

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <StatusBadge status={labelFor(project.status)} />
        <span className="text-[0.8125rem] text-muted-foreground">
          {formatDate(project.startDate)} 閳?{formatDate(project.targetEndDate)}
        </span>
        <span className="text-[0.8125rem] text-muted-foreground">
          Manager: {project.managerName}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryTile label="Material budget" value={formatCentavos(project.budgetCentavos)} />
        <SummaryTile label="Recorded spend" value={formatCentavos(budget?.expenseCentavos ?? 0)} />
        <SummaryTile label="Remaining budget" value={formatCentavos(budget?.remainingCentavos ?? 0)} />
        <SummaryTile label="Allocated materials" value={String(allocations.length)} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="gap-3 p-4">
          <div>
            <p className="text-sm font-semibold">Progress</p>
            <p className="text-[0.8125rem] text-muted-foreground">
              {project.progress}% complete 璺?{budget?.consumedPercent ?? 0}% of budget consumed
            </p>
          </div>
          <Progress value={project.progress} className="h-2" />
          <div className="flex items-end gap-2">
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="project-progress">Update progress</Label>
              <Input
                id="project-progress"
                type="number"
                min={0}
                max={100}
                placeholder={`${project.progress}`}
                value={progressDraft}
                onChange={(event) => setProgressDraft(event.currentTarget.value)}
              />
            </div>
            <Button type="button" size="sm" onClick={saveProgress} disabled={progressDraft === ""}>
              Save
            </Button>
          </div>
        </Card>

        <Card className="gap-3 p-4">
          <div>
            <p className="text-sm font-semibold">Status</p>
            <p className="text-[0.8125rem] text-muted-foreground">
              Status changes are recorded in the activity log.
            </p>
          </div>
          <Select value={project.status} onValueChange={(value) => changeStatus(value as ProjectStatus)}>
            <SelectTrigger aria-label="Project status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="mt-6">
        <TabsList className="max-w-full overflow-x-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="consumption">Consumption</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card className="gap-2 p-4">
            <p className="text-sm">{project.description ?? "No description recorded."}</p>
            <dl className="mt-2 grid grid-cols-1 gap-3 border-t border-border pt-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-xs text-muted-foreground">Open requests</dt>
                <dd className="tabular-nums">
                  {requests.filter((request) =>
                    ["pending", "approved", "partially-fulfilled"].includes(request.status),
                  ).length}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Assigned equipment</dt>
                <dd className="tabular-nums">{equipment.length}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Consumption records</dt>
                <dd className="tabular-nums">{consumptions.length}</dd>
              </div>
            </dl>
          </Card>
        </TabsContent>

        <TabsContent value="materials" className="mt-4">
          {allocations.length === 0 ? (
            <EmptyState
              title="No allocated materials"
              description="Materials arrive on site when a warehouse fulfilment releases stock to this project."
            />
          ) : (
            <Card className="overflow-x-auto p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/60 text-left">
                    <th scope="col" className="px-3 py-2 text-xs font-semibold text-muted-foreground">Material</th>
                    <th scope="col" className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground">On site</th>
                    <th scope="col" className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground">Consumed</th>
                    <th scope="col" className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground">Unit cost</th>
                  </tr>
                </thead>
                <tbody>
                  {allocations.map(({ allocation, material }) => (
                    <tr key={allocation.id} className="border-b border-border last:border-b-0">
                      <td className="px-3 py-2">
                        <p className="font-medium">{material.name}</p>
                        <p className="font-mono text-[0.6875rem] text-muted-foreground">{material.sku}</p>
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {formatQuantity(allocation.quantity, material.unit)}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {formatQuantity(allocation.consumedQuantity, material.unit)}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {formatCentavos(material.unitCostCentavos)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="consumption" className="mt-4">
          {consumptions.length === 0 ? (
            <EmptyState
              title="No consumption recorded"
              description="Record consumption once material is actually used on site."
            />
          ) : (
            <Card className="overflow-x-auto p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/60 text-left">
                    <th scope="col" className="px-3 py-2 text-xs font-semibold text-muted-foreground">Material</th>
                    <th scope="col" className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground">Quantity</th>
                    <th scope="col" className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground">Cost</th>
                    <th scope="col" className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground">Recorded</th>
                  </tr>
                </thead>
                <tbody>
                  {consumptions.map((entry) => {
                    const material = state.materials.find((item) => item.id === entry.materialId);
                    return (
                      <tr key={entry.id} className="border-b border-border last:border-b-0">
                        <td className="px-3 py-2">{material?.name ?? "Material"}</td>
                        <td className="px-3 py-2 text-right tabular-nums">
                          {formatQuantity(entry.quantity, material?.unit ?? "piece")}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums">
                          {formatCentavos(entry.totalCostCentavos)}
                        </td>
                        <td className="px-3 py-2 text-right text-xs text-muted-foreground">
                          {formatDateTime(entry.consumedAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="requests" className="mt-4">
          {requests.length === 0 ? (
            <EmptyState title="No material requests" description="Requests raised for this project appear here." />
          ) : (
            <ul className="flex flex-col gap-2">
              {requests.map((request) => (
                <li
                  key={request.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-muted-foreground">{request.reference}</p>
                    <p className="truncate text-sm">
                      {request.items.length} line{request.items.length === 1 ? "" : "s"} 璺?{request.priority} priority
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <StatusBadge status={request.status} />
                    <Button asChild size="sm" variant="ghost">
                      <Link href="/material-requests">
                        <ClipboardList aria-hidden="true" />
                        Open
                      </Link>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="equipment" className="mt-4">
          {equipment.length === 0 ? (
            <EmptyState title="No equipment assigned" description="Assign equipment from the equipment register." />
          ) : (
            <ul className="flex flex-col gap-2">
              {equipment.map((asset) => (
                <li
                  key={asset.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{asset.name}</p>
                    <p className="font-mono text-[0.6875rem] text-muted-foreground">{asset.assetCode}</p>
                  </div>
                  <StatusBadge status={labelForEquipment(asset.status)} />
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          {activity.length === 0 ? (
            <EmptyState title="No activity" description="Operations on this project will appear here." />
          ) : (
            <ul className="flex flex-col gap-2">
              {activity.map((log) => (
                <li key={log.id} className="rounded-md border border-border px-3 py-2">
                  <p className="text-sm">{log.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {log.description} 璺?{formatDateTime(log.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>

      <ProjectFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        project={project}
        onSubmit={submitProject}
      />

      <ConsumptionDialog
        open={consumptionOpen}
        onOpenChange={setConsumptionOpen}
        allocations={allocations}
        onSubmit={submitConsumption}
      />
    </PageContainer>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <Card className="gap-1 p-4">
      <p className="text-[0.8125rem] font-medium text-muted-foreground">{label}</p>
      <p className="font-heading text-xl leading-7 font-bold tabular-nums">{value}</p>
    </Card>
  );
}

function labelFor(status: ProjectStatus): string {
  const found = STATUS_OPTIONS.find((option) => option.value === status);
  return found?.label ?? status;
}

function labelForEquipment(status: string): string {
  switch (status) {
    case "available":
      return "Available";
    case "assigned":
      return "Assigned";
    case "under-maintenance":
      return "Under maintenance";
    case "damaged":
      return "Damaged";
    case "retired":
      return "Retired";
    default:
      return status;
  }
}

export type { ConstructionProject };
