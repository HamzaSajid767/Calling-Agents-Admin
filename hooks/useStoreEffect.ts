"use client";

import { useEffect } from "react";

/**
 * Run a side effect once deps change. Intended for calling Zustand store actions (not fetch directly).
 */
export function useStoreEffect(effect: () => void | Promise<void>, deps: unknown[]) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    void effect();
  }, deps);
}
