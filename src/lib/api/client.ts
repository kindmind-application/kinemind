const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:9600/api";

export class ApiError extends Error {
  code: string;
  status: number;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
    ...init,
  });
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = (body as { error?: { code?: string; message?: string } })?.error ?? {
      code: "unknown",
      message: "Error desconocido",
    };
    throw new ApiError(res.status, err.code ?? "unknown", err.message ?? "Error desconocido");
  }
  return body as T;
}

type QsValue = string | number | boolean | null | undefined;

export function qs(params: Record<string, QsValue> | object): string {
  const entries = Object.entries(params as Record<string, QsValue>).filter(
    ([, v]) => v !== undefined && v !== null && v !== ""
  );
  if (entries.length === 0) return "";
  const sp = new URLSearchParams();
  for (const [k, v] of entries) sp.set(k, String(v));
  return `?${sp.toString()}`;
}
