import { apiGet } from "@/services/api";
import { dashboardData } from "@/data/mockData";
import { sacDashboardData } from "@/data/mockSACData";

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

const mockQualidadeDashboard: DashboardQualidadeData = {
  garantiaRate: dashboardData.garantiaRate,
  totalGarantias: dashboardData.totalGarantias,
  totalNCs: dashboardData.totalNCs,
  avgResolutionDays: dashboardData.avgResolutionDays,
  topDefeitos: dashboardData.topDefeitos,
  ncByGravidade: dashboardData.ncByGravidade,
  garantiasByMonth: dashboardData.garantiasByMonth,
  ncByCategoria: dashboardData.ncByCategoria,
  avaliacaoSAC: {
    totalPesquisasEnviadas: 24,
    totalPesquisasRespondidas: 18,
    taxaResposta: 75,
    notaMedia: 4.4,
    percentualNotasAltas: 78,
    percentualNotasBaixas: 11,
    pesquisasNaoRespondidas: 6,
    evolucaoNotaPorPeriodo: [
      { periodo: "Out", notaMedia: 4.1 },
      { periodo: "Nov", notaMedia: 4.2 },
      { periodo: "Dez", notaMedia: 4.3 },
      { periodo: "Jan", notaMedia: 4.4 },
      { periodo: "Fev", notaMedia: 4.5 },
      { periodo: "Mar", notaMedia: 4.4 },
    ],
    avaliacoesPorPlanta: sacDashboardData.porPlanta,
    avaliacoesPorAtendente: [
      { name: "Ana SAC", value: 7 },
      { name: "Carlos SAC", value: 6 },
      { name: "Maria SAC", value: 5 },
    ],
    distribuicaoNota: [
      { name: "5", value: 9 },
      { name: "4", value: 5 },
      { name: "3", value: 2 },
      { name: "2", value: 1 },
      { name: "1", value: 1 },
    ],
  },
};

export async function getDashboardQualidade(): Promise<DashboardQualidadeData> {
  try {
    return await apiGet<DashboardQualidadeData>("/dashboard/qualidade");
  } catch {
    return mockQualidadeDashboard;
  }
}


