"use client";

import { useMemo } from "react";
import { DataTable, type Column } from "@/components/tables/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { useStoreEffect } from "@/hooks/useStoreEffect";
import { useJobsBox, useWorkersBox } from "@/store/selectors";
import { useAppActions } from "@/store/useAppStore";
import type { WorkerJob, WorkerNode } from "@/types/models";

export default function WorkersPage() {
  const actions = useAppActions();
  const workersBox = useWorkersBox();
  const jobsBox = useJobsBox();

  useStoreEffect(() => {
    void Promise.all([actions.loadWorkers(), actions.loadJobs()]);
  }, [actions]);

  const workers = workersBox.data ?? [];
  const jobs = jobsBox.data ?? [];

  const workerColumns: Column<WorkerNode>[] = useMemo(
    () => [
      {
        key: "host",
        header: "Worker",
        width: "34%",
        cell: (w) => (
          <div>
            <div className="font-medium">{w.hostname}</div>
            <div className="mt-1 font-mono text-xs text-[color:var(--muted)]">{w.id}</div>
          </div>
        ),
      },
      {
        key: "online",
        header: "Online",
        width: "12%",
        cell: (w) => <Badge tone={w.online ? "good" : "bad"}>{w.online ? "yes" : "no"}</Badge>,
      },
      {
        key: "cpu",
        header: "CPU load",
        width: "14%",
        cell: (w) => <span className="text-sm">{(w.cpuLoad * 100).toFixed(0)}%</span>,
      },
      {
        key: "jobs",
        header: "Active jobs",
        width: "14%",
        cell: (w) => <span className="text-sm">{w.activeJobs}</span>,
      },
      {
        key: "ver",
        header: "Version",
        width: "26%",
        cell: (w) => <span className="font-mono text-xs">{w.version}</span>,
      },
    ],
    [],
  );

  const jobColumns: Column<WorkerJob>[] = useMemo(
    () => [
      {
        key: "id",
        header: "Job",
        width: "22%",
        cell: (j) => <div className="font-mono text-xs">{j.id}</div>,
      },
      {
        key: "type",
        header: "Type",
        width: "12%",
        cell: (j) => <Badge tone="neutral">{j.type}</Badge>,
      },
      {
        key: "status",
        header: "Status",
        width: "14%",
        cell: (j) => (
          <Badge tone={j.status === "failed" ? "bad" : j.status === "running" ? "good" : "neutral"}>{j.status}</Badge>
        ),
      },
      {
        key: "worker",
        header: "Worker",
        width: "18%",
        cell: (j) => <span className="font-mono text-xs">{j.workerId}</span>,
      },
      {
        key: "room",
        header: "Room",
        width: "18%",
        cell: (j) => <span className="font-mono text-xs">{j.room ?? "—"}</span>,
      },
      {
        key: "times",
        header: "Timeline",
        width: "16%",
        cell: (j) => (
          <div className="text-[11px] text-[color:var(--muted)]">
            <div>start: {new Date(j.startedAt).toLocaleString()}</div>
            {j.endedAt && <div className="mt-1">end: {new Date(j.endedAt).toLocaleString()}</div>}
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workers & jobs"
        description="AgentServer fleet health, CPU load averages, active jobs, and historical job execution (room vs publisher jobs)."
        right={
          <Button variant="secondary" onClick={() => void Promise.all([actions.loadWorkers(), actions.loadJobs()])}>
            Refresh
          </Button>
        }
      />

      <Card title="Workers" subtitle="Mirrors `livekit-agents` worker registration + load reporting concepts">
        <DataTable
          rows={workers}
          columns={workerColumns}
          isLoading={workersBox.loadState === "loading"}
          emptyTitle="No workers"
          filterPlaceholder="Search hostname…"
          getRowId={(r) => r.id}
          filterFn={(r, q) => `${r.hostname} ${r.id}`.toLowerCase().includes(q)}
        />
      </Card>

      <Card title="Jobs" subtitle="Includes assignment, execution, and teardown phases (mock)">
        <DataTable
          rows={jobs}
          columns={jobColumns}
          isLoading={jobsBox.loadState === "loading"}
          emptyTitle="No jobs"
          filterPlaceholder="Search job id, worker, room…"
          getRowId={(r) => r.id}
          filterFn={(r, q) => `${r.id} ${r.workerId} ${r.room ?? ""} ${r.status}`.toLowerCase().includes(q)}
        />
      </Card>

      <Card title="CLI & execution tracking" subtitle="Maps to `livekit-agents` CLI / worker entrypoints in your deployment">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-[10px] border border-[color:var(--border)] bg-white/[0.02] p-3 text-sm text-[color:var(--muted)]">
            <div className="font-semibold text-[color:var(--text)]">Local dev</div>
            <div className="mt-2">
              Operators typically run agents via the Python CLI while this console observes jobs and sessions through the control plane API.
            </div>
          </div>
          <div className="rounded-[10px] border border-[color:var(--border)] bg-white/[0.02] p-3 text-sm text-[color:var(--muted)]">
            <div className="font-semibold text-[color:var(--text)]">Production</div>
            <div className="mt-2">
              Wire `adminApi.listJobs` to your scheduler/queue audit log so this table reflects true execution history (attempts, retries, exit codes).
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
