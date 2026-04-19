import type {
  AgentDefinition,
  AgentSessionDetail,
  AgentSessionSummary,
  AmdLog,
  AmdSettings,
  ConversationDetail,
  DashboardOverview,
  GlobalSettings,
  IvrFlow,
  LiveKitParticipant,
  LiveKitRoom,
  OtelLogLine,
  PrometheusSample,
  ProviderIntegration,
  RecordingItem,
  TimeSeriesPoint,
  ToolDefinition,
  TraceSpan,
  UsageRollup,
  VoicePipelineConfig,
  WorkerJob,
  WorkerNode,
  SystemLogLine,
} from "@/types/models";
import { mockDelay } from "@/services/mock/delay";
import * as seed from "@/services/mock/seed";

/**
 * Admin API facade. Replace internals with real REST/WS when backend exposes it.
 * All reads/writes should go through this module (used exclusively by the global store).
 */
class AdminApi {
  private agents: AgentDefinition[] = seed.seedAgents();
  private sessions: AgentSessionSummary[] = seed.seedSessions();
  private conversations: ConversationDetail[] = seed.seedConversations();
  private tools: ToolDefinition[] = seed.seedTools();
  private providers: ProviderIntegration[] = seed.seedProviders();
  private voice: VoicePipelineConfig = seed.seedVoicePipeline();
  private ivr: IvrFlow = seed.seedIvr();
  private amdLogs: AmdLog[] = seed.seedAmdLogs();
  private amdSettings: AmdSettings = seed.seedAmdSettings();
  private rooms: LiveKitRoom[] = seed.seedRooms();
  private recordings: RecordingItem[] = seed.seedRecordings();
  private workers: WorkerNode[] = seed.seedWorkers();
  private jobs: WorkerJob[] = seed.seedJobs();
  private otel: OtelLogLine[] = seed.seedOtelLogs();
  private traces: TraceSpan[] = seed.seedTraces();
  private prom: PrometheusSample[] = seed.seedPrometheus();
  private usage: UsageRollup[] = seed.seedUsage();
  private logs: SystemLogLine[] = seed.seedSystemLogs();
  private settings: GlobalSettings = seed.seedSettings();

  async getDashboard(): Promise<{ overview: DashboardOverview; series: TimeSeriesPoint[] }> {
    await mockDelay();
    return { overview: seed.seedDashboardOverview(), series: seed.seedSeries() };
  }

  async listAgents(): Promise<AgentDefinition[]> {
    await mockDelay();
    return structuredClone(this.agents);
  }

  async getAgent(id: string): Promise<AgentDefinition | null> {
    await mockDelay();
    return structuredClone(this.agents.find((a) => a.id === id) ?? null);
  }

  async createAgent(input: Omit<AgentDefinition, "id" | "updatedAt">): Promise<AgentDefinition> {
    await mockDelay();
    const agent: AgentDefinition = {
      ...input,
      id: `ag_${Math.random().toString(16).slice(2, 10)}`,
      updatedAt: new Date().toISOString(),
    };
    this.agents = [agent, ...this.agents];
    return structuredClone(agent);
  }

  async updateAgent(id: string, patch: Partial<AgentDefinition>): Promise<AgentDefinition> {
    await mockDelay();
    const idx = this.agents.findIndex((a) => a.id === id);
    if (idx < 0) throw new Error("Agent not found");
    this.agents[idx] = {
      ...this.agents[idx],
      ...patch,
      behavior: patch.behavior ? { ...this.agents[idx].behavior, ...patch.behavior } : this.agents[idx].behavior,
      updatedAt: new Date().toISOString(),
    };
    return structuredClone(this.agents[idx]);
  }

  async deleteAgent(id: string): Promise<void> {
    await mockDelay();
    this.agents = this.agents.filter((a) => a.id !== id);
  }

  async listSessions(): Promise<AgentSessionSummary[]> {
    await mockDelay();
    return structuredClone(this.sessions);
  }

  async getSession(id: string): Promise<AgentSessionDetail> {
    await mockDelay();
    return structuredClone(seed.seedSessionDetail(id));
  }

  async stopSession(id: string): Promise<void> {
    await mockDelay();
    this.sessions = this.sessions.map((s) =>
      s.id === id ? { ...s, status: "ended" as const, endedAt: new Date().toISOString() } : s,
    );
  }

  async listConversations(): Promise<ConversationDetail[]> {
    await mockDelay();
    return structuredClone(this.conversations);
  }

  async getConversation(id: string): Promise<ConversationDetail | null> {
    await mockDelay();
    return structuredClone(this.conversations.find((c) => c.id === id) ?? null);
  }

  async listTools(): Promise<ToolDefinition[]> {
    await mockDelay();
    return structuredClone(this.tools);
  }

  async upsertTool(tool: ToolDefinition): Promise<ToolDefinition> {
    await mockDelay();
    const idx = this.tools.findIndex((t) => t.id === tool.id);
    const next = { ...tool, updatedAt: new Date().toISOString() };
    if (idx >= 0) this.tools[idx] = next;
    else this.tools = [next, ...this.tools];
    return structuredClone(next);
  }

  async deleteTool(id: string): Promise<void> {
    await mockDelay();
    this.tools = this.tools.filter((t) => t.id !== id);
  }

  async assignToolsToAgent(agentId: string, toolIds: string[]): Promise<AgentDefinition> {
    await mockDelay();
    return this.updateAgent(agentId, { toolIds });
  }

