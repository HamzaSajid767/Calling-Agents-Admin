import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { toast } from "sonner";

import { adminApi } from "@/services/adminApi";
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
  LoadState,
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

type Box<T> = {
  data: T | null;
  loadState: LoadState;
  error: string | null;
};

const idleBox = <T,>(): Box<T> => ({ data: null, loadState: "idle", error: null });

function startBox<T>(prev: Box<T>): Box<T> {
  return { ...prev, loadState: "loading", error: null };
}

function okBox<T>(data: T): Box<T> {
  return { data, loadState: "success", error: null };
}

function errBox<T>(prev: Box<T>, message: string): Box<T> {
  return { ...prev, loadState: "error", error: message };
}

export type AppStore = {
  dashboard: Box<{ overview: DashboardOverview; series: TimeSeriesPoint[] }>;
  agents: Box<AgentDefinition[]>;
  agentDetail: Box<AgentDefinition | null>;
  sessions: Box<AgentSessionSummary[]>;
  sessionDetail: Box<AgentSessionDetail | null>;
  conversations: Box<ConversationDetail[]>;
  conversationDetail: Box<ConversationDetail | null>;
  tools: Box<ToolDefinition[]>;
  providers: Box<ProviderIntegration[]>;
  voice: Box<VoicePipelineConfig>;
  ivr: Box<IvrFlow>;
  amdLogs: Box<AmdLog[]>;
  amdSettings: Box<AmdSettings>;
  rooms: Box<LiveKitRoom[]>;
  participants: Box<LiveKitParticipant[]>;
  selectedRoomId: string | null;
  recordings: Box<RecordingItem[]>;
  workers: Box<WorkerNode[]>;
  jobs: Box<WorkerJob[]>;
  otelLogs: Box<OtelLogLine[]>;
  traces: Box<TraceSpan[]>;
  prom: Box<PrometheusSample[]>;
  usage: Box<UsageRollup[]>;
  systemLogs: Box<SystemLogLine[]>;
  settings: Box<GlobalSettings>;

  actions: {
    loadDashboard: () => Promise<void>;
    loadAgents: () => Promise<void>;
    loadAgent: (id: string) => Promise<void>;
    createAgent: (input: Omit<AgentDefinition, "id" | "updatedAt">) => Promise<void>;
    updateAgent: (id: string, patch: Partial<AgentDefinition>) => Promise<void>;
    deleteAgent: (id: string) => Promise<void>;

    loadSessions: () => Promise<void>;
    loadSession: (id: string) => Promise<void>;
    stopSession: (id: string) => Promise<void>;

    loadConversations: () => Promise<void>;
    loadConversation: (id: string) => Promise<void>;

    loadTools: () => Promise<void>;
    upsertTool: (tool: ToolDefinition) => Promise<void>;
    deleteTool: (id: string) => Promise<void>;
    setToolEnabled: (id: string, enabled: boolean) => Promise<void>;
    assignToolsToAgent: (agentId: string, toolIds: string[]) => Promise<void>;

    loadProviders: () => Promise<void>;
    setProviderEnabled: (id: string, enabled: boolean) => Promise<void>;
    setProviderApiKey: (id: string, present: boolean) => Promise<void>;
    updateProvider: (id: string, patch: Partial<Omit<ProviderIntegration, "id">>) => Promise<void>;

    loadVoicePipeline: () => Promise<void>;
    updateVoicePipeline: (patch: Partial<VoicePipelineConfig>) => Promise<void>;

    loadIvr: () => Promise<void>;
    saveIvr: (flow: IvrFlow) => Promise<void>;

    loadAmdLogs: () => Promise<void>;
    loadAmdSettings: () => Promise<void>;
    updateAmdSettings: (patch: Partial<AmdSettings>) => Promise<void>;

    loadRooms: () => Promise<void>;
    selectRoom: (roomId: string | null) => void;
    loadParticipants: (roomId: string) => Promise<void>;

    loadRecordings: () => Promise<void>;

    loadWorkers: () => Promise<void>;
    loadJobs: () => Promise<void>;

    loadTelemetry: () => Promise<void>;
    loadUsage: () => Promise<void>;
    loadSystemLogs: () => Promise<void>;

    loadSettings: () => Promise<void>;
    updateSettings: (patch: Partial<GlobalSettings>) => Promise<void>;
  };
};

