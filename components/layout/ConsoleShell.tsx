"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { NAV_SECTIONS } from "@/modules/common/nav";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";

function NavSections({
  pathname,
  onNavigate,
  dense,
}: {
  pathname: string;
  onNavigate?: () => void;
  dense?: boolean;
}) {
  return (
    <nav className={cn("space-y-6", dense ? "px-1" : "mt-4 px-1")}>
      {NAV_SECTIONS.map((section) => (
        <div key={section.title}>
          <div className="px-2 text-[11px] font-semibold tracking-wide text-[color:var(--muted)]">{section.title}</div>
          <div className="mt-2 space-y-1">
            {section.items.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex min-h-11 items-start gap-3 rounded-[10px] px-2 py-2.5 text-sm transition active:opacity-80",
                    active ? "bg-white/10 text-white" : "text-[color:var(--muted)] hover:bg-white/5 hover:text-white",
                  )}
                >
                  <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  <span className="min-w-0">
                    <span className="block font-medium leading-snug">{item.label}</span>
                    <span className="mt-0.5 block text-[11px] leading-snug text-[color:var(--muted)]">{item.description}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

export function ConsoleShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-[1600px]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-[min(100%,280px)] shrink-0 border-r border-[color:var(--border)] bg-[color:var(--panel)]/80 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur md:block">
        <div className="px-2 py-3">
          <div className="text-xs font-semibold tracking-wide text-[color:var(--muted)]">LIVEKIT AGENTS</div>
          <div className="mt-1 text-sm font-semibold leading-snug">Control Console</div>
        </div>
        <NavSections pathname={pathname} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-40 flex items-center gap-2 border-b border-[color:var(--border)] bg-[color:var(--bg)]/85 px-3 py-3 backdrop-blur supports-[backdrop-filter]:bg-[color:var(--bg)]/70 md:hidden">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="min-h-11 min-w-11 shrink-0 px-0"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-drawer"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" aria-hidden />
            <span className="sr-only">Open navigation</span>
          </Button>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">LiveKit Agents</div>
            <div className="truncate text-[11px] text-[color:var(--muted)]">Control console</div>
          </div>
        </header>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden" id="mobile-nav-drawer">
            <button
              type="button"
              className="absolute inset-0 bg-black/60"
              aria-label="Close navigation"
              onClick={() => setMobileOpen(false)}
            />
            <div
              className={cn(
                "absolute left-0 top-0 flex h-full w-[min(100vw-2.5rem,20rem)] flex-col border-r border-[color:var(--border)]",
                "bg-[color:var(--panel)] shadow-[var(--shadow-soft)]",
                "pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]",
              )}
            >
              <div className="flex items-center justify-between gap-2 border-b border-[color:var(--border)] px-3 py-3">
                <div className="min-w-0">
                  <div className="text-xs font-semibold tracking-wide text-[color:var(--muted)]">NAVIGATION</div>
                  <div className="truncate text-sm font-semibold">Menu</div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="min-h-11 min-w-11 shrink-0 px-0"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-2 py-2">
                <NavSections pathname={pathname} onNavigate={() => setMobileOpen(false)} dense />
              </div>
            </div>
          </div>
        )}

        <main className="min-w-0 flex-1 px-3 py-5 sm:px-4 sm:py-6 md:px-8 md:py-8 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          {children}
        </main>
      </div>
    </div>
  );
}
