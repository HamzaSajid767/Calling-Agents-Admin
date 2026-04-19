"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { useStoreEffect } from "@/hooks/useStoreEffect";
import { AgentForm } from "@/modules/agents/AgentForm";
import { emptyAgentDraft } from "@/modules/agents/agentDraft";
import { useProvidersBox, useToolsBox } from "@/store/selectors";
import { useAppActions } from "@/store/useAppStore";
import type { AgentDefinition } from "@/types/models";

export default function AgentCreatePage() {
  const router = useRouter();
  const actions = useAppActions();
  const providersBox = useProvidersBox();
  const toolsBox = useToolsBox();
  const [draft, setDraft] = useState<Omit<AgentDefinition, "id" | "updatedAt">>(emptyAgentDraft());

  useStoreEffect(() => {
    void Promise.all([actions.loadProviders(), actions.loadTools()]);
  }, [actions]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create agent"
        description="Provision a new agent definition with model routing, speech providers, tools, and interruption policy."
        right={
          <Button variant="secondary" onClick={() => router.push("/agents")}>
            Back
          </Button>
        }
      />

      <Card
        title="Agent blueprint"
        subtitle="Saved to the mock control plane via the global store"
        right={
          <Button
            onClick={async () => {
              await actions.createAgent(draft);
              router.push("/agents");
            }}
          >
            Create agent
          </Button>
        }
      >
        <AgentForm
          value={draft}
          onChange={(v) => setDraft(v as Omit<AgentDefinition, "id" | "updatedAt">)}
          providers={providersBox.data ?? []}
          tools={toolsBox.data ?? []}
        />
        <div className="mt-6 text-xs text-[color:var(--muted)]">
          Looking for REST wiring? Point `adminApi` methods at your gateway; the UI already routes exclusively through the store.
        </div>
      </Card>
    </div>
  );
}
