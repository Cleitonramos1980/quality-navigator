import { apiGet, apiPost, apiPostFormData, apiPut } from "@/services/api";
import { SESMT_MENU_GROUPS, SESMT_MENU_CHILDREN } from "@/lib/sesmtMenu";
import { MOCK_COLABORADORES, getDossieByColaboradorId } from "@/data/mockDossieColaborador";
import type { Colaborador, DossieColaborador } from "@/data/mockDossieColaborador";
import type {
  SesmtExecutiveView,
  SesmtFavoritePreset,
  SesmtIndicatorsDashboard,
  SesmtMasterDashboard,
  SesmtMaturityDashboard,
  SesmtMenuGroup,
  SesmtModuleDefinition,
  SesmtOccupationalDashboard,
  SesmtPredictiveDashboard,
  SesmtRecord,
  SesmtRecordListResult,
} from "@/types/sesmt";

export interface SesmtRecordFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  unidade?: string;
  responsavel?: string;
  criticidade?: string;
  nr?: string;
  periodStart?: string;
  periodEnd?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  specificFilters?: Record<string, string>;
}

export interface SesmtFavoritePresetPayload {
  presetKey: string | null;
  status?: string;
  criticidade?: string;
  unidade?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  specificFilters?: Record<string, string>;
}

type QueryValue = string | number | boolean | Record<string, unknown> | undefined;

const mockSesmtModules: SesmtModuleDefinition[] = SESMT_MENU_GROUPS.flatMap((group) =>
  group.children.map((child) => ({
    key: child.key,
    path: child.path,
    groupKey: group.key,
    groupLabel: group.label,
    label: child.label,
    description: child.label,
    collectionKey: child.key.replace(/-/g, "_"),
    visibility: "STANDARD" as const,
  })),
);

const mockSesmtMasterDashboard: SesmtMasterDashboard = {
  scoreGeral: 82,
  documentosVencendo: 6,
  asoVencendo: 11,
  treinamentosVencendo: 9,
  inspecoesAtrasadas: 4,
  acoesCriticasAbertas: 7,
  rankingUnidades: [
    { unidade: "MAO", score: 86, total: 42, concluidos: 34, criticos: 3 },
    { unidade: "BEL", score: 81, total: 35, concluidos: 27, criticos: 4 },
    { unidade: "AGR", score: 77, total: 29, concluidos: 21, criticos: 5 },
  ],
  visaoNr: [
    { nr: "NR-01", total: 12 },
    { nr: "NR-04", total: 8 },
    { nr: "NR-07", total: 10 },
    { nr: "NR-23", total: 6 },
  ],
  custoAnual: 390000,
  tendencia: [
    { mes: "Out", abertos: 12, concluidos: 9 },
    { mes: "Nov", abertos: 10, concluidos: 11 },
    { mes: "Dez", abertos: 9, concluidos: 10 },
    { mes: "Jan", abertos: 11, concluidos: 12 },
    { mes: "Fev", abertos: 8, concluidos: 10 },
    { mes: "Mar", abertos: 7, concluidos: 9 },
  ],
  pendenciasPrioritarias: [
    { id: "SES-RIS-001", titulo: "Revisar PGR corporativo", unidade: "MAO", responsavel: "Ana Souza", vencimentoAt: "2026-04-10", moduleKey: "riscos-barreiras-e-controles" },
    { id: "SES-IND-001", titulo: "Atualizar inspeção de EPC", unidade: "BEL", responsavel: "Bruno Lima", vencimentoAt: "2026-04-05", moduleKey: "indicadores" },
    { id: "SES-SAU-001", titulo: "Regularizar exames ocupacionais pendentes", unidade: "AGR", responsavel: "Carla Reis", vencimentoAt: "2026-04-03", moduleKey: "gerencial-ocupacional" },
  ],
  generatedAt: new Date().toISOString(),
  generatedBy: "frontend-fallback",
};

const mockSesmtMaturityDashboard: SesmtMaturityDashboard = {
  indiceMaturidade: 82,
  eixoDetalhado: [
    { eixo: "Governança", peso: 25, valor: 84 },
    { eixo: "Conformidade", peso: 25, valor: 80 },
    { eixo: "Operação", peso: 25, valor: 79 },
    { eixo: "Saúde Ocupacional", peso: 25, valor: 85 },
  ],
  rankingUnidades: mockSesmtMasterDashboard.rankingUnidades,
  generatedAt: new Date().toISOString(),
};

