import { apiGet, apiPut } from "@/services/api";
import type { ExcecaoTorre, TorreKPIs } from "@/types/torreControle";
import { mockExcecoesTorre, mockTorreKPIs } from "@/data/mockTorreControle";

export async function getExcecoesTorre(): Promise<ExcecaoTorre[]> {
  try { return await apiGet<ExcecaoTorre[]>("/operacional/torre-controle/excecoes"); } catch { return mockExcecoesTorre; }
}

export async function getTorreKPIs(): Promise<TorreKPIs> {
  try { return await apiGet<TorreKPIs>("/operacional/torre-controle/kpis"); } catch { return mockTorreKPIs; }
}

export async function atribuirResponsavel(id: string, responsavel: string): Promise<ExcecaoTorre> {
  try { return await apiPut<ExcecaoTorre>(`/operacional/torre-controle/excecoes/${id}/responsavel`, { responsavel }); }
  catch { return mockExcecoesTorre.find(e => e.id === id) || mockExcecoesTorre[0]; }
}

export async function atualizarStatusExcecao(id: string, status: string, justificativa?: string): Promise<ExcecaoTorre> {
  try { return await apiPut<ExcecaoTorre>(`/operacional/torre-controle/excecoes/${id}/status`, { status, justificativa }); }
  catch { return mockExcecoesTorre.find(e => e.id === id) || mockExcecoesTorre[0]; }
}
