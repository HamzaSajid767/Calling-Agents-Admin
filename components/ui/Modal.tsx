"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/Button";

export function Modal({
  open,
  title,
  children,
  onClose,
  footer,
  wide,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative z-10 flex max-h-[min(92dvh,900px)] w-full flex-col overflow-hidden rounded-t-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--panel)] shadow-[var(--shadow-soft)] sm:rounded-[var(--radius-lg)]",
          wide ? "sm:max-w-3xl" : "sm:max-w-lg",
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[color:var(--border)] px-4 py-3 sm:px-5 sm:py-4">
          <div id="modal-title" className="min-w-0 pr-2 text-sm font-semibold leading-snug">
            {title}
          </div>
          <Button variant="ghost" size="sm" className="min-h-11 min-w-11 shrink-0 px-0 sm:min-h-9 sm:min-w-9" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 sm:py-4">{children}</div>
        {footer && (
          <div className="shrink-0 border-t border-[color:var(--border)] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5 sm:py-4 sm:pb-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
