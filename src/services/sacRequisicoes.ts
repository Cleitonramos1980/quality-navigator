import { apiGet, apiPost } from "@/services/api";
import { SACRequisicao, MaterialERP, RequisicaoStatus } from "@/types/sacRequisicao";

const mockRequisicoes: SACRequisicao[] = [
  {
    id: "REQ-SAC-001",
    atendimentoId: "SAC-001",
    codcli: "1042",
    clienteNome: "Magazine Luiza",
    cgcent: "47.960.950/0001-21",
    numPedido: "PED-88421",
    numNfVenda: "NF-112340",
    codprod: "COL-QUEEN-01",
    produtoRelacionado: "Colchão Queen Premium",
    plantaCd: "MAO",
    motivo: "ASSISTENCIA_EXTERNA",
    prioridade: "ALTA",
    observacoes: "Solicitação de peças para atendimento em campo.",
    itens: [
      { codmat: "MAT-001", descricaoMaterial: "Bloco de Espuma D33 Queen", un: "UN", qtdSolicitada: 1, qtdAtendida: 1, situacao: "ATENDIDO" },
      { codmat: "MAT-005", descricaoMaterial: "Tecido Malha Bambu Queen", un: "M", qtdSolicitada: 3, qtdAtendida: 2, situacao: "PARCIAL" },
    ],
    status: "PENDENTE",
    criadoAt: "2026-03-01",
    atualizadoAt: "2026-03-03",
  },
  {
    id: "REQ-SAC-002",
    atendimentoId: "SAC-002",
    codcli: "2081",
    clienteNome: "Casas Bahia",
    cgcent: "33.041.260/0001-65",
    plantaCd: "BEL",
    motivo: "MANUTENCAO_CONSERTO",
    prioridade: "MEDIA",
    observacoes: "Reposição para assistência regional.",
    itens: [
      { codmat: "MAT-003", descricaoMaterial: "Mola Bonnel Casal", un: "JG", qtdSolicitada: 1 },
    ],
    status: "RASCUNHO",
    criadoAt: "2026-03-02",
    atualizadoAt: "2026-03-02",
  },
];

export async function getRequisicoes(): Promise<SACRequisicao[]> {
  try {
    return await apiGet<SACRequisicao[]>("/sac/requisicoes");
  } catch {
    return mockRequisicoes;
  }
}

export async function getRequisicaoById(id: string): Promise<SACRequisicao | undefined> {
  try {
    return await apiGet<SACRequisicao | null>(`/sac/requisicoes/${id}`).then((r) => r || undefined);
  } catch {
    return mockRequisicoes.find((item) => item.id === id);
  }
}

export async function criarRequisicao(data: Partial<SACRequisicao>): Promise<SACRequisicao> {
  return apiPost<SACRequisicao>("/sac/requisicoes", data);
}

export async function atenderRequisicao(
  id: string,
  dados: { status: RequisicaoStatus; itens: SACRequisicao["itens"]; observacoesAtendimento: string; atendidoPor: string }
): Promise<SACRequisicao | undefined> {
  return apiPost<SACRequisicao | null>(`/sac/requisicoes/${id}/atender`, dados).then((r) => r || undefined);
}

export async function buscarMateriais(filtro?: { codigo?: string; descricao?: string; categoria?: string }): Promise<MaterialERP[]> {
  const query = filtro ? new URLSearchParams(Object.entries(filtro).filter(([, v]) => !!v) as Array<[string, string]>).toString() : "";
  return apiGet<MaterialERP[]>(`/erp/materiais${query ? `?${query}` : ""}`);
}

export async function getRequisicaoDashboardData() {
  try {
    return await apiGet<{ pendentes: number; atendidasMes: number; porPlanta: Array<{ name: string; value: number }>; ultimasPendentes: SACRequisicao[] }>("/sac/requisicoes/dashboard");
  } catch {
    return {
      pendentes: mockRequisicoes.filter((item) => item.status === "PENDENTE").length,
      atendidasMes: mockRequisicoes.filter((item) => item.status === "ATENDIDA").length,
      porPlanta: [
        { name: "MAO", value: mockRequisicoes.filter((item) => item.plantaCd === "MAO").length },
        { name: "BEL", value: mockRequisicoes.filter((item) => item.plantaCd === "BEL").length },
        { name: "AGR", value: mockRequisicoes.filter((item) => item.plantaCd === "AGR").length },
      ].filter((item) => item.value > 0),
      ultimasPendentes: mockRequisicoes.filter((item) => item.status === "PENDENTE" || item.status === "RASCUNHO"),
    };
  }
}


