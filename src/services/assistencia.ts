import { apiGet, apiPost, apiPut } from "@/services/api";
import { OrdemServico, RequisicaoAssistencia, ConsumoMaterial, OSStatus, ReqAssistStatus } from "@/types/assistencia";

export interface EstoqueItem {
  codMaterial: string;
  descricao: string;
  un: string;
  categoria: string;
  estoqueMAO: number;
  estoqueBEL: number;
  estoqueAGR: number;
}

function toOptionalString(value: unknown): string | undefined {
  if (value == null) return undefined;
  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : undefined;
}

function toFiniteNumber(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const normalized = Number(value.replace(",", "."));
    if (Number.isFinite(normalized)) return normalized;
  }
  return fallback;
}

function normalizeOSPayload(os: Omit<OrdemServico, "id">): Omit<OrdemServico, "id"> {
  return {
    ...os,
    codcli: String(os.codcli || "").trim(),
    clienteNome: String(os.clienteNome || "").trim(),
    numPedido: toOptionalString(os.numPedido),
    nfVenda: toOptionalString(os.nfVenda),
    codprod: toOptionalString(os.codprod),
    tecnicoResponsavel: String(os.tecnicoResponsavel || "").trim(),
    descricaoProblema: String(os.descricaoProblema || "").trim(),
  };
}

function normalizeReqPayload(req: Omit<RequisicaoAssistencia, "id">): Omit<RequisicaoAssistencia, "id"> {
  return {
    ...req,
    observacao: toOptionalString(req.observacao),
    itens: req.itens.map((item) => ({
      ...item,
      codMaterial: String(item.codMaterial || "").trim(),
      descricao: String(item.descricao || "").trim(),
      un: String(item.un || "").trim(),
      observacao: toOptionalString(item.observacao),
      observacaoAtendente: toOptionalString(item.observacaoAtendente),
      qtdSolicitada: Math.max(1, toFiniteNumber(item.qtdSolicitada, 1)),
      qtdAtendida: item.qtdAtendida == null ? undefined : Math.max(0, toFiniteNumber(item.qtdAtendida, 0)),
      qtdRecebida: item.qtdRecebida == null ? undefined : Math.max(0, toFiniteNumber(item.qtdRecebida, 0)),
    })),
  };
}

export async function listarOS(): Promise<OrdemServico[]> {
  return apiGet<OrdemServico[]>("/assistencia/os");
}

export async function buscarOS(id: string): Promise<OrdemServico | undefined> {
  return apiGet<OrdemServico | null>(`/assistencia/os/${id}`).then((r) => r || undefined);
}

export async function criarOS(os: Omit<OrdemServico, "id">): Promise<OrdemServico> {
  return apiPost<OrdemServico>("/assistencia/os", normalizeOSPayload(os));
}

export async function atualizarStatusOS(id: string, status: OSStatus): Promise<void> {
  await apiPut(`/assistencia/os/${id}/status`, { status });
}

export async function listarReqAssistencia(): Promise<RequisicaoAssistencia[]> {
  return apiGet<RequisicaoAssistencia[]>("/assistencia/requisicoes");
}

export async function buscarReqAssistencia(id: string): Promise<RequisicaoAssistencia | undefined> {
  return apiGet<RequisicaoAssistencia | null>(`/assistencia/requisicoes/${id}`).then((r) => r || undefined);
}

export async function criarReqAssistencia(req: Omit<RequisicaoAssistencia, "id">): Promise<RequisicaoAssistencia> {
  return apiPost<RequisicaoAssistencia>("/assistencia/requisicoes", normalizeReqPayload(req));
}

export async function atualizarStatusReq(id: string, status: ReqAssistStatus): Promise<void> {
  await apiPut(`/assistencia/requisicoes/${id}/status`, { status });
}

export async function listarConsumos(): Promise<ConsumoMaterial[]> {
  return apiGet<ConsumoMaterial[]>("/assistencia/consumos");
}

export async function listarConsumosPorOS(osId: string): Promise<ConsumoMaterial[]> {
  return apiGet<ConsumoMaterial[]>(`/assistencia/consumos/${osId}`);
}

export async function registrarConsumo(consumo: Omit<ConsumoMaterial, "id">): Promise<ConsumoMaterial> {
  return apiPost<ConsumoMaterial>("/assistencia/consumos", consumo);
}

export async function receberRequisicao(id: string, itensRecebidos: { codMaterial: string; qtdRecebida: number }[], observacao?: string): Promise<void> {
  await apiPost(`/assistencia/requisicoes/${id}/receber`, { itensRecebidos, observacao: toOptionalString(observacao) });
}

export async function listarEstoque(): Promise<EstoqueItem[]> {
  return apiGet<EstoqueItem[]>("/assistencia/estoque");
}

export async function getDashboardCounters() {
  return apiGet<{
    osAbertas: number;
    osConcluidas: number;
    osCanceladas: number;
    reqPendentes: number;
    reqAtendidas: number;
    consumoTotal: number;
    osPorStatus: Record<string, number>;
    osPorPlanta: Record<string, number>;
  }>("/assistencia/dashboard");
}
