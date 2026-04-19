"use client";

import type { AgentDefinition, ProviderIntegration, ToolDefinition } from "@/types/models";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

export function AgentForm({
  value,
  onChange,
  providers,
  tools,
}: {
  value: AgentDefinition | Omit<AgentDefinition, "id" | "updatedAt">;
  onChange: (next: AgentDefinition | Omit<AgentDefinition, "id" | "updatedAt">) => void;
  providers: ProviderIntegration[];
  tools: ToolDefinition[];
}) {
  const llmProviders = providers.filter((p) => p.kind === "llm");
  const sttProviders = providers.filter((p) => p.kind === "stt");
  const ttsProviders = providers.filter((p) => p.kind === "tts");

  const patch = (patch: Partial<AgentDefinition>) => onChange({ ...(value as any), ...patch });

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="md:col-span-2">
        <div className="text-xs font-semibold text-[color:var(--muted)]">Name</div>
        <Input className="mt-1" value={value.name} onChange={(e) => patch({ name: e.target.value })} />
      </div>
      <div className="md:col-span-2">
        <div className="text-xs font-semibold text-[color:var(--muted)]">Description</div>
        <Input className="mt-1" value={value.description} onChange={(e) => patch({ description: e.target.value })} />
      </div>

      <div>
        <div className="text-xs font-semibold text-[color:var(--muted)]">LLM model</div>
        <Input className="mt-1" value={value.llmModel} onChange={(e) => patch({ llmModel: e.target.value })} />
        <div className="mt-1 text-[11px] text-[color:var(--muted)]">Provider is selected implicitly by model routing in the control plane.</div>
      </div>

      <div>
        <div className="text-xs font-semibold text-[color:var(--muted)]">Enabled</div>
        <Select
          className="mt-1"
          value={value.enabled ? "true" : "false"}
          onChange={(e) => patch({ enabled: e.target.value === "true" })}
        >
          <option value="true">Enabled</option>
          <option value="false">Disabled</option>
        </Select>
      </div>

      <div>
        <div className="text-xs font-semibold text-[color:var(--muted)]">STT provider</div>
        <Select
          className="mt-1"
          value={value.sttProviderId}
          onChange={(e) => patch({ sttProviderId: e.target.value })}
        >
          {sttProviders.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <div className="text-xs font-semibold text-[color:var(--muted)]">TTS provider</div>
        <Select
          className="mt-1"
          value={value.ttsProviderId}
          onChange={(e) => patch({ ttsProviderId: e.target.value })}
        >
          {ttsProviders.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="md:col-span-2">
        <div className="text-xs font-semibold text-[color:var(--muted)]">Tools</div>
        <div className="mt-2 grid gap-2 md:grid-cols-2">
          {tools.map((t) => {
            const checked = value.toolIds.includes(t.id);
            return (
              <label key={t.id} className="flex items-start gap-2 rounded-[10px] border border-[color:var(--border)] bg-white/[0.02] p-3 text-sm">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    const next = checked ? value.toolIds.filter((x) => x !== t.id) : [...value.toolIds, t.id];
                    patch({ toolIds: next });
                  }}
                />
                <span>
                  <span className="font-medium">{t.name}</span>
                  <span className="mt-1 block text-xs text-[color:var(--muted)]">{t.description}</span>
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div>
        <div className="text-xs font-semibold text-[color:var(--muted)]">Temperature</div>
        <Input
          className="mt-1"
          type="number"
          step="0.05"
          min={0}
          max={2}
          value={value.behavior.temperature}
          onChange={(e) => patch({ behavior: { ...value.behavior, temperature: Number(e.target.value) } })}
        />
      </div>
      <div>
        <div className="text-xs font-semibold text-[color:var(--muted)]">Max output tokens</div>
        <Input
          className="mt-1"
          type="number"
          min={1}
          value={value.behavior.maxOutputTokens}
          onChange={(e) => patch({ behavior: { ...value.behavior, maxOutputTokens: Number(e.target.value) } })}
        />
      </div>

      <div className="md:col-span-2">
        <div className="text-xs font-semibold text-[color:var(--muted)]">Instructions</div>
        <Textarea
          className="mt-1"
          value={value.behavior.instructions}
          onChange={(e) => patch({ behavior: { ...value.behavior, instructions: e.target.value } })}
        />
      </div>

      <div>
        <div className="text-xs font-semibold text-[color:var(--muted)]">Preemptive generation</div>
        <Select
          className="mt-1"
          value={value.behavior.preemptiveGeneration ? "true" : "false"}
          onChange={(e) => patch({ behavior: { ...value.behavior, preemptiveGeneration: e.target.value === "true" } })}
        >
          <option value="true">On</option>
          <option value="false">Off</option>
        </Select>
      </div>
      <div>
        <div className="text-xs font-semibold text-[color:var(--muted)]">Interruptions</div>
        <Select
          className="mt-1"
          value={value.behavior.interruptionsEnabled ? "true" : "false"}
          onChange={(e) => patch({ behavior: { ...value.behavior, interruptionsEnabled: e.target.value === "true" } })}
        >
          <option value="true">Enabled</option>
          <option value="false">Disabled</option>
        </Select>
      </div>

      {llmProviders.length > 0 && (
        <div className="md:col-span-2 rounded-[10px] border border-[color:var(--border)] bg-white/[0.02] p-3 text-xs text-[color:var(--muted)]">
          LLM integrations available: {llmProviders.map((p) => p.name).join(", ")}. Model strings are validated server-side in a real deployment.
        </div>
      )}
    </div>
  );
}
