"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/utils/cn";

export type Column<T> = {
  key: string;
  header: string;
  width?: string;
  cell: (row: T) => ReactNode;
};

export function DataTable<T>({
  rows,
  columns,
  isLoading,
  emptyTitle,
  filterPlaceholder,
  getRowId,
  filterFn,
}: {
  rows: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  emptyTitle: string;
  filterPlaceholder?: string;
  getRowId: (row: T) => string;
  filterFn?: (row: T, q: string) => boolean;
}) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 8;

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query || !filterFn) return rows;
    return rows.filter((r) => filterFn(r, query));
  }, [rows, q, filterFn]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = filtered.slice(safePage * pageSize, safePage * pageSize + pageSize);

  return (
    <div className="space-y-3">
      {filterPlaceholder && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(0);
            }}
            placeholder={filterPlaceholder}
            className="min-w-0"
          />
          <div className="shrink-0 text-xs text-[color:var(--muted)]">
            {filtered.length} row{filtered.length === 1 ? "" : "s"}
          </div>
        </div>
      )}

      {/* Mobile: stacked cards */}
      <div className="space-y-3 md:hidden">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2 rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-white/[0.02] p-3">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
              </div>
            ))}
          </div>
        ) : pageRows.length === 0 ? (
          <div className="rounded-[var(--radius-lg)] border border-dashed border-[color:var(--border)] bg-white/[0.02] px-4 py-10 text-center text-sm text-[color:var(--muted)]">
            {emptyTitle}
          </div>
        ) : (
          pageRows.map((row) => (
            <div
              key={getRowId(row)}
              className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-white/[0.02] p-3 shadow-sm"
            >
              <div className="space-y-3">
                {columns.map((c) => (
                  <div key={c.key} className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                    <div className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-[color:var(--muted)]">
                      {c.header || c.key}
                    </div>
                    <div className="min-w-0 flex-1 text-sm sm:text-right">{c.cell(row)}</div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop: horizontal scroll table */}
      <div className="hidden md:block">
        <div className="-mx-1 max-w-full overflow-x-auto overscroll-x-contain px-1 [scrollbar-gutter:stable]">
          <table className="w-full min-w-[640px] border-collapse text-sm lg:min-w-[720px]">
            <thead className="bg-white/[0.03] text-left text-xs text-[color:var(--muted)]">
              <tr>
                {columns.map((c) => (
                  <th key={c.key} className={cn("whitespace-nowrap px-3 py-2 font-medium", c.width)} style={{ width: c.width }}>
                    {c.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="px-3 py-6">
                    <div className="space-y-2">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-9 w-full" />
                      ))}
                    </div>
                  </td>
                </tr>
              ) : pageRows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-3 py-10 text-center text-sm text-[color:var(--muted)]">
                    {emptyTitle}
                  </td>
                </tr>
              ) : (
                pageRows.map((row) => (
                  <tr key={getRowId(row)} className="border-t border-[color:var(--border)] hover:bg-white/[0.02]">
                    {columns.map((c) => (
                      <td key={c.key} className="max-w-[min(28rem,40vw)] px-3 py-3 align-top text-[color:var(--text)]">
                        <div className="min-w-0 break-words">{c.cell(row)}</div>
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-[color:var(--muted)]">
          Page {safePage + 1} / {pageCount}
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="min-h-11 min-w-11 sm:min-h-9 sm:min-w-9"
            disabled={safePage <= 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="min-h-11 min-w-11 sm:min-h-9 sm:min-w-9"
            disabled={safePage >= pageCount - 1}
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
