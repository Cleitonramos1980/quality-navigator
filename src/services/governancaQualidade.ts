import { apiGet, apiPost, apiPut } from "@/services/api";
import type {
  AuditoriaCamada,
  AvaliacaoRiscoSla,
  DocumentoQualidade,
  EstudoMsa,
  FornecedorQualidade,
  GateFornecedor,
  IndicadorIndustrial,
  IndicadorIndustrialResumo,
  InstrumentoMetrologia,
  IsoReadinessItem,
  IsoReadinessResumo,
  MudancaQualidade,
  RegraRiscoSla,
  ScarFornecedor,
  TreinamentoParticipante,
  TreinamentoQualidade,
} from "@/types/sgq";

export async function listDocumentosQualidade(): Promise<DocumentoQualidade[]> {
  return apiGet<DocumentoQualidade[]>("/qualidade/documentos");
}

export async function createDocumentoQualidade(
  payload: Omit<DocumentoQualidade, "id" | "createdAt" | "updatedAt">,
): Promise<DocumentoQualidade> {
  return apiPost<DocumentoQualidade>("/qualidade/documentos", payload);
}

export async function updateDocumentoQualidade(
  id: string,
  payload: Partial<DocumentoQualidade>,
): Promise<DocumentoQualidade> {
  return apiPut<DocumentoQualidade>(`/qualidade/documentos/${id}`, payload);
}

export async function listTreinamentosQualidade(): Promise<TreinamentoQualidade[]> {
  return apiGet<TreinamentoQualidade[]>("/qualidade/treinamentos");
}

export async function createTreinamentoQualidade(
  payload: Omit<TreinamentoQualidade, "id">,
): Promise<TreinamentoQualidade> {
  return apiPost<TreinamentoQualidade>("/qualidade/treinamentos", payload);
}

export async function updateTreinamentoQualidade(
  id: string,
  payload: Partial<TreinamentoQualidade>,
): Promise<TreinamentoQualidade> {
  return apiPut<TreinamentoQualidade>(`/qualidade/treinamentos/${id}`, payload);
}

export async function listTreinamentoParticipantes(
  treinamentoId?: string,
): Promise<TreinamentoParticipante[]> {
  const query = treinamentoId
    ? `?treinamentoId=${encodeURIComponent(treinamentoId)}`
    : "";
  return apiGet<TreinamentoParticipante[]>(`/qualidade/treinamentos/participantes${query}`);
}

export async function addTreinamentoParticipante(
  payload: Omit<TreinamentoParticipante, "id">,
): Promise<TreinamentoParticipante> {
  return apiPost<TreinamentoParticipante>("/qualidade/treinamentos/participantes", payload);
}

export async function updateTreinamentoParticipante(
  id: string,
  payload: Partial<TreinamentoParticipante>,
): Promise<TreinamentoParticipante> {
  return apiPut<TreinamentoParticipante>(`/qualidade/treinamentos/participantes/${id}`, payload);
}

export async function listMudancasQualidade(): Promise<MudancaQualidade[]> {
  return apiGet<MudancaQualidade[]>("/qualidade/mudancas");
}

export async function createMudancaQualidade(
  payload: Omit<MudancaQualidade, "id">,
): Promise<MudancaQualidade> {
  return apiPost<MudancaQualidade>("/qualidade/mudancas", payload);
}

export async function updateMudancaQualidade(
  id: string,
  payload: Partial<MudancaQualidade>,
): Promise<MudancaQualidade> {
  return apiPut<MudancaQualidade>(`/qualidade/mudancas/${id}`, payload);
}

export async function listFornecedoresQualidade(): Promise<FornecedorQualidade[]> {
  return apiGet<FornecedorQualidade[]>("/qualidade/fornecedores");
}

export async function createFornecedorQualidade(
  payload: Omit<FornecedorQualidade, "id">,
): Promise<FornecedorQualidade> {
  return apiPost<FornecedorQualidade>("/qualidade/fornecedores", payload);
}

export async function updateFornecedorQualidade(
  id: string,
  payload: Partial<FornecedorQualidade>,
): Promise<FornecedorQualidade> {
  return apiPut<FornecedorQualidade>(`/qualidade/fornecedores/${id}`, payload);
}

export async function listScarsFornecedor(
  fornecedorId?: string,
): Promise<ScarFornecedor[]> {
  const query = fornecedorId ? `?fornecedorId=${encodeURIComponent(fornecedorId)}` : "";
  return apiGet<ScarFornecedor[]>(`/qualidade/scar${query}`);
}

export async function createScarFornecedor(
  payload: Omit<ScarFornecedor, "id">,
): Promise<ScarFornecedor> {
  return apiPost<ScarFornecedor>("/qualidade/scar", payload);
}

export async function updateScarFornecedor(
  id: string,
  payload: Partial<ScarFornecedor>,
): Promise<ScarFornecedor> {
  return apiPut<ScarFornecedor>(`/qualidade/scar/${id}`, payload);
}

