"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { Textarea } from "@/components/ui/Textarea";
import { useStoreEffect } from "@/hooks/useStoreEffect";
import { useIvrBox } from "@/store/selectors";
import { useAppActions } from "@/store/useAppStore";
import type { IvrFlow, IvrStep, IvrStepType } from "@/types/models";

function newStep(): IvrStep {
  return { id: `st_${Math.random().toString(16).slice(2, 8)}`, type: "say", title: "New step", prompt: "", nextId: null };
}

export default function IvrPage() {
  const box = useIvrBox();
  const actions = useAppActions();
  const [local, setLocal] = useState<IvrFlow | null>(null);

  useStoreEffect(() => {
    void actions.loadIvr();
  }, [actions]);

  useEffect(() => {
    if (box.data) setLocal(structuredClone(box.data));
  }, [box.data]);

  const stepsById = useMemo(() => {
    const m = new Map<string, IvrStep>();
    for (const s of local?.steps ?? []) m.set(s.id, s);
    return m;
  }, [local]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="IVR flow builder"
        description="Structured telephony flows: prompts, DTMF gathers, branching, transfers, and terminal steps."
        right={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => void actions.loadIvr()}>
              Reload
            </Button>
            <Button
              disabled={!local}
              onClick={async () => {
                if (!local) return;
                await actions.saveIvr(local);
              }}
            >
              Save flow
            </Button>
          </div>
        }
      />

      <Card title="Flow metadata" subtitle="Entry step drives the runtime graph">
        {box.loadState === "loading" && !local ? (
          <div className="flex items-center gap-2 text-sm text-[color:var(--muted)]">
            <Spinner />
            Loading…
          </div>
        ) : !local ? (
          <div className="text-sm text-[color:var(--muted)]">No IVR loaded.</div>
        ) : (
          <div className="grid gap-3 md:grid-cols-3">
            <div className="md:col-span-2">
              <div className="text-xs font-semibold text-[color:var(--muted)]">Flow name</div>
              <Input className="mt-1" value={local.name} onChange={(e) => setLocal({ ...local, name: e.target.value })} />
            </div>
            <div>
              <div className="text-xs font-semibold text-[color:var(--muted)]">Entry step</div>
              <Select
                className="mt-1"
                value={local.entryStepId}
                onChange={(e) => setLocal({ ...local, entryStepId: e.target.value })}
              >
                {local.steps.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} ({s.id})
                  </option>
                ))}
              </Select>
            </div>
          </div>
        )}
      </Card>

      {local && (
        <Card
          title="Steps"
          subtitle="Branching uses DTMF maps for gather nodes; transfers reference downstream queues in your telephony layer"
          right={
            <Button
              variant="secondary"
              onClick={() => setLocal({ ...local, steps: [...local.steps, newStep()] })}
            >
              <Plus className="h-4 w-4" />
              Add step
            </Button>
          }
        >
          <div className="space-y-4">
            {local.steps.map((step, idx) => (
              <div key={step.id} className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-white/[0.02] p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="grid flex-1 gap-3 md:grid-cols-3">
                    <div>
                      <div className="text-xs font-semibold text-[color:var(--muted)]">Title</div>
                      <Input
                        className="mt-1"
                        value={step.title}
                        onChange={(e) => {
                          const steps = [...local.steps];
                          steps[idx] = { ...step, title: e.target.value };
                          setLocal({ ...local, steps });
                        }}
                      />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[color:var(--muted)]">Type</div>
                      <Select
                        className="mt-1"
                        value={step.type}
                        onChange={(e) => {
                          const steps = [...local.steps];
                          steps[idx] = { ...step, type: e.target.value as IvrStepType };
                          setLocal({ ...local, steps });
                        }}
                      >
                        <option value="say">say</option>
                        <option value="gather">gather</option>
                        <option value="branch">branch</option>
                        <option value="transfer">transfer</option>
                        <option value="end">end</option>
                      </Select>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[color:var(--muted)]">Next step</div>
                      <Select
                        className="mt-1"
                        value={step.nextId ?? ""}
                        onChange={(e) => {
                          const steps = [...local.steps];
                          const v = e.target.value;
                          steps[idx] = { ...step, nextId: v ? v : null };
                          setLocal({ ...local, steps });
                        }}
                      >
                        <option value="">(none)</option>
                        {local.steps
                          .filter((s) => s.id !== step.id)
                          .map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.title}
                            </option>
                          ))}
                      </Select>
                    </div>
                    <div className="md:col-span-3">
                      <div className="text-xs font-semibold text-[color:var(--muted)]">Prompt / script</div>
                      <Textarea
                        className="mt-1"
                        value={step.prompt ?? ""}
                        onChange={(e) => {
                          const steps = [...local.steps];
                          steps[idx] = { ...step, prompt: e.target.value };
                          setLocal({ ...local, steps });
                        }}
                      />
                    </div>
                    {step.type === "gather" && (
                      <div className="md:col-span-3">
                        <div className="text-xs font-semibold text-[color:var(--muted)]">DTMF map (JSON)</div>
                        <Textarea
                          className="mt-1 font-mono text-xs"
                          value={JSON.stringify(step.dtmfMap ?? {}, null, 2)}
                          onChange={(e) => {
                            try {
                              const parsed = JSON.parse(e.target.value || "{}") as Record<string, string>;
                              const steps = [...local.steps];
                              steps[idx] = { ...step, dtmfMap: parsed };
                              setLocal({ ...local, steps });
                            } catch {
                              // ignore invalid JSON while typing
                            }
                          }}
                        />
                        <div className="mt-2 text-[11px] text-[color:var(--muted)]">
                          Keys are DTMF digits; values must be step ids. Known ids:{" "}
                          {Array.from(stepsById.keys()).join(", ")}
                        </div>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      const steps = local.steps.filter((s) => s.id !== step.id);
                      setLocal({ ...local, steps, entryStepId: steps[0]?.id ?? local.entryStepId });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
