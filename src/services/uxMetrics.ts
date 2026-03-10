import { apiGet, apiPost } from "@/services/api";

export type UxMetricEventType = "PAGE_VIEW" | "ACTION" | "ERROR" | "SCREEN_TIME";

export interface UxMetricEvent {
  type: UxMetricEventType;
  screen: string;
  action?: string;
  success?: boolean;
  durationMs?: number;
  metadata?: Record<string, unknown>;
  createdAt?: string;
}

export interface UxMetricEntry extends UxMetricEvent {
  id: string;
}

export async function trackUxMetric(event: UxMetricEvent): Promise<void> {
  await apiPost<void>("/metrics/ux", event);
}

export async function listUxMetrics(limit = 100): Promise<UxMetricEntry[]> {
  return apiGet<UxMetricEntry[]>(`/metrics/ux?limit=${limit}`);
}
