import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  right,
}: {
  title: string;
  description?: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        <h1 className="text-lg font-semibold tracking-tight sm:text-xl">{title}</h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[color:var(--muted)]">{description}</p>
        )}
      </div>
      {right && <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">{right}</div>}
    </div>
  );
}
