export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-dashed border-[color:var(--border)] bg-white/[0.02] p-10 text-center">
      <div className="text-sm font-medium">{title}</div>
      {hint && <div className="mt-2 text-xs text-[color:var(--muted)]">{hint}</div>}
    </div>
  );
}
