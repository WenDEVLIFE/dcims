"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import type { DateRange } from "react-day-picker";
import { FileText, Printer, Download } from "lucide-react";
import { toast } from "sonner";

import { DateRangeFilter } from "@/components/shared/date-range-filter";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  REPORTS,
  formatCell,
  summarize,
  type ReportDefinition,
  type ReportFilters,
  type ReportGroup,
} from "@/features/reports/report-definitions";
import { buildCsv, downloadCsv } from "@/lib/csv";
import { formatDate } from "@/lib/format";
import { useDomainStore } from "@/stores/domain-store";

const subscribeToMount = () => () => {};
const GROUPS: ReportGroup[] = ["Inventory", "Construction", "Procurement", "Equipment"];
const ALL = "all";

export function ReportsContent() {
  const state = useDomainStore();
  const mounted = useSyncExternalStore(
    subscribeToMount,
    () => true,
    () => false,
  );

  const [reportId, setReportId] = useState(REPORTS[0].id);
  const [range, setRange] = useState<DateRange | undefined>(undefined);
  const [warehouseId, setWarehouseId] = useState<string>(ALL);
  const [projectId, setProjectId] = useState<string>(ALL);
  const [categoryId, setCategoryId] = useState<string>(ALL);

  const report: ReportDefinition =
    REPORTS.find((entry) => entry.id === reportId) ?? REPORTS[0];

  const filters: ReportFilters = useMemo(
    () => ({
      from: range?.from ? toIsoDay(range.from) : undefined,
      to: range?.to ? toIsoDay(range.to) : undefined,
      warehouseId: warehouseId === ALL ? undefined : warehouseId,
      projectId: projectId === ALL ? undefined : projectId,
      categoryId: categoryId === ALL ? undefined : categoryId,
    }),
    [range, warehouseId, projectId, categoryId],
  );

  const rows = useMemo(
    () => (mounted ? report.build(state, filters) : []),
    [mounted, report, state, filters],
  );

  const totals = useMemo(() => summarize(rows, report.columns), [rows, report]);

  function filtersSummary(): string {
    const parts: string[] = [];
    if (filters.from || filters.to) {
      parts.push(
        `Period ${filters.from ? formatDate(filters.from) : "start"} – ${
          filters.to ? formatDate(filters.to) : "today"
        }`,
      );
    }
    if (filters.warehouseId) {
      parts.push(
        `Warehouse ${state.warehouses.find((w) => w.id === filters.warehouseId)?.name ?? ""}`,
      );
    }
    if (filters.projectId) {
      parts.push(
        `Project ${state.projects.find((p) => p.id === filters.projectId)?.name ?? ""}`,
      );
    }
    if (filters.categoryId) {
      parts.push(
        `Category ${state.categories.find((c) => c.id === filters.categoryId)?.name ?? ""}`,
      );
    }
    return parts.length > 0 ? parts.join(" · ") : "No filters applied";
  }

  function exportCsv() {
    if (rows.length === 0) {
      toast.error("This report has no rows to export");
      return;
    }

    const csv = buildCsv(
      report.columns.map((column) => column.header),
      rows.map((row) =>
        report.columns.map((column) => {
          const value = row[column.key];
          if (column.format === "currency") return (Number(value) / 100).toFixed(2);
          if (column.format === "date") return String(value).slice(0, 10);
          return value ?? "";
        }),
      ),
    );

    downloadCsv(`dcims-${report.id}`, csv);
    toast.success(`Exported ${rows.length} rows`);
  }

  const header = (
    <PageHeader
      title="Reports"
      description="Inventory, construction, procurement, and equipment reporting over current application state."
      actions={
        <>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={exportCsv}
            disabled={rows.length === 0}
          >
            <Download aria-hidden="true" />
            Export CSV
          </Button>
          <Button type="button" size="sm" onClick={() => window.print()} disabled={!mounted}>
            <Printer aria-hidden="true" />
            Print
          </Button>
        </>
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

  // Computed only after mount; Next.js rejects new Date() during prerender.
  const generatedAt = new Date();

  return (
    <PageContainer>
      <div className="print-hide">{header}</div>
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[16rem_1fr]">
        <nav aria-label="Reports" className="print-hide">
          <Card className="gap-3 p-3">
            <div className="flex flex-col gap-1.5 lg:hidden">
              <label htmlFor="report-select" className="text-xs font-medium text-muted-foreground">
                Report
              </label>
              <Select value={reportId} onValueChange={setReportId}>
                <SelectTrigger id="report-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REPORTS.map((entry) => (
                    <SelectItem key={entry.id} value={entry.id}>
                      {entry.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="hidden flex-col gap-3 lg:flex">
              {GROUPS.map((group) => {
                const entries = REPORTS.filter((entry) => entry.group === group);
                if (entries.length === 0) return null;
                return (
                  <div key={group} className="flex flex-col gap-1">
                    <p className="px-1 text-[0.6875rem] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                      {group}
                    </p>
                    <ul className="flex flex-col">
                      {entries.map((entry) => (
                        <li key={entry.id}>
                          <button
                            type="button"
                            onClick={() => setReportId(entry.id)}
                            aria-current={entry.id === report.id ? "true" : undefined}
                            className={`w-full rounded-sm px-2 py-1.5 text-left text-[0.8125rem] transition-colors duration-150 ease-out motion-reduce:transition-none ${
                              entry.id === report.id
                                ? "bg-secondary font-medium text-foreground"
                                : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                            }`}
                          >
                            {entry.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </Card>
        </nav>

        <div className="flex min-w-0 flex-col gap-3">
          <div className="print-hide flex flex-wrap items-center gap-2">
            <DateRangeFilter value={range} onValueChange={setRange} label="Report period" />
            <Select value={warehouseId} onValueChange={setWarehouseId}>
              <SelectTrigger className="w-44" aria-label="Warehouse filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All warehouses</SelectItem>
                {state.warehouses.map((warehouse) => (
                  <SelectItem key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger className="w-48" aria-label="Project filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All projects</SelectItem>
                {state.projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="w-44" aria-label="Category filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All categories</SelectItem>
                {state.categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <section className="rounded-card border border-border bg-card p-4">
            <div className="mb-3 hidden print:block">
              <p className="text-xs font-semibold tracking-[0.06em] uppercase">
                {state.settings.company.name}
              </p>
              <p className="text-xs">{state.settings.company.address}</p>
              <p className="mt-1 text-xs">
                Generated {formatDate(generatedAt)} · {filtersSummary()}
              </p>
              <p className="mt-1 text-[0.6875rem]">
                Portfolio demonstration. Data is simulated and stored in this browser.
              </p>
            </div>

            <div className="flex items-start gap-2">
              <FileText aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <h2 className="text-base leading-6 font-semibold">{report.label}</h2>
                <p className="text-[0.8125rem] leading-5 text-muted-foreground">
                  {report.description}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {filtersSummary()} · {rows.length} row{rows.length === 1 ? "" : "s"}
                </p>
              </div>
            </div>

            {rows.length === 0 ? (
              <div className="mt-4">
                <EmptyState
                  title="No records for this report"
                  description="Adjust the filters or period; this report is empty for the current selection."
                />
              </div>
            ) : (
              <>
                <div className="mt-4 overflow-x-auto rounded-md border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-secondary/60">
                        {report.columns.map((column) => (
                          <th
                            key={column.key}
                            scope="col"
                            className={`px-3 py-2 text-xs font-semibold text-muted-foreground ${
                              column.align === "right" ? "text-right" : "text-left"
                            }`}
                          >
                            {column.header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, index) => (
                        <tr key={index} className="border-b border-border last:border-b-0">
                          {report.columns.map((column) => (
                            <td
                              key={column.key}
                              className={`px-3 py-2 ${
                                column.align === "right" ? "text-right tabular-nums" : ""
                              }`}
                            >
                              {formatCell(row[column.key], column.format)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totals.length > 0 && (
                  <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 border-t border-border pt-2 text-sm">
                    {totals.map((total) => (
                      <div key={total.header} className="flex items-baseline gap-2">
                        <dt className="text-xs text-muted-foreground">{total.header}</dt>
                        <dd className="font-semibold tabular-nums">{total.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </PageContainer>
  );
}

function toIsoDay(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
