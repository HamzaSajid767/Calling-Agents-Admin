"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { cn } from "@/utils/cn";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { DataTable, type Column } from "@/components/tables/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/ui/PageHeader";
import { useStoreEffect } from "@/hooks/useStoreEffect";
import { AgentForm } from "@/modules/agents/AgentForm";
import { emptyAgentDraft } from "@/modules/agents/agentDraft";
import { useAgentsBox, useProvidersBox, useToolsBox } from "@/store/selectors";
import { useAppActions } from "@/store/useAppStore";
import type { AgentDefinition } from "@/types/models";

export default function AgentsPage() {
  const agentsBox = useAgentsBox();
  const providersBox = useProvidersBox();
  const toolsBox = useToolsBox();
  const actions = useAppActions();

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState<string | null>(null);
  const [draft, setDraft] = useState<Omit<AgentDefinition, "id" | "updatedAt">>(emptyAgentDraft());
  const [editAgent, setEditAgent] = useState<AgentDefinition | null>(null);

  useStoreEffect(() => {
    void Promise.all([actions.loadAgents(), actions.loadProviders(), actions.loadTools()]);
  }, [actions]);

  const rows = agentsBox.data ?? [];
  const providers = providersBox.data ?? [];
  const tools = toolsBox.data ?? [];

  const columns: Column<AgentDefinition>[] = useMemo(
    () => [
      {
        key: "name",
        header: "Agent",
        width: "34%",
        cell: (a) => (
          <div>
            <div className="font-medium">{a.name}</div>
            <div className="mt-1 text-xs text-[color:var(--muted)]">{a.description}</div>
          </div>
        ),
      },
      {
        key: "models",
        header: "Model / speech",
        width: "30%",
        cell: (a) => (
          <div className="text-xs text-[color:var(--muted)]">
            <div>
              <span className="text-[color:var(--text)]">LLM:</span> {a.llmModel}
            </div>
            <div className="mt-1">
              <span className="text-[color:var(--text)]">STT:</span> {a.sttProviderId}{" "}
              <span className="text-[color:var(--text)]">TTS:</span> {a.ttsProviderId}
            </div>
          </div>
        ),
      },
      {
        key: "tools",
        header: "Tools",
        width: "18%",
        cell: (a) => <Badge tone="neutral">{a.toolIds.length} tools</Badge>,
      },
      {
        key: "enabled",
        header: "Status",
        width: "10%",
        cell: (a) => <Badge tone={a.enabled ? "good" : "warn"}>{a.enabled ? "enabled" : "disabled"}</Badge>,
      },
      {
        key: "actions",
        header: "",
        width: "18%",
        cell: (a) => (
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/agents/${a.id}`}
              className={cn(
                "inline-flex min-h-11 items-center justify-center rounded-[10px] border border-[color:var(--border)] px-3",
                "bg-[color:var(--panel-2)] text-sm font-medium text-[color:var(--text)] hover:bg-[#1a1a24] sm:min-h-9",
              )}
            >
              Open
            </Link>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setEditAgent(a);
                setEditOpen(true);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="danger" size="sm" onClick={() => setDeleteOpen(a.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agents"
        description="Create and manage agent definitions: LLM, STT/TTS providers, tools, and realtime behavior flags."
        right={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              href="/agents/new"
              className={cn(
                "inline-flex min-h-11 items-center justify-center rounded-[10px] border border-[color:var(--border)] px-4",
                "bg-[color:var(--panel-2)] text-sm font-medium text-[color:var(--text)] hover:bg-[#1a1a24] sm:min-h-10",
              )}
            >
              Create in full page
            </Link>
            <Button
              className="w-full sm:w-auto"
              onClick={() => {
                setDraft(emptyAgentDraft());
                setCreateOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              New agent
            </Button>
          </div>
        }
      />

      {agentsBox.error && (
        <div className="rounded-[var(--radius-lg)] border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {agentsBox.error}
        </div>
      )}

      <Card title="Agent directory" subtitle="All configured agents (mock persistence)">
        <DataTable
          rows={rows}
          columns={columns}
          isLoading={agentsBox.loadState === "loading"}
          emptyTitle="No agents yet"
          filterPlaceholder="Search name, description, model…"
          getRowId={(r) => r.id}
          filterFn={(r, q) =>
            `${r.name} ${r.description} ${r.llmModel} ${r.sttProviderId} ${r.ttsProviderId}`.toLowerCase().includes(q)
          }
        />
      </Card>

      <Modal
        open={createOpen}
        title="Create agent"
        onClose={() => setCreateOpen(false)}
        wide
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                await actions.createAgent(draft);
                setCreateOpen(false);
              }}
            >
              Create
            </Button>
          </div>
        }
      >
        <AgentForm value={draft} onChange={(v) => setDraft(v as any)} providers={providers} tools={tools} />
      </Modal>

      <Modal
        open={editOpen && !!editAgent}
        title="Edit agent"
        onClose={() => setEditOpen(false)}
        wide
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!editAgent) return;
                await actions.updateAgent(editAgent.id, editAgent);
                setEditOpen(false);
              }}
            >
              Save
            </Button>
          </div>
        }
      >
        {editAgent && (
          <AgentForm
            value={editAgent}
            onChange={(v) => setEditAgent(v as AgentDefinition)}
            providers={providers}
            tools={tools}
          />
        )}
      </Modal>

      <Modal
        open={!!deleteOpen}
        title="Delete agent?"
        onClose={() => setDeleteOpen(null)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setDeleteOpen(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={async () => {
                if (!deleteOpen) return;
                await actions.deleteAgent(deleteOpen);
                setDeleteOpen(null);
              }}
            >
              Delete
            </Button>
          </div>
        }
      >
        <div className="text-sm text-[color:var(--muted)]">This action removes the agent definition from the control plane (mock).</div>
      </Modal>
    </div>
  );
}
