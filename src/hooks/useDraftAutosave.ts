import { useEffect, useMemo, useState } from "react";

interface DraftEnvelope<T> {
  value: T;
  updatedAt: string;
  version: string;
}

interface DraftOptions {
  debounceMs?: number;
  enabled?: boolean;
  version?: string;
}

const DEFAULT_VERSION = "v1";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadDraft<T>(key: string, fallback: T, version = DEFAULT_VERSION): T {
  if (!canUseStorage()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as DraftEnvelope<T>;
    if (!parsed || parsed.version !== version) return fallback;
    return parsed.value;
  } catch {
    return fallback;
  }
}

export function clearDraft(key: string): void {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(key);
}

export function useDraftAutosave<T>(
  key: string,
  value: T,
  options: DraftOptions = {},
): { lastSavedAt: string | null; clear: () => void } {
  const { debounceMs = 700, enabled = true, version = DEFAULT_VERSION } = options;
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !canUseStorage()) return;
    const timer = window.setTimeout(() => {
      const payload: DraftEnvelope<T> = {
        value,
        updatedAt: new Date().toISOString(),
        version,
      };
      window.localStorage.setItem(key, JSON.stringify(payload));
      setLastSavedAt(payload.updatedAt);
    }, debounceMs);
    return () => window.clearTimeout(timer);
  }, [debounceMs, enabled, key, value, version]);

  const clear = useMemo(() => () => clearDraft(key), [key]);

  return { lastSavedAt, clear };
}
