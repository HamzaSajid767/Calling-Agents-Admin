import { cn } from "@/utils/cn";

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "good" | "warn" | "bad" | "info";
}) {
  const toneClass =
    tone === "good"
      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/25"
      : tone === "warn"
        ? "bg-amber-500/15 text-amber-200 border-amber-500/25"
        : tone === "bad"
          ? "bg-red-500/15 text-red-200 border-red-500/25"
          : tone === "info"
            ? "bg-indigo-500/15 text-indigo-200 border-indigo-500/25"
            : "bg-white/5 text-[color:var(--muted)] border-white/10";

  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs", toneClass)}>
      {children}
    </span>
  );
}
