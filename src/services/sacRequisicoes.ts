import { SACRequisicao, MaterialERP, RequisicaoStatus } from "@/types/sacRequisicao";

// Mock materials — future integration with Oracle/WinThor VW_SGQ_MATERIAL
export const mockMateriais: MaterialERP[] = [
  { codmat: "MAT-001", descricao: "Mola ensacada D33 – Queen", un: "UN", categoria: "Molas", estoqueDisponivel: 150 },
  { codmat: "MAT-002", descricao: "Espuma D45 Laminada 10cm", un: "M²", categoria: "Espumas", estoqueDisponivel: 320 },
  { codmat: "MAT-003", descricao: "Tecido Jacquard Premium", un: "M", categoria: "Tecidos", estoqueDisponivel: 500 },
  { codmat: "MAT-004", descricao: "Zíper Nylon 2m – Branco", un: "UN", categoria: "Aviamentos", estoqueDisponivel: 1200 },
  { codmat: "MAT-005", descricao: "Feltro TNT 100g", un: "M²", categoria: "Feltros", estoqueDisponivel: 800 },
  { codmat: "MAT-006", descricao: "Cola Spray Industrial", un: "LT", categoria: "Químicos", estoqueDisponivel: 45 },
  { codmat: "MAT-007", descricao: "Espuma Viscoelástica 5cm", un: "M²", categoria: "Espumas", estoqueDisponivel: 200 },
  { codmat: "MAT-008", descricao: "Tecido Malha Bambu", un: "M", categoria: "Tecidos", estoqueDisponivel: 350 },
  { codmat: "MAT-009", descricao: "Mola Bonnel Casal", un: "UN", categoria: "Molas", estoqueDisponivel: 90 },
  { codmat: "MAT-010", descricao: "Fita de Borda 4cm", un: "M", categoria: "Aviamentos", estoqueDisponivel: 2000 },
  { codmat: "MAT-011", descricao: "Pé de Colchão Cromado", un: "UN", categoria: "Acessórios", estoqueDisponivel: 400 },
  { codmat: "MAT-012", descricao: "Protetor Impermeável Queen", un: "UN", categoria: "Acessórios", estoqueDisponivel: 60 },
];

export const mockRequisicoes: SACRequisicao[] = [
  {
    id: "REQ-001",
    atendimentoId: "SAC-001",
    codcli: "1042",
    clienteNome: "Magazine Luiza",
    cgcent: "47.960.950/0001-21",
    numPedido: "PED-88421",
    numNfVenda: "NF-112340",
    produtoRelacionado: "COL-QN-001 - Colchão Queen Premium Molas Ensacadas",
    plantaCd: "MAO",
    motivo: "MANUTENCAO_CONSERTO",
    prioridade: "ALTA",
    observacoes: "Cliente relata deformação no colchão. Necessário enviar materiais para conserto.",
    itens: [
      { codmat: "MAT-001", descricaoMaterial: "Mola ensacada D33 – Queen", un: "UN", qtdSolicitada: 5 },
      { codmat: "MAT-002", descricaoMaterial: "Espuma D45 Laminada 10cm", un: "M²", qtdSolicitada: 2 },
    ],
    status: "PENDENTE",
    criadoAt: "2026-03-01",
    atualizadoAt: "2026-03-01",
  },
  {
    id: "REQ-002",
    atendimentoId: "SAC-002",
    codcli: "2081",
    clienteNome: "Casas Bahia",
    cgcent: "33.041.260/0001-65",
    numPedido: "PED-77312",
    numNfVenda: "NF-109877",
    plantaCd: "BEL",
    motivo: "TROCA_COMPONENTE",
    prioridade: "MEDIA",
    observacoes: "Troca de molas com ruído.",
    itens: [
      { codmat: "MAT-009", descricaoMaterial: "Mola Bonnel Casal", un: "UN", qtdSolicitada: 10 },
    ],
    status: "PENDENTE",
    criadoAt: "2026-02-27",
    atualizadoAt: "2026-02-27",
  },
  {
    id: "REQ-003",
    codcli: "3055",
    clienteNome: "Ponto Frio",
    cgcent: "44.123.456/0001-78",
    plantaCd: "AGR",
    motivo: "ASSISTENCIA_EXTERNA",
    prioridade: "BAIXA",
    observacoes: "Assistência técnica para avaliação de colchão.",
    itens: [
      { codmat: "MAT-003", descricaoMaterial: "Tecido Jacquard Premium", un: "M", qtdSolicitada: 3 },
      { codmat: "MAT-006", descricaoMaterial: "Cola Spray Industrial", un: "LT", qtdSolicitada: 1 },
    ],
    status: "ATENDIDA",
    criadoAt: "2026-02-15",
    atualizadoAt: "2026-02-20",
    atendidoAt: "2026-02-20",
    atendidoPor: "João Almoxarifado",
    observacoesAtendimento: "Materiais separados e enviados.",
  },
  {
    id: "REQ-004",
    atendimentoId: "SAC-006",
    codcli: "1042",
    clienteNome: "Magazine Luiza",
    cgcent: "47.960.950/0001-21",
    numPedido: "PED-88500",
    numNfVenda: "NF-112500",
    plantaCd: "MAO",
    motivo: "TROCA_COMPONENTE",
    prioridade: "CRITICA",
    observacoes: "Troca urgente de tecido manchado.",
    itens: [
      { codmat: "MAT-003", descricaoMaterial: "Tecido Jacquard Premium", un: "M", qtdSolicitada: 5 },
      { codmat: "MAT-004", descricaoMaterial: "Zíper Nylon 2m – Branco", un: "UN", qtdSolicitada: 2 },
    ],
    status: "PARCIAL",
    criadoAt: "2026-02-28",
    atualizadoAt: "2026-03-02",
    atendidoAt: "2026-03-02",
    atendidoPor: "Maria Almoxarifado",
    observacoesAtendimento: "Tecido enviado parcialmente, zíper indisponível.",
  },
];