const mockSesmtPredictiveDashboard: SesmtPredictiveDashboard = {
  riscosFuturos: [
    { unidade: "MAO", riscoFuturo: 28, reincidencia: 21, degradacao: 18, justificativa: "Treinamentos e inspeções em recuperação." },
    { unidade: "BEL", riscoFuturo: 34, reincidencia: 27, degradacao: 22, justificativa: "Maior concentração de pendências críticas." },
    { unidade: "AGR", riscoFuturo: 31, reincidencia: 24, degradacao: 20, justificativa: "Exames ocupacionais vencendo no próximo ciclo." },
  ],
  alertas: [
    { unidade: "BEL", nivel: "ALTO", titulo: "Pendências NR-23", descricao: "Plano de emergência requer revisão.", justificativa: "Prazo regulatório próximo do vencimento." },
    { unidade: "AGR", nivel: "MEDIO", titulo: "ASO em atraso", descricao: "Colaboradores com exames a vencer.", justificativa: "Necessário replanejamento com clínica ocupacional." },
  ],
  generatedAt: new Date().toISOString(),
};

const mockSesmtIndicatorsDashboard: SesmtIndicatorsDashboard = {
  cards: [
    { titulo: "Ações críticas", valor: 7, meta: 5, unidade: "" },
    { titulo: "Treinamentos vencendo", valor: 9, meta: 6, unidade: "" },
    { titulo: "ASO pendentes", valor: 11, meta: 4, unidade: "" },
    { titulo: "Inspeções atrasadas", valor: 4, meta: 2, unidade: "" },
  ],
  statusDistribuicao: [
    { status: "ABERTO", total: 14 },
    { status: "EM_ANDAMENTO", total: 19 },
    { status: "CONCLUIDO", total: 31 },
    { status: "ATRASADO", total: 4 },
  ],
  criticidadeDistribuicao: [
    { criticidade: "BAIXA", total: 12 },
    { criticidade: "MEDIA", total: 21 },
    { criticidade: "ALTA", total: 10 },
    { criticidade: "CRITICA", total: 4 },
  ],
  visaoNr: mockSesmtMasterDashboard.visaoNr,
  tendencia: mockSesmtMasterDashboard.tendencia,
  generatedAt: new Date().toISOString(),
};

const mockSesmtOccupationalDashboard: SesmtOccupationalDashboard = {
  kpis: {
    totalProntuarios: 218,
    examesPendentes: 11,
    afastamentos: 3,
    restricoesAtivas: 5,
  },
  agendaExames: [
    { id: "EX-001", colaborador: "Diego Matos", unidade: "MAO", vencimentoAt: "2026-04-08", status: "PENDENTE" },
    { id: "EX-002", colaborador: "Elaine Costa", unidade: "BEL", vencimentoAt: "2026-04-10", status: "AGENDADO" },
  ],
  historicoAtendimentos: [
    { id: "ATD-001", titulo: "Atendimento ambulatorial - lombalgia", unidade: "MAO", updatedAt: new Date().toISOString(), status: "CONCLUIDO" },
    { id: "ATD-002", titulo: "Acompanhamento ocupacional - retorno", unidade: "AGR", updatedAt: new Date().toISOString(), status: "EM_ANDAMENTO" },
  ],
  generatedAt: new Date().toISOString(),
};

function queryString(filters?: Record<string, QueryValue>): string {
  if (!filters) return "";
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value == null) return;
    if (typeof value === "object") {
      const serialized = JSON.stringify(value);
      if (serialized === "{}" || serialized === "[]") return;
      params.set(key, serialized);
      return;
    }
    if (String(value).trim() === "") return;
    params.set(key, String(value));
  });
  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function getSesmtMenu(): Promise<SesmtMenuGroup[]> {
  try {
    return await apiGet<SesmtMenuGroup[]>("/sesmt/menu");
  } catch {
    return SESMT_MENU_GROUPS;
  }
}

export async function getSesmtModules(): Promise<SesmtModuleDefinition[]> {
  try {
    return await apiGet<SesmtModuleDefinition[]>("/sesmt/modules");
  } catch {
    return mockSesmtModules;
  }
}

