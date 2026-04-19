import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Bot,
  Cpu,
  FileAudio,
  Gauge,
  Layers,
  LineChart,
  Mic2,
  PhoneCall,
  Plug,
  ScrollText,
  Settings,
  Sparkles,
  Users,
  Voicemail,
  Workflow,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  description: string;
};

export const NAV_SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: "Overview",
    items: [
      {
        href: "/",
        label: "Dashboard",
        icon: Gauge,
        description: "System health, workers, usage",
      },
    ],
  },
  {
    title: "Agents & sessions",
    items: [
      { href: "/agents", label: "Agents", icon: Bot, description: "Definitions, models, tools" },
      { href: "/sessions", label: "Sessions", icon: Sparkles, description: "Live + historical sessions" },
      { href: "/conversations", label: "Conversations", icon: Layers, description: "Chat context + tool calls" },
      { href: "/tools", label: "Tools", icon: Workflow, description: "Function tools & assignments" },
    ],
  },
  {
    title: "Voice & telephony",
    items: [
      { href: "/voice-pipeline", label: "Voice pipeline", icon: Mic2, description: "STT/TTS/VAD/tokenizer/streaming" },
      { href: "/ivr", label: "IVR builder", icon: PhoneCall, description: "Menus, branching, transfers" },
      { href: "/amd", label: "AMD", icon: Voicemail, description: "Answering machine detection" },
    ],
  },
  {
    title: "Realtime infrastructure",
    items: [
      { href: "/livekit", label: "LiveKit rooms", icon: Users, description: "Rooms, participants, tracks" },
      { href: "/recordings", label: "Recordings", icon: FileAudio, description: "Audio + telemetry bundles" },
      { href: "/workers", label: "Workers & jobs", icon: Cpu, description: "AgentServer fleet + job history" },
    ],
  },
  {
    title: "Integrations",
    items: [{ href: "/providers", label: "Providers", icon: Plug, description: "LLM/STT/TTS plugins & keys" }],
  },
  {
    title: "Observability",
    items: [
      { href: "/telemetry", label: "Telemetry", icon: Activity, description: "OTel logs, traces, Prometheus" },
      { href: "/usage", label: "Usage & billing", icon: LineChart, description: "Tokens, minutes, costs" },
      { href: "/logs", label: "System logs", icon: ScrollText, description: "Errors, warnings, events" },
    ],
  },
  {
    title: "Administration",
    items: [{ href: "/settings", label: "Settings", icon: Settings, description: "Global config + flags" }],
  },
];

export const NAV_FLAT: NavItem[] = NAV_SECTIONS.flatMap((s) => s.items);