  async listProviders(): Promise<ProviderIntegration[]> {
    await mockDelay();
    return structuredClone(this.providers);
  }

  async setProviderEnabled(id: string, enabled: boolean): Promise<ProviderIntegration> {
    await mockDelay();
    const idx = this.providers.findIndex((p) => p.id === id);
    if (idx < 0) throw new Error("Provider not found");
    this.providers[idx] = { ...this.providers[idx], enabled };
    return structuredClone(this.providers[idx]);
  }

  async setProviderApiKey(id: string, present: boolean): Promise<ProviderIntegration> {
    await mockDelay();
    const idx = this.providers.findIndex((p) => p.id === id);
    if (idx < 0) throw new Error("Provider not found");
    this.providers[idx] = { ...this.providers[idx], hasApiKey: present };
    return structuredClone(this.providers[idx]);
  }

  async updateProvider(id: string, patch: Partial<Omit<ProviderIntegration, "id">>): Promise<ProviderIntegration> {
    await mockDelay();
    const idx = this.providers.findIndex((p) => p.id === id);
    if (idx < 0) throw new Error("Provider not found");
    this.providers[idx] = { ...this.providers[idx], ...patch };
    return structuredClone(this.providers[idx]);
  }

  async setToolEnabled(id: string, enabled: boolean): Promise<ToolDefinition> {
    await mockDelay();
    const idx = this.tools.findIndex((t) => t.id === id);
    if (idx < 0) throw new Error("Tool not found");
    this.tools[idx] = { ...this.tools[idx], enabled, updatedAt: new Date().toISOString() };
    return structuredClone(this.tools[idx]);
  }

  async getVoicePipeline(): Promise<VoicePipelineConfig> {
    await mockDelay();
    return structuredClone(this.voice);
  }

  async updateVoicePipeline(patch: Partial<VoicePipelineConfig>): Promise<VoicePipelineConfig> {
    await mockDelay();
    this.voice = {
      ...this.voice,
      ...patch,
      stt: patch.stt ? { ...this.voice.stt, ...patch.stt } : this.voice.stt,
      tts: patch.tts ? { ...this.voice.tts, ...patch.tts } : this.voice.tts,
      vad: patch.vad ? { ...this.voice.vad, ...patch.vad } : this.voice.vad,
      tokenizer: patch.tokenizer ? { ...this.voice.tokenizer, ...patch.tokenizer } : this.voice.tokenizer,
      realtime: patch.realtime ? { ...this.voice.realtime, ...patch.realtime } : this.voice.realtime,
    };
    return structuredClone(this.voice);
  }

  async getIvr(): Promise<IvrFlow> {
    await mockDelay();
    return structuredClone(this.ivr);
  }

  async saveIvr(flow: IvrFlow): Promise<IvrFlow> {
    await mockDelay();
    this.ivr = { ...flow, updatedAt: new Date().toISOString() };
    return structuredClone(this.ivr);
  }

  async listAmdLogs(): Promise<AmdLog[]> {
    await mockDelay();
    return structuredClone(this.amdLogs);
  }

  async getAmdSettings(): Promise<AmdSettings> {
    await mockDelay();
    return structuredClone(this.amdSettings);
  }

  async updateAmdSettings(patch: Partial<AmdSettings>): Promise<AmdSettings> {
    await mockDelay();
    this.amdSettings = { ...this.amdSettings, ...patch };
    return structuredClone(this.amdSettings);
  }

  async listRooms(): Promise<LiveKitRoom[]> {
    await mockDelay();
    return structuredClone(this.rooms);
  }

  async listParticipants(roomId: string): Promise<LiveKitParticipant[]> {
    await mockDelay();
    return structuredClone(seed.seedParticipants(roomId));
  }

  async listRecordings(): Promise<RecordingItem[]> {
    await mockDelay();
    return structuredClone(this.recordings);
  }

  async listWorkers(): Promise<WorkerNode[]> {
    await mockDelay();
    return structuredClone(this.workers);
  }

  async listJobs(): Promise<WorkerJob[]> {
    await mockDelay();
    return structuredClone(this.jobs);
  }

  async listOtelLogs(): Promise<OtelLogLine[]> {
    await mockDelay();
    return structuredClone(this.otel);
  }

  async listTraces(): Promise<TraceSpan[]> {
    await mockDelay();
    return structuredClone(this.traces);
  }

  async listPrometheus(): Promise<PrometheusSample[]> {
    await mockDelay();
    return structuredClone(this.prom);
  }

  async listUsage(): Promise<UsageRollup[]> {
    await mockDelay();
    return structuredClone(this.usage);
  }

  async listSystemLogs(): Promise<SystemLogLine[]> {
    await mockDelay();
    return structuredClone(this.logs);
  }

  async getSettings(): Promise<GlobalSettings> {
    await mockDelay();
    return structuredClone(this.settings);
  }

  async updateSettings(patch: Partial<GlobalSettings>): Promise<GlobalSettings> {
    await mockDelay();
    this.settings = {
      ...this.settings,
      ...patch,
      featureFlags: patch.featureFlags
        ? { ...this.settings.featureFlags, ...patch.featureFlags }
        : this.settings.featureFlags,
    };
    return structuredClone(this.settings);
  }
}

export const adminApi = new AdminApi();
