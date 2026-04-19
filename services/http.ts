export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
}

/**
 * Central HTTP entry for future real backend wiring.
 * Policy: only call this from `/services` modules (e.g. a future `adminGateway.ts`), never from React components or hooks.
 * The live admin UI uses `adminApi` via the Zustand store exclusively.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  const url = `${base}${path}`;
  const res = await fetch(url, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}
