import { ApiError, apiGet, apiPost, apiPostFormData, apiPut } from "@/services/api";
import { mockAtendimentos, sacDashboardData } from "@/data/mockSACData";
import type { SACAtendimento, SACAvaliacao, SACAvaliacaoDashboard } from "@/types/sac";

export interface SACDashboardData {
  porStatus: Array<{ name: string; value: number }>;
  porTipo: Array<{ name: string; value: number }>;
  porPlanta: Array<{ name: string; value: number }>;
  porDia: Array<{ date: string; value: number }>;
}

export interface SACAtendimentoAnexo {
  id: string;
  atendimentoId: string;
  nomeArquivo: string;
  mimeType: string;
  tamanho: number;
  caminho: string;
  criadoAt: string;
}

export interface SACUploadAnexosResponse {
  atendimentoId: string;
  uploaded: number;
  anexos: SACAtendimentoAnexo[];
  rejected?: Array<{ nomeArquivo: string; motivo: string }>;
}

export interface SACHistoricoCliente {
  atendimentos: SACAtendimento[];
  garantias: any[];
  ncs: any[];
  capa: any[];
  avaliacoes: SACAvaliacao[];
}

const mockSACAvaliacaoDashboard: SACAvaliacaoDashboard = {
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
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toOptionalString(value: unknown): string | undefined {
  if (value == null) return undefined;
  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : undefined;
}

function normalizeAtendimentoPayload(data: Partial<SACAtendimento>): Partial<SACAtendimento> {
  return {
    ...data,
    codcli: toOptionalString(data.codcli) || "",
    clienteNome: toOptionalString(data.clienteNome) || "",
    cgcent: toOptionalString(data.cgcent) || "",
    telefone: toOptionalString(data.telefone) || "",
    numPedido: toOptionalString(data.numPedido),
    numNfVenda: toOptionalString(data.numNfVenda),
    codprod: toOptionalString(data.codprod),
    produtoRelacionado: toOptionalString(data.produtoRelacionado),
    descricao: toOptionalString(data.descricao) || "",
  };
}

export async function getSACDashboard(): Promise<SACDashboardData> {
  try {
    return await apiGet<SACDashboardData>("/sac/dashboard");
  } catch {
    return {
      porStatus: sacDashboardData.porStatus.map(({ name, value }) => ({ name, value })),
      porTipo: sacDashboardData.porTipo,
      porPlanta: sacDashboardData.porPlanta,
      porDia: sacDashboardData.porDia.map(({ dia, count }) => ({ date: dia, value: count })),
    };
  }
}

export async function getSACAvaliacaoDashboard(): Promise<SACAvaliacaoDashboard> {
  try {
    return await apiGet<SACAvaliacaoDashboard>("/sac/dashboard/avaliacoes");
  } catch {
    return mockSACAvaliacaoDashboard;
  }
}

export async function getAtendimentos(): Promise<SACAtendimento[]> {
  try {
    return await apiGet<SACAtendimento[]>("/sac/atendimentos");
  } catch {
    return mockAtendimentos;
  }
}

export async function getAtendimentoById(id: string): Promise<SACAtendimento | undefined> {
  return apiGet<SACAtendimento | null>(`/sac/atendimentos/${id}`).then((r) => r || undefined);
}

export async function getAvaliacoes(filters?: Record<string, string | number | undefined>): Promise<SACAvaliacao[]> {
  const query = filters
    ? new URLSearchParams(
      Object.entries(filters)
        .filter(([, value]) => value != null && String(value).trim() !== "")
        .map(([key, value]) => [key, String(value)]),
    ).toString()
    : "";

  return apiGet<SACAvaliacao[]>(`/sac/avaliacoes${query ? `?${query}` : ""}`);
}

export async function getAvaliacaoById(id: string): Promise<SACAvaliacao | undefined> {
  return apiGet<SACAvaliacao | null>(`/sac/avaliacoes/${encodeURIComponent(id)}`).then((item) => item || undefined);
}

export async function gerarLinkAvaliacao(atendimentoId: string): Promise<SACAvaliacao> {
  return apiPost<SACAvaliacao>(`/sac/atendimentos/${encodeURIComponent(atendimentoId)}/avaliacao/link`, {});
}

export async function enviarAvaliacaoWhatsapp(atendimentoId: string, regenerateToken = false): Promise<SACAvaliacao> {
  return apiPost<SACAvaliacao>(`/sac/atendimentos/${encodeURIComponent(atendimentoId)}/avaliacao/enviar`, { regenerateToken });
}

export async function reenviarAvaliacao(avaliacaoId: string, regenerateToken = true): Promise<SACAvaliacao> {
  return apiPost<SACAvaliacao>(`/sac/avaliacoes/${encodeURIComponent(avaliacaoId)}/reenviar`, { regenerateToken });
}

export async function getHistoricoClienteSAC(filters: { codcli?: string; cgcent?: string; cliente?: string }): Promise<SACHistoricoCliente> {
  const query = new URLSearchParams(
    Object.entries(filters)
      .filter(([, value]) => value != null && String(value).trim().length > 0)
      .map(([key, value]) => [key, String(value)]),
  ).toString();
  return apiGet<SACHistoricoCliente>(`/sac/historico-cliente?${query}`);
}

export async function getAvaliacaoPublic(token: string): Promise<{
  id: string;
  atendimentoId: string;
  codcli: string;
  clienteNome: string;
  statusResposta: string;
  dataEnvio?: string;
  nota?: number;
  comentario?: string;
}> {
  return apiGet(`/sac/avaliacoes/public?token=${encodeURIComponent(token)}`);
}

export async function responderAvaliacaoPublic(payload: { token: string; nota: number; comentario?: string }): Promise<SACAvaliacao> {
  return apiPost<SACAvaliacao>("/sac/avaliacoes/public/responder", payload);
}

export async function criarAtendimento(data: Partial<SACAtendimento>): Promise<SACAtendimento> {
  return apiPost<SACAtendimento>("/sac/atendimentos", normalizeAtendimentoPayload(data));
}

export async function uploadAtendimentoAnexos(atendimentoId: string, files: File[]): Promise<SACUploadAnexosResponse> {
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file, file.name));
      return await apiPostFormData<SACUploadAnexosResponse>(
        `/sac/atendimentos/${encodeURIComponent(atendimentoId)}/anexos`,
        formData,
      );
    } catch (error) {
      const nonRetryable = error instanceof ApiError && error.status > 0 && error.status < 500 && error.status !== 408;
      if (attempt >= maxAttempts || nonRetryable) throw error;
      await sleep(400 * attempt);
    }
  }

  throw new Error("Falha no upload de anexos.");
}

