import { apiGet, apiPost } from "@/services/api";
import type { AudExec } from "@/types/sgq";

export interface AuditoriaTemplate {
  id: string;
  nome: string;
  tipoAuditoria: string;
}

export interface AuditoriaTemplateItem {
  id: string;
  descricao: string;
}

export async function getAuditorias(): Promise<AudExec[]> {
  return apiGet<AudExec[]>("/auditorias");
}

export async function createAuditoria(data: Omit<AudExec, "id">): Promise<AudExec> {
  return apiPost<AudExec>("/auditorias", data);
}

export async function getAuditoriaTemplates(): Promise<AuditoriaTemplate[]> {
  return apiGet<AuditoriaTemplate[]>("/auditorias/templates");
}

export async function getAuditoriaTemplateItems(tplId: string): Promise<AuditoriaTemplateItem[]> {
  return apiGet<AuditoriaTemplateItem[]>(`/auditorias/templates/${tplId}/items`);
}


