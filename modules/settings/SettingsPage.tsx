"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { useStoreEffect } from "@/hooks/useStoreEffect";
import { useAgentsBox, useSettingsBox } from "@/store/selectors";
import { useAppActions } from "@/store/useAppStore";
import type { GlobalSettings } from "@/types/models";

export default function SettingsPage() {
  const actions = useAppActions();
  const settingsBox = useSettingsBox();
  const agentsBox = useAgentsBox();
  const [local, setLocal] = useState<GlobalSettings | null>(null);

  useStoreEffect(() => {
    void Promise.all([actions.loadSettings(), actions.loadAgents()]);
  }, [actions]);

  useEffect(() => {
    if (settingsBox.data) setLocal(settingsBox.data);
  }, [settingsBox.data]);

  const agents = agentsBox.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Global configuration: LiveKit URL, default agent, retention, observability endpoints, and feature toggles."
        right={
          <Button
            disabled={!local}
            onClick={async () => {
              if (!local) return;
              await actions.updateSettings(local);
            }}
          >
            Save
          </Button>
        }
      />

      <Card title="Environment" subtitle="Secrets belong in your vault — UI stores non-secret fields only">
        {settingsBox.loadState === "loading" && !local ? (
          <div className="flex items-center gap-2 text-sm text-[color:var(--muted)]">
            <Spinner />
            Loading…
          </div>
        ) : !local ? (
          <div className="text-sm text-[color:var(--muted)]">Failed to load settings.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <div className="text-xs font-semibold text-[color:var(--muted)]">LiveKit URL</div>
              <Input className="mt-1" value={local.livekitUrl} onChange={(e) => setLocal({ ...local, livekitUrl: e.target.value })} />
            </div>
            <div>
              <div className="text-xs font-semibold text-[color:var(--muted)]">Default agent</div>
              <Select
                className="mt-1"
                value={local.defaultAgentId}
                onChange={(e) => setLocal({ ...local, defaultAgentId: e.target.value })}
              >
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <div className="text-xs font-semibold text-[color:var(--muted)]">Retention (days)</div>
              <Input
                className="mt-1"
                type="number"
                value={local.retentionDays}
                onChange={(e) => setLocal({ ...local, retentionDays: Number(e.target.value) })}
              />
            </div>
            <div className="md:col-span-2">
              <div className="text-xs font-semibold text-[color:var(--muted)]">OTLP endpoint</div>
              <Input
                className="mt-1"
                value={local.otlpEndpoint ?? ""}
                onChange={(e) => setLocal({ ...local, otlpEndpoint: e.target.value || undefined })}
              />
            </div>
            <div className="md:col-span-2">
              <div className="text-xs font-semibold text-[color:var(--muted)]">Prometheus endpoint</div>
              <Input
                className="mt-1"
                value={local.prometheusEndpoint ?? ""}
                onChange={(e) => setLocal({ ...local, prometheusEndpoint: e.target.value || undefined })}
              />
            </div>
          </div>
        )}
      </Card>

      {local && (
        <Card title="Feature toggles" subtitle="Maps to runtime feature gates in your control plane">
          <div className="grid gap-3 md:grid-cols-2">
            {Object.entries(local.featureFlags).map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-3 rounded-[10px] border border-[color:var(--border)] bg-white/[0.02] p-3">
                <div>
                  <div className="text-sm font-medium">{k}</div>
                  <div className="mt-1 text-xs text-[color:var(--muted)]">Toggle feature availability for tenants</div>
                </div>
                <Select
                  value={v ? "true" : "false"}
                  onChange={(e) =>
                    setLocal({
                      ...local,
                      featureFlags: { ...local.featureFlags, [k]: e.target.value === "true" },
                    })
                  }
                >
                  <option value="true">on</option>
                  <option value="false">off</option>
                </Select>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
