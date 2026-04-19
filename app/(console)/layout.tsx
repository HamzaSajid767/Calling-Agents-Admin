import type { ReactNode } from "react";
import { ClientConsoleLayout } from "@/components/layout/ClientConsoleLayout";

export default function ConsoleLayout({ children }: { children: ReactNode }) {
  return <ClientConsoleLayout>{children}</ClientConsoleLayout>;
}
