import { apiGet, apiPost, apiPut } from "@/services/api";
import { mockAssistenciasTerceirizadas, mockItensEmAssistencia, mockMovimentacoes } from "@/data/mockAssistenciaTerceirizadaData";
import type {
  AssistenciaTerceirizada,
  ItemEmAssistencia,
  MovimentacaoAssistencia,
  CondicaoRetorno,
} from "@/types/assistenciaTerceirizada";

// ── Assistências Técnicas ──
export async function listarAssistenciasTerceirizadas(): Promise<AssistenciaTerceirizada[]> {
  try {
    return await apiGet<AssistenciaTerceirizada[]>("/assistencia-terceirizada");
  } catch {
    return mockAssistenciasTerceirizadas;
  }
}

export async function buscarAssistenciaTerceirizada(id: string): Promise<AssistenciaTerceirizada | undefined> {
  try {
    return await apiGet<AssistenciaTerceirizada | null>(`/assistencia-terceirizada/${id}`).then((r) => r || undefined);
  } catch {
    return mockAssistenciasTerceirizadas.find((item) => item.id === id);
  }
}

export async function criarAssistenciaTerceirizada(data: Omit<AssistenciaTerceirizada, "id">): Promise<AssistenciaTerceirizada> {
  return apiPost<AssistenciaTerceirizada>("/assistencia-terceirizada", data);
}

export async function atualizarAssistenciaTerceirizada(id: string, data: Partial<AssistenciaTerceirizada>): Promise<AssistenciaTerceirizada> {
  return apiPut<AssistenciaTerceirizada>(`/assistencia-terceirizada/${id}`, data);
}

// ── Itens em Assistência ──
export async function listarItensEmAssistencia(): Promise<ItemEmAssistencia[]> {
  try {
    return await apiGet<ItemEmAssistencia[]>("/assistencia-terceirizada/itens");
  } catch {
    return mockItensEmAssistencia;
  }
}

export async function buscarItemEmAssistencia(id: string): Promise<ItemEmAssistencia | undefined> {
  try {
    return await apiGet<ItemEmAssistencia | null>(`/assistencia-terceirizada/itens/${id}`).then((r) => r || undefined);
  } catch {
    return mockItensEmAssistencia.find((item) => item.id === id);
  }
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
  try {
    return await apiGet<MovimentacaoAssistencia[]>("/assistencia-terceirizada/movimentacoes");
  } catch {
    return mockMovimentacoes;
  }
}

export async function listarMovimentacoesPorItem(itemId: string): Promise<MovimentacaoAssistencia[]> {
  try {
    return await apiGet<MovimentacaoAssistencia[]>(`/assistencia-terceirizada/movimentacoes/item/${itemId}`);
  } catch {
    return mockMovimentacoes.filter((item) => item.itemId === itemId);
  }
}

export async function listarMovimentacoesPorAssistencia(assistenciaId: string): Promise<MovimentacaoAssistencia[]> {
  try {
    return await apiGet<MovimentacaoAssistencia[]>(`/assistencia-terceirizada/movimentacoes/assistencia/${assistenciaId}`);
  } catch {
    return mockMovimentacoes.filter((item) => item.assistenciaId === assistenciaId);
  }
}

// ── Dashboard ──
export async function getDashboardTerceirizada() {
  try {
    return await apiGet<{
      totalAssistencias: number;
      totalPecasEmPoder: number;
      totalEquipamentosEmPoder: number;
      enviosNoPeriodo: number;
      retornosNoPeriodo: number;
      itensSemRetornoMaisDias: number;
      assistenciaMaiorVolume: string;
    }>("/assistencia-terceirizada/dashboard");
  } catch {
    return {
      totalAssistencias: mockAssistenciasTerceirizadas.length,
      totalPecasEmPoder: mockItensEmAssistencia.filter((item) => item.tipoItem === "PECA" && !["DEVOLVIDO", "ENCERRADO"].includes(item.status)).length,
      totalEquipamentosEmPoder: mockItensEmAssistencia.filter((item) => item.tipoItem === "EQUIPAMENTO" && !["DEVOLVIDO", "ENCERRADO"].includes(item.status)).length,
      enviosNoPeriodo: mockMovimentacoes.filter((item) => item.tipoMovimentacao.startsWith("ENVIO")).length,
      retornosNoPeriodo: mockMovimentacoes.filter((item) => item.tipoMovimentacao.startsWith("RETORNO")).length,
      itensSemRetornoMaisDias: 19,
      assistenciaMaiorVolume: "TechRepair Ltda",
    };
  }
}
