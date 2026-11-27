"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";

export interface DataTableColumn<TData> {
  id: string;
  header: string;
  cell: (row: TData) => ReactNode;
  align?: "left" | "right";
  className?: string;
  sortValue?: (row: TData) => string | number;
}

interface DataTableProps<TData> {
  columns: DataTableColumn<TData>[];
  data: TData[];
  getRowId: (row: TData) => string;
  emptyTitle?: string;
  emptyDescription?: string;
  caption?: string;
  footer?: ReactNode;
}

type SortDirection = "asc" | "desc";

export function DataTable<TData>({
  columns,
  data,
  getRowId,
  emptyTitle = "No records",
  emptyDescription,
  caption,
  footer,
}: DataTableProps<TData>) {
  const [sort, setSort] = useState<{ id: string; direction: SortDirection } | null>(
    null,
  );

  const rows = useMemo(() => {
    if (!sort) return data;
    const column = columns.find((candidate) => candidate.id === sort.id);
    if (!column?.sortValue) return data;

    const { sortValue } = column;
    return [...data].sort((a, b) => {
      const left = sortValue(a);
      const right = sortValue(b);
      const result =
        typeof left === "number" && typeof right === "number"
          ? left - right
          : String(left).localeCompare(String(right), "en-PH");
      return sort.direction === "asc" ? result : -result;
    });
  }, [columns, data, sort]);

  if (data.length === 0) {
    return (
      <EmptyState title={emptyTitle} description={emptyDescription} />
    );
  }

  return (
    <div className="overflow-x-auto rounded-card border border-border">
      <table className="w-full min-w-[36rem] border-collapse text-sm">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr className="border-b border-border bg-secondary/60">
            {columns.map((column) => {
              const sortable = Boolean(column.sortValue);
              const active = sort?.id === column.id;
              return (
                <th
                  key={column.id}
                  scope="col"
                  aria-sort={
                    active
                      ? sort?.direction === "asc"
                        ? "ascending"
                        : "descending"
                      : sortable
                        ? "none"
                        : undefined
                  }
                  className={cn(
                    "px-3 py-2 text-xs leading-4 font-semibold text-muted-foreground",
                    column.align === "right" ? "text-right" : "text-left",
                    column.className,
                  )}
                >
                  {sortable ? (
                    <button
                      type="button"
                      onClick={() =>
                        setSort((current) =>
                          current?.id === column.id
                            ? {
                                id: column.id,
                                direction:
                                  current.direction === "asc" ? "desc" : "asc",
                              }
                            : { id: column.id, direction: "asc" },
                        )
                      }
                      className={cn(
                        "inline-flex items-center gap-1 rounded-sm transition-colors duration-150 ease-out hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none motion-reduce:transition-none",
                        active && "text-foreground",
                      )}
                    >
                      {column.header}
                      {active ? (
                        sort?.direction === "asc" ? (
                          <ArrowUp aria-hidden="true" className="size-3" />
                        ) : (
                          <ArrowDown aria-hidden="true" className="size-3" />
                        )
                      ) : (
                        <ChevronsUpDown
                          aria-hidden="true"
                          className="size-3 text-border"
                        />
                      )}
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={getRowId(row)}
              className="border-b border-border last:border-b-0 transition-colors duration-150 ease-out hover:bg-secondary/40 motion-reduce:transition-none"
            >
              {columns.map((column) => (
                <td
                  key={column.id}
                  className={cn(
                    "px-3 py-2 align-middle",
                    column.align === "right" && "text-right tabular-nums",
                    column.className,
                  )}
                >
                  {column.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {footer}
    </div>
  );
}
