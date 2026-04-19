"use client";

import { useId } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TimeSeriesPoint } from "@/types/models";

export function SeriesChart({ data, title }: { data: TimeSeriesPoint[]; title: string }) {
  const gid = useId().replace(/:/g, "");
  const chartData = data.map((d) => ({
    t: new Date(d.t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    v: d.v,
  }));

  return (
    <div className="h-[220px] w-full min-w-0 sm:h-[260px] md:h-[280px]">
      <div className="mb-3 text-xs font-semibold text-[color:var(--muted)]">{title}</div>
      <ResponsiveContainer width="100%" height="100%" minHeight={160}>
        <AreaChart data={chartData} margin={{ left: -8, right: 8, top: 8, bottom: 0 }}>
          <defs>
            <linearGradient id={`g-${gid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.55} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
          <XAxis dataKey="t" tick={{ fill: "#a1a1aa", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#a1a1aa", fontSize: 11 }} axisLine={false} tickLine={false} width={32} />
          <Tooltip
            contentStyle={{
              background: "#13131a",
              border: "1px solid #23232b",
              borderRadius: 10,
              color: "#f4f4f5",
            }}
          />
          <Area type="monotone" dataKey="v" stroke="#6366f1" fill={`url(#g-${gid})`} strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