export const useAppStore = create<AppStore>()((set, get) => ({
  dashboard: idleBox(),
  agents: idleBox(),
  agentDetail: idleBox(),
  sessions: idleBox(),
  sessionDetail: idleBox(),
  conversations: idleBox(),
  conversationDetail: idleBox(),
  tools: idleBox(),
  providers: idleBox(),
  voice: idleBox(),
  ivr: idleBox(),
  amdLogs: idleBox(),
  amdSettings: idleBox(),
  rooms: idleBox(),
  participants: idleBox(),
  selectedRoomId: null,
  recordings: idleBox(),
  workers: idleBox(),
  jobs: idleBox(),
  otelLogs: idleBox(),
  traces: idleBox(),
  prom: idleBox(),
  usage: idleBox(),
  systemLogs: idleBox(),
  settings: idleBox(),

  actions: {
    loadDashboard: async () => {
      set((s) => ({ dashboard: startBox(s.dashboard) }));
      try {
        const data = await adminApi.getDashboard();
        set({ dashboard: okBox(data) });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load dashboard";
        set((s) => ({ dashboard: errBox(s.dashboard, msg) }));
        toast.error(msg);
      }
    },

    loadAgents: async () => {
      set((s) => ({ agents: startBox(s.agents) }));
      try {
        const data = await adminApi.listAgents();
        set({ agents: okBox(data) });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load agents";
        set((s) => ({ agents: errBox(s.agents, msg) }));
        toast.error(msg);
      }
    },

    loadAgent: async (id: string) => {
      set((s) => ({ agentDetail: startBox(s.agentDetail) }));
      try {
        const data = await adminApi.getAgent(id);
        set({ agentDetail: okBox(data) });
        if (!data) toast.message("Agent not found");
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load agent";
        set((s) => ({ agentDetail: errBox(s.agentDetail, msg) }));
        toast.error(msg);
      }
    },

    createAgent: async (input) => {
      try {
        const created = await adminApi.createAgent(input);
        toast.success("Agent created");
        await get().actions.loadAgents();
        set({ agentDetail: okBox(created) });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to create agent";
        toast.error(msg);
      }
    },

    updateAgent: async (id, patch) => {
      try {
        const updated = await adminApi.updateAgent(id, patch);
        toast.success("Agent updated");
        await get().actions.loadAgents();
        set({ agentDetail: okBox(updated) });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to update agent";
        toast.error(msg);
      }
    },

    deleteAgent: async (id) => {
      try {
        await adminApi.deleteAgent(id);
        toast.success("Agent deleted");
        await get().actions.loadAgents();
        set({ agentDetail: okBox(null) });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to delete agent";
        toast.error(msg);
      }
    },

    loadSessions: async () => {
      set((s) => ({ sessions: startBox(s.sessions) }));
      try {
        const data = await adminApi.listSessions();
        set({ sessions: okBox(data) });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load sessions";
        set((s) => ({ sessions: errBox(s.sessions, msg) }));
        toast.error(msg);
      }
    },

    loadSession: async (id: string) => {
      set((s) => ({ sessionDetail: startBox(s.sessionDetail) }));
      try {
        const data = await adminApi.getSession(id);
        set({ sessionDetail: okBox(data) });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load session";
        set((s) => ({ sessionDetail: errBox(s.sessionDetail, msg) }));
        toast.error(msg);
      }
    },

    stopSession: async (id: string) => {
      try {
        await adminApi.stopSession(id);
        toast.success("Session stop requested");
        await get().actions.loadSessions();
        const detail = get().sessionDetail.data;
        if (detail?.id === id) await get().actions.loadSession(id);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to stop session";
        toast.error(msg);
      }
    },

    loadConversations: async () => {
      set((s) => ({ conversations: startBox(s.conversations) }));
      try {
        const data = await adminApi.listConversations();
        set({ conversations: okBox(data) });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load conversations";
        set((s) => ({ conversations: errBox(s.conversations, msg) }));
        toast.error(msg);
      }
    },

    loadConversation: async (id: string) => {
      set((s) => ({ conversationDetail: startBox(s.conversationDetail) }));
      try {
        const data = await adminApi.getConversation(id);
        set({ conversationDetail: okBox(data) });
        if (!data) toast.message("Conversation not found");
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load conversation";
        set((s) => ({ conversationDetail: errBox(s.conversationDetail, msg) }));
        toast.error(msg);
      }
    },

    loadTools: async () => {
      set((s) => ({ tools: startBox(s.tools) }));
      try {
        const data = await adminApi.listTools();
        set({ tools: okBox(data) });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load tools";
        set((s) => ({ tools: errBox(s.tools, msg) }));
        toast.error(msg);
      }
    },

    upsertTool: async (tool) => {
      try {
        await adminApi.upsertTool(tool);
        toast.success("Tool saved");
        await get().actions.loadTools();
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to save tool";
        toast.error(msg);
      }
    },

    deleteTool: async (id: string) => {
      try {
        await adminApi.deleteTool(id);
        toast.success("Tool deleted");
        await get().actions.loadTools();
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to delete tool";
        toast.error(msg);
      }
    },

    setToolEnabled: async (id, enabled) => {
      try {
        await adminApi.setToolEnabled(id, enabled);
        toast.success(`Tool ${enabled ? "enabled" : "disabled"}`);
        await get().actions.loadTools();
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to update tool";
        toast.error(msg);
      }
    },

    assignToolsToAgent: async (agentId, toolIds) => {
      try {
        await adminApi.assignToolsToAgent(agentId, toolIds);
        toast.success("Tools assigned");
        await get().actions.loadAgents();
        await get().actions.loadAgent(agentId);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to assign tools";
        toast.error(msg);
      }
    },

    loadProviders: async () => {
      set((s) => ({ providers: startBox(s.providers) }));
      try {
        const data = await adminApi.listProviders();
        set({ providers: okBox(data) });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load providers";
        set((s) => ({ providers: errBox(s.providers, msg) }));
        toast.error(msg);
      }
    },

    setProviderEnabled: async (id, enabled) => {
      try {
        await adminApi.setProviderEnabled(id, enabled);
        toast.success(`Provider ${enabled ? "enabled" : "disabled"}`);
        await get().actions.loadProviders();
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to update provider";
        toast.error(msg);
      }
    },

    setProviderApiKey: async (id, present) => {
      try {
        await adminApi.setProviderApiKey(id, present);
        toast.success("API key state updated (mock)");
        await get().actions.loadProviders();
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to update API key";
        toast.error(msg);
      }
    },

    updateProvider: async (id, patch) => {
      try {
        await adminApi.updateProvider(id, patch);
        toast.success("Provider configuration saved");
        await get().actions.loadProviders();
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to update provider";
        toast.error(msg);
      }
    },

    loadVoicePipeline: async () => {
      set((s) => ({ voice: startBox(s.voice) }));
      try {
        const data = await adminApi.getVoicePipeline();
        set({ voice: okBox(data) });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load voice pipeline";
        set((s) => ({ voice: errBox(s.voice, msg) }));
        toast.error(msg);
      }
    },

    updateVoicePipeline: async (patch) => {
      try {
        const data = await adminApi.updateVoicePipeline(patch);
        set({ voice: okBox(data) });
        toast.success("Voice pipeline updated");
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to update voice pipeline";
        toast.error(msg);
      }
    },

    loadIvr: async () => {
      set((s) => ({ ivr: startBox(s.ivr) }));
      try {
        const data = await adminApi.getIvr();
        set({ ivr: okBox(data) });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load IVR";
        set((s) => ({ ivr: errBox(s.ivr, msg) }));
        toast.error(msg);
      }
    },

    saveIvr: async (flow) => {
      try {
        const data = await adminApi.saveIvr(flow);
        set({ ivr: okBox(data) });
        toast.success("IVR flow saved");
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to save IVR";
        toast.error(msg);
      }
    },

    loadAmdLogs: async () => {
      set((s) => ({ amdLogs: startBox(s.amdLogs) }));
      try {
        const data = await adminApi.listAmdLogs();
        set({ amdLogs: okBox(data) });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load AMD logs";
        set((s) => ({ amdLogs: errBox(s.amdLogs, msg) }));
        toast.error(msg);
      }
    },

    loadAmdSettings: async () => {
      set((s) => ({ amdSettings: startBox(s.amdSettings) }));
      try {
        const data = await adminApi.getAmdSettings();
        set({ amdSettings: okBox(data) });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load AMD settings";
        set((s) => ({ amdSettings: errBox(s.amdSettings, msg) }));
        toast.error(msg);
      }
    },

    updateAmdSettings: async (patch) => {
      try {
        const data = await adminApi.updateAmdSettings(patch);
        set({ amdSettings: okBox(data) });
        toast.success("AMD settings updated");
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to update AMD settings";
        toast.error(msg);
      }
    },

    loadRooms: async () => {
      set((s) => ({ rooms: startBox(s.rooms) }));
      try {
        const data = await adminApi.listRooms();
        set({ rooms: okBox(data) });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load rooms";
        set((s) => ({ rooms: errBox(s.rooms, msg) }));
        toast.error(msg);
      }
    },

    selectRoom: (roomId) => set({ selectedRoomId: roomId }),

    loadParticipants: async (roomId: string) => {
      set((s) => ({ participants: startBox(s.participants) }));
      try {
        const data = await adminApi.listParticipants(roomId);
        set({ participants: okBox(data) });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load participants";
        set((s) => ({ participants: errBox(s.participants, msg) }));
        toast.error(msg);
      }
    },

    loadRecordings: async () => {
      set((s) => ({ recordings: startBox(s.recordings) }));
      try {
        const data = await adminApi.listRecordings();
        set({ recordings: okBox(data) });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load recordings";
        set((s) => ({ recordings: errBox(s.recordings, msg) }));
        toast.error(msg);
      }
    },

    loadWorkers: async () => {
      set((s) => ({ workers: startBox(s.workers) }));
      try {
        const data = await adminApi.listWorkers();
        set({ workers: okBox(data) });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load workers";
        set((s) => ({ workers: errBox(s.workers, msg) }));
        toast.error(msg);
      }
    },

    loadJobs: async () => {
      set((s) => ({ jobs: startBox(s.jobs) }));
      try {
        const data = await adminApi.listJobs();
        set({ jobs: okBox(data) });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load jobs";
        set((s) => ({ jobs: errBox(s.jobs, msg) }));
        toast.error(msg);
      }
    },

    loadTelemetry: async () => {
      set((s) => ({
        otelLogs: startBox(s.otelLogs),
        traces: startBox(s.traces),
        prom: startBox(s.prom),
      }));
      try {
        const [otelLogs, traces, prom] = await Promise.all([
          adminApi.listOtelLogs(),
          adminApi.listTraces(),
          adminApi.listPrometheus(),
        ]);
        set({
          otelLogs: okBox(otelLogs),
          traces: okBox(traces),
          prom: okBox(prom),
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load telemetry";
        set((s) => ({
          otelLogs: errBox(s.otelLogs, msg),
          traces: errBox(s.traces, msg),
          prom: errBox(s.prom, msg),
        }));
        toast.error(msg);
      }
    },

    loadUsage: async () => {
      set((s) => ({ usage: startBox(s.usage) }));
      try {
        const data = await adminApi.listUsage();
        set({ usage: okBox(data) });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load usage";
        set((s) => ({ usage: errBox(s.usage, msg) }));
        toast.error(msg);
      }
    },

    loadSystemLogs: async () => {
      set((s) => ({ systemLogs: startBox(s.systemLogs) }));
      try {
        const data = await adminApi.listSystemLogs();
        set({ systemLogs: okBox(data) });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load logs";
        set((s) => ({ systemLogs: errBox(s.systemLogs, msg) }));
        toast.error(msg);
      }
    },

    loadSettings: async () => {
      set((s) => ({ settings: startBox(s.settings) }));
      try {
        const data = await adminApi.getSettings();
        set({ settings: okBox(data) });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load settings";
        set((s) => ({ settings: errBox(s.settings, msg) }));
        toast.error(msg);
      }
    },

    updateSettings: async (patch) => {
      try {
        const data = await adminApi.updateSettings(patch);
        set({ settings: okBox(data) });
        toast.success("Settings saved");
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to save settings";
        toast.error(msg);
      }
    },
  },
}));

export const useAppActions = () => useAppStore(useShallow((s) => s.actions));
