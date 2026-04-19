"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { cn } from "@/utils/cn";
import { DataTable, type Column } from "@/components/tables/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Select } from "@/components/ui/Select";
import { useStoreEffect } from "@/hooks/useStoreEffect";
import { useSessionsBox } from "@/store/selectors";
import { useAppActions } from "@/store/useAppStore";
import type { AgentSessionSummary } from "@/types/models";

function statusTone(s: AgentSessionSummary["status"]) {
  if (s === "live") return "good" as const;
  if (s === "ended") return "neutral" as const;
  if (s === "error") return "bad" as const;
  return "info" as const;
}

export default function SessionsPage() {
  const box = useSessionsBox();
  const actions = useAppActions();
  const [status, setStatus] = useState<string>("all");

  useStoreEffect(() => {
    void actions.loadSessions();
  }, [actions]);

  const rows = useMemo(() => {
    const all = box.data ?? [];
    if (status === "all") return all;
    return all.filter((s) => s.status === status);
  }, [box.data, status]);

  const columns: Column<AgentSessionSummary>[] = useMemo(
    () => [
      {
        key: "session",
        header: "Session",
        width: "34%",
        cell: (s) => (
          <div>
            <div className="font-mono text-xs text-[color:var(--muted)]">{s.id}</div>
            <div className="mt-1 font-medium">{s.agentName}</div>
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        width: "12%",
        cell: (s) => <Badge tone={statusTone(s.status)}>{s.status}</Badge>,
      },
      {
        key: "room",
        header: "Room",
        width: "22%",
        cell: (s) => <span className="font-mono text-xs">{s.roomName}</span>,
      },
      {
        key: "participants",
        header: "Participants",
        width: "12%",
        cell: (s) => <span className="text-sm">{s.participantCount}</span>,
      },
      {
        key: "times",
        header: "Timeline",
        width: "20%",
        cell: (s) => (
          <div className="text-xs text-[color:var(--muted)]">
            <div>Start: {new Date(s.startedAt).toLocaleString()}</div>
            {s.endedAt && <div className="mt-1">End: {new Date(s.endedAt).toLocaleString()}</div>}
          </div>
        ),
      },
      {
        key: "actions",
        header: "",
        width: "14%",
        cell: (s) => (
          <Link
            href={`/sessions/${s.id}`}
            className={cn(
              "inline-flex min-h-11 items-center justify-center rounded-[10px] border border-[color:var(--border)] px-3",
              "bg-[color:var(--panel-2)] text-sm font-medium text-[color:var(--text)] hover:bg-[#1a1a24] sm:min-h-9",
            )}
          >
            Details
          </Link>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agent sessions"
        description="Voice session lifecycle: starting, live, ended, and error states with room linkage."
        right={
          <div className="flex flex-wrap items-center gap-2">
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">All statuses</option>
              <option value="live">Live</option>
              <option value="starting">Starting</option>
              <option value="ended">Ended</option>
              <option value="error">Error</option>
            </Select>
            <Button variant="secondary" onClick={() => void actions.loadSessions()}>
              Refresh
            </Button>
          </div>
        }
      />

      <Card title="Sessions" subtitle="Includes STT/TTS/LLM/realtime pipeline events on the detail page">
        <DataTable
          rows={rows}
          columns={columns}
          isLoading={box.loadState === "loading"}
          emptyTitle="No sessions"
          filterPlaceholder="Search id, room, agent…"
          getRowId={(r) => r.id}
          filterFn={(r, q) => `${r.id} ${r.roomName} ${r.agentName}`.toLowerCase().includes(q)}
        />
      </Card>
    </div>
  );
}
