"use client";

import { useMemo, useState } from "react";
import { DataTable, type Column } from "@/components/tables/DataTable";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { useStoreEffect } from "@/hooks/useStoreEffect";
import { useOtelBox, usePromBox, useTracesBox } from "@/store/selectors";
import { useAppActions } from "@/store/useAppStore";
import type { OtelLogLine, PrometheusSample, TraceSpan } from "@/types/models";

type Tab = "otel" | "traces" | "prom";

export default function TelemetryPage() {
  const actions = useAppActions();
  const otelBox = useOtelBox();
  const tracesBox = useTracesBox();
  const promBox = usePromBox();
  const [tab, setTab] = useState<Tab>("otel");

  useStoreEffect(() => {
    void actions.loadTelemetry();
  }, [actions]);

  const otelColumns: Column<OtelLogLine>[] = useMemo(
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
        cell: (l) => <span className="text-xs uppercase">{l.severity}</span>,
      },
      {
        key: "scope",
        header: "Scope",
        width: "18%",
        cell: (l) => <span className="font-mono text-xs">{l.scope}</span>,
      },
      {
        key: "msg",
        header: "Message",
        width: "52%",
        cell: (l) => <div className="text-sm">{l.message}</div>,
      },
    ],
    [],
  );

  const traceColumns: Column<TraceSpan>[] = useMemo(
    () => [
      { key: "name", header: "Span", width: "34%", cell: (s) => <div className="font-medium">{s.name}</div> },
      { key: "status", header: "Status", width: "12%", cell: (s) => <span className="text-xs">{s.status}</span> },
      {
        key: "times",
        header: "Window",
        width: "54%",
        cell: (s) => (
          <div className="text-xs text-[color:var(--muted)]">
            {new Date(s.start).toISOString()} → {new Date(s.end).toISOString()}
          </div>
        ),
      },
    ],
    [],
  );

  const promColumns: Column<PrometheusSample>[] = useMemo(
    () => [
      { key: "name", header: "Metric", width: "40%", cell: (m) => <div className="font-mono text-xs">{m.name}</div> },
      { key: "help", header: "Help", width: "44%", cell: (m) => <div className="text-xs text-[color:var(--muted)]">{m.help}</div> },
      { key: "v", header: "Value", width: "16%", cell: (m) => <div className="text-sm font-semibold">{m.value}</div> },
    ],
    [],
  );

  const loading = otelBox.loadState === "loading" || tracesBox.loadState === "loading" || promBox.loadState === "loading";
  const telemetryError = otelBox.error ?? tracesBox.error ?? promBox.error;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Telemetry & observability"
        description="OpenTelemetry logs, distributed traces, and Prometheus-style samples exported by the agent runtime."
        right={<Button variant="secondary" onClick={() => void actions.loadTelemetry()}>Refresh</Button>}
      />

      {telemetryError && (
        <div className="rounded-[var(--radius-lg)] border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {telemetryError}
        </div>
      )}

      <Card
        title="Signals"
        subtitle="Single store action loads all three planes (batched network in `adminApi`)"
        right={
          <div className="flex max-w-full flex-wrap gap-2">
            <Button size="sm" variant={tab === "otel" ? "primary" : "secondary"} onClick={() => setTab("otel")}>
              OTel logs
            </Button>
            <Button size="sm" variant={tab === "traces" ? "primary" : "secondary"} onClick={() => setTab("traces")}>
              Traces
            </Button>
            <Button size="sm" variant={tab === "prom" ? "primary" : "secondary"} onClick={() => setTab("prom")}>
              Prometheus
            </Button>
          </div>
        }
      >
        {tab === "otel" && (
          <DataTable
            rows={otelBox.data ?? []}
            columns={otelColumns}
            isLoading={loading}
            emptyTitle="No OTel logs"
            filterPlaceholder="Search message, scope…"
            getRowId={(r) => r.id}
            filterFn={(r, q) => `${r.message} ${r.scope}`.toLowerCase().includes(q)}
          />
        )}
        {tab === "traces" && (
          <DataTable
            rows={tracesBox.data ?? []}
            columns={traceColumns}
            isLoading={loading}
            emptyTitle="No traces"
            getRowId={(r) => r.id}
          />
        )}
        {tab === "prom" && (
          <DataTable
            rows={promBox.data ?? []}
            columns={promColumns}
            isLoading={loading}
            emptyTitle="No samples"
            filterPlaceholder="Search metric name…"
            getRowId={(r) => `${r.name}:${r.value}`}
            filterFn={(r, q) => `${r.name} ${r.help}`.toLowerCase().includes(q)}
          />
        )}
      </Card>
    </div>
  );
}
