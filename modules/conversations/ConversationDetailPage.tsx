"use client";

import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Spinner } from "@/components/ui/Spinner";
import { useStoreEffect } from "@/hooks/useStoreEffect";
import { useConversationDetailBox } from "@/store/selectors";
import { useAppActions } from "@/store/useAppStore";

type Tab = "messages" | "tools" | "streaming";

export default function ConversationDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const actions = useAppActions();
  const box = useConversationDetailBox();
  const [tab, setTab] = useState<Tab>("messages");

  useStoreEffect(() => {
    void actions.loadConversation(id);
  }, [actions, id]);

  const c = box.data;

  const tabs = useMemo(
    () =>
      [
        { id: "messages" as const, label: "Messages" },
        { id: "tools" as const, label: "Tool calls" },
        { id: "streaming" as const, label: "Streaming logs" },
      ] satisfies { id: Tab; label: string }[],
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Conversation detail"
        description="Inspect chat items, tool I/O, and per-channel streaming chunks (LLM/STT/TTS/realtime)."
        right={<Button variant="secondary" onClick={() => void actions.loadConversation(id)}>Refresh</Button>}
      />

      {box.error && (
        <div className="rounded-[var(--radius-lg)] border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {box.error}
        </div>
      )}

      <Card title="Overview" subtitle={c ? c.title : "Loading"}>
        {box.loadState === "loading" && !c ? (
          <div className="flex items-center gap-2 text-sm text-[color:var(--muted)]">
            <Spinner />
            Loading…
          </div>
        ) : !c ? (
          <div className="text-sm text-[color:var(--muted)]">Not found.</div>
        ) : (
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-[10px] border border-[color:var(--border)] bg-white/[0.02] p-3 text-sm">
              <div className="text-xs text-[color:var(--muted)]">Conversation id</div>
              <div className="mt-1 font-mono text-xs">{c.id}</div>
            </div>
            <div className="rounded-[10px] border border-[color:var(--border)] bg-white/[0.02] p-3 text-sm">
              <div className="text-xs text-[color:var(--muted)]">Session id</div>
              <div className="mt-1 font-mono text-xs">{c.sessionId}</div>
            </div>
            <div className="rounded-[10px] border border-[color:var(--border)] bg-white/[0.02] p-3 text-sm">
              <div className="text-xs text-[color:var(--muted)]">Totals</div>
              <div className="mt-1 text-xs text-[color:var(--muted)]">
                {c.messages.length} messages • {c.toolCalls.length} tools • {c.streaming.length} stream lines
              </div>
            </div>
          </div>
        )}
      </Card>

      {c && (
        <Card
          title="Transcript artifacts"
          subtitle="Mirrors ChatContext-style items and tool execution logs"
          right={
            <div className="flex max-w-full flex-wrap gap-2">
              {tabs.map((t) => (
                <Button key={t.id} size="sm" variant={tab === t.id ? "primary" : "secondary"} onClick={() => setTab(t.id)}>
                  {t.label}
                </Button>
              ))}
            </div>
          }
        >
          {tab === "messages" && (
            <div className="space-y-2">
              {c.messages.map((m) => (
                <div key={m.id} className="rounded-[10px] border border-[color:var(--border)] bg-white/[0.02] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs font-semibold uppercase text-[color:var(--muted)]">{m.role}</div>
                    <div className="text-[11px] text-[color:var(--muted)]">{new Date(m.at).toLocaleString()}</div>
                  </div>
                  <div className="mt-2 whitespace-pre-wrap text-sm">{m.content}</div>
                </div>
              ))}
            </div>
          )}

          {tab === "tools" && (
            <div className="space-y-3">
              {c.toolCalls.map((t) => (
                <div key={t.id} className="rounded-[10px] border border-[color:var(--border)] bg-white/[0.02] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs text-[color:var(--muted)]">{t.ok ? "ok" : "failed"}</div>
                  </div>
                  <div className="mt-2 grid gap-2 md:grid-cols-2">
                    <pre className="overflow-auto rounded-[8px] bg-black/30 p-2 text-[11px] text-[color:var(--muted)]">
                      {t.argsJson}
                    </pre>
                    <pre className="overflow-auto rounded-[8px] bg-black/30 p-2 text-[11px] text-[color:var(--muted)]">
                      {t.outputJson ?? "// no output"}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "streaming" && (
            <div className="space-y-2">
              {c.streaming.map((s) => (
                <div key={s.id} className="flex items-start justify-between gap-3 rounded-[10px] border border-[color:var(--border)] bg-white/[0.02] p-3">
                  <div>
                    <div className="text-xs font-semibold text-[color:var(--muted)]">{s.channel}</div>
                    <div className="mt-1 font-mono text-sm">{JSON.stringify(s.chunk)}</div>
                  </div>
                  <div className="shrink-0 text-[11px] text-[color:var(--muted)]">{new Date(s.at).toLocaleTimeString()}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
