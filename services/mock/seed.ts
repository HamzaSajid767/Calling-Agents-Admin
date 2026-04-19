import type {
  AgentDefinition,
  AgentSessionDetail,
  AgentSessionSummary,
  AmdLog,
  AmdSettings,
  ChatMessage,
  ConversationDetail,
  DashboardOverview,
  GlobalSettings,
  IvrFlow,
  IvrStep,
  LiveKitParticipant,
  LiveKitRoom,
  OtelLogLine,
  PrometheusSample,
  ProviderIntegration,
  RecordingItem,
  SessionEvent,
  StreamingLogLine,
  SystemLogLine,
  TimeSeriesPoint,
  ToolCallLog,
  ToolDefinition,
  UsageRollup,
  VoicePipelineConfig,
  WorkerJob,
  WorkerNode,
  TraceSpan,
} from "@/types/models";

const now = () => new Date().toISOString();

export const seedDashboardOverview = (): DashboardOverview => ({
  activeSessions: 18,
  activeAgents: 6,
  workersOnline: 4,
  roomsLive: 12,
  errorRate24h: 0.008,
  health: "healthy",
  updatedAt: now(),
});

export const seedSeries = (): TimeSeriesPoint[] =>
  Array.from({ length: 24 }).map((_, i) => ({
    t: new Date(Date.now() - (23 - i) * 3600_000).toISOString(),
    v: Math.round(30 + Math.random() * 40 + (i > 18 ? 15 : 0)),
  }));

export const seedAgents = (): AgentDefinition[] => [
  {
    id: "ag_voice_ops",
    name: "Voice Ops Concierge",
    description: "Primary inbound triage agent",
    enabled: true,
    llmModel: "gpt-4.1-mini",
    sttProviderId: "pv_deepgram",
    ttsProviderId: "pv_elevenlabs",
    toolIds: ["tl_lookup", "tl_schedule"],
    behavior: {
      temperature: 0.3,
      maxOutputTokens: 800,
      instructions: "Be concise, confirm intent, escalate when uncertain.",
      preemptiveGeneration: true,
      interruptionsEnabled: true,
    },
    updatedAt: now(),
  },
  {
    id: "ag_sales_qa",
    name: "Sales Qualifier",
    description: "Outbound qualification",
    enabled: true,
    llmModel: "claude-3-5-sonnet",
    sttProviderId: "pv_assemblyai",
    ttsProviderId: "pv_cartesia",
    toolIds: ["tl_crm"],
    behavior: {
      temperature: 0.6,
      maxOutputTokens: 1200,
      instructions: "Ask qualification questions, capture answers.",
      preemptiveGeneration: false,
      interruptionsEnabled: true,
    },
    updatedAt: now(),
  },
];

export const seedSessions = (): AgentSessionSummary[] => [
  {
    id: "ss_1001",
    agentId: "ag_voice_ops",
    agentName: "Voice Ops Concierge",
    status: "live",
    startedAt: new Date(Date.now() - 120_000).toISOString(),
    roomName: "room_support_441",
    participantCount: 2,
  },
  {
    id: "ss_1000",
    agentId: "ag_sales_qa",
    agentName: "Sales Qualifier",
    status: "ended",
    startedAt: new Date(Date.now() - 3_600_000).toISOString(),
    endedAt: new Date(Date.now() - 3_402_000).toISOString(),
    roomName: "room_outbound_882",
    participantCount: 1,
  },
];

export const seedSessionDetail = (id: string): AgentSessionDetail => {
  const base = seedSessions().find((s) => s.id === id) ?? seedSessions()[0];
  const transcript: AgentSessionDetail["transcript"] = [
    {
      id: "tr_1",
      at: base.startedAt,
      role: "assistant",
      text: "Hi — how can I help today?",
      final: true,
    },
    {
      id: "tr_2",
      at: new Date(new Date(base.startedAt).getTime() + 8000).toISOString(),
      role: "user",
      text: "I need to reschedule my appointment.",
      final: true,
    },
  ];
  const events: SessionEvent[] = [
    {
      id: "ev_1",
      at: base.startedAt,
      kind: "lifecycle",
      message: "session.started",
    },
    {
      id: "ev_2",
      at: new Date(new Date(base.startedAt).getTime() + 1500).toISOString(),
      kind: "stt",
      message: "partial transcript",
      meta: { confidence: 0.92 },
    },
    {
      id: "ev_3",
      at: new Date(new Date(base.startedAt).getTime() + 2200).toISOString(),
      kind: "llm",
      message: "stream.token",
    },
    {
      id: "ev_4",
      at: new Date(new Date(base.startedAt).getTime() + 2600).toISOString(),
      kind: "tts",
      message: "audio.chunk",
    },
    {
      id: "ev_5",
      at: new Date(new Date(base.startedAt).getTime() + 9000).toISOString(),
      kind: "turn",
      message: "endpoint.final",
    },
  ];
  return {
    ...base,
    id: base.id === id ? base.id : id,
    transcript,
    events,
    errors: [],
  };
};

