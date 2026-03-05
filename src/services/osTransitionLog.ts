// Service: OS Transition Log — localStorage-backed
import type { OSTransitionLog } from "@/types/assistencia";

const STORAGE_KEY = "sgq_os_transition_log";

function readAll(): OSTransitionLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAll(logs: OSTransitionLog[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

export async function listByOS(osId: string): Promise<OSTransitionLog[]> {
  return readAll().filter((l) => l.osId === osId).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export async function listAll(): Promise<OSTransitionLog[]> {
  return readAll().sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export async function append(
  entry: Omit<OSTransitionLog, "id" | "timestamp"> & { timestamp?: string },
): Promise<OSTransitionLog> {
  const logs = readAll();
  const log: OSTransitionLog = {
    ...entry,
    id: `TRN-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: entry.timestamp || new Date().toISOString(),
  };
  logs.unshift(log);
  saveAll(logs);
  return log;
}
