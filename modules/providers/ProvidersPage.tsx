"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Settings2 } from "lucide-react";
import { DataTable, type Column } from "@/components/tables/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/ui/PageHeader";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useStoreEffect } from "@/hooks/useStoreEffect";
import { useProvidersBox } from "@/store/selectors";
import { useAppActions } from "@/store/useAppStore";
import type { ProviderIntegration } from "@/types/models";

export default function ProvidersPage() {
  const box = useProvidersBox();
  const actions = useAppActions();

  const [configOpen, setConfigOpen] = useState(false);
  const [active, setActive] = useState<ProviderIntegration | null>(null);
  const [region, setRegion] = useState("");
  const [notes, setNotes] = useState("");
  const [enabled, setEnabled] = useState(true);

  useStoreEffect(() => {
    void actions.loadProviders();
  }, [actions]);

  useEffect(() => {
    if (!active) return;
    setRegion(active.region ?? "");
    setNotes(active.notes ?? "");
    setEnabled(active.enabled);
  }, [active]);

  const rows = box.data ?? [];

  const openConfig = useCallback((p: ProviderIntegration) => {
    setActive(p);
    setConfigOpen(true);
  }, []);

  const columns: Column<ProviderIntegration>[] = useMemo(
    () => [
      {
        key: "name",
        header: "Provider",
        width: "28%",
        cell: (p) => (
          <div>
            <div className="font-medium leading-snug">{p.name}</div>
            <div className="mt-1 text-xs text-[color:var(--muted)]">{p.vendor}</div>
          </div>
        ),
      },
      {
        key: "kind",
        header: "Kind",
        width: "12%",
        cell: (p) => <Badge tone="info">{p.kind}</Badge>,
      },
      {
        key: "region",
        header: "Region",
        width: "12%",
        cell: (p) => <span className="break-words text-xs text-[color:var(--muted)]">{p.region ?? "—"}</span>,
      },
      {
        key: "key",
        header: "API key",
        width: "12%",
        cell: (p) => <Badge tone={p.hasApiKey ? "good" : "warn"}>{p.hasApiKey ? "present" : "missing"}</Badge>,
      },
      {
        key: "enabled",
        header: "Enabled",
        width: "10%",
        cell: (p) => <Badge tone={p.enabled ? "good" : "warn"}>{p.enabled ? "on" : "off"}</Badge>,
      },
      {
        key: "actions",
        header: "Actions",
        width: "26%",
        cell: (p) => (
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button size="sm" variant="secondary" onClick={() => void actions.setProviderEnabled(p.id, !p.enabled)}>
              Toggle
            </Button>
            <Button size="sm" variant="secondary" onClick={() => void actions.setProviderApiKey(p.id, !p.hasApiKey)}>
              Key (mock)
            </Button>
            <Button size="sm" variant="primary" onClick={() => openConfig(p)}>
              <Settings2 className="h-4 w-4" />
              Configure
            </Button>
          </div>
        ),
      },
    ],
    [actions, openConfig],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Providers / plugins"
        description="Manage LLM, STT, TTS, realtime, and avatar integrations. Secrets are never displayed—only configuration metadata and key presence."
        right={<Button variant="secondary" onClick={() => void actions.loadProviders()}>Refresh</Button>}
      />

      <Card title="Integrations" subtitle="Maps to livekit-plugins style integrations in your agent runtime">
        <DataTable
          rows={rows}
          columns={columns}
          isLoading={box.loadState === "loading"}
          emptyTitle="No providers"
          filterPlaceholder="Search vendor, name, kind…"
          getRowId={(r) => r.id}
          filterFn={(r, q) => `${r.name} ${r.vendor} ${r.kind}`.toLowerCase().includes(q)}
        />
      </Card>

      <Modal
        open={configOpen && !!active}
        title={active ? `Configure ${active.name}` : "Configure provider"}
        onClose={() => {
          setConfigOpen(false);
          setActive(null);
        }}
        wide
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setConfigOpen(false);
                setActive(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!active) return;
                await actions.updateProvider(active.id, {
                  region: region.trim() || undefined,
                  notes: notes.trim() || undefined,
                  enabled,
                });
                setConfigOpen(false);
                setActive(null);
              }}
            >
              Save configuration
            </Button>
          </div>
        }
      >
        {active && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <div className="text-xs font-semibold text-[color:var(--muted)]">Provider id</div>
              <div className="mt-1 font-mono text-xs text-[color:var(--muted)]">{active.id}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-[color:var(--muted)]">Enabled</div>
              <Select className="mt-1" value={enabled ? "true" : "false"} onChange={(e) => setEnabled(e.target.value === "true")}>
                <option value="true">On</option>
                <option value="false">Off</option>
              </Select>
            </div>
            <div>
              <div className="text-xs font-semibold text-[color:var(--muted)]">Region</div>
              <Input className="mt-1" value={region} onChange={(e) => setRegion(e.target.value)} placeholder="e.g. us-east-1" />
            </div>
            <div className="sm:col-span-2">
              <div className="text-xs font-semibold text-[color:var(--muted)]">Notes</div>
              <Textarea
                className="mt-1"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Routing hints, quotas, or rollout notes"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