export const seedConversations = (): ConversationDetail[] => [
  {
    id: "cv_1",
    sessionId: "ss_1000",
    title: "Outbound qualification",
    messages: [
      { id: "m1", at: now(), role: "assistant", content: "Hi, is now a good time?" },
      { id: "m2", at: now(), role: "user", content: "Sure — go ahead." },
    ] satisfies ChatMessage[],
    toolCalls: [
      {
        id: "tc1",
        at: now(),
        name: "crm_lookup",
        argsJson: JSON.stringify({ email: "user@example.com" }),
        outputJson: JSON.stringify({ tier: "pro" }),
        ok: true,
      },
    ] satisfies ToolCallLog[],
    streaming: [
      { id: "sl1", at: now(), channel: "llm", chunk: "Thanks " },
      { id: "sl2", at: now(), channel: "llm", chunk: "for confirming." },
    ] satisfies StreamingLogLine[],
  },
];

export const seedTools = (): ToolDefinition[] => [
  {
    id: "tl_lookup",
    name: "account_lookup",
    description: "Fetch account by phone",
    kind: "function",
    schemaJson: JSON.stringify({ type: "object", properties: { phone: { type: "string" } } }),
    enabled: true,
    assignedAgentIds: ["ag_voice_ops"],
    updatedAt: now(),
  },
  {
    id: "tl_schedule",
    name: "schedule_callback",
    description: "Book a callback window",
    kind: "http",
    schemaJson: JSON.stringify({ type: "object" }),
    enabled: true,
    assignedAgentIds: ["ag_voice_ops"],
    updatedAt: now(),
  },
  {
    id: "tl_crm",
    name: "crm_push",
    description: "Push lead to CRM",
    kind: "mcp",
    schemaJson: JSON.stringify({ type: "object" }),
    enabled: true,
    assignedAgentIds: ["ag_sales_qa"],
    updatedAt: now(),
  },
];

export const seedProviders = (): ProviderIntegration[] => [
  {
    id: "pv_openai",
    name: "OpenAI",
    kind: "llm",
    vendor: "openai",
    enabled: true,
    hasApiKey: true,
  },
  {
    id: "pv_deepgram",
    name: "Deepgram",
    kind: "stt",
    vendor: "deepgram",
    enabled: true,
    hasApiKey: true,
  },
  {
    id: "pv_elevenlabs",
    name: "ElevenLabs",
    kind: "tts",
    vendor: "elevenlabs",
    enabled: true,
    hasApiKey: true,
  },
  {
    id: "pv_assemblyai",
    name: "AssemblyAI",
    kind: "stt",
    vendor: "assemblyai",
    enabled: true,
    hasApiKey: true,
  },
  {
    id: "pv_cartesia",
    name: "Cartesia",
    kind: "tts",
    vendor: "cartesia",
    enabled: false,
    hasApiKey: false,
  },
  {
    id: "pv_google_rt",
    name: "Google Realtime",
    kind: "realtime",
    vendor: "google",
    enabled: true,
    hasApiKey: true,
    region: "us-central1",
  },
];

export const seedVoicePipeline = (): VoicePipelineConfig => ({
  stt: {
    providerId: "pv_deepgram",
    streaming: true,
    interimResults: true,
    language: "en-US",
  },
  tts: {
    providerId: "pv_elevenlabs",
    streaming: true,
    sampleRateHz: 24000,
    voiceId: "voice_default",
  },
  vad: {
    enabled: true,
    sensitivity: 0.62,
    prefixPaddingMs: 300,
    silenceDurationMs: 480,
  },
  tokenizer: {
    provider: "tiktoken",
    model: "gpt-4.1-mini",
  },
  realtime: {
    enabled: true,
    duplex: true,
    bufferMs: 120,
  },
});

export const seedIvr = (): IvrFlow => {
  const steps: IvrStep[] = [
    { id: "st_entry", type: "say", title: "Greeting", prompt: "Thanks for calling ACME." },
    {
      id: "st_menu",
      type: "gather",
      title: "Main menu",
      prompt: "Press 1 for sales, 2 for support.",
      dtmfMap: { "1": "st_sales", "2": "st_support" },
    },
    { id: "st_sales", type: "transfer", title: "Sales queue", nextId: "st_end" },
    { id: "st_support", type: "transfer", title: "Support queue", nextId: "st_end" },
    { id: "st_end", type: "end", title: "Hang up" },
  ];
  return { id: "ivr_main", name: "Main line", entryStepId: "st_entry", steps, updatedAt: now() };
};

