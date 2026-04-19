"use client";

import { useMemo } from "react";
import { DataTable, type Column } from "@/components/tables/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { useStoreEffect } from "@/hooks/useStoreEffect";
import { useRecordingsBox } from "@/store/selectors";
import { useAppActions } from "@/store/useAppStore";
import type { RecordingItem } from "@/types/models";
import { formatBytes, formatDurationMs } from "@/utils/format";

export default function RecordingsPage() {
  const box = useRecordingsBox();
  const actions = useAppActions();

  useStoreEffect(() => {
    void actions.loadRecordings();
  }, [actions]);

  const rows = box.data ?? [];

  const columns: Column<RecordingItem>[] = useMemo(
    () => [
      {
        key: "id",
        header: "Recording",
        width: "22%",
        cell: (r) => <div className="font-mono text-xs">{r.id}</div>,
      },
      {
        key: "session",
        header: "Session",
        width: "22%",
        cell: (r) => <div className="font-mono text-xs">{r.sessionId}</div>,
      },
      {
        key: "meta",
        header: "Bundles",
        width: "22%",
        cell: (r) => (
          <div className="flex flex-wrap gap-2">
            {r.hasAudio && <Badge tone="good">audio</Badge>}
            {r.hasTraces && <Badge tone="info">traces</Badge>}
            {r.hasLogs && <Badge tone="neutral">logs</Badge>}
          </div>
        ),
      },
      {
        key: "size",
        header: "Size / duration",
        width: "18%",
        cell: (r) => (
          <div className="text-xs text-[color:var(--muted)]">
            <div>{formatBytes(r.sizeBytes)}</div>
            <div className="mt-1">{formatDurationMs(r.durationMs)}</div>
          </div>
        ),
      },
      {
        key: "playback",
        header: "Playback",
        width: "16%",
        cell: () => (
          <div className="space-y-2">
            <audio controls className="h-8 w-full max-w-[220px] opacity-60">
              <track kind="captions" />
            </audio>
            <div className="text-[11px] text-[color:var(--muted)]">Requires signed URL from your media API</div>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recordings"
        description="Session audio bundles plus optional OpenTelemetry traces/logs exports (as configured in `RecordingOptions`)."
        right={<Button variant="secondary" onClick={() => void actions.loadRecordings()}>Refresh</Button>}
      />

      <Card title="Library" subtitle="Mock entries — wire `adminApi.listRecordings` to your object store + metadata DB">
        <DataTable
          rows={rows}
          columns={columns}
          isLoading={box.loadState === "loading"}
          emptyTitle="No recordings"
          filterPlaceholder="Search ids…"
          getRowId={(r) => r.id}
          filterFn={(r, q) => `${r.id} ${r.sessionId}`.toLowerCase().includes(q)}
        />
      </Card>
    </div>
  );
}
