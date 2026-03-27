import { apiGet, apiPost, apiPostFormData, apiPut } from "@/services/api";
import type {
  SesmtExecutiveView,
  SesmtFavoritePreset,
  SesmtIndicatorsDashboard,
  SesmtMasterDashboard,
  SesmtMaturityDashboard,
  SesmtMenuGroup,
  SesmtModuleDefinition,
  SesmtOccupationalDashboard,
  SesmtPredictiveDashboard,
  SesmtRecord,
  SesmtRecordListResult,
} from "@/types/sesmt";

export interface SesmtRecordFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  unidade?: string;
  responsavel?: string;
  criticidade?: string;
  nr?: string;
  periodStart?: string;
  periodEnd?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  specificFilters?: Record<string, string>;
}

export interface SesmtFavoritePresetPayload {
  presetKey: string | null;
  status?: string;
  criticidade?: string;
  unidade?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  specificFilters?: Record<string, string>;
}

type QueryValue = string | number | boolean | Record<string, unknown> | undefined;

function queryString(filters?: Record<string, QueryValue>): string {
  if (!filters) return "";
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value == null) return;
    if (typeof value === "object") {
      const serialized = JSON.stringify(value);
      if (serialized === "{}" || serialized === "[]") return;
      params.set(key, serialized);
      return;
    }
    if (String(value).trim() === "") return;
    params.set(key, String(value));
  });
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function getSesmtMenu(): Promise<SesmtMenuGroup[]> {
  return apiGet<SesmtMenuGroup[]>("/sesmt/menu");
}

export function getSesmtModules(): Promise<SesmtModuleDefinition[]> {
  return apiGet<SesmtModuleDefinition[]>("/sesmt/modules");
}

export function getSesmtExecutiveViews(): Promise<SesmtExecutiveView[]> {
  return apiGet<SesmtExecutiveView[]>("/sesmt/executive-views");
}

export function getSesmtLookups() {
  return apiGet<any>("/sesmt/lookups");
}

export function getSesmtMasterDashboard(filters?: { unidade?: string; periodStart?: string; periodEnd?: string }) {
  return apiGet<SesmtMasterDashboard>(`/sesmt/dashboard/painel-mestre${queryString(filters)}`);
}

export function getSesmtMaturityDashboard(filters?: { unidade?: string }) {
  return apiGet<SesmtMaturityDashboard>(`/sesmt/dashboard/indice-maturidade${queryString(filters)}`);
}

export function getSesmtPredictiveDashboard(filters?: { unidade?: string }) {
  return apiGet<SesmtPredictiveDashboard>(`/sesmt/dashboard/painel-preditivo${queryString(filters)}`);
}

export function getSesmtIndicatorsDashboard(filters?: { unidade?: string }) {
  return apiGet<SesmtIndicatorsDashboard>(`/sesmt/dashboard/indicadores${queryString(filters)}`);
}

export function getSesmtOccupationalDashboard(filters?: { unidade?: string }) {
  return apiGet<SesmtOccupationalDashboard>(`/sesmt/dashboard/gerencial-ocupacional${queryString(filters)}`);
}

export function listSesmtRecords(moduleKey: string, filters?: SesmtRecordFilters) {
  return apiGet<SesmtRecordListResult>(`/sesmt/modules/${encodeURIComponent(moduleKey)}/records${queryString(filters as unknown as Record<string, QueryValue>)}`);
}

export function getSesmtFavoritePreset(moduleKey: string) {
  return apiGet<{ favoritePreset: SesmtFavoritePreset | null }>(`/sesmt/modules/${encodeURIComponent(moduleKey)}/favorite-preset`);
}

export function saveSesmtFavoritePreset(moduleKey: string, payload: SesmtFavoritePresetPayload) {
  return apiPut<{ favoritePreset: SesmtFavoritePreset }>(`/sesmt/modules/${encodeURIComponent(moduleKey)}/favorite-preset`, payload);
}

export function getSesmtRecord(moduleKey: string, id: string) {
  return apiGet<SesmtRecord>(`/sesmt/modules/${encodeURIComponent(moduleKey)}/records/${encodeURIComponent(id)}`);
}

export function createSesmtRecord(moduleKey: string, payload: Partial<SesmtRecord>) {
  return apiPost<SesmtRecord>(`/sesmt/modules/${encodeURIComponent(moduleKey)}/records`, payload);
}

export function updateSesmtRecord(moduleKey: string, id: string, payload: Partial<SesmtRecord>) {
  return apiPut<SesmtRecord>(`/sesmt/modules/${encodeURIComponent(moduleKey)}/records/${encodeURIComponent(id)}`, payload);
}

export function addSesmtEvidence(moduleKey: string, id: string, payload: { descricao: string; tipo?: string; data?: string; responsavel?: string; anexoId?: string }) {
  return apiPost<SesmtRecord>(`/sesmt/modules/${encodeURIComponent(moduleKey)}/records/${encodeURIComponent(id)}/evidencias`, payload);
}

export async function uploadSesmtAttachments(moduleKey: string, id: string, files: File[]) {
  const form = new FormData();
  files.forEach((file) => form.append("files", file, file.name));
  return apiPostFormData<{ uploaded: any[]; rejected: Array<{ nomeArquivo: string; motivo: string }> }>(
    `/sesmt/modules/${encodeURIComponent(moduleKey)}/records/${encodeURIComponent(id)}/anexos`,
    form,
  );
}

export function listSesmtAccessAudit() {
  return apiGet<any[]>("/sesmt/access-audit");
}