export const seedAmdLogs = (): AmdLog[] => [
  {
    id: "amd_1",
    at: now(),
    sessionId: "ss_1000",
    category: "human",
    confidence: 0.91,
  },
  {
    id: "amd_2",
    at: now(),
    sessionId: "ss_0999",
    category: "machine",
    confidence: 0.86,
  },
];

export const seedAmdSettings = (): AmdSettings => ({
  enabled: true,
  minSpeechMs: 1200,
  maxSilenceMs: 2200,
  beepSensitivity: 0.55,
});

export const seedRooms = (): LiveKitRoom[] => [
  { id: "rm_1", name: "room_support_441", numParticipants: 2, createdAt: now() },
  { id: "rm_2", name: "room_outbound_882", numParticipants: 1, createdAt: now() },
];

export const seedParticipants = (roomId: string): LiveKitParticipant[] => [
  {
    id: "p1",
    identity: "sip:+15551234567",
    kind: "sip",
    audioTracks: 1,
    videoTracks: 0,
    isSpeaking: true,
  },
  {
    id: "p2",
    identity: "agent:voice_ops",
    kind: "agent",
    audioTracks: 1,
    videoTracks: 0,
    isSpeaking: false,
  },
].map((p, i) => ({ ...p, id: `${roomId}_p${i}` }));

export const seedRecordings = (): RecordingItem[] => [
  {
    id: "rec_1",
    sessionId: "ss_1000",
    createdAt: now(),
    durationMs: 198_000,
    sizeBytes: 12_400_000,
    hasAudio: true,
    hasTraces: true,
    hasLogs: true,
  },
];

export const seedWorkers = (): WorkerNode[] => [
  {
    id: "wk_1",
    hostname: "agent-worker-7f9c",
    online: true,
    cpuLoad: 0.42,
    activeJobs: 3,
    version: "1.5.4",
  },
  {
    id: "wk_2",
    hostname: "agent-worker-2aab",
    online: true,
    cpuLoad: 0.18,
    activeJobs: 1,
    version: "1.5.4",
  },
];

export const seedJobs = (): WorkerJob[] => [
  {
    id: "jb_1",
    type: "room",
    status: "running",
    startedAt: new Date(Date.now() - 60_000).toISOString(),
    workerId: "wk_1",
    room: "room_support_441",
  },
  {
    id: "jb_0",
    type: "publisher",
    status: "completed",
    startedAt: new Date(Date.now() - 3_600_000).toISOString(),
    endedAt: new Date(Date.now() - 3_558_000).toISOString(),
    workerId: "wk_2",
  },
];

export const seedOtelLogs = (): OtelLogLine[] => [
  { id: "ol1", at: now(), severity: "info", scope: "livekit.agents", message: "worker heartbeat ok" },
  { id: "ol2", at: now(), severity: "warn", scope: "livekit.agents.voice", message: "endpointing delayed" },
];

export const seedTraces = (): TraceSpan[] => [
  {
    id: "sp1",
    name: "AgentSession.start",
    start: new Date(Date.now() - 5000).toISOString(),
    end: new Date(Date.now() - 4800).toISOString(),
    status: "ok",
  },
];

export const seedPrometheus = (): PrometheusSample[] => [
  { name: "lk_agent_jobs_active", value: 4, help: "Active agent jobs" },
  { name: "lk_agent_stt_latency_ms_p95", value: 210, help: "STT latency p95" },
  { name: "lk_agent_tts_latency_ms_p95", value: 180, help: "TTS latency p95" },
];

export const seedUsage = (): UsageRollup[] =>
  Array.from({ length: 14 }).map((_, i) => ({
    period: new Date(Date.now() - (13 - i) * 86400_000).toISOString().slice(0, 10),
    promptTokens: 120_000 + i * 9000,
    completionTokens: 40_000 + i * 3000,
    sttMinutes: 220 + i * 12,
    ttsChars: 900_000 + i * 50_000,
    providerCostUsd: 42 + i * 3.1,
    sessions: 80 + i * 5,
    avgSessionMs: 240_000 + i * 2000,
  }));

export const seedSystemLogs = (): SystemLogLine[] => [
  { id: "lg1", at: now(), severity: "error", source: "worker", message: "AssignmentTimeoutError: job not accepted in time" },
  { id: "lg2", at: now(), severity: "warn", source: "stt", message: "Provider fallback engaged: deepgram -> assemblyai" },
];

export const seedSettings = (): GlobalSettings => ({
  livekitUrl: "wss://example.livekit.cloud",
  defaultAgentId: "ag_voice_ops",
  featureFlags: {
    ivr_builder: true,
    amd: true,
    preemptive_generation: true,
    otel_export: true,
  },
  retentionDays: 30,
  otlpEndpoint: "https://otel.example.com/v1/traces",
  prometheusEndpoint: "https://prom.example.com",
});
