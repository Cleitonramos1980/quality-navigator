// Mock service — preparado para integração futura com Oracle/WinThor
import { OrdemServico, RequisicaoAssistencia, ConsumoMaterial, OSStatus, ReqAssistStatus } from "@/types/assistencia";
import { mockOrdensServico, mockReqAssistencia, mockConsumos, mockEstoque, EstoqueItem } from "@/data/mockAssistenciaData";

// ── OS ──
export async function listarOS(): Promise<OrdemServico[]> {
  return [...mockOrdensServico];
}

export async function buscarOS(id: string): Promise<OrdemServico | undefined> {
  return mockOrdensServico.find((os) => os.id === id);
}

export async function criarOS(os: Omit<OrdemServico, "id">): Promise<OrdemServico> {
  const nova: OrdemServico = { ...os, id: `OS-${String(mockOrdensServico.length + 1).padStart(3, "0")}` };
  mockOrdensServico.push(nova);
  return nova;
}

export async function atualizarStatusOS(id: string, status: OSStatus): Promise<void> {
  const os = mockOrdensServico.find((o) => o.id === id);
  if (os) os.status = status;
}

// ── Requisição Assistência ──
export async function listarReqAssistencia(): Promise<RequisicaoAssistencia[]> {
  return [...mockReqAssistencia];
}

export async function buscarReqAssistencia(id: string): Promise<RequisicaoAssistencia | undefined> {
  return mockReqAssistencia.find((r) => r.id === id);
}

export async function criarReqAssistencia(req: Omit<RequisicaoAssistencia, "id">): Promise<RequisicaoAssistencia> {
  const nova: RequisicaoAssistencia = { ...req, id: `RA-${String(mockReqAssistencia.length + 1).padStart(3, "0")}` };
  mockReqAssistencia.push(nova);
  return nova;
}

export async function atualizarStatusReq(id: string, status: ReqAssistStatus): Promise<void> {
  const req = mockReqAssistencia.find((r) => r.id === id);
  if (req) {
    req.status = status;
    req.atualizadoAt = new Date().toISOString().slice(0, 10);
  }
}

// ── Consumo ──
export async function listarConsumos(): Promise<ConsumoMaterial[]> {
  return [...mockConsumos];
}

export async function registrarConsumo(consumo: Omit<ConsumoMaterial, "id">): Promise<ConsumoMaterial> {
  const novo: ConsumoMaterial = { ...consumo, id: `CON-${String(mockConsumos.length + 1).padStart(3, "0")}` };
  mockConsumos.push(novo);
  return novo;
}

// ── Estoque ──
export async function listarEstoque(): Promise<EstoqueItem[]> {
  return [...mockEstoque];
}

// ── Dashboard Counters ──
export async function getDashboardCounters() {
  const osList = mockOrdensServico;
  const reqList = mockReqAssistencia;

  return {
    osAbertas: osList.filter((o) => !["CONCLUIDA", "ENCERRADA", "CANCELADA"].includes(o.status)).length,
    osConcluidas: osList.filter((o) => o.status === "CONCLUIDA" || o.status === "ENCERRADA").length,
    osCanceladas: osList.filter((o) => o.status === "CANCELADA").length,
    reqPendentes: reqList.filter((r) => ["PENDENTE", "EM_SEPARACAO", "EM_TRANSFERENCIA"].includes(r.status)).length,
    reqAtendidas: reqList.filter((r) => r.status === "ATENDIDA").length,
    consumoTotal: mockConsumos.length,
    osPorStatus: {
      ABERTA: osList.filter((o) => o.status === "ABERTA").length,
      AGUARDANDO_RECEBIMENTO: osList.filter((o) => o.status === "AGUARDANDO_RECEBIMENTO").length,
      RECEBIDO: osList.filter((o) => o.status === "RECEBIDO").length,
      EM_INSPECAO: osList.filter((o) => o.status === "EM_INSPECAO").length,
      AGUARDANDO_PECAS: osList.filter((o) => o.status === "AGUARDANDO_PECAS").length,
      EM_REPARO: osList.filter((o) => o.status === "EM_REPARO").length,
      AGUARDANDO_VALIDACAO: osList.filter((o) => o.status === "AGUARDANDO_VALIDACAO").length,
      CONCLUIDA: osList.filter((o) => o.status === "CONCLUIDA").length,
      ENCERRADA: osList.filter((o) => o.status === "ENCERRADA").length,
      CANCELADA: osList.filter((o) => o.status === "CANCELADA").length,
    },
    osPorPlanta: {
      MAO: osList.filter((o) => o.planta === "MAO").length,
      BEL: osList.filter((o) => o.planta === "BEL").length,
      AGR: osList.filter((o) => o.planta === "AGR").length,
    },
  };
}
