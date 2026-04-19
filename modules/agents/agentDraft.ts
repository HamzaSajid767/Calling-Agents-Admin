import type { AgentDefinition } from "@/types/models";

export function emptyAgentDraft(): Omit<AgentDefinition, "id" | "updatedAt"> {
  return {
    name: "",
    description: "",
    enabled: true,
    llmModel: "gpt-4.1-mini",
    sttProviderId: "pv_deepgram",
    ttsProviderId: "pv_elevenlabs",
    toolIds: [],
    behavior: {
      temperature: 0.4,
      maxOutputTokens: 900,
      instructions: "",
      preemptiveGeneration: true,
      interruptionsEnabled: true,
    },
  };
}
