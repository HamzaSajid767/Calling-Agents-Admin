"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "min-h-11 w-full rounded-[10px] border border-[color:var(--border)] bg-[color:var(--panel)] px-3 py-2 text-base text-[color:var(--text)] outline-none focus:ring-2 focus:ring-indigo-500/40 sm:min-h-10 sm:text-sm",
          className,
        )}
        {...props}
      />
    );
  },
);
