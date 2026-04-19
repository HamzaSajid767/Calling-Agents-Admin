export type RealtimeEvent = {
  topic: string;
  payload: unknown;
  receivedAt: string;
};

export type RealtimeListener = (event: RealtimeEvent) => void;

/**
 * WebSocket / SSE abstraction for future wiring to LiveKit + control-plane streams.
 * Keep all realtime subscriptions behind this module (invoked from the global store only).
 */
class RealtimeHub {
  private listeners = new Map<string, Set<RealtimeListener>>();

  subscribe(topic: string, listener: RealtimeListener) {
    const set = this.listeners.get(topic) ?? new Set();
    set.add(listener);
    this.listeners.set(topic, set);
    return () => {
      const s = this.listeners.get(topic);
      if (!s) return;
      s.delete(listener);
      if (s.size === 0) this.listeners.delete(topic);
    };
  }

  emit(topic: string, payload: unknown) {
    const evt: RealtimeEvent = { topic, payload, receivedAt: new Date().toISOString() };
    for (const l of this.listeners.get(topic) ?? []) l(evt);
  }
}

export const realtimeHub = new RealtimeHub();
