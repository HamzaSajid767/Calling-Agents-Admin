"use client";

import { useEffect, useMemo, useState } from "react";
import { DataTable, type Column } from "@/components/tables/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { useStoreEffect } from "@/hooks/useStoreEffect";
import { useAmdLogsBox, useAmdSettingsBox } from "@/store/selectors";
import { useAppActions } from "@/store/useAppStore";
import type { AmdLog, AmdSettings } from "@/types/models";

export default function AmdPage() {
  const actions = useAppActions();
  const logsBox = useAmdLogsBox();
  const settingsBox = useAmdSettingsBox();
  const [local, setLocal] = useState<AmdSettings | null>(null);

  useStoreEffect(() => {
    void Promise.all([actions.loadAmdLogs(), actions.loadAmdSettings()]);
  }, [actions]);

  useEffect(() => {
    if (settingsBox.data) setLocal(settingsBox.data);
  }, [settingsBox.data]);

  const rows = logsBox.data ?? [];

  const columns: Column<AmdLog>[] = useMemo(
    () => [
      {
        key: "at",
        header: "Time",
        width: "18%",
        cell: (l) => <div className="text-xs text-[color:var(--muted)]">{new Date(l.at).toLocaleString()}</div>,
      },
      {
        key: "session",
        header: "Session",
        width: "22%",
        cell: (l) => <span className="font-mono text-xs">{l.sessionId}</span>,
      },
      {
        key: "category",
        header: "Category",
        width: "14%",
        cell: (l) => <Badge tone={l.category === "human" ? "good" : l.category === "machine" ? "warn" : "neutral"}>{l.category}</Badge>,
      },
      {
        key: "conf",
        header: "Confidence",
        width: "12%",
        cell: (l) => <span className="text-sm">{(l.confidence * 100).toFixed(1)}%</span>,
      },
      {
        key: "id",
        header: "Log id",
        width: "34%",
        cell: (l) => <span className="font-mono text-xs text-[color:var(--muted)]">{l.id}</span>,
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Answering machine detection (AMD)"
        description="Operational logs and tuning knobs for voicemail/machine classification in outbound calling."
        right={<Button variant="secondary" onClick={() => void Promise.all([actions.loadAmdLogs(), actions.loadAmdSettings()])}>Refresh</Button>}
      />

      <Card title="Detection logs" subtitle="Correlates with `voice.amd` style classifiers in LiveKit Agents">
        <DataTable
          rows={rows}
          columns={columns}
          isLoading={logsBox.loadState === "loading"}
          emptyTitle="No AMD logs"
          filterPlaceholder="Search session id…"
          getRowId={(r) => r.id}
          filterFn={(r, q) => r.sessionId.toLowerCase().includes(q)}
        />
      </Card>

      <Card
        title="Detection behavior"
        subtitle="Mock controls — wire to your policy service for real deployments"
        right={
          <Button
            disabled={!local}
            onClick={async () => {
              if (!local) return;
              await actions.updateAmdSettings(local);
            }}
          >
            Save
          </Button>
        }
      >
        {settingsBox.loadState === "loading" && !local ? (
          <div className="flex items-center gap-2 text-sm text-[color:var(--muted)]">
            <Spinner />
            Loading…
          </div>
        ) : !local ? (
          <div className="text-sm text-[color:var(--muted)]">Failed to load settings.</div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="text-xs font-semibold text-[color:var(--muted)]">Enabled</div>
              <Select
                className="mt-1"
                value={local.enabled ? "true" : "false"}
                onChange={(e) => setLocal({ ...local, enabled: e.target.value === "true" })}
              >
                <option value="true">On</option>
                <option value="false">Off</option>
              </Select>
            </div>
            <div>
              <div className="text-xs font-semibold text-[color:var(--muted)]">Min speech ms</div>
              <Input
                className="mt-1"
                type="number"
                value={local.minSpeechMs}
                onChange={(e) => setLocal({ ...local, minSpeechMs: Number(e.target.value) })}
              />
            </div>
            <div>
              <div className="text-xs font-semibold text-[color:var(--muted)]">Max silence ms</div>
              <Input
                className="mt-1"
                type="number"
                value={local.maxSilenceMs}
                onChange={(e) => setLocal({ ...local, maxSilenceMs: Number(e.target.value) })}
              />
            </div>
            <div>
              <div className="text-xs font-semibold text-[color:var(--muted)]">Beep sensitivity</div>
              <Input
                className="mt-1"
                type="number"
                step="0.01"
                min={0}
                max={1}
                value={local.beepSensitivity}
                onChange={(e) => setLocal({ ...local, beepSensitivity: Number(e.target.value) })}
              />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
