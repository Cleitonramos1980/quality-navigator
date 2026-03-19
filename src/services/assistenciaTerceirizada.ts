import { apiGet, apiPost, apiPut } from "@/services/api";
import type {
  AssistenciaTerceirizada,
  ItemEmAssistencia,
  MovimentacaoAssistencia,
  CondicaoRetorno,
} from "@/types/assistenciaTerceirizada";

// ── Assistências Técnicas ──
export async function listarAssistenciasTerceirizadas(): Promise<AssistenciaTerceirizada[]> {
  return apiGet<AssistenciaTerceirizada[]>("/assistencia-terceirizada");
}

export async function buscarAssistenciaTerceirizada(id: string): Promise<AssistenciaTerceirizada | undefined> {
  return apiGet<AssistenciaTerceirizada | null>(`/assistencia-terceirizada/${id}`).then((r) => r || undefined);
}

export async function criarAssistenciaTerceirizada(data: Omit<AssistenciaTerceirizada, "id">): Promise<AssistenciaTerceirizada> {
  return apiPost<AssistenciaTerceirizada>("/assistencia-terceirizada", data);
}

export async function atualizarAssistenciaTerceirizada(id: string, data: Partial<AssistenciaTerceirizada>): Promise<AssistenciaTerceirizada> {
  return apiPut<AssistenciaTerceirizada>(`/assistencia-terceirizada/${id}`, data);
}

// ── Itens em Assistência ──
export async function listarItensEmAssistencia(): Promise<ItemEmAssistencia[]> {
  return apiGet<ItemEmAssistencia[]>("/assistencia-terceirizada/itens");
}

export async function buscarItemEmAssistencia(id: string): Promise<ItemEmAssistencia | undefined> {
  return apiGet<ItemEmAssistencia | null>(`/assistencia-terceirizada/itens/${id}`).then((r) => r || undefined);
}

export async function enviarParaAssistencia(data: Omit<ItemEmAssistencia, "id" | "quantidadeRetornada" | "status" | "dataRetorno">): Promise<ItemEmAssistencia> {
  return apiPost<ItemEmAssistencia>("/assistencia-terceirizada/itens/enviar", data);
}

export async function registrarRetorno(
  itemId: string,
  data: {
    quantidadeRetornada: number;
    condicaoRetorno: CondicaoRetorno;
    laudoObservacao?: string;
    responsavelRecebimento: string;
    dataRetorno: string;
  }
): Promise<ItemEmAssistencia> {
  return apiPost<ItemEmAssistencia>(`/assistencia-terceirizada/itens/${itemId}/retorno`, data);
}

// ── Movimentações ──
export async function listarMovimentacoes(): Promise<MovimentacaoAssistencia[]> {
  return apiGet<MovimentacaoAssistencia[]>("/assistencia-terceirizada/movimentacoes");
}

export async function listarMovimentacoesPorItem(itemId: string): Promise<MovimentacaoAssistencia[]> {
  return apiGet<MovimentacaoAssistencia[]>(`/assistencia-terceirizada/movimentacoes/item/${itemId}`);
}

export async function listarMovimentacoesPorAssistencia(assistenciaId: string): Promise<MovimentacaoAssistencia[]> {
  return apiGet<MovimentacaoAssistencia[]>(`/assistencia-terceirizada/movimentacoes/assistencia/${assistenciaId}`);
}

// ── Dashboard ──
export async function getDashboardTerceirizada() {
  return apiGet<{
    totalAssistencias: number;
    totalPecasEmPoder: number;
    totalEquipamentosEmPoder: number;
    enviosNoPeriodo: number;
    retornosNoPeriodo: number;
    itensSemRetornoMaisDias: number;
    assistenciaMaiorVolume: string;
  }>("/assistencia-terceirizada/dashboard");
}