export async function updateAtendimento(id: string, data: Partial<SACAtendimento>): Promise<SACAtendimento> {
  return apiPut<SACAtendimento>(`/sac/atendimentos/${id}`, normalizeAtendimentoPayload(data));
}

export async function buscarClientesERP(filtro: Record<string, string>) {
  const codcli = (filtro.codcli || "").trim();
  const cgcent = (filtro.cgcent || "").trim();
  const telent = (filtro.telent || filtro.telefone || "").trim();

  const query = codcli
    ? new URLSearchParams({ codcli }).toString()
    : new URLSearchParams(
        Object.entries({ cgcent, telent }).filter(([, value]) => Boolean(value)),
      ).toString();
  if (!query) return [];

  const data = await apiGet<any[]>(`/erp/clientes-sac-busca?${query}`);
  return data.map((item) => ({
    codcli: String(item.codcli ?? ""),
    nome: String(item.cliente ?? ""),
    cgcent: String(item.cgcent ?? ""),
    telefones: String(item.telefone ?? ""),
    cidade: String(item.nomecidade ?? ""),
    uf: "",
  }));
}

export async function buscarPedidosERP(codcli?: string) {
  if (!codcli) return [];
  const query = `?codcli=${encodeURIComponent(codcli)}`;
  const data = await apiGet<any[]>(`/erp/pedidos-por-cliente${query}`);
  return data.map((item) => ({
    numped: String(item.numped ?? ""),
    numnf: item.numnf == null ? "" : String(item.numnf),
    codcli: item.codcli == null ? "" : String(item.codcli),
    dtPedido: item.dtPedido == null ? "" : String(item.dtPedido),
    vlrPedido: Number(item.vlrPedido ?? 0),
    status: item.status == null ? "" : String(item.status),
    canal: item.canal == null ? "" : String(item.canal),
  }));
}

export async function buscarItensPedidoERP(numped: string) {
  return apiGet<any[]>(`/erp/pedido-itens-por-pedido?numped=${encodeURIComponent(numped)}`);
}

export async function buscarNFVendaERP(filtro?: Record<string, string>) {
  const query = filtro ? new URLSearchParams(filtro).toString() : "";
  return apiGet<any[]>(`/erp/nf-venda${query ? `?${query}` : ""}`);
}