export async function getSesmtExecutiveViews(): Promise<SesmtExecutiveView[]> {
  try {
    return await apiGet<SesmtExecutiveView[]>("/sesmt/executive-views");
  } catch {
    return SESMT_MENU_CHILDREN.map((child) => ({ key: child.key, label: child.label }));
  }
}

export async function getSesmtLookups() {
  try {
    return await apiGet<any>("/sesmt/lookups");
  } catch {
    return { unidades: ["MAO", "BEL", "AGR"] };
  }
}

export async function getSesmtMasterDashboard(filters?: { unidade?: string; periodStart?: string; periodEnd?: string }) {
  try {
    return await apiGet<SesmtMasterDashboard>(`/sesmt/dashboard/painel-mestre${queryString(filters)}`);
  } catch {
    return mockSesmtMasterDashboard;
  }
}

export async function getSesmtMaturityDashboard(filters?: { unidade?: string }) {
  try {
    return await apiGet<SesmtMaturityDashboard>(`/sesmt/dashboard/indice-maturidade${queryString(filters)}`);
  } catch {
    return mockSesmtMaturityDashboard;
  }
}

export async function getSesmtPredictiveDashboard(filters?: { unidade?: string }) {
  try {
    return await apiGet<SesmtPredictiveDashboard>(`/sesmt/dashboard/painel-preditivo${queryString(filters)}`);
  } catch {
    return mockSesmtPredictiveDashboard;
  }
}

export async function getSesmtIndicatorsDashboard(filters?: { unidade?: string }) {
  try {
    return await apiGet<SesmtIndicatorsDashboard>(`/sesmt/dashboard/indicadores${queryString(filters)}`);
  } catch {
    return mockSesmtIndicatorsDashboard;
  }
}

export async function getSesmtOccupationalDashboard(filters?: { unidade?: string }) {
  try {
    return await apiGet<SesmtOccupationalDashboard>(`/sesmt/dashboard/gerencial-ocupacional${queryString(filters)}`);
  } catch {
    return mockSesmtOccupationalDashboard;
  }
}

export function listSesmtRecords(moduleKey: string, filters?: SesmtRecordFilters) {
  return apiGet<SesmtRecordListResult>(`/sesmt/modules/${encodeURIComponent(moduleKey)}/records${queryString(filters as unknown as Record<string, QueryValue>)}`);
}

export function getSesmtFavoritePreset(moduleKey: string) {
  return apiGet<{ favoritePreset: SesmtFavoritePreset | null }>(`/sesmt/modules/${encodeURIComponent(moduleKey)}/favorite-preset`);
}

export function saveSesmtFavoritePreset(moduleKey: string, payload: SesmtFavoritePresetPayload) {
  return apiPut<{ favoritePreset: SesmtFavoritePreset }>(`/sesmt/modules/${encodeURIComponent(moduleKey)}/favorite-preset`, payload);
}

export function getSesmtRecord(moduleKey: string, id: string) {
  return apiGet<SesmtRecord>(`/sesmt/modules/${encodeURIComponent(moduleKey)}/records/${encodeURIComponent(id)}`);
}

export function createSesmtRecord(moduleKey: string, payload: Partial<SesmtRecord>) {
  return apiPost<SesmtRecord>(`/sesmt/modules/${encodeURIComponent(moduleKey)}/records`, payload);
}

export function updateSesmtRecord(moduleKey: string, id: string, payload: Partial<SesmtRecord>) {
  return apiPut<SesmtRecord>(`/sesmt/modules/${encodeURIComponent(moduleKey)}/records/${encodeURIComponent(id)}`, payload);
}

export function addSesmtEvidence(moduleKey: string, id: string, payload: { descricao: string; tipo?: string; data?: string; responsavel?: string; anexoId?: string }) {
  return apiPost<SesmtRecord>(`/sesmt/modules/${encodeURIComponent(moduleKey)}/records/${encodeURIComponent(id)}/evidencias`, payload);
}

export async function uploadSesmtAttachments(moduleKey: string, id: string, files: File[]) {
  const form = new FormData();
  files.forEach((file) => form.append("files", file, file.name));
  return apiPostFormData<{ uploaded: any[]; rejected: Array<{ nomeArquivo: string; motivo: string }> }>(
    `/sesmt/modules/${encodeURIComponent(moduleKey)}/records/${encodeURIComponent(id)}/anexos`,
    form,
  );
}

