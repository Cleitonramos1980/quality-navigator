/**
 * Service contracts for operational modules.
 * Currently returns mock data; will be replaced by real API calls
 * when the backend complement is implemented by Codex.
 *
 * Each function defines the expected API contract (endpoint, payload, response type).
 */

import { apiGet, apiPost, apiPut } from "@/services/api";
import type {
  Acesso, Visitante, VeiculoVisitante, VeiculoFrota, DeslocamentoFrota,
  Transportadora, MotoristaTerceiro, VeiculoTerceiro, OperacaoTerceiro,
  AgendamentoDoca, Doca, FilaPatio, AlertaOperacional, ExcecaoOperacional,
  NFTransito, ExcecaoFiscal,
} from "@/types/operacional";
import {
  mockAcessos, mockVisitantes, mockVeiculosVisitantes, mockFrota, mockDeslocamentos,
  mockTransportadoras, mockMotoristasTerceiros, mockVeiculosTerceiros, mockOperacoes,
  mockAgendamentos, mockDocas, mockFilaPatio, mockAlertas, mockExcecoes,
  mockNFsTransito, mockExcecoesFiscais, dashboardOperacional,
} from "@/data/mockOperacionalData";

// ══════════════════════════════════════════════
// PORTARIA / ACESSOS
// Backend: GET /operacional/acessos
// ══════════════════════════════════════════════
export async function getAcessos(): Promise<Acesso[]> {
  try { return await apiGet<Acesso[]>("/operacional/acessos"); } catch { return mockAcessos; }
}

// Backend: GET /operacional/acessos/:id
export async function getAcessoById(id: string): Promise<Acesso | undefined> {
  try { return await apiGet<Acesso>(`/operacional/acessos/${id}`); } catch { return mockAcessos.find((a) => a.id === id); }
}

// Backend: POST /operacional/acessos
export async function criarAcesso(data: Partial<Acesso>): Promise<Acesso> {
  try { return await apiPost<Acesso>("/operacional/acessos", data); } catch { return { ...data, id: `ACS-${Date.now()}` } as Acesso; }
}

// Backend: PUT /operacional/acessos/:id/liberar
export async function liberarEntrada(id: string): Promise<Acesso> {
  try { return await apiPut<Acesso>(`/operacional/acessos/${id}/liberar`, {}); } catch { return mockAcessos[0]; }
}

// Backend: PUT /operacional/acessos/:id/saida
export async function registrarSaida(id: string): Promise<Acesso> {
  try { return await apiPut<Acesso>(`/operacional/acessos/${id}/saida`, {}); } catch { return mockAcessos[0]; }
}

// ══════════════════════════════════════════════
// VISITANTES
// Backend: GET /operacional/visitantes
// ══════════════════════════════════════════════
export async function getVisitantes(): Promise<Visitante[]> {
  try { return await apiGet<Visitante[]>("/operacional/visitantes"); } catch { return mockVisitantes; }
}

export async function getVisitanteById(id: string): Promise<Visitante | undefined> {
  try { return await apiGet<Visitante>(`/operacional/visitantes/${id}`); } catch { return mockVisitantes.find((v) => v.id === id); }
}

export async function criarPreAutorizacao(data: Partial<Visitante>): Promise<Visitante> {
  try { return await apiPost<Visitante>("/operacional/visitantes", data); } catch { return { ...data, id: `VIS-${Date.now()}` } as Visitante; }
}

export async function aprovarVisitante(id: string): Promise<Visitante> {
  try { return await apiPut<Visitante>(`/operacional/visitantes/${id}/aprovar`, {}); } catch { return mockVisitantes[0]; }
}

// ══════════════════════════════════════════════
// VEÍCULOS VISITANTES
// Backend: GET /operacional/veiculos-visitantes
// ══════════════════════════════════════════════
export async function getVeiculosVisitantes(): Promise<VeiculoVisitante[]> {
  try { return await apiGet<VeiculoVisitante[]>("/operacional/veiculos-visitantes"); } catch { return mockVeiculosVisitantes; }
}

// ══════════════════════════════════════════════
// FROTA
// Backend: GET /operacional/frota
// ══════════════════════════════════════════════
export async function getVeiculosFrota(): Promise<VeiculoFrota[]> {
  try { return await apiGet<VeiculoFrota[]>("/operacional/frota"); } catch { return mockFrota; }
}

export async function getVeiculoFrotaById(id: string): Promise<VeiculoFrota | undefined> {
  try { return await apiGet<VeiculoFrota>(`/operacional/frota/${id}`); } catch { return mockFrota.find((v) => v.id === id); }
}

export async function getDeslocamentos(): Promise<DeslocamentoFrota[]> {
  try { return await apiGet<DeslocamentoFrota[]>("/operacional/frota/deslocamentos"); } catch { return mockDeslocamentos; }
}

export interface DespachoPayload {
  veiculoId: string;
  motorista: string;
  origem: string;
  destino: string;
  notasFiscais: Array<{ numero: string; descricao?: string }>;
  observacao?: string;
}

// Backend: POST /operacional/frota/despacho
export async function registrarDespacho(data: DespachoPayload): Promise<DeslocamentoFrota> {
  try { return await apiPost<DeslocamentoFrota>("/operacional/frota/despacho", data); } catch { return mockDeslocamentos[0]; }
}

// Backend: PUT /operacional/frota/:id/movimentacao
export async function registrarMovimentacao(id: string, data: { status: string; quilometragem?: number; docaId?: string }): Promise<VeiculoFrota> {
  try { return await apiPut<VeiculoFrota>(`/operacional/frota/${id}/movimentacao`, data); } catch { return mockFrota[0]; }
}

