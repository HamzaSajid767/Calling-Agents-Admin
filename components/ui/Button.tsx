"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = "primary", size = "md", ...props },
  ref,
) {
  const styles =
    variant === "primary"
      ? "bg-indigo-600 hover:bg-indigo-500 text-white"
      : variant === "secondary"
        ? "bg-[color:var(--panel-2)] hover:bg-[#1a1a24] text-[color:var(--text)] border border-[color:var(--border)]"
        : variant === "danger"
          ? "bg-red-600 hover:bg-red-500 text-white"
          : "hover:bg-white/5 text-[color:var(--text)]";

  const sizes =
    size === "sm"
      ? "min-h-11 px-3 text-sm sm:min-h-9"
      : "min-h-11 px-4 text-sm sm:min-h-10";

  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[10px] font-medium transition disabled:opacity-50 disabled:pointer-events-none",
        styles,
        sizes,
        className,
      )}
      {...props}
    />
  );
});
