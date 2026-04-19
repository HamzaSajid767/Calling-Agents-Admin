"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      richColors
      closeButton
      position="top-center"
      style={{ top: "max(12px, env(safe-area-inset-top))" }}
      toastOptions={{
        classNames: {
          toast: "bg-[color:var(--panel-2)] border border-[color:var(--border)] text-[color:var(--text)]",
        },
      }}
    />
  );
}