// === Mock service functions — prepared for Oracle/WinThor REST integration ===

export async function getRequisicoes(): Promise<SACRequisicao[]> {
  return mockRequisicoes;
}

export async function getRequisicaoById(id: string): Promise<SACRequisicao | undefined> {
  return mockRequisicoes.find((r) => r.id === id);
}

export async function criarRequisicao(data: Partial<SACRequisicao>): Promise<SACRequisicao> {
  const nova: SACRequisicao = {
    id: `REQ-${String(mockRequisicoes.length + 1).padStart(3, "0")}`,
    atendimentoId: data.atendimentoId,
    codcli: data.codcli || "",
    clienteNome: data.clienteNome || "",
    cgcent: data.cgcent || "",
    numPedido: data.numPedido,
    numNfVenda: data.numNfVenda,
    produtoRelacionado: data.produtoRelacionado,
    plantaCd: data.plantaCd || "MAO",
    motivo: data.motivo || "MANUTENCAO_CONSERTO",
    prioridade: data.prioridade || "MEDIA",
    observacoes: data.observacoes || "",
    itens: data.itens || [],
    status: data.status || "PENDENTE",
    criadoAt: new Date().toISOString().slice(0, 10),
    atualizadoAt: new Date().toISOString().slice(0, 10),
  };
  mockRequisicoes.push(nova);
  return nova;
}

export async function atenderRequisicao(
  id: string,
  dados: { status: RequisicaoStatus; itens: SACRequisicao["itens"]; observacoesAtendimento: string; atendidoPor: string }
): Promise<SACRequisicao | undefined> {
  const req = mockRequisicoes.find((r) => r.id === id);
  if (!req) return undefined;
  req.status = dados.status;
  req.itens = dados.itens;
  req.observacoesAtendimento = dados.observacoesAtendimento;
  req.atendidoPor = dados.atendidoPor;
  req.atendidoAt = new Date().toISOString().slice(0, 10);
  req.atualizadoAt = new Date().toISOString().slice(0, 10);
  return req;
}

export async function buscarMateriais(filtro?: { codigo?: string; descricao?: string; categoria?: string }): Promise<MaterialERP[]> {
  // Will call /erp/materiais
  if (!filtro) return mockMateriais;
  return mockMateriais.filter((m) => {
    if (filtro.codigo && !m.codmat.toLowerCase().includes(filtro.codigo.toLowerCase())) return false;
    if (filtro.descricao && !m.descricao.toLowerCase().includes(filtro.descricao.toLowerCase())) return false;
    if (filtro.categoria && m.categoria !== filtro.categoria) return false;
    return true;
  });
}

export function getRequisicaoDashboardData() {
  const pendentes = mockRequisicoes.filter((r) => r.status === "PENDENTE").length;
  const atendidasMes = mockRequisicoes.filter((r) => ["ATENDIDA", "PARCIAL"].includes(r.status)).length;
  const porPlanta = [
    { name: "MAO", value: mockRequisicoes.filter((r) => r.plantaCd === "MAO").length },
    { name: "BEL", value: mockRequisicoes.filter((r) => r.plantaCd === "BEL").length },
    { name: "AGR", value: mockRequisicoes.filter((r) => r.plantaCd === "AGR").length },
  ];
  const ultimasPendentes = mockRequisicoes
    .filter((r) => r.status === "PENDENTE")
    .sort((a, b) => a.criadoAt.localeCompare(b.criadoAt))
    .slice(0, 10);
  return { pendentes, atendidasMes, porPlanta, ultimasPendentes };
}
