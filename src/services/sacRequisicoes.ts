import { apiGet, apiPost } from "@/services/api";
import { SACRequisicao, MaterialERP, RequisicaoStatus } from "@/types/sacRequisicao";

export async function getRequisicoes(): Promise<SACRequisicao[]> {
  return apiGet<SACRequisicao[]>("/sac/requisicoes");
}

export async function getRequisicaoById(id: string): Promise<SACRequisicao | undefined> {
  return apiGet<SACRequisicao | null>(`/sac/requisicoes/${id}`).then((r) => r || undefined);
}

export async function criarRequisicao(data: Partial<SACRequisicao>): Promise<SACRequisicao> {
  return apiPost<SACRequisicao>("/sac/requisicoes", data);
}

export async function atenderRequisicao(
  id: string,
  dados: { status: RequisicaoStatus; itens: SACRequisicao["itens"]; observacoesAtendimento: string; atendidoPor: string }
): Promise<SACRequisicao | undefined> {
  return apiPost<SACRequisicao | null>(`/sac/requisicoes/${id}/atender`, dados).then((r) => r || undefined);
}

export async function buscarMateriais(filtro?: { codigo?: string; descricao?: string; categoria?: string }): Promise<MaterialERP[]> {
  const query = filtro ? new URLSearchParams(Object.entries(filtro).filter(([, v]) => !!v) as Array<[string, string]>).toString() : "";
  return apiGet<MaterialERP[]>(`/erp/materiais${query ? `?${query}` : ""}`);
}

export async function getRequisicaoDashboardData() {
  return apiGet<{ pendentes: number; atendidasMes: number; porPlanta: Array<{ name: string; value: number }>; ultimasPendentes: SACRequisicao[] }>("/sac/requisicoes/dashboard");
}


