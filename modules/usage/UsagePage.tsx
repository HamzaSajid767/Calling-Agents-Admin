"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DataTable, type Column } from "@/components/tables/DataTable";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { useStoreEffect } from "@/hooks/useStoreEffect";
import { useUsageBox } from "@/store/selectors";
import { useAppActions } from "@/store/useAppStore";
import type { UsageRollup } from "@/types/models";
import { formatNumber } from "@/utils/format";

export default function UsagePage() {
  const box = useUsageBox();
  const actions = useAppActions();

  useStoreEffect(() => {
    void actions.loadUsage();
  }, [actions]);

  const rows = box.data ?? [];
  const chart = useMemo(
    () =>
      rows.map((r) => ({
        day: r.period.slice(5),
        tokens: r.promptTokens + r.completionTokens,
        cost: Number(r.providerCostUsd.toFixed(2)),
        sessions: r.sessions,
      })),
    [rows],
  );

  const columns: Column<UsageRollup>[] = useMemo(
    () => [
      { key: "p", header: "Day", width: "12%", cell: (r) => <div className="text-xs font-semibold">{r.period}</div> },
      {
        key: "tok",
        header: "Tokens (p/c)",
        width: "22%",
        cell: (r) => (
          <div className="text-xs text-[color:var(--muted)]">
            <div>p: {formatNumber(r.promptTokens)}</div>
            <div className="mt-1">c: {formatNumber(r.completionTokens)}</div>
          </div>
        ),
      },
      {
        key: "speech",
        header: "Speech",
        width: "18%",
        cell: (r) => (
          <div className="text-xs text-[color:var(--muted)]">
            <div>STT min: {formatNumber(Math.round(r.sttMinutes))}</div>
            <div className="mt-1">TTS chars: {formatNumber(r.ttsChars)}</div>
          </div>
        ),
      },
      {
        key: "sess",
        header: "Sessions",
        width: "14%",
        cell: (r) => <div className="text-sm">{formatNumber(r.sessions)}</div>,
      },
      {
        key: "dur",
        header: "Avg duration",
        width: "16%",
        cell: (r) => <div className="text-sm">{formatNumber(Math.round(r.avgSessionMs / 1000))}s</div>,
      },
      {
        key: "cost",
        header: "Provider $",
        width: "18%",
        cell: (r) => <div className="text-sm font-semibold">${r.providerCostUsd.toFixed(2)}</div>,
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usage & billing metrics"
        description="Token throughput, speech minutes/characters, session counts, and estimated provider spend (mock rollups)."
        right={<Button variant="secondary" onClick={() => void actions.loadUsage()}>Refresh</Button>}
      />

      {box.error && (
        <div className="rounded-[var(--radius-lg)] border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {box.error}
        </div>
      )}

      <div className="grid min-w-0 gap-4 xl:grid-cols-2">
        <Card title="Tokens + sessions" subtitle="Operational demand curve">
          <div className="h-[220px] w-full min-w-0 sm:h-[260px] md:h-[280px]">
            <ResponsiveContainer width="100%" height="100%" minHeight={180}>
              <LineChart data={chart} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="day" tick={{ fill: "#a1a1aa", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fill: "#a1a1aa", fontSize: 11 }} axisLine={false} tickLine={false} width={44} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: "#a1a1aa", fontSize: 11 }} axisLine={false} tickLine={false} width={44} />
                <Tooltip
                  contentStyle={{
                    background: "#13131a",
                    border: "1px solid #23232b",
                    borderRadius: 10,
                    color: "#f4f4f5",
                  }}
                />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="tokens" name="tokens" stroke="#6366f1" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="sessions" name="sessions" stroke="#22c55e" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Estimated provider cost" subtitle="Rollup suitable for finance dashboards">
          <div className="h-[220px] w-full min-w-0 sm:h-[260px] md:h-[280px]">
            <ResponsiveContainer width="100%" height="100%" minHeight={180}>
              <BarChart data={chart} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="day" tick={{ fill: "#a1a1aa", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#a1a1aa", fontSize: 11 }} axisLine={false} tickLine={false} width={44} />
                <Tooltip
                  contentStyle={{
                    background: "#13131a",
                    border: "1px solid #23232b",
                    borderRadius: 10,
                    color: "#f4f4f5",
                  }}
                />
                <Bar dataKey="cost" name="usd" fill="#a78bfa" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card title="Daily rollups" subtitle="Backed by `adminApi.listUsage` — replace with warehouse queries later">
        <DataTable rows={rows} columns={columns} isLoading={box.loadState === "loading"} emptyTitle="No usage" getRowId={(r) => r.period} />
      </Card>
    </div>
  );
}
