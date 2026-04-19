import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

export function Card({
  className,
  children,
  title,
  subtitle,
  right,
}: {
  className?: string;
  children: ReactNode;
  title?: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--panel)] shadow-[var(--shadow-soft)]",
        className,
      )}
    >
      {(title || subtitle || right) && (
        <div className="flex flex-col gap-3 border-b border-[color:var(--border)] px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:px-5">
          <div className="min-w-0">
            {title && <div className="text-sm font-semibold text-[color:var(--text)]">{title}</div>}
            {subtitle && <div className="mt-1 text-xs text-[color:var(--muted)]">{subtitle}</div>}
          </div>
          {right && <div className="flex shrink-0 flex-wrap items-stretch gap-2 sm:justify-end">{right}</div>}
        </div>
      )}
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}
