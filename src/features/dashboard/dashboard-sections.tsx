import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { SectionHeader } from "@/components/shared/section-header";
import { StatusBadge } from "@/components/shared/status-badge";
import type {
  ActivityLog,
  ConstructionProject,
  Equipment,
  MaintenanceRecord,
  Material,
  MaterialRequest,
  StockMovement,
} from "@/types/domain";
import { formatCentavos } from "@/lib/currency";
import { formatDate, formatDateTime, formatQuantity } from "@/lib/format";

/**
 * Dashboard feed sections. Each list reads records the store already holds and
 * links to the module that owns them.
 */

function SectionShell({
  title,
  description,
  href,
  linkLabel,
  children,
  isEmpty,
  emptyLabel,
}: {
  title: string;
  description: string;
  href: string;
  linkLabel: string;
  children: React.ReactNode;
  isEmpty: boolean;
  emptyLabel: string;
}) {
  return (
    <section className="rounded-card border border-border bg-card p-4">
      <SectionHeader
        title={title}
        description={description}
        actions={
          <Link
            href={href}
            className="inline-flex items-center gap-1 rounded-sm text-[0.8125rem] font-medium text-brand-text transition-colors duration-150 ease-out hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none motion-reduce:transition-none"
          >
            {linkLabel}
            <ArrowRight aria-hidden="true" className="size-3.5" />
          </Link>
        }
      />
      <div className="mt-3">
        {isEmpty ? (
          <p className="rounded-md border border-dashed border-border px-3 py-6 text-center text-[0.8125rem] text-muted-foreground">
            {emptyLabel}
          </p>
        ) : (
          children
        )}
      </div>
    </section>
  );
}

interface MovementProps {
  movements: StockMovement[];
  materials: Material[];
}

export function RecentMovements({ movements, materials }: MovementProps) {
  return (
    <SectionShell
      title="Recent stock movements"
      description="Latest inventory transactions across all warehouses."
      href="/stock-movements"
      linkLabel="All movements"
      isEmpty={movements.length === 0}
      emptyLabel="No movements recorded yet."
    >
      <ul className="divide-y divide-border">
        {movements.map((movement) => {
          const material = materials.find((item) => item.id === movement.materialId);
          return (
            <li
              key={movement.id}
              className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {material?.name ?? "Material"}
                </p>
                <p className="truncate font-mono text-[0.6875rem] text-muted-foreground">
                  {movement.reference}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm tabular-nums">
                  {formatQuantity(
                    movement.quantity,
                    material?.unit ?? "piece",
                  )}
                </p>
                <p className="text-[0.6875rem] text-muted-foreground">
                  {formatDate(movement.createdAt)}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </SectionShell>
  );
}

interface LowStockProps {
  items: Array<{ material: Material; quantity: number }>;
}

export function LowStockAlerts({ items }: LowStockProps) {
  return (
    <SectionShell
      title="Low-stock alerts"
      description="Materials at or below their reorder point."
      href="/materials"
      linkLabel="Review materials"
      isEmpty={items.length === 0}
      emptyLabel="Every material is above its reorder point."
    >
      <ul className="divide-y divide-border">
        {items.map(({ material, quantity }) => (
          <li
            key={material.id}
            className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{material.name}</p>
              <p className="font-mono text-[0.6875rem] text-muted-foreground">
                {material.sku}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm tabular-nums">
                {formatQuantity(quantity, material.unit)}
              </p>
              <p className="text-[0.6875rem] text-muted-foreground">
                Reorder at {material.reorderPoint}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}

interface RequestProps {
  requests: MaterialRequest[];
  projects: ConstructionProject[];
}

export function OpenRequests({ requests, projects }: RequestProps) {
  return (
    <SectionShell
      title="Open material requests"
      description="Work waiting on approval or warehouse release."
      href="/material-requests"
      linkLabel="All requests"
      isEmpty={requests.length === 0}
      emptyLabel="No requests are waiting."
    >
      <ul className="divide-y divide-border">
        {requests.slice(0, 6).map((request) => {
          const project = projects.find((item) => item.id === request.projectId);
          return (
            <li
              key={request.id}
              className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {project?.name ?? "Project"}
                </p>
                <p className="font-mono text-[0.6875rem] text-muted-foreground">
                  {request.reference} · {request.items.length} line
                  {request.items.length === 1 ? "" : "s"}
                </p>
              </div>
              <StatusBadge status={request.status} />
            </li>
          );
        })}
      </ul>
    </SectionShell>
  );
}

export function ActiveProjects({ projects }: { projects: ConstructionProject[] }) {
  return (
    <SectionShell
      title="Active projects"
      description="Sites currently drawing from inventory."
      href="/projects"
      linkLabel="All projects"
      isEmpty={projects.length === 0}
      emptyLabel="No projects are active."
    >
      <ul className="divide-y divide-border">
        {projects.map((project) => (
          <li key={project.id} className="py-2 first:pt-0 last:pb-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{project.name}</p>
                <p className="text-[0.6875rem] text-muted-foreground">
                  {project.location} · {project.managerName}
                </p>
              </div>
              <p className="shrink-0 text-sm tabular-nums">
                {formatCentavos(project.budgetCentavos)}
              </p>
            </div>
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-brand"
                style={{
                  width: `${Math.min(100, Math.max(4, budgetUsedPercent(project)))}%`,
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}

function budgetUsedPercent(project: ConstructionProject): number {
  // Until consumption records exist for a project, show elapsed schedule time
  // rather than inventing a spend percentage.
  const start = Date.parse(project.startDate);
  const end = Date.parse(project.targetEndDate);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 0;
  const elapsed = Date.now() - start;
  return (elapsed / (end - start)) * 100;
}

export function RecentActivity({ logs }: { logs: ActivityLog[] }) {
  return (
    <SectionShell
      title="Recent activity"
      description="Audit trail of domain operations."
      href="/activity-logs"
      linkLabel="Full log"
      isEmpty={logs.length === 0}
      emptyLabel="No activity recorded yet."
    >
      <ul className="flex flex-col gap-2.5">
        {logs.map((log) => (
          <li key={log.id} className="flex gap-2.5">
            <span
              aria-hidden="true"
              className="mt-1.5 size-1.5 shrink-0 rounded-full bg-border"
            />
            <div className="min-w-0">
              <p className="text-sm leading-5">{log.action}</p>
              <p className="truncate text-[0.6875rem] text-muted-foreground">
                {log.performedBy} · {formatDateTime(log.createdAt)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}

interface MaintenanceProps {
  records: MaintenanceRecord[];
  equipment: Equipment[];
}

export function UpcomingMaintenance({ records, equipment }: MaintenanceProps) {
  return (
    <SectionShell
      title="Open maintenance"
      description="Equipment work that has not been completed."
      href="/equipment"
      linkLabel="Equipment register"
      isEmpty={records.length === 0}
      emptyLabel="No maintenance is outstanding."
    >
      <ul className="divide-y divide-border">
        {records.map((record) => {
          const asset = equipment.find((item) => item.id === record.equipmentId);
          return (
            <li key={record.id} className="py-2 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {asset?.name ?? "Equipment"}
                  </p>
                  <p className="truncate text-[0.6875rem] text-muted-foreground">
                    {record.description}
                  </p>
                </div>
                <p className="shrink-0 text-[0.6875rem] text-muted-foreground">
                  {formatDate(record.startedAt)}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </SectionShell>
  );
}
