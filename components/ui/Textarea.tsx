"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(
          "min-h-28 w-full rounded-[10px] border border-[color:var(--border)] bg-[color:var(--panel)] px-3 py-2 text-base text-[color:var(--text)] outline-none focus:ring-2 focus:ring-indigo-500/40 sm:text-sm",
          className,
        )}
        {...props}
      />
    );
  },
);
