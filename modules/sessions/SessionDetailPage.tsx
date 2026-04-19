"use client";

import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Spinner } from "@/components/ui/Spinner";
import { useStoreEffect } from "@/hooks/useStoreEffect";
import { useSessionDetailBox } from "@/store/selectors";
import { useAppActions } from "@/store/useAppStore";
import { cn } from "@/utils/cn";

type Tab = "transcript" | "events" | "errors";

export default function SessionDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const actions = useAppActions();
  const box = useSessionDetailBox();
  const [tab, setTab] = useState<Tab>("transcript");

  useStoreEffect(() => {
    void actions.loadSession(id);
  }, [actions, id]);

  const s = box.data;

  const tabs = useMemo(
    () =>
      [
        { id: "transcript" as const, label: "Transcript" },
        { id: "events" as const, label: "Pipeline events" },
        { id: "errors" as const, label: "Errors" },
      ] satisfies { id: Tab; label: string }[],
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Session detail"
        description="Transcription, audio/LLM/TTS/realtime events, and lifecycle errors for a single voice session."
        right={
          <Button
            variant="danger"
            disabled={!s || s.status !== "live"}
            onClick={() => void actions.stopSession(id)}
          >
            Stop session
          </Button>
        }
      />

      {box.error && (
        <div className="rounded-[var(--radius-lg)] border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {box.error}
        </div>
      )}

      <Card title="Summary" subtitle={s ? `${s.status} • ${s.roomName}` : "Loading"}>
        {box.loadState === "loading" && !s ? (
          <div className="flex items-center gap-2 text-sm text-[color:var(--muted)]">
            <Spinner />
            Loading session…
          </div>
        ) : !s ? (
          <div className="text-sm text-[color:var(--muted)]">Session not found.</div>
        ) : (
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-[10px] border border-[color:var(--border)] bg-white/[0.02] p-3 text-sm">
              <div className="text-xs text-[color:var(--muted)]">Agent</div>
              <div className="mt-1 font-medium">{s.agentName}</div>
            </div>
            <div className="rounded-[10px] border border-[color:var(--border)] bg-white/[0.02] p-3 text-sm">
              <div className="text-xs text-[color:var(--muted)]">Participants</div>
              <div className="mt-1 font-medium">{s.participantCount}</div>
            </div>
            <div className="rounded-[10px] border border-[color:var(--border)] bg-white/[0.02] p-3 text-sm">
              <div className="text-xs text-[color:var(--muted)]">Session id</div>
              <div className="mt-1 font-mono text-xs">{s.id}</div>
            </div>
          </div>
        )}
      </Card>

      {s && (
        <Card
          title="Diagnostics"
          subtitle="STT partial/final, TTS chunks, LLM streaming, interruptions, tool calls (aggregated)"
          right={
            <div className="flex max-w-full flex-wrap gap-2">
              {tabs.map((t) => (
                <Button
                  key={t.id}
                  size="sm"
                  variant={tab === t.id ? "primary" : "secondary"}
                  onClick={() => setTab(t.id)}
                >
                  {t.label}
                </Button>
              ))}
            </div>
          }
        >
          {tab === "transcript" && (
            <div className="space-y-2">
              {s.transcript.map((line) => (
                <div key={line.id} className="rounded-[10px] border border-[color:var(--border)] bg-white/[0.02] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs font-semibold uppercase text-[color:var(--muted)]">{line.role}</div>
                    <div className="text-[11px] text-[color:var(--muted)]">{new Date(line.at).toLocaleString()}</div>
                  </div>
                  <div className="mt-2 text-sm">{line.text}</div>
                  <div className="mt-2 text-[11px] text-[color:var(--muted)]">{line.final ? "final" : "partial"}</div>
                </div>
              ))}
            </div>
          )}

          {tab === "events" && (
            <div className="space-y-2">
              {s.events.map((e) => (
                <div key={e.id} className="flex items-start justify-between gap-4 rounded-[10px] border border-[color:var(--border)] bg-white/[0.02] p-3">
                  <div>
                    <div className="text-xs font-semibold">{e.kind}</div>
                    <div className="mt-1 text-sm">{e.message}</div>
                    {e.meta && (
                      <pre className="mt-2 overflow-auto rounded-[8px] bg-black/30 p-2 text-[11px] text-[color:var(--muted)]">
                        {JSON.stringify(e.meta, null, 2)}
                      </pre>
                    )}
                  </div>
                  <div className="shrink-0 text-[11px] text-[color:var(--muted)]">{new Date(e.at).toLocaleTimeString()}</div>
                </div>
              ))}
            </div>
          )}

          {tab === "errors" && (
            <div className="space-y-2">
              {s.errors.length === 0 ? (
                <div className="text-sm text-[color:var(--muted)]">No errors recorded for this session.</div>
              ) : (
                s.errors.map((err) => (
                  <div key={err.id} className={cn("rounded-[10px] border p-3", "border-red-500/25 bg-red-500/10")}>
                    <div className="text-xs text-red-200">{new Date(err.at).toLocaleString()}</div>
                    <div className="mt-2 text-sm">{err.message}</div>
                    {err.code && <div className="mt-2 font-mono text-xs text-red-200/80">{err.code}</div>}
                  </div>
                ))
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
