"use client";

import { RefreshCw } from "lucide-react";
import { useMemo } from "react";
import { SeriesChart } from "@/components/charts/SeriesChart";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { Spinner } from "@/components/ui/Spinner";
import { useStoreEffect } from "@/hooks/useStoreEffect";
import { useDashboardBox } from "@/store/selectors";
import { useAppActions } from "@/store/useAppStore";
import { formatNumber } from "@/utils/format";

function StatCard({
  title,
  subtitle,
  value,
  loading,
}: {
  title: string;
  subtitle: string;
  value: string | number | null;
  loading: boolean;
}) {
  return (
    <Card title={title} subtitle={subtitle}>
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
      ) : (
        <div className="text-2xl font-semibold tabular-nums sm:text-3xl">{value ?? "—"}</div>
      )}
    </Card>
  );
}

export default function DashboardPage() {
  const box = useDashboardBox();
  const actions = useAppActions();

  useStoreEffect(() => {
    void actions.loadDashboard();
  }, [actions]);

  const overview = box.data?.overview;
  const series = box.data?.series ?? [];
  const loading = box.loadState === "loading";

  const healthTone = useMemo(() => {
    if (!overview) return "neutral" as const;
    if (overview.health === "healthy") return "good" as const;
    if (overview.health === "degraded") return "warn" as const;
    return "bad" as const;
  }, [overview]);

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Dashboard"
        description="Realtime operational view across agent sessions, workers, and platform health."
        right={
          <Button variant="secondary" onClick={() => void actions.loadDashboard()} disabled={loading}>
            {loading ? <Spinner className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </Button>
        }
      />

      {box.error && (
        <div className="rounded-[var(--radius-lg)] border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {box.error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 xl:grid-cols-4">
        <StatCard
          title="Active sessions"
          subtitle="Voice agent sessions currently running"
          value={overview ? formatNumber(overview.activeSessions) : null}
          loading={loading}
        />
        <StatCard
          title="Active agents"
          subtitle="Enabled agent definitions"
          value={overview ? formatNumber(overview.activeAgents) : null}
          loading={loading}
        />
        <StatCard
          title="Workers online"
          subtitle="AgentServer fleet reachability"
          value={overview ? formatNumber(overview.workersOnline) : null}
          loading={loading}
        />
        <StatCard
          title="Live rooms"
          subtitle="LiveKit rooms with media"
          value={overview ? formatNumber(overview.roomsLive) : null}
          loading={loading}
        />
      </div>

      <div className="grid min-w-0 gap-4 xl:grid-cols-3">
        <Card className="min-w-0 xl:col-span-2" title="Usage pulse" subtitle="Rolling activity index (mock series)">
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-[220px] w-full sm:h-[260px] md:h-[280px]" />
            </div>
          ) : box.loadState !== "success" ? (
            <div className="flex h-[200px] items-center justify-center text-sm text-[color:var(--muted)] sm:h-[240px] md:h-[280px]">
              No data
            </div>
          ) : (
            <div className="min-w-0">
              <SeriesChart data={series} title="Last 24h (synthetic)" />
            </div>
          )}
        </Card>

        <Card title="System health" subtitle="SLO-oriented signals">
          {loading ? (
            <SkeletonText lines={4} />
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-[color:var(--muted)]">Status</div>
                {overview ? <Badge tone={healthTone}>{overview.health}</Badge> : <Badge tone="neutral">unknown</Badge>}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-[color:var(--muted)]">24h error rate</div>
                <div className="text-sm font-medium tabular-nums">
                  {overview ? `${(overview.errorRate24h * 100).toFixed(2)}%` : "—"}
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-[color:var(--muted)]">Last refresh</div>
                <div className="max-w-[14rem] truncate text-xs text-[color:var(--muted)] sm:max-w-none">
                  {overview?.updatedAt ?? "—"}
                </div>
              </div>
              <div className="rounded-[10px] border border-[color:var(--border)] bg-white/[0.02] p-3 text-xs leading-relaxed text-[color:var(--muted)]">
                This console uses a mock control plane. Replace the service layer with your REST or WebSocket gateway; the UI stays
                store-driven.
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