export async function listInstrumentosMetrologia(): Promise<InstrumentoMetrologia[]> {
  return apiGet<InstrumentoMetrologia[]>("/qualidade/metrologia/instrumentos");
}

export async function createInstrumentoMetrologia(
  payload: Omit<InstrumentoMetrologia, "id">,
): Promise<InstrumentoMetrologia> {
  return apiPost<InstrumentoMetrologia>("/qualidade/metrologia/instrumentos", payload);
}

export async function listEstudosMsa(instrumentoId?: string): Promise<EstudoMsa[]> {
  const query = instrumentoId ? `?instrumentoId=${encodeURIComponent(instrumentoId)}` : "";
  return apiGet<EstudoMsa[]>(`/qualidade/metrologia/msa${query}`);
}

export async function createEstudoMsa(payload: Omit<EstudoMsa, "id">): Promise<EstudoMsa> {
  return apiPost<EstudoMsa>("/qualidade/metrologia/msa", payload);
}

export async function listIndicadoresIndustriais(filters?: {
  planta?: string;
  linha?: string;
}): Promise<IndicadorIndustrial[]> {
  const params = new URLSearchParams();
  if (filters?.planta) params.set("planta", filters.planta);
  if (filters?.linha) params.set("linha", filters.linha);
  const query = params.toString() ? `?${params.toString()}` : "";
  return apiGet<IndicadorIndustrial[]>(`/qualidade/kpis-industriais${query}`);
}

export async function createIndicadorIndustrial(
  payload: Omit<IndicadorIndustrial, "id">,
): Promise<IndicadorIndustrial> {
  return apiPost<IndicadorIndustrial>("/qualidade/kpis-industriais", payload);
}

export async function getResumoIndicadoresIndustriais(filters?: {
  planta?: string;
  linha?: string;
}): Promise<IndicadorIndustrialResumo> {
  const params = new URLSearchParams();
  if (filters?.planta) params.set("planta", filters.planta);
  if (filters?.linha) params.set("linha", filters.linha);
  const query = params.toString() ? `?${params.toString()}` : "";
  return apiGet<IndicadorIndustrialResumo>(`/qualidade/kpis-industriais/resumo${query}`);
}

export async function listRegrasRiscoSla(origemTipo?: string): Promise<RegraRiscoSla[]> {
  const query = origemTipo ? `?origemTipo=${encodeURIComponent(origemTipo)}` : "";
  return apiGet<RegraRiscoSla[]>(`/qualidade/risco-sla/regras${query}`);
}

export async function createRegraRiscoSla(payload: Omit<RegraRiscoSla, "id">): Promise<RegraRiscoSla> {
  return apiPost<RegraRiscoSla>("/qualidade/risco-sla/regras", payload);
}

export async function listAvaliacoesRiscoSla(origemTipo?: string): Promise<AvaliacaoRiscoSla[]> {
  const params = new URLSearchParams();
  params.set("refreshStatus", "1");
  if (origemTipo) params.set("origemTipo", origemTipo);
  return apiGet<AvaliacaoRiscoSla[]>(`/qualidade/risco-sla/avaliacoes?${params.toString()}`);
}

export async function createAvaliacaoRiscoSla(
  payload: Omit<AvaliacaoRiscoSla, "id" | "pontuacao" | "slaHoras" | "statusSla" | "limiteAt" | "criadoAt">,
): Promise<AvaliacaoRiscoSla> {
  return apiPost<AvaliacaoRiscoSla>("/qualidade/risco-sla/avaliacoes", payload);
}

export async function listAuditoriasCamadas(): Promise<AuditoriaCamada[]> {
  return apiGet<AuditoriaCamada[]>("/qualidade/auditorias-camadas");
}

export async function createAuditoriaCamada(
  payload: Omit<AuditoriaCamada, "id">,
): Promise<AuditoriaCamada> {
  return apiPost<AuditoriaCamada>("/qualidade/auditorias-camadas", payload);
}

export async function listGatesFornecedores(fornecedorId?: string): Promise<GateFornecedor[]> {
  const query = fornecedorId ? `?fornecedorId=${encodeURIComponent(fornecedorId)}` : "";
  return apiGet<GateFornecedor[]>(`/qualidade/fornecedores/gates${query}`);
}

export async function createGateFornecedor(payload: Omit<GateFornecedor, "id">): Promise<GateFornecedor> {
  return apiPost<GateFornecedor>("/qualidade/fornecedores/gates", payload);
}

export async function listIsoReadiness(): Promise<IsoReadinessItem[]> {
  return apiGet<IsoReadinessItem[]>("/qualidade/iso9001/readiness");
}

export async function createIsoReadiness(payload: Omit<IsoReadinessItem, "id">): Promise<IsoReadinessItem> {
  return apiPost<IsoReadinessItem>("/qualidade/iso9001/readiness", payload);
}

export async function getIsoReadinessResumo(): Promise<IsoReadinessResumo> {
  return apiGet<IsoReadinessResumo>("/qualidade/iso9001/readiness/resumo");
}
