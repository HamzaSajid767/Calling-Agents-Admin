export type ID = string;

export type LoadState = "idle" | "loading" | "success" | "error";

export type HealthStatus = "healthy" | "degraded" | "down";

export interface DashboardOverview {
  activeSessions: number;
  activeAgents: number;
  workersOnline: number;
  roomsLive: number;
  errorRate24h: number;
  health: HealthStatus;
  updatedAt: string;
}

export interface TimeSeriesPoint {
  t: string;
  v: number;
}

export interface AgentDefinition {
  id: ID;
  name: string;
  description: string;
  enabled: boolean;
  llmModel: string;
  sttProviderId: ID;
  ttsProviderId: ID;
  toolIds: ID[];
  behavior: {
    temperature: number;
    maxOutputTokens: number;
    instructions: string;
    preemptiveGeneration: boolean;
    interruptionsEnabled: boolean;
  };
  updatedAt: string;
}

export type SessionStatus = "starting" | "live" | "ended" | "error";

export interface AgentSessionSummary {
  id: ID;
  agentId: ID;
  agentName: string;
  status: SessionStatus;
  startedAt: string;
  endedAt?: string;
  roomName: string;
  participantCount: number;
}

export interface TranscriptLine {
  id: ID;
  at: string;
  role: "user" | "assistant" | "system";
  text: string;
  final: boolean;
}

export interface SessionEvent {
  id: ID;
  at: string;
  kind:
    | "lifecycle"
    | "audio"
    | "error"
    | "tool"
    | "turn"
    | "interruption"
    | "realtime"
    | "stt"
    | "tts"
    | "llm";
  message: string;
  meta?: Record<string, string | number | boolean | null>;
}

export interface AgentSessionDetail extends AgentSessionSummary {
  transcript: TranscriptLine[];
  events: SessionEvent[];
  errors: { id: ID; at: string; message: string; code?: string }[];
}

export interface ChatMessage {
  id: ID;
  at: string;
  role: "system" | "user" | "assistant" | "tool";
  content: string;
}

export interface ToolCallLog {
  id: ID;
  at: string;
  name: string;
  argsJson: string;
  outputJson?: string;
  ok: boolean;
}

export interface StreamingLogLine {
  id: ID;
  at: string;
  channel: "llm" | "stt" | "tts" | "realtime";
  chunk: string;
}

export interface ConversationDetail {
  id: ID;
  sessionId: ID;
  title: string;
  messages: ChatMessage[];
  toolCalls: ToolCallLog[];
  streaming: StreamingLogLine[];
}

export type ToolKind = "http" | "function" | "mcp";

export interface ToolDefinition {
  id: ID;
  name: string;
  description: string;
  kind: ToolKind;
  schemaJson: string;
  enabled: boolean;
  assignedAgentIds: ID[];
  updatedAt: string;
}

export type ProviderKind = "llm" | "stt" | "tts" | "realtime" | "avatar";

export interface ProviderIntegration {
  id: ID;
  name: string;
  kind: ProviderKind;
  vendor: string;
  enabled: boolean;
  hasApiKey: boolean;
  region?: string;
  notes?: string;
}

export interface VoicePipelineConfig {
  stt: {
    providerId: ID;
    streaming: boolean;
    interimResults: boolean;
    language: string;
  };
  tts: {
    providerId: ID;
    streaming: boolean;
    sampleRateHz: number;
    voiceId?: string;
  };
  vad: {
    enabled: boolean;
    sensitivity: number;
    prefixPaddingMs: number;
    silenceDurationMs: number;
  };
  tokenizer: {
    provider: "internal" | "tiktoken" | "huggingface";
    model: string;
  };
  realtime: {
    enabled: boolean;
    duplex: boolean;
    bufferMs: number;
  };
}

export type IvrStepType = "say" | "gather" | "branch" | "transfer" | "end";

export interface IvrStep {
  id: ID;
  type: IvrStepType;
  title: string;
  prompt?: string;
  dtmfMap?: Record<string, ID>;
  nextId?: ID | null;
}

export interface IvrFlow {
  id: ID;
  name: string;
  entryStepId: ID;
  steps: IvrStep[];
  updatedAt: string;
}

export interface AmdLog {
  id: ID;
  at: string;
  sessionId: ID;
  category: "human" | "machine" | "unknown" | "fax";
  confidence: number;
}

export interface AmdSettings {
  enabled: boolean;
  minSpeechMs: number;
  maxSilenceMs: number;
  beepSensitivity: number;
}

export interface LiveKitRoom {
  id: ID;
  name: string;
  numParticipants: number;
  createdAt: string;
}

export interface LiveKitParticipant {
  id: ID;
  identity: string;
  kind: "agent" | "user" | "sip" | "unknown";
  audioTracks: number;
  videoTracks: number;
  isSpeaking: boolean;
}

export interface RecordingItem {
  id: ID;
  sessionId: ID;
  createdAt: string;
  durationMs: number;
  sizeBytes: number;
  hasAudio: boolean;
  hasTraces: boolean;
  hasLogs: boolean;
}

export type JobStatus = "queued" | "running" | "completed" | "failed";

export interface WorkerJob {
  id: ID;
  type: "room" | "publisher";
  status: JobStatus;
  startedAt: string;
  endedAt?: string;
  workerId: ID;
  room?: string;
}

export interface WorkerNode {
  id: ID;
  hostname: string;
  online: boolean;
  cpuLoad: number;
  activeJobs: number;
  version: string;
}

export interface OtelLogLine {
  id: ID;
  at: string;
  severity: "debug" | "info" | "warn" | "error";
  scope: string;
  message: string;
}

export interface TraceSpan {
  id: ID;
  name: string;
  start: string;
  end: string;
  status: "ok" | "error";
}

export interface PrometheusSample {
  name: string;
  value: number;
  help: string;
}

export interface UsageRollup {
  period: string;
  promptTokens: number;
  completionTokens: number;
  sttMinutes: number;
  ttsChars: number;
  providerCostUsd: number;
  sessions: number;
  avgSessionMs: number;
}

export type LogSeverity = "error" | "warn" | "info" | "debug";

export interface SystemLogLine {
  id: ID;
  at: string;
  severity: LogSeverity;
  source: string;
  message: string;
}

export interface GlobalSettings {
  livekitUrl: string;
  defaultAgentId: ID;
  featureFlags: Record<string, boolean>;
  retentionDays: number;
  otlpEndpoint?: string;
  prometheusEndpoint?: string;
}
