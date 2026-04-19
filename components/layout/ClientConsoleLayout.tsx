"use client";

import type { ReactNode } from "react";
import { ConsoleErrorBoundary } from "@/components/system/ConsoleErrorBoundary";
import { ConsoleShell } from "@/components/layout/ConsoleShell";

export function ClientConsoleLayout({ children }: { children: ReactNode }) {
  return (
    <ConsoleErrorBoundary>
      <ConsoleShell>{children}</ConsoleShell>
    </ConsoleErrorBoundary>
  );
}
