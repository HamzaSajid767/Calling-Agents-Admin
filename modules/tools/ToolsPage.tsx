"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Wrench } from "lucide-react";
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
import { useAgentsBox, useToolsBox } from "@/store/selectors";
import { useAppActions } from "@/store/useAppStore";
import type { ID, ToolDefinition, ToolKind } from "@/types/models";

function emptyTool(): ToolDefinition {
  return {
    id: `tl_${Math.random().toString(16).slice(2, 10)}`,
    name: "",
    description: "",
    kind: "function",
    schemaJson: JSON.stringify({ type: "object", properties: {} }, null, 2),
    enabled: true,
    assignedAgentIds: [],
    updatedAt: new Date().toISOString(),
  };
}

export default function ToolsPage() {
  const toolsBox = useToolsBox();
  const agentsBox = useAgentsBox();
  const actions = useAppActions();

  const [editorOpen, setEditorOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [draft, setDraft] = useState<ToolDefinition>(emptyTool());
  const [assignToolId, setAssignToolId] = useState<ID | null>(null);
  const [assignAgentId, setAssignAgentId] = useState<ID>("");

  useStoreEffect(() => {
    void Promise.all([actions.loadTools(), actions.loadAgents()]);
  }, [actions]);

  const tools = toolsBox.data ?? [];
  const agents = agentsBox.data ?? [];

  const columns: Column<ToolDefinition>[] = useMemo(
    () => [
      {
        key: "tool",
        header: "Tool",
        width: "34%",
        cell: (t) => (
          <div>
            <div className="font-medium">{t.name}</div>
            <div className="mt-1 text-xs text-[color:var(--muted)]">{t.description}</div>
          </div>
        ),
      },
      {
        key: "kind",
        header: "Kind",
        width: "12%",
        cell: (t) => <Badge tone="info">{t.kind}</Badge>,
      },
      {
        key: "enabled",
        header: "Status",
        width: "14%",
        cell: (t) => (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Badge tone={t.enabled ? "good" : "warn"}>{t.enabled ? "enabled" : "disabled"}</Badge>
            <Button size="sm" variant="secondary" onClick={() => void actions.setToolEnabled(t.id, !t.enabled)}>
              {t.enabled ? "Disable" : "Enable"}
            </Button>
          </div>
        ),
      },
      {
        key: "agents",
        header: "Assigned agents",
        width: "18%",
        cell: (t) => <span className="text-xs text-[color:var(--muted)]">{t.assignedAgentIds.length} agents</span>,
      },
      {
        key: "actions",
        header: "",
        width: "26%",
        cell: (t) => (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setDraft(t);
                setEditorOpen(true);
              }}
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setAssignToolId(t.id);
                setAssignAgentId(t.assignedAgentIds[0] ?? agents[0]?.id ?? "");
                setAssignOpen(true);
              }}
            >
              <Wrench className="h-4 w-4" />
              Assign
            </Button>
          </div>
        ),
      },
    ],
    [agents, actions],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tools"
        description="Function tools, HTTP tools, and MCP bridges — assignable to agents for runtime tool calling."
        right={
          <Button
            onClick={() => {
              setDraft(emptyTool());
              setEditorOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            New tool
          </Button>
        }
      />

      <Card title="Tool registry" subtitle="Schema is JSON; validated server-side in production">
        <DataTable
          rows={tools}
          columns={columns}
          isLoading={toolsBox.loadState === "loading"}
          emptyTitle="No tools"
          filterPlaceholder="Search name, description, kind…"
          getRowId={(r) => r.id}
          filterFn={(r, q) => `${r.name} ${r.description} ${r.kind}`.toLowerCase().includes(q)}
        />
      </Card>

      <Modal
        open={editorOpen}
        title={tools.some((t) => t.id === draft.id) ? "Edit tool" : "Create tool"}
        onClose={() => setEditorOpen(false)}
        wide
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setEditorOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void actions.upsertTool(draft).then(() => setEditorOpen(false))}>Save</Button>
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="text-xs font-semibold text-[color:var(--muted)]">Name</div>
            <Input className="mt-1" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          </div>
          <div>
            <div className="text-xs font-semibold text-[color:var(--muted)]">Kind</div>
            <Select
              className="mt-1"
              value={draft.kind}
              onChange={(e) => setDraft({ ...draft, kind: e.target.value as ToolKind })}
            >
              <option value="function">function</option>
              <option value="http">http</option>
              <option value="mcp">mcp</option>
            </Select>
          </div>
          <div className="md:col-span-2">
            <div className="text-xs font-semibold text-[color:var(--muted)]">Description</div>
            <Input
              className="mt-1"
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <div className="text-xs font-semibold text-[color:var(--muted)]">JSON schema</div>
            <Textarea className="mt-1 font-mono text-xs" value={draft.schemaJson} onChange={(e) => setDraft({ ...draft, schemaJson: e.target.value })} />
          </div>
          <div>
            <div className="text-xs font-semibold text-[color:var(--muted)]">Enabled</div>
            <Select
              className="mt-1"
              value={draft.enabled ? "true" : "false"}
              onChange={(e) => setDraft({ ...draft, enabled: e.target.value === "true" })}
            >
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </Select>
          </div>
        </div>
      </Modal>

      <Modal
        open={assignOpen && !!assignToolId}
        title="Assign tool to agent"
        onClose={() => setAssignOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setAssignOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!assignToolId || !assignAgentId) return;
                const tool = tools.find((t) => t.id === assignToolId);
                if (!tool) return;
                const agent = agents.find((a) => a.id === assignAgentId);
                if (!agent) return;
                const nextToolIds = Array.from(new Set([...agent.toolIds, tool.id]));
                await actions.assignToolsToAgent(agent.id, nextToolIds);
                setAssignOpen(false);
              }}
            >
              Assign
            </Button>
          </div>
        }
      >
        <div className="grid gap-3">
          <div>
            <div className="text-xs font-semibold text-[color:var(--muted)]">Agent</div>
            <Select className="mt-1" value={assignAgentId} onChange={(e) => setAssignAgentId(e.target.value)}>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="text-xs text-[color:var(--muted)]">
            This uses the store’s `assignToolsToAgent` action (merges tool id into the agent’s tool list).
          </div>
        </div>
      </Modal>
    </div>
  );
}