export function listSesmtAccessAudit() {
  return apiGet<any[]>("/sesmt/access-audit");
}

export interface SesmtColaboradorDossieListFilters {
  search?: string;
  unidade?: string;
  status?: string;
}

export async function listSesmtColaboradores(filters?: SesmtColaboradorDossieListFilters): Promise<Colaborador[]> {
  try {
    return await apiGet<Colaborador[]>(`/sesmt/colaboradores${queryString(filters as unknown as Record<string, QueryValue>)}`);
  } catch {
    return MOCK_COLABORADORES;
  }
}

export async function getSesmtColaboradorDossie(colaboradorId: string): Promise<DossieColaborador | null> {
  try {
    return await apiGet<DossieColaborador>(`/sesmt/colaboradores/${encodeURIComponent(colaboradorId)}/dossie`);
  } catch {
    return getDossieByColaboradorId(colaboradorId);
  }
}

export async function getSesmtColaboradorDossieTimeline(colaboradorId: string) {
  try {
    return await apiGet<{ colaboradorId: string; timeline: DossieColaborador["timeline"] }>(
      `/sesmt/colaboradores/${encodeURIComponent(colaboradorId)}/dossie/timeline`,
    );
  } catch {
    return {
      colaboradorId,
      timeline: getDossieByColaboradorId(colaboradorId)?.timeline ?? [],
    };
  }
}

export async function getSesmtColaboradorDossieDocumentos(colaboradorId: string) {
  try {
    return await apiGet<{ colaboradorId: string; documentos: DossieColaborador["documentos"] }>(
      `/sesmt/colaboradores/${encodeURIComponent(colaboradorId)}/dossie/documentos`,
    );
  } catch {
    return {
      colaboradorId,
      documentos: getDossieByColaboradorId(colaboradorId)?.documentos ?? [],
    };
  }
}

export async function getSesmtColaboradorDossieAlertas(colaboradorId: string) {
  try {
    return await apiGet<{ colaboradorId: string; alertas: string[]; pendencias: string[] }>(
      `/sesmt/colaboradores/${encodeURIComponent(colaboradorId)}/dossie/alertas`,
    );
  } catch {
    const dossie = getDossieByColaboradorId(colaboradorId);
    return {
      colaboradorId,
      alertas: dossie?.colaborador.alertas ?? [],
      pendencias: dossie?.colaborador.alertas ?? [],
    };
  }
}

export async function getSesmtColaboradorDossieRelatorio(colaboradorId: string) {
  try {
    return await apiGet<any>(`/sesmt/colaboradores/${encodeURIComponent(colaboradorId)}/dossie/relatorio`);
  } catch {
    const dossie = getDossieByColaboradorId(colaboradorId);
    return {
      colaborador: dossie?.colaborador ?? null,
      resumo: {
        totalExames: dossie?.exames.length ?? 0,
        examesVencidos: dossie?.exames.filter((item) => item.status === "VENCIDO").length ?? 0,
        totalTreinamentos: dossie?.treinamentos.length ?? 0,
        treinamentosPendentes: dossie?.treinamentos.filter((item) => item.status === "PENDENTE" || item.status === "VENCIDO").length ?? 0,
        totalVacinas: dossie?.vacinas.length ?? 0,
        vacinasPendentes: dossie?.vacinas.filter((item) => item.status === "PENDENTE" || item.status === "ATRASADA").length ?? 0,
      },
      alertas: dossie?.colaborador.alertas ?? [],
      pendencias: dossie?.colaborador.alertas ?? [],
      generatedAt: new Date().toISOString(),
      generatedBy: "frontend-fallback",
    };
  }
}

export async function exportSesmtColaboradorDossie(colaboradorId: string, payload?: { formato?: "PDF" | "XLSX" | "JSON"; incluirSigiloso?: boolean }) {
  try {
    return await apiPost<any>(
      `/sesmt/colaboradores/${encodeURIComponent(colaboradorId)}/dossie/exportar`,
      payload ?? {},
    );
  } catch {
    return {
      status: "QUEUED",
      colaboradorId,
      exportId: `EXP-${Math.floor(Math.random() * 1_000_000)}`,
      solicitadoPor: "frontend-fallback",
      solicitadoEm: new Date().toISOString(),
    };
  }
}

