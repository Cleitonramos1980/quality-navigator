import { apiGet, apiPost, apiPut } from "@/services/api";
import type { CustodiaNF, CustodiaKPIs, CustodiaStatus, CustodiaEvento, EvidenciaEntrega } from "@/types/custodiaDigital";
import { mockCustodias, mockCustodiaKPIs } from "@/data/mockCustodia";

export async function getCustodias(): Promise<CustodiaNF[]> {
  try { return await apiGet<CustodiaNF[]>("/operacional/custodia"); } catch { return mockCustodias; }
}

export async function getCustodiaById(id: string): Promise<CustodiaNF | undefined> {
  try { return await apiGet<CustodiaNF>(`/operacional/custodia/${id}`); } catch { return mockCustodias.find(c => c.id === id); }
}

export async function getCustodiaKPIs(): Promise<CustodiaKPIs> {
  try { return await apiGet<CustodiaKPIs>("/operacional/custodia/kpis"); } catch { return mockCustodiaKPIs; }
}

export async function registrarEventoCustodia(id: string, evento: Partial<CustodiaEvento>): Promise<CustodiaNF> {
  try { return await apiPost<CustodiaNF>(`/operacional/custodia/${id}/evento`, evento); }
  catch { return mockCustodias.find(c => c.id === id) || mockCustodias[0]; }
}

export async function registrarEvidenciaCustodia(id: string, evidencia: Partial<EvidenciaEntrega>): Promise<CustodiaNF> {
  try { return await apiPost<CustodiaNF>(`/operacional/custodia/${id}/evidencia`, evidencia); }
  catch { return mockCustodias.find(c => c.id === id) || mockCustodias[0]; }
}

export async function atualizarStatusCustodia(
  id: string,
  status: CustodiaStatus,
  extra?: { recebedorNome?: string; statusAceite?: string; divergencia?: string }
): Promise<CustodiaNF> {
  try { return await apiPut<CustodiaNF>(`/operacional/custodia/${id}/status`, { status, ...extra }); }
  catch { return mockCustodias.find(c => c.id === id) || mockCustodias[0]; }
}
