/**
 * Service contracts for the Inventory module.
 * Currently returns mock data; prepared for backend integration.
 */

import { apiGet, apiPost, apiPut } from "@/services/api";
import type {
  LojaInventario, DepartamentoInventario, FrequenciaConfig,
  TarefaInventario, Contagem, DivergenciaDiaria,
} from "@/types/inventario";
import {
  mockLojas, mockDepartamentos, mockFrequenciaConfigs,
  mockTarefas, mockContagens, mockDivergencias,
} from "@/data/mockInventarioData";

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
