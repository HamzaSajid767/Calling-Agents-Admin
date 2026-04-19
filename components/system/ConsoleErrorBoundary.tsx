"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

type Props = { children: ReactNode };

type State = { error: Error | null };

export class ConsoleErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[admin] console error boundary", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 py-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/15 text-red-300">
            <AlertTriangle className="h-7 w-7" aria-hidden />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Something went wrong</h1>
            <p className="mt-2 max-w-md text-sm text-[color:var(--muted)]">
              {this.state.error.message}
            </p>
          </div>
          <Button
            onClick={() => {
              this.setState({ error: null });
              window.location.reload();
            }}
          >
            Reload console
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
