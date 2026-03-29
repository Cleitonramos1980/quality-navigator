/**
 * Service contracts for the Inventory module.
 * Currently returns mock data; prepared for backend integration.
 */

import { apiDelete, apiGet, apiPost, apiPut } from "@/services/api";
import type {
  LojaInventario, DepartamentoInventario, FrequenciaConfig,
  TarefaInventario, Contagem, DivergenciaDiaria,
} from "@/types/inventario";
import type { ChecklistPreInventario, ChecklistItem } from "@/types/checklistPreInventario";
import {
  mockLojas, mockDepartamentos, mockFrequenciaConfigs,
  mockTarefas, mockContagens, mockDivergencias,
} from "@/data/mockInventarioData";
import { mockChecklists } from "@/data/mockChecklistPreInventario";

// Backend: GET /inventario/lojas
export async function getLojas(): Promise<LojaInventario[]> {
  try { return await apiGet<LojaInventario[]>("/inventario/lojas"); } catch { return mockLojas; }
}

// Backend: GET /inventario/departamentos
export async function getDepartamentos(): Promise<DepartamentoInventario[]> {
  try { return await apiGet<DepartamentoInventario[]>("/inventario/departamentos"); } catch { return mockDepartamentos; }
}

// Backend: GET /inventario/frequencias
export async function getFrequenciaConfigs(): Promise<FrequenciaConfig[]> {
  try { return await apiGet<FrequenciaConfig[]>("/inventario/frequencias"); } catch { return mockFrequenciaConfigs; }
}

// Backend: GET /inventario/tarefas
export async function getTarefas(): Promise<TarefaInventario[]> {
  try { return await apiGet<TarefaInventario[]>("/inventario/tarefas"); } catch { return mockTarefas; }
}

// Backend: GET /inventario/contagens
export async function getContagens(): Promise<Contagem[]> {
  try { return await apiGet<Contagem[]>("/inventario/contagens"); } catch { return mockContagens; }
}

// Backend: GET /inventario/contagens/:id
export async function getContagemById(id: string): Promise<Contagem | undefined> {
  try { return await apiGet<Contagem>(`/inventario/contagens/${id}`); } catch { return mockContagens.find((c) => c.id === id); }
}

// Backend: POST /inventario/contagens
export async function criarContagem(data: Partial<Contagem>): Promise<Contagem> {
  try { return await apiPost<Contagem>("/inventario/contagens", data); } catch { return mockContagens[0]; }
}

// Backend: PUT /inventario/contagens/:id
export async function salvarContagem(id: string, data: Partial<Contagem>): Promise<Contagem> {
  try { return await apiPut<Contagem>(`/inventario/contagens/${id}`, data); } catch { return mockContagens[0]; }
}

// Backend: PUT /inventario/contagens/:id/validar
export async function validarContagem(id: string, validadoPor: string): Promise<Contagem> {
  try { return await apiPut<Contagem>(`/inventario/contagens/${id}/validar`, { validadoPor }); } catch { return mockContagens[0]; }
}

// Backend: POST /inventario/contagens/:id/recontagem
export async function solicitarRecontagem(id: string, solicitadoPor: string): Promise<Contagem> {
  try { return await apiPost<Contagem>(`/inventario/contagens/${id}/recontagem`, { solicitadoPor }); } catch { return mockContagens[0]; }
}

// Backend: GET /inventario/divergencias
export async function getDivergencias(): Promise<DivergenciaDiaria[]> {
  try { return await apiGet<DivergenciaDiaria[]>("/inventario/divergencias"); } catch { return mockDivergencias; }
}

export interface InventarioDashboardData {
  totalContagens: number;
  contagensConcluidas: number;
  contagensPendentes: number;
  acuracidadeMedia: number;
  lojasComDivergenciaAlta: number;
  totalItensContados: number;
  totalItensDivergentes: number;
}

// Backend: GET /inventario/dashboard
export async function getInventarioDashboard(): Promise<InventarioDashboardData> {
  try {
    return await apiGet<InventarioDashboardData>("/inventario/dashboard");
  } catch {
    const concluidas = mockContagens.filter((c) => ["CONCLUIDO", "VALIDADO"].includes(c.status));
    const acuracidadeMedia = concluidas.length > 0
      ? Math.round(concluidas.reduce((sum, c) => sum + c.acuracidade, 0) / concluidas.length)
      : 0;
    return {
      totalContagens: mockContagens.length,
      contagensConcluidas: concluidas.length,
      contagensPendentes: mockContagens.filter((c) => ["NAO_INICIADO", "EM_ANDAMENTO"].includes(c.status)).length,
      acuracidadeMedia,
      lojasComDivergenciaAlta: mockDivergencias.filter((d) => d.nivel === "alta").length,
      totalItensContados: concluidas.reduce((sum, c) => sum + c.itensContados, 0),
      totalItensDivergentes: concluidas.reduce((sum, c) => sum + c.itensDivergentes, 0),
    };
  }
}

export interface ChecklistPreInventarioDashboardData {
  totalChecklists: number;
  totalItens: number;
  concluidos: number;
  pendentes: number;
  emAndamento: number;
  criticos: number;
  ncs: number;
  semResponsavel: number;
  semEvidencia: number;
  progresso: number;
  bloqueadosPorNc: number;
}

