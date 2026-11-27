"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import type { DateRange } from "react-day-picker";
import { Activity, ArrowUpRight, Boxes, Clock3 } from "lucide-react";

import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { DateRangeFilter } from "@/components/shared/date-range-filter";
import { FilterDropdown } from "@/components/shared/filter-dropdown";
import { LoadingState } from "@/components/shared/loading-state";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { StatCard } from "@/components/shared/stat-card";
import type { ActivityLog } from "@/types/domain";
import { formatDateTime, formatNumber } from "@/lib/format";
import {
  activityActions,
  activityModuleLabel,
  activityReference,
  activityRoute,
  filterByDateRange,
} from "@/stores/selectors";
import { useDomainStore } from "@/stores/domain-store";

const PAGE_SIZE = 20;
const subscribeToMount = () => () => {};

interface ActivityRow {
  log: ActivityLog;
  reference: string;
  module: string;
  route: string;
}

export function ActivityLogsContent() {
  const state = useDomainStore();
  const mounted = useSyncExternalStore(
    subscribeToMount,
    () => true,
    () => false,
  );

  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState<string[]>([]);
  const [actionFilter, setActionFilter] = useState<string[]>([]);
  const [range, setRange] = useState<DateRange | undefined>(undefined);
  const [page, setPage] = useState(1);

  const modules = useMemo(
    () => [...new Set(state.activityLogs.map((log) => log.entityType))].sort(),
    [state.activityLogs],
  );
  const actions = useMemo(() => activityActions(state), [state]);

  const filtered = useMemo<ActivityRow[]>(() => {
    const term = search.trim().toLowerCase();
    const dated = filterByDateRange(state.activityLogs, (log) => log.createdAt, range);

    return dated
      .filter((log) => {
        const reference = activityReference(state, log);
        if (moduleFilter.length > 0 && !moduleFilter.includes(log.entityType)) return false;
        if (actionFilter.length > 0 && !actionFilter.includes(log.action)) return false;
        if (
          term &&
          !`${log.action} ${log.description} ${reference} ${log.performedBy}`
            .toLowerCase()
            .includes(term)
        ) {
          return false;
        }
        return true;
      })
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .map((log) => ({
        log,
        reference: activityReference(state, log),
        module: activityModuleLabel(log.entityType),
        route: activityRoute(log),
      }));
  }, [state, search, moduleFilter, actionFilter, range]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const todayIso = mounted ? new Date().toISOString().slice(0, 10) : "";

  const summary = useMemo(() => {
    return {
      total: state.activityLogs.length,
      today: todayIso
        ? state.activityLogs.filter((log) => log.createdAt.startsWith(todayIso)).length
        : 0,
      modules: modules.length,
      latest: [...state.activityLogs]
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0]?.createdAt,
    };
  }, [state.activityLogs, modules, todayIso]);

  const columns: DataTableColumn<ActivityRow>[] = [
    {
      id: "createdAt",
      header: "When",
      sortValue: (row) => row.log.createdAt,
      cell: (row) => (
        <span className="text-[0.8125rem] tabular-nums text-muted-foreground">
          {formatDateTime(row.log.createdAt)}
        </span>
      ),
    },
    {
      id: "action",
      header: "Action",
      sortValue: (row) => row.log.action,
      cell: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.log.action}</p>
          <p className="truncate text-[0.6875rem] text-muted-foreground">
            {row.log.description}
          </p>
        </div>
      ),
    },
    {
      id: "module",
      header: "Module",
      sortValue: (row) => row.module,
      cell: (row) => <span className="text-muted-foreground">{row.module}</span>,
    },
    {
      id: "reference",
      header: "Reference",
      cell: (row) => <span className="font-mono text-xs">{row.reference}</span>,
    },
    {
      id: "user",
      header: "User",
      cell: (row) => (
        <span className="text-muted-foreground">{row.log.performedBy}</span>
      ),
    },
    {
      id: "link",
      header: "",
      align: "right",
      cell: (row) => (
        <Link
          href={row.route}
          className="inline-flex items-center gap-1 rounded-sm text-[0.8125rem] font-medium text-brand-text hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          aria-label={`Open ${row.module}`}
        >
          Open
          <ArrowUpRight aria-hidden="true" className="size-3.5" />
        </Link>
      ),
    },
  ];

  const header = (
    <PageHeader
      title="Activity logs"
      description="Audit trail of domain operations. Entries are generated by the domain actions themselves, not typed in."
    />
  );

  if (!mounted) {
    return (
      <PageContainer>
        {header}
        <div className="mt-6">
          <LoadingState rows={10} />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {header}

      <p className="mt-2 text-[0.8125rem] text-muted-foreground">
        These logs are stored in this browser.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Recorded events" value={formatNumber(summary.total)} hint="All time" icon={Activity} />
        <StatCard label="Today" value={formatNumber(summary.today)} hint="Since midnight" icon={Clock3} />
        <StatCard label="Modules covered" value={formatNumber(summary.modules)} hint="Distinct entity types" icon={Boxes} />
        <StatCard
          label="Latest event"
          value={
            summary.latest ? formatDateTime(summary.latest).split(",")[1]?.trim() ?? "—" : "—"
          }
          hint={summary.latest ? formatDateTime(summary.latest).split(",")[0] : "No activity yet"}
        />
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <SearchInput
              value={search}
              onValueChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              label="Search activity"
              placeholder="Search action, description, or reference"
            />
            <FilterDropdown
              label="Module"
              selected={moduleFilter}
              onChange={(selected) => {
                setModuleFilter(selected);
                setPage(1);
              }}
              options={modules.map((module) => ({
                value: module,
                label: activityModuleLabel(module),
              }))}
            />
            <FilterDropdown
              label="Action"
              selected={actionFilter}
              onChange={(selected) => {
                setActionFilter(selected);
                setPage(1);
              }}
              options={actions.map((action) => ({ value: action, label: action }))}
            />
            <DateRangeFilter
              value={range}
              onValueChange={(value) => {
                setRange(value);
                setPage(1);
              }}
              label="Activity period"
            />
          </div>
          <DataTablePagination
            page={currentPage}
            pageSize={PAGE_SIZE}
            total={filtered.length}
            onPageChange={setPage}
            className="sm:justify-end"
          />
        </div>

        <DataTable
          columns={columns}
          data={visible}
          getRowId={(row) => row.log.id}
          emptyTitle="No activity matches"
          emptyDescription="Adjust the filters or period; only operations recorded by the app appear here."
        />
      </div>
    </PageContainer>
  );
}
