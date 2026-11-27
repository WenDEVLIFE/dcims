"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { Building2, FolderPlus, HardHat, Wallet } from "lucide-react";
import { toast } from "sonner";

import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { FilterDropdown } from "@/components/shared/filter-dropdown";
import { LoadingState } from "@/components/shared/loading-state";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ProjectFormDialog } from "@/features/projects/project-form-dialog";
import type { ProjectInputValues } from "@/schemas/domain";
import type { ConstructionProject } from "@/types/domain";
import { formatCentavos } from "@/lib/currency";
import { formatDate, formatNumber } from "@/lib/format";
import { useDomainStore } from "@/stores/domain-store";
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_OPTIONS } from "@/lib/status-labels";
import { projectOverview } from "@/stores/selectors";


const subscribeToMount = () => () => {};

export function ProjectsContent() {
  const state = useDomainStore();
  const mounted = useSyncExternalStore(
    subscribeToMount,
    () => true,
    () => false,
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [view, setView] = useState<"cards" | "table">("cards");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ConstructionProject | null>(null);

  const overview = useMemo(() => projectOverview(state), [state]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return overview.filter(({ project }) => {
      if (term && !`${project.name} ${project.code} ${project.client}`.toLowerCase().includes(term)) {
        return false;
      }
      if (statusFilter.length > 0 && !statusFilter.includes(project.status)) return false;
      return true;
    });
  }, [overview, search, statusFilter]);

  const summary = useMemo(() => {
    const active = overview.filter((entry) => entry.project.status === "active").length;
    const budget = overview.reduce(
      (total, entry) => total + entry.project.budgetCentavos,
      0,
    );
    // Reuses the rows already derived once; previously this called
    // projectOverview() again for every project, which is quadratic.
    const expense = overview.reduce(
      (total, entry) => total + entry.expenseCentavos,
      0,
    );
    return { active, budget, expense };
  }, [overview]);

  function submitProject(values: ProjectInputValues) {
    const result = editing
      ? state.updateProject(editing.id, values)
      : state.createProject(values);
    if (!result.ok) return { ok: false as const, error: result.error };
    toast.success(editing ? "Project updated" : "Project created");
    return { ok: true as const };
  }

  const columns: DataTableColumn<(typeof overview)[number]>[] = [
    {
      id: "name",
      header: "Project",
      sortValue: (row) => row.project.name,
      cell: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.project.name}</p>
          <p className="font-mono text-[0.6875rem] text-muted-foreground">{row.project.code}</p>
        </div>
      ),
    },
    {
      id: "location",
      header: "Location",
      sortValue: (row) => row.project.location,
      cell: (row) => <span className="text-muted-foreground">{row.project.location}</span>,
    },
    {
      id: "manager",
      header: "Manager",
      cell: (row) => <span className="text-muted-foreground">{row.project.managerName}</span>,
    },
    {
      id: "progress",
      header: "Progress",
      align: "right",
      sortValue: (row) => row.project.progress,
      cell: (row) => <span className="tabular-nums">{row.project.progress}%</span>,
    },
    {
      id: "expense",
      header: "Material spend",
      align: "right",
      sortValue: (row) => row.expenseCentavos,
      cell: (row) => <span className="tabular-nums">{formatCentavos(row.expenseCentavos)}</span>,
    },
    {
      id: "status",
      header: "Status",
      sortValue: (row) => row.project.status,
      cell: (row) => <StatusBadge status={PROJECT_STATUS_LABELS[row.project.status]} />,
    },
  ];

  const header = (
    <PageHeader
      title="Projects"
      description="Construction sites, their material budgets, and consumption across Davao City."
      actions={
        <Button
          type="button"
          size="sm"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <FolderPlus aria-hidden="true" />
          New project
        </Button>
      }
    />
  );

  if (!mounted) {
    return (
      <PageContainer>
        {header}
        <div className="mt-6">
          <LoadingState rows={6} />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {header}

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Projects" value={formatNumber(state.projects.length)} hint="All statuses" icon={Building2} />
        <StatCard label="Active sites" value={formatNumber(summary.active)} hint="Currently consuming materials" icon={HardHat} />
        <StatCard label="Total material budget" value={formatCentavos(summary.budget)} hint="Across all projects" icon={Wallet} />
        <StatCard label="Recorded spend" value={formatCentavos(summary.expense)} hint="From consumption records" />
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <SearchInput
            value={search}
            onValueChange={setSearch}
            label="Search projects"
            placeholder="Search name, code, or client"
          />
          <FilterDropdown
            label="Status"
            selected={statusFilter}
            onChange={setStatusFilter}
            options={PROJECT_STATUS_OPTIONS}
          />
        </div>
        <div className="flex items-center gap-1 rounded-md border border-border p-0.5">
          {(["cards", "table"] as const).map((mode) => (
            <Button
              key={mode}
              type="button"
              size="sm"
              variant={view === mode ? "secondary" : "ghost"}
              onClick={() => setView(mode)}
            >
              {mode === "cards" ? "Cards" : "Table"}
            </Button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-6 rounded-card border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
          No projects match the current filters.
        </p>
      ) : view === "cards" ? (
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map(({ project, allocationCount, expenseCentavos, budget, openRequests }) => (
            <Card key={project.id} className="gap-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    href={`/projects/${project.id}`}
                    className="truncate text-sm font-semibold hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    {project.name}
                  </Link>
                  <p className="font-mono text-[0.6875rem] text-muted-foreground">{project.code}</p>
                </div>
                <StatusBadge status={PROJECT_STATUS_LABELS[project.status]} />
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{project.location}</span>
                <span>{project.managerName}</span>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="tabular-nums">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-1.5" />
              </div>

              <dl className="grid grid-cols-2 gap-2 border-t border-border pt-2 text-xs">
                <div>
                  <dt className="text-muted-foreground">Material spend</dt>
                  <dd className="tabular-nums">{formatCentavos(expenseCentavos)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Remaining</dt>
                  <dd className="tabular-nums">{formatCentavos(budget?.remainingCentavos ?? 0)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Allocations</dt>
                  <dd className="tabular-nums">{allocationCount}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Open requests</dt>
                  <dd className="tabular-nums">{openRequests}</dd>
                </div>
              </dl>

              <p className="text-[0.6875rem] text-muted-foreground">
                {formatDate(project.startDate)} → {formatDate(project.targetEndDate)}
              </p>

              <div className="flex gap-2">
                <Button asChild size="sm" variant="outline" className="flex-1">
                  <Link href={`/projects/${project.id}`}>Open</Link>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditing(project);
                    setFormOpen(true);
                  }}
                >
                  Edit
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="mt-4">
          <DataTable
            columns={columns}
            data={filtered}
            getRowId={(row) => row.project.id}
            emptyTitle="No projects match"
          />
        </div>
      )}

      <ProjectFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        project={editing ?? undefined}
        onSubmit={submitProject}
      />
    </PageContainer>
  );
}

