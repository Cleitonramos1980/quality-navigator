import { clearAuthSession, getAuthToken } from "@/lib/rbac";

function normalizeBaseUrl(value: string): string {
  const trimmed = value.trim();
  return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
}

const configuredBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
const defaultBaseUrl = import.meta.env.DEV ? "http://localhost:3333/api" : "/api";
const initialBaseUrl = normalizeBaseUrl(configuredBaseUrl || defaultBaseUrl);
const fallbackBaseUrls = [
  ...(import.meta.env.DEV ? ["http://localhost:3333/api"] : []),
  "/api",
].map(normalizeBaseUrl);

let activeBaseUrl = initialBaseUrl;

function getBaseUrlCandidates(): string[] {
  const ordered = [activeBaseUrl, ...fallbackBaseUrls];
  return Array.from(new Set(ordered));
}

export class ApiError extends Error {
  status: number;
  requestId?: string;
  details?: unknown;

  constructor(message: string, status: number, requestId?: string, details?: unknown) {
    super(message);
    this.status = status;
    this.requestId = requestId;
    this.details = details;
  }
}

type RequestOptions = RequestInit & {
  timeoutMs?: number;
  retry?: number;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildRequestId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `req-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function shouldRetry(error: unknown, attempt: number, retry: number): boolean {
  if (attempt >= retry) return false;
  if (error instanceof ApiError) {
    return error.status >= 500 || error.status === 0 || error.status === 408;
  }
  return true;
}

export function getApiErrorMessage(error: unknown, fallback = "Falha na comunicacao com o servidor."): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) {
    if (error.message.toLowerCase().includes("failed to fetch")) {
      return "Nao foi possivel conectar na API. Verifique se o backend esta ativo.";
    }
    return error.message;
  }
  return fallback;
}

async function request<T>(path: string, init?: RequestOptions): Promise<T> {
  const isFormData = typeof FormData !== "undefined" && init?.body instanceof FormData;
  const baseHeaders: HeadersInit = isFormData ? {} : { "Content-Type": "application/json" };
  const requestId = buildRequestId();
  const timeoutMs = init?.timeoutMs ?? 30_000;
  const retry = init?.retry ?? ((init?.method || "GET").toUpperCase() === "GET" ? 1 : 0);

  for (let attempt = 0; attempt <= retry; attempt += 1) {
    let lastError: unknown;

    for (const baseUrl of getBaseUrlCandidates()) {
      const abortController = new AbortController();
      const timeoutHandle = setTimeout(() => abortController.abort(), timeoutMs);

      try {
        const token = getAuthToken();
        const res = await fetch(`${baseUrl}${path}`, {
          ...init,
          headers: {
            ...baseHeaders,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            "x-request-id": requestId,
            ...(init?.headers || {}),
          },
          signal: abortController.signal,
        });

        const responseRequestId = res.headers.get("x-request-id") || requestId;

        if (!res.ok) {
          const text = await res.text();
          let message = `API error: ${res.status}`;
          let details: unknown;

          try {
            const parsed = JSON.parse(text);
            details = parsed;
            message = parsed?.error?.message || parsed?.message || message;
          } catch {
            if (text) message = text;
          }

          if (res.status === 401) {
            clearAuthSession();
          }
          throw new ApiError(message, res.status, responseRequestId, details);
        }

        if (activeBaseUrl !== baseUrl) {
          activeBaseUrl = baseUrl;
        }

        if (res.status === 204) return undefined as T;
        return (await res.json()) as T;
      } catch (error) {
        lastError = error;

        if (error instanceof ApiError) {
          throw error;
        }

        const isTimeout = error instanceof DOMException && error.name === "AbortError";
        if (isTimeout) {
          throw new ApiError("Tempo limite de requisicao excedido.", 408, requestId, error);
        }
      } finally {
        clearTimeout(timeoutHandle);
      }
    }

    if (!shouldRetry(lastError, attempt, retry)) {
      if (lastError instanceof ApiError) throw lastError;
      throw new ApiError(getApiErrorMessage(lastError), 0, requestId, lastError);
    }

    await sleep(300 * (attempt + 1));
  }

  throw new ApiError("Falha na comunicacao com a API.", 0, requestId);
}

export async function apiGet<T>(path: string): Promise<T> {
  return request<T>(path);
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function apiDelete(path: string): Promise<void> {
  await request<void>(path, { method: "DELETE" });
}

export async function apiPostFormData<T>(path: string, formData: FormData): Promise<T> {
  return request<T>(path, {
    method: "POST",
    body: formData,
  });
}

export function getApiBaseUrl(): string {
  return activeBaseUrl;
}
