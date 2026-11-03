/**
 * Thin fetch wrapper for the Freitty API. Requests go to the same origin under `/api/*`, which
 * Next rewrites to the Nest API (see next.config.ts) — so there is no CORS and no API origin in
 * the browser bundle. Errors use Nest's envelope `{ statusCode, message, error }`.
 */

export class ApiError extends Error {
  readonly status: number;
  /** Nest's short error name, e.g. `Not Found`, `Bad Request`. */
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  /** 4xx — retrying won't help. */
  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/** Query-string values; `undefined`, `null` and empty strings are omitted. */
export type QueryValue = string | number | boolean | null | undefined;

export function toQueryString(params: Record<string, QueryValue>): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    qs.set(key, String(value));
  }
  const text = qs.toString();
  return text ? `?${text}` : "";
}

/** Builds a same-origin API URL, e.g. `apiUrl("/orders/export", { hub: "MAR" })`. */
export function apiUrl(path: string, params: Record<string, QueryValue> = {}): string {
  return `/api${path}${toQueryString(params)}`;
}

interface RequestOptions {
  params?: Record<string, QueryValue>;
  signal?: AbortSignal;
}

function messageFrom(payload: unknown, fallback: string): string {
  if (payload && typeof payload === "object" && "message" in payload) {
    const { message } = payload as { message: unknown };
    // class-validator errors arrive as a list of messages.
    if (Array.isArray(message)) return message.join("; ");
    if (typeof message === "string" && message) return message;
  }
  return fallback;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(apiUrl(path, options.params), {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: options.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiError(0, "Network Error", "Can't reach the server. Check your connection.");
  }

  const text = await res.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { message: text };
    }
  }

  if (!res.ok) {
    const code =
      payload && typeof payload === "object" && "error" in payload
        ? String((payload as { error: unknown }).error)
        : res.statusText || "Error";
    throw new ApiError(res.status, code, messageFrom(payload, res.statusText || "Request failed"));
  }

  return payload as T;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(path, options),
};
