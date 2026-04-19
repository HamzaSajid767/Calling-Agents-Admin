"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { useStoreEffect } from "@/hooks/useStoreEffect";
import { useProvidersBox, useVoiceBox } from "@/store/selectors";
import { useAppActions } from "@/store/useAppStore";
import type { VoicePipelineConfig } from "@/types/models";

export default function VoicePipelinePage() {
  const actions = useAppActions();
  const voiceBox = useVoiceBox();
  const providersBox = useProvidersBox();
  const [local, setLocal] = useState<VoicePipelineConfig | null>(null);

  useStoreEffect(() => {
    void Promise.all([actions.loadVoicePipeline(), actions.loadProviders()]);
  }, [actions]);

  useEffect(() => {
    if (voiceBox.data) setLocal(voiceBox.data);
  }, [voiceBox.data]);

  const providers = providersBox.data ?? [];
  const stt = providers.filter((p) => p.kind === "stt");
  const tts = providers.filter((p) => p.kind === "tts");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Voice pipeline"
        description="STT/TTS streaming, VAD, tokenizer, and realtime duplex buffering — aligned with LiveKit Agents voice settings."
        right={
          <Button
            disabled={!local}
            onClick={async () => {
              if (!local) return;
              await actions.updateVoicePipeline(local);
            }}
          >
            Save
          </Button>
        }
      />

      <Card title="Configuration" subtitle="All fields route through the global store into `adminApi.updateVoicePipeline`">
        {voiceBox.loadState === "loading" && !local ? (
          <div className="flex items-center gap-2 text-sm text-[color:var(--muted)]">
            <Spinner />
            Loading…
          </div>
        ) : !local ? (
          <div className="text-sm text-[color:var(--muted)]">Failed to load.</div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              <div className="text-sm font-semibold">Speech-to-text</div>
              <div>
                <div className="text-xs text-[color:var(--muted)]">Provider</div>
                <Select
                  className="mt-1"
                  value={local.stt.providerId}
                  onChange={(e) => setLocal({ ...local, stt: { ...local.stt, providerId: e.target.value } })}
                >
                  {stt.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-[color:var(--muted)]">Streaming</div>
                  <Select
                    className="mt-1"
                    value={local.stt.streaming ? "true" : "false"}
                    onChange={(e) => setLocal({ ...local, stt: { ...local.stt, streaming: e.target.value === "true" } })}
                  >
                    <option value="true">On</option>
                    <option value="false">Off</option>
                  </Select>
                </div>
                <div>
                  <div className="text-xs text-[color:var(--muted)]">Interim results</div>
                  <Select
                    className="mt-1"
                    value={local.stt.interimResults ? "true" : "false"}
                    onChange={(e) =>
                      setLocal({ ...local, stt: { ...local.stt, interimResults: e.target.value === "true" } })
                    }
                  >
                    <option value="true">On</option>
                    <option value="false">Off</option>
                  </Select>
                </div>
              </div>
              <div>
                <div className="text-xs text-[color:var(--muted)]">Language</div>
                <Input
                  className="mt-1"
                  value={local.stt.language}
                  onChange={(e) => setLocal({ ...local, stt: { ...local.stt, language: e.target.value } })}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-sm font-semibold">Text-to-speech</div>
              <div>
                <div className="text-xs text-[color:var(--muted)]">Provider</div>
                <Select
                  className="mt-1"
                  value={local.tts.providerId}
                  onChange={(e) => setLocal({ ...local, tts: { ...local.tts, providerId: e.target.value } })}
                >
                  {tts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-[color:var(--muted)]">Streaming</div>
                  <Select
                    className="mt-1"
                    value={local.tts.streaming ? "true" : "false"}
                    onChange={(e) => setLocal({ ...local, tts: { ...local.tts, streaming: e.target.value === "true" } })}
                  >
                    <option value="true">On</option>
                    <option value="false">Off</option>
                  </Select>
                </div>
                <div>
                  <div className="text-xs text-[color:var(--muted)]">Sample rate (Hz)</div>
                  <Input
                    className="mt-1"
                    type="number"
                    value={local.tts.sampleRateHz}
                    onChange={(e) =>
                      setLocal({ ...local, tts: { ...local.tts, sampleRateHz: Number(e.target.value) } })
                    }
                  />
                </div>
              </div>
              <div>
                <div className="text-xs text-[color:var(--muted)]">Voice id</div>
                <Input
                  className="mt-1"
                  value={local.tts.voiceId ?? ""}
                  onChange={(e) => setLocal({ ...local, tts: { ...local.tts, voiceId: e.target.value || undefined } })}
                />
              </div>
            </div>

            <div className="space-y-3 lg:col-span-2">
              <div className="text-sm font-semibold">VAD</div>
              <div className="grid gap-3 md:grid-cols-4">
                <div>
                  <div className="text-xs text-[color:var(--muted)]">Enabled</div>
                  <Select
                    className="mt-1"
                    value={local.vad.enabled ? "true" : "false"}
                    onChange={(e) => setLocal({ ...local, vad: { ...local.vad, enabled: e.target.value === "true" } })}
                  >
                    <option value="true">On</option>
                    <option value="false">Off</option>
                  </Select>
                </div>
                <div>
                  <div className="text-xs text-[color:var(--muted)]">Sensitivity</div>
                  <Input
                    className="mt-1"
                    type="number"
                    step="0.01"
                    min={0}
                    max={1}
                    value={local.vad.sensitivity}
                    onChange={(e) =>
                      setLocal({ ...local, vad: { ...local.vad, sensitivity: Number(e.target.value) } })
                    }
                  />
                </div>
                <div>
                  <div className="text-xs text-[color:var(--muted)]">Prefix padding ms</div>
                  <Input
                    className="mt-1"
                    type="number"
                    value={local.vad.prefixPaddingMs}
                    onChange={(e) =>
                      setLocal({ ...local, vad: { ...local.vad, prefixPaddingMs: Number(e.target.value) } })
                    }
                  />
                </div>
                <div>
                  <div className="text-xs text-[color:var(--muted)]">Silence duration ms</div>
                  <Input
                    className="mt-1"
                    type="number"
                    value={local.vad.silenceDurationMs}
                    onChange={(e) =>
                      setLocal({ ...local, vad: { ...local.vad, silenceDurationMs: Number(e.target.value) } })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-sm font-semibold">Tokenizer</div>
              <div>
                <div className="text-xs text-[color:var(--muted)]">Provider</div>
                <Select
                  className="mt-1"
                  value={local.tokenizer.provider}
                  onChange={(e) =>
                    setLocal({
                      ...local,
                      tokenizer: { ...local.tokenizer, provider: e.target.value as VoicePipelineConfig["tokenizer"]["provider"] },
                    })
                  }
                >
                  <option value="internal">internal</option>
                  <option value="tiktoken">tiktoken</option>
                  <option value="huggingface">huggingface</option>
                </Select>
              </div>
              <div>
                <div className="text-xs text-[color:var(--muted)]">Model</div>
                <Input
                  className="mt-1"
                  value={local.tokenizer.model}
                  onChange={(e) => setLocal({ ...local, tokenizer: { ...local.tokenizer, model: e.target.value } })}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-sm font-semibold">Realtime streaming</div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <div className="text-xs text-[color:var(--muted)]">Enabled</div>
                  <Select
                    className="mt-1"
                    value={local.realtime.enabled ? "true" : "false"}
                    onChange={(e) =>
                      setLocal({ ...local, realtime: { ...local.realtime, enabled: e.target.value === "true" } })
                    }
                  >
                    <option value="true">On</option>
                    <option value="false">Off</option>
                  </Select>
                </div>
                <div>
                  <div className="text-xs text-[color:var(--muted)]">Duplex</div>
                  <Select
                    className="mt-1"
                    value={local.realtime.duplex ? "true" : "false"}
                    onChange={(e) =>
                      setLocal({ ...local, realtime: { ...local.realtime, duplex: e.target.value === "true" } })
                    }
                  >
                    <option value="true">On</option>
                    <option value="false">Off</option>
                  </Select>
                </div>
                <div>
                  <div className="text-xs text-[color:var(--muted)]">Buffer ms</div>
                  <Input
                    className="mt-1"
                    type="number"
                    value={local.realtime.bufferMs}
                    onChange={(e) =>
                      setLocal({ ...local, realtime: { ...local.realtime, bufferMs: Number(e.target.value) } })
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