export async function listChecklistsPreInventario(): Promise<ChecklistPreInventario[]> {
  try {
    return await apiGet<ChecklistPreInventario[]>("/inventario/checklists");
  } catch {
    return mockChecklists;
  }
}

export async function getChecklistPreInventarioById(id: string): Promise<ChecklistPreInventario | null> {
  try {
    return await apiGet<ChecklistPreInventario>(`/inventario/checklists/${encodeURIComponent(id)}`);
  } catch {
    return mockChecklists.find((checklist) => checklist.id === id) ?? null;
  }
}

export async function createChecklistPreInventario(payload: Partial<ChecklistPreInventario>): Promise<ChecklistPreInventario> {
  try {
    return await apiPost<ChecklistPreInventario>("/inventario/checklists", payload);
  } catch {
    return mockChecklists[0];
  }
}

export async function updateChecklistPreInventario(id: string, payload: Partial<ChecklistPreInventario>): Promise<ChecklistPreInventario> {
  try {
    return await apiPut<ChecklistPreInventario>(`/inventario/checklists/${encodeURIComponent(id)}`, payload);
  } catch {
    const fallback = mockChecklists.find((checklist) => checklist.id === id) ?? mockChecklists[0];
    return {
      ...fallback,
      ...payload,
    };
  }
}

export async function deleteChecklistPreInventario(id: string): Promise<void> {
  try {
    await apiDelete(`/inventario/checklists/${encodeURIComponent(id)}`);
  } catch {
    // noop fallback
  }
}

export async function updateChecklistPreInventarioItem(
  checklistId: string,
  itemId: string,
  payload: Partial<ChecklistItem>,
): Promise<ChecklistItem> {
  try {
    return await apiPut<ChecklistItem>(
      `/inventario/checklists/${encodeURIComponent(checklistId)}/itens/${encodeURIComponent(itemId)}`,
      payload,
    );
  } catch {
    const checklist = mockChecklists.find((row) => row.id === checklistId);
    const item = checklist?.blocos.flatMap((bloco) => bloco.itens).find((row) => row.id === itemId);
    return {
      ...(item ?? {
        id: itemId,
        blocoId: "",
        descricao: "",
        status: "PENDENTE",
        responsavel: "",
        data: "",
        setor: "",
        criticidade: "MEDIA",
        historico: [],
      }),
      ...payload,
    };
  }
}

export async function getChecklistPreInventarioItemHistorico(checklistId: string, itemId: string) {
  try {
    return await apiGet<Array<{ id: string; data: string; usuario: string; acao: string; detalhe: string }>>(
      `/inventario/checklists/${encodeURIComponent(checklistId)}/itens/${encodeURIComponent(itemId)}/historico`,
    );
  } catch {
    const checklist = mockChecklists.find((row) => row.id === checklistId);
    const item = checklist?.blocos.flatMap((bloco) => bloco.itens).find((row) => row.id === itemId);
    return item?.historico ?? [];
  }
}

export async function addChecklistPreInventarioItemEvidencia(
  checklistId: string,
  itemId: string,
  payload: {
    nomeArquivo?: string;
    caminho?: string;
    mimeType?: string;
    tamanho?: number;
    descricao?: string;
  },
) {
  try {
    return await apiPost<any>(
      `/inventario/checklists/${encodeURIComponent(checklistId)}/itens/${encodeURIComponent(itemId)}/evidencias`,
      payload,
    );
  } catch {
    return {
      id: `${itemId}-EVD`,
      nomeArquivo: payload.nomeArquivo ?? "evidencia.png",
      caminho: payload.caminho ?? "",
      mimeType: payload.mimeType ?? "image/png",
      tamanho: payload.tamanho ?? 0,
      descricao: payload.descricao,
    };
  }
}

export async function getChecklistPreInventarioDashboard(): Promise<ChecklistPreInventarioDashboardData> {
  try {
    return await apiGet<ChecklistPreInventarioDashboardData>("/inventario/checklists/dashboard");
  } catch {
    const allItems = mockChecklists.flatMap((checklist) => checklist.blocos.flatMap((bloco) => bloco.itens));
    const totalItens = allItems.length;
    const concluidos = allItems.filter((item) => item.status === "CONCLUIDO").length;
    const pendentes = allItems.filter((item) => item.status === "PENDENTE").length;
    const emAndamento = allItems.filter((item) => item.status === "EM_ANDAMENTO").length;
    const criticos = allItems.filter((item) => item.criticidade === "ALTA" && item.status !== "CONCLUIDO").length;
    const ncs = allItems.filter((item) => !!item.nc).length;
    const semResponsavel = allItems.filter((item) => !item.responsavel).length;
    const semEvidencia = allItems.filter((item) => !item.evidencia && (!item.evidencias || item.evidencias.length === 0)).length;
    return {
      totalChecklists: mockChecklists.length,
      totalItens,
      concluidos,
      pendentes,
      emAndamento,
      criticos,
      ncs,
      semResponsavel,
      semEvidencia,
      progresso: totalItens > 0 ? Number(((concluidos / totalItens) * 100).toFixed(2)) : 0,
      bloqueadosPorNc: mockChecklists.filter((checklist) =>
        checklist.statusGeral !== "CONCLUIDO"
        && checklist.blocos.some((bloco) => bloco.itens.some((item) => !!item.nc))).length,
    };
  }
}
