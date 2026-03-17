import { apiGet, apiPut, apiPost } from "@/services/api";
import type { ExcecaoTorre, TorreKPIs, ExcecaoStatus, ExcecaoCriticidade } from "@/types/torreControle";
import { mockExcecoesTorre, mockTorreKPIs } from "@/data/mockTorreControle";

export async function getExcecoesTorre(): Promise<ExcecaoTorre[]> {
  try { return await apiGet<ExcecaoTorre[]>("/operacional/torre-controle/excecoes"); } catch { return mockExcecoesTorre; }
}

export async function getTorreKPIs(): Promise<TorreKPIs> {
  try { return await apiGet<TorreKPIs>("/operacional/torre-controle/kpis"); } catch { return mockTorreKPIs; }
}

export async function getExcecaoById(id: string): Promise<ExcecaoTorre | undefined> {
  try { return await apiGet<ExcecaoTorre>(`/operacional/torre-controle/excecoes/${id}`); } catch { return mockExcecoesTorre.find(e => e.id === id); }
}

export async function atribuirResponsavel(id: string, responsavel: string): Promise<ExcecaoTorre> {
  try { return await apiPut<ExcecaoTorre>(`/operacional/torre-controle/excecoes/${id}/responsavel`, { responsavel }); }
  catch { return mockExcecoesTorre.find(e => e.id === id) || mockExcecoesTorre[0]; }
}

export async function atualizarStatusExcecao(id: string, status: ExcecaoStatus, justificativa?: string): Promise<ExcecaoTorre> {
  try { return await apiPut<ExcecaoTorre>(`/operacional/torre-controle/excecoes/${id}/status`, { status, justificativa }); }
  catch { return mockExcecoesTorre.find(e => e.id === id) || mockExcecoesTorre[0]; }
}

export async function registrarTratativa(id: string, tratativa: string): Promise<ExcecaoTorre> {
  try { return await apiPut<ExcecaoTorre>(`/operacional/torre-controle/excecoes/${id}/tratativa`, { tratativa }); }
  catch { return mockExcecoesTorre.find(e => e.id === id) || mockExcecoesTorre[0]; }
}

export async function reclassificarCriticidade(id: string, criticidade: ExcecaoCriticidade, justificativa: string): Promise<ExcecaoTorre> {
  try { return await apiPut<ExcecaoTorre>(`/operacional/torre-controle/excecoes/${id}/status`, { criticidade, justificativa }); }
  catch { return mockExcecoesTorre.find(e => e.id === id) || mockExcecoesTorre[0]; }
}

export async function criarExcecao(data: Partial<ExcecaoTorre>): Promise<ExcecaoTorre> {
  try { return await apiPost<ExcecaoTorre>("/operacional/torre-controle/excecoes", data); }
  catch { return mockExcecoesTorre[0]; }
}