// ══════════════════════════════════════════════
// TERCEIROS / TRANSPORTADORAS
// Backend: GET /operacional/transportadoras
// ══════════════════════════════════════════════
export async function getTransportadoras(): Promise<Transportadora[]> {
  try { return await apiGet<Transportadora[]>("/operacional/transportadoras"); } catch { return mockTransportadoras; }
}

export async function getMotoristasTerceiros(): Promise<MotoristaTerceiro[]> {
  try { return await apiGet<MotoristaTerceiro[]>("/operacional/motoristas-terceiros"); } catch { return mockMotoristasTerceiros; }
}

export async function getVeiculosTerceiros(): Promise<VeiculoTerceiro[]> {
  try { return await apiGet<VeiculoTerceiro[]>("/operacional/veiculos-terceiros"); } catch { return mockVeiculosTerceiros; }
}

export async function getOperacoes(): Promise<OperacaoTerceiro[]> {
  try { return await apiGet<OperacaoTerceiro[]>("/operacional/operacoes"); } catch { return mockOperacoes; }
}

export async function getAgendamentos(): Promise<AgendamentoDoca[]> {
  try { return await apiGet<AgendamentoDoca[]>("/operacional/agendamentos"); } catch { return mockAgendamentos; }
}

// ══════════════════════════════════════════════
// PÁTIO / DOCAS
// Backend: GET /operacional/docas
// ══════════════════════════════════════════════
export async function getDocas(): Promise<Doca[]> {
  try { return await apiGet<Doca[]>("/operacional/docas"); } catch { return mockDocas; }
}

export async function getFilaPatio(): Promise<FilaPatio[]> {
  try { return await apiGet<FilaPatio[]>("/operacional/fila-patio"); } catch { return mockFilaPatio; }
}

// ══════════════════════════════════════════════
// MONITORAMENTO
// Backend: GET /operacional/alertas
// ══════════════════════════════════════════════
export async function getAlertas(): Promise<AlertaOperacional[]> {
  try { return await apiGet<AlertaOperacional[]>("/operacional/alertas"); } catch { return mockAlertas; }
}

export async function getExcecoes(): Promise<ExcecaoOperacional[]> {
  try { return await apiGet<ExcecaoOperacional[]>("/operacional/excecoes"); } catch { return mockExcecoes; }
}

export interface DashboardOperacionalData {
  visitantesPresentes: number;
  veiculosVisitantesPresentes: number;
  terceirosNaUnidade: number;
  frotaEmDeslocamento: number;
  docasOcupadas: number;
  docasTotal: number;
  alertasAtivos: number;
  nfsEmTransito: number;
  nfsEmRisco: number;
  nfsSemConfirmacao: number;
  valorEmTransito: number;
  valorEmRisco: number;
  mediaDiasTransito: number;
  filaExterna: number;
  filaInterna: number;
  veiculosParados: number;
  tempoMedioPatio: number;
  slaGeral: number;
}

export async function getDashboardOperacional(): Promise<DashboardOperacionalData> {
  try { return await apiGet<DashboardOperacionalData>("/operacional/dashboard"); } catch { return dashboardOperacional; }
}

// ══════════════════════════════════════════════
// NF EM TRÂNSITO
// Backend: GET /operacional/nf-transito
// ══════════════════════════════════════════════
export async function getNFsTransito(): Promise<NFTransito[]> {
  try { return await apiGet<NFTransito[]>("/operacional/nf-transito"); } catch { return mockNFsTransito; }
}

export async function getNFTransitoById(id: string): Promise<NFTransito | undefined> {
  try { return await apiGet<NFTransito>(`/operacional/nf-transito/${id}`); } catch { return mockNFsTransito.find((nf) => nf.id === id); }
}

export async function getExcecoesFiscais(): Promise<ExcecaoFiscal[]> {
  try { return await apiGet<ExcecaoFiscal[]>("/operacional/excecoes-fiscais"); } catch { return mockExcecoesFiscais; }
}

// Backend: PUT /operacional/nf-transito/:id/confirmar-recebimento
export async function confirmarRecebimentoNF(id: string): Promise<NFTransito> {
  try { return await apiPut<NFTransito>(`/operacional/nf-transito/${id}/confirmar-recebimento`, {}); } catch { return mockNFsTransito[0]; }
}

// ══════════════════════════════════════════════
// MOVIMENTAÇÕES FROTA
// Backend: GET /operacional/frota/movimentacoes
// ══════════════════════════════════════════════
import type { MovimentacaoFrota } from "@/data/mockOperacionalData";
import { mockMovimentacoesFrota, mockTimelinePortaria } from "@/data/mockOperacionalData";
export type { MovimentacaoFrota };

export async function getMovimentacoesFrota(veiculoId?: string): Promise<MovimentacaoFrota[]> {
  try {
    const all = await apiGet<MovimentacaoFrota[]>("/operacional/frota/movimentacoes");
    return veiculoId ? all.filter((m) => m.veiculoId === veiculoId) : all;
  } catch {
    return veiculoId ? mockMovimentacoesFrota.filter((m) => m.veiculoId === veiculoId) : mockMovimentacoesFrota;
  }
}

// ══════════════════════════════════════════════
// TIMELINE PORTARIA
// Backend: GET /operacional/timeline/:acessoId
// ══════════════════════════════════════════════
import type { EventoTimeline } from "@/types/operacional";

export async function getTimelinePortaria(acessoId?: string): Promise<EventoTimeline[]> {
  try { return await apiGet<EventoTimeline[]>(`/operacional/timeline/${acessoId || ""}`); } catch { return mockTimelinePortaria; }
}
