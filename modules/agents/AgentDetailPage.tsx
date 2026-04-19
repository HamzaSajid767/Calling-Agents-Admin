"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Spinner } from "@/components/ui/Spinner";
import { useStoreEffect } from "@/hooks/useStoreEffect";
import { AgentForm } from "@/modules/agents/AgentForm";
import { useAgentDetailBox, useProvidersBox, useToolsBox } from "@/store/selectors";
import { useAppActions } from "@/store/useAppStore";
import type { AgentDefinition } from "@/types/models";

export default function AgentDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const actions = useAppActions();
  const detailBox = useAgentDetailBox();
  const providersBox = useProvidersBox();
  const toolsBox = useToolsBox();
  const [local, setLocal] = useState<AgentDefinition | null>(null);

  useStoreEffect(() => {
    void Promise.all([actions.loadAgent(id), actions.loadProviders(), actions.loadTools()]);
  }, [actions, id]);

  useEffect(() => {
    if (detailBox.data) setLocal(detailBox.data);
  }, [detailBox.data]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agent detail"
        description="Edit model routing, speech providers, tool attachments, and realtime behavior."
        right={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => router.push("/agents")}>
              Back
            </Button>
            <Button
              variant="danger"
              onClick={async () => {
                await actions.deleteAgent(id);
                router.push("/agents");
              }}
            >
              Delete
            </Button>
          </div>
        }
      />

      <Card
        title="Configuration"
        subtitle={`Agent id: ${id}`}
        right={
          <Button
            disabled={!local}
            onClick={async () => {
              if (!local) return;
              await actions.updateAgent(local.id, local);
            }}
          >
            Save changes
          </Button>
        }
      >
        {detailBox.loadState === "loading" && !local ? (
          <div className="flex items-center gap-2 text-sm text-[color:var(--muted)]">
            <Spinner />
            Loading agent…
          </div>
        ) : !local ? (
          <div className="text-sm text-[color:var(--muted)]">Agent not found.</div>
        ) : (
          <AgentForm
            value={local}
            onChange={(v) => setLocal(v as AgentDefinition)}
            providers={providersBox.data ?? []}
            tools={toolsBox.data ?? []}
          />
        )}
      </Card>
    </div>
  );
}
