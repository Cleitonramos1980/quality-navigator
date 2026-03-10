import { apiGet } from "@/services/api";

import type { SACAvaliacaoDashboard } from "@/types/sac";

export interface DashboardQualidadeData {
  garantiaRate: number;
  totalGarantias: number;
  totalNCs: number;
  avgResolutionDays: number;
  topDefeitos: Array<{ name: string; value: number }>;
  ncByGravidade: Array<{ name: string; value: number }>;
  garantiasByMonth: Array<{ month: string; count: number }>;
  ncByCategoria: Array<{ name: string; value: number }>;
  avaliacaoSAC?: SACAvaliacaoDashboard;
}

export async function getDashboardQualidade(): Promise<DashboardQualidadeData> {
  return apiGet<DashboardQualidadeData>("/dashboard/qualidade");
}


