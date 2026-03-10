import type { OSTransitionLog } from "@/types/assistencia";
import { apiGet, apiPost } from "@/services/api";

export async function listByOS(osId: string): Promise<OSTransitionLog[]> {
  return apiGet<OSTransitionLog[]>(`/os-transition-log?osId=${encodeURIComponent(osId)}`);
}

export async function listAll(): Promise<OSTransitionLog[]> {
  return apiGet<OSTransitionLog[]>("/os-transition-log");
}

export async function append(
  entry: Omit<OSTransitionLog, "id" | "timestamp"> & { timestamp?: string },
): Promise<OSTransitionLog> {
  return apiPost<OSTransitionLog>("/os-transition-log", entry);
}


