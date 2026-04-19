"use client";

import Link from "next/link";
import { useMemo } from "react";
import { DataTable, type Column } from "@/components/tables/DataTable";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { useStoreEffect } from "@/hooks/useStoreEffect";
import { useConversationsBox } from "@/store/selectors";
import { useAppActions } from "@/store/useAppStore";
import type { ConversationDetail } from "@/types/models";
import { cn } from "@/utils/cn";

export default function ConversationsPage() {
  const box = useConversationsBox();
  const actions = useAppActions();

  useStoreEffect(() => {
    void actions.loadConversations();
  }, [actions]);

  const rows = box.data ?? [];

  const columns: Column<ConversationDetail>[] = useMemo(
    () => [
      {
        key: "title",
        header: "Conversation",
        width: "40%",
        cell: (c) => (
          <div>
            <div className="font-medium">{c.title}</div>
            <div className="mt-1 font-mono text-xs text-[color:var(--muted)]">{c.id}</div>
          </div>
        ),
      },
      {
        key: "session",
        header: "Session",
        width: "20%",
        cell: (c) => <span className="font-mono text-xs">{c.sessionId}</span>,
      },
      {
        key: "counts",
        header: "Artifacts",
        width: "22%",
        cell: (c) => (
          <div className="text-xs text-[color:var(--muted)]">
            <div>Messages: {c.messages.length}</div>
            <div className="mt-1">Tool calls: {c.toolCalls.length}</div>
            <div className="mt-1">Streaming lines: {c.streaming.length}</div>
          </div>
        ),
      },
      {
        key: "actions",
        header: "",
        width: "18%",
        cell: (c) => (
          <Link
            href={`/conversations/${c.id}`}
            className={cn(
              "inline-flex min-h-11 items-center justify-center rounded-[10px] border border-[color:var(--border)] px-3",
              "bg-[color:var(--panel-2)] text-sm font-medium text-[color:var(--text)] hover:bg-[#1a1a24] sm:min-h-9",
            )}
          >
            Open
          </Link>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Conversations / chat context"
        description="Chat roles, tool call transcripts, and streaming logs captured from the LLM/STT/TTS/realtime pipeline."
        right={
          <button
            type="button"
            className={cn(
              "inline-flex h-10 items-center justify-center rounded-[10px] border border-[color:var(--border)]",
              "bg-[color:var(--panel-2)] px-4 text-sm font-medium text-[color:var(--text)] hover:bg-[#1a1a24]",
            )}
            onClick={() => void actions.loadConversations()}
          >
            Refresh
          </button>
        }
      />

      <Card title="Conversation index" subtitle="Backed by mock `adminApi` until your control plane exists">
        <DataTable
          rows={rows}
          columns={columns}
          isLoading={box.loadState === "loading"}
          emptyTitle="No conversations"
          filterPlaceholder="Search title, ids…"
          getRowId={(r) => r.id}
          filterFn={(r, q) => `${r.id} ${r.title} ${r.sessionId}`.toLowerCase().includes(q)}
        />
      </Card>
    </div>
  );
}
