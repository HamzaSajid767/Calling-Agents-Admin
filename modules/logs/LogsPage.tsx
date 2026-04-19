"use client";

import { useMemo, useState } from "react";
import { DataTable, type Column } from "@/components/tables/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Select } from "@/components/ui/Select";
import { useStoreEffect } from "@/hooks/useStoreEffect";
import { useSystemLogsBox } from "@/store/selectors";
import { useAppActions } from "@/store/useAppStore";
import type { LogSeverity, SystemLogLine } from "@/types/models";

function sevTone(s: LogSeverity) {
  if (s === "error") return "bad" as const;
  if (s === "warn") return "warn" as const;
  if (s === "info") return "info" as const;
  return "neutral" as const;
}

export default function LogsPage() {
  const box = useSystemLogsBox();
  const actions = useAppActions();
  const [sev, setSev] = useState<"all" | LogSeverity>("all");

  useStoreEffect(() => {
    void actions.loadSystemLogs();
  }, [actions]);

  const rows = useMemo(() => {
    const all = box.data ?? [];
    if (sev === "all") return all;
    return all.filter((l) => l.severity === sev);
  }, [box.data, sev]);

  const columns: Column<SystemLogLine>[] = useMemo(
    () => [
      {
        key: "t",
        header: "Time",
        width: "18%",
        cell: (l) => <div className="text-xs text-[color:var(--muted)]">{new Date(l.at).toLocaleString()}</div>,
      },
      {
        key: "sev",
        header: "Severity",
        width: "12%",
        cell: (l) => <Badge tone={sevTone(l.severity)}>{l.severity}</Badge>,
      },
      {
        key: "src",
        header: "Source",
        width: "14%",
        cell: (l) => <span className="font-mono text-xs">{l.source}</span>,
      },
      {
        key: "msg",
        header: "Message",
        width: "56%",
        cell: (l) => (
          <div className="rounded-md bg-black/20 px-2 py-1.5 font-mono text-xs leading-relaxed text-[color:var(--text)]">
            {l.message}
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="System logs"
        description="Structured operational events: severity, subsystem source, and message payloads suitable for log shipping."
        right={
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={sev}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "all" || v === "error" || v === "warn" || v === "info" || v === "debug") setSev(v);
              }}
            >
              <option value="all">All severities</option>
              <option value="error">error</option>
              <option value="warn">warn</option>
              <option value="info">info</option>
              <option value="debug">debug</option>
            </Select>
            <Button variant="secondary" onClick={() => void actions.loadSystemLogs()}>
              Refresh
            </Button>
          </div>
        }
      />

      {box.error && (
        <div className="rounded-[var(--radius-lg)] border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {box.error}
        </div>
      )}

      <Card title="Event stream" subtitle="Feed from the global store — wire the service layer to your log backend">
        <DataTable
          rows={rows}
          columns={columns}
          isLoading={box.loadState === "loading"}
          emptyTitle="No logs"
          filterPlaceholder="Search message, source…"
          getRowId={(r) => r.id}
          filterFn={(r, q) => `${r.message} ${r.source}`.toLowerCase().includes(q)}
        />
      </Card>
    </div>
  );
}
