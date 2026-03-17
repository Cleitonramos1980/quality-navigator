import { apiGet } from "@/services/api";
import type { CustodiaNF, CustodiaKPIs } from "@/types/custodiaDigital";
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
