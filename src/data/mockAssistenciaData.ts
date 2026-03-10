import { OrdemServico, RequisicaoAssistencia, ConsumoMaterial } from "@/types/assistencia";

export const mockOrdensServico: OrdemServico[] = [
  {
    id: "OS-001",
    origemTipo: "SAC",
    origemId: "SAC-001",
    codcli: "1042",
    clienteNome: "Magazine Luiza",
    numPedido: "PED-88421",
    nfVenda: "NF-112340",
    planta: "MAO",
    tipoOs: "GARANTIA_DEFEITO",
    status: "EM_REPARO",
    prioridade: "ALTA",
    tecnicoResponsavel: "João Técnico",
    descricaoProblema: "Colchão Queen com deformação central após 3 meses de uso",
    laudoInspecao: "Deformação confirmada por excesso de carga pontual",
    decisaoTecnica: "Substituir bloco de espuma e revestimento",
    dataAbertura: "2026-02-28",
    dataPrevista: "2026-03-10",
    recebimentoConfirmado: true,
  },
  {
    id: "OS-002",
    origemTipo: "SAC",
    origemId: "SAC-002",
    codcli: "2081",
    clienteNome: "Casas Bahia",
    numPedido: "PED-77312",
    nfVenda: "NF-109877",
    planta: "BEL",
    tipoOs: "ASSISTENCIA_EXTERNA",
    status: "AGUARDANDO_PECAS",
    prioridade: "MEDIA",
    tecnicoResponsavel: "Maria Técnica",
    descricaoProblema: "Base box com ruído nas molas ao deitar",
    laudoInspecao: "Molas centrais com desgaste prematuro",
    dataAbertura: "2026-02-25",
    dataPrevista: "2026-03-08",
  },
  {
    id: "OS-003",
    origemTipo: "GARANTIA",
    origemId: "GAR-003",
    codcli: "3055",
    clienteNome: "Ponto Frio",
    numPedido: "PED-66201",
    nfVenda: "NF-105432",
    planta: "AGR",
    tipoOs: "DESISTENCIA_DEVOLUCAO",
    status: "ABERTA",
    prioridade: "CRITICA",
    tecnicoResponsavel: "Carlos Técnico",
    descricaoProblema: "Afundamento severo no colchão ortopédico",
    dataAbertura: "2026-03-01",
    dataPrevista: "2026-03-05",
  },
  {
    id: "OS-004",
    origemTipo: "AVULSA",
    codcli: "4010",
    clienteNome: "Havan",
    planta: "MAO",
    tipoOs: "LOGISTICA_TRANSFERENCIA",
    status: "CONCLUIDA",
    prioridade: "BAIXA",
    tecnicoResponsavel: "Pedro Instalador",
    descricaoProblema: "Instalação de cama box baú king size",
    dataAbertura: "2026-02-20",
    dataPrevista: "2026-02-22",
    dataConclusao: "2026-02-21",
  },
  {
    id: "OS-005",
    origemTipo: "SAC",
    origemId: "SAC-003",
    codcli: "5022",
    clienteNome: "Riachuelo",
    numPedido: "PED-44300",
    nfVenda: "NF-098700",
    planta: "BEL",
    tipoOs: "TROCA_COMERCIAL",
    status: "EM_INSPECAO",
    prioridade: "ALTA",
    tecnicoResponsavel: "Ana Inspetora",
    descricaoProblema: "Tecido com cor desbotada após limpeza padrão",
    dataAbertura: "2026-03-02",
    dataPrevista: "2026-03-12",
  },
  {
    id: "OS-006",
    origemTipo: "NC",
    origemId: "NC-001",
    codcli: "1042",
    clienteNome: "Magazine Luiza",
    planta: "MAO",
    tipoOs: "OUTROS",
    status: "AGUARDANDO_VALIDACAO",
    prioridade: "MEDIA",
    tecnicoResponsavel: "João Técnico",
    descricaoProblema: "Espuma com densidade abaixo do especificado",
    laudoInspecao: "Confirmado: densidade 26kg/m³ vs. 33kg/m³ especificado",
    decisaoTecnica: "Reforar com camada adicional de espuma D33",
    dataAbertura: "2026-02-15",
    dataPrevista: "2026-03-01",
    recebimentoConfirmado: true,
    relatorioReparo: "Camada adicional de espuma D33 aplicada conforme especificação",
  },
];

export const mockReqAssistencia: RequisicaoAssistencia[] = [
  {
    id: "RA-001",
    osId: "OS-001",
    cdResponsavel: "MAO",
    plantaDestino: "MAO",
    status: "ATENDIDA",
    itens: [
      { codMaterial: "MAT-001", descricao: "Bloco de Espuma D33 Queen", un: "UN", qtdSolicitada: 1, qtdAtendida: 1, situacao: "ATENDIDO" },
      { codMaterial: "MAT-005", descricao: "Tecido Malha Bambu Queen", un: "M", qtdSolicitada: 3, qtdAtendida: 3, situacao: "ATENDIDO" },
    ],
    criadoAt: "2026-03-01",
    atualizadoAt: "2026-03-03",
  },
  {
    id: "RA-002",
    osId: "OS-002",
    cdResponsavel: "BEL",
    plantaDestino: "BEL",
    status: "PENDENTE",
    itens: [
      { codMaterial: "MAT-003", descricao: "Mola Bonnel Casal", un: "JG", qtdSolicitada: 1 },
      { codMaterial: "MAT-004", descricao: "Feltro Protetor", un: "M", qtdSolicitada: 2 },
    ],
    criadoAt: "2026-03-02",
    atualizadoAt: "2026-03-02",
  },
  {
    id: "RA-003",
    osId: "OS-005",
    cdResponsavel: "MAO",
    plantaDestino: "BEL",
    status: "EM_TRANSFERENCIA",
    itens: [
      { codMaterial: "MAT-005", descricao: "Tecido Malha Bambu Queen", un: "M", qtdSolicitada: 4 },
    ],
    criadoAt: "2026-03-03",
    atualizadoAt: "2026-03-04",
  },
  {
    id: "RA-004",
    osId: "OS-006",
    cdResponsavel: "MAO",
    plantaDestino: "MAO",
    status: "RECEBIDA_ASSISTENCIA",
    itens: [
      { codMaterial: "MAT-001", descricao: "Bloco de Espuma D33 Queen", un: "UN", qtdSolicitada: 2, qtdAtendida: 2, situacao: "ATENDIDO" },
    ],
    criadoAt: "2026-02-20",
    atualizadoAt: "2026-02-28",
  },
];

export const mockConsumos: ConsumoMaterial[] = [
  { id: "CON-001", osId: "OS-001", reqId: "RA-001", codMaterial: "MAT-001", descricao: "Bloco de Espuma D33 Queen", un: "UN", qtdConsumida: 1, tecnico: "João Técnico", dataConsumo: "2026-03-04" },
  { id: "CON-002", osId: "OS-001", reqId: "RA-001", codMaterial: "MAT-005", descricao: "Tecido Malha Bambu Queen", un: "M", qtdConsumida: 2.5, tecnico: "João Técnico", dataConsumo: "2026-03-04" },
  { id: "CON-003", osId: "OS-004", codMaterial: "MAT-008", descricao: "Kit Parafusos Fixação Baú", un: "KIT", qtdConsumida: 1, tecnico: "Pedro Instalador", dataConsumo: "2026-02-21" },
];

// Mock estoque para visualização
export interface EstoqueItem {
  codMaterial: string;
  descricao: string;
  un: string;
  categoria: string;
  estoqueMAO: number;
  estoqueBEL: number;
  estoqueAGR: number;
}

export const mockEstoque: EstoqueItem[] = [
  { codMaterial: "MAT-001", descricao: "Bloco de Espuma D33 Queen", un: "UN", categoria: "Espuma", estoqueMAO: 15, estoqueBEL: 8, estoqueAGR: 5 },
  { codMaterial: "MAT-002", descricao: "Bloco de Espuma D33 Casal", un: "UN", categoria: "Espuma", estoqueMAO: 22, estoqueBEL: 12, estoqueAGR: 10 },
  { codMaterial: "MAT-003", descricao: "Mola Bonnel Casal", un: "JG", categoria: "Molas", estoqueMAO: 30, estoqueBEL: 5, estoqueAGR: 18 },
  { codMaterial: "MAT-004", descricao: "Feltro Protetor", un: "M", categoria: "Proteção", estoqueMAO: 200, estoqueBEL: 80, estoqueAGR: 120 },
  { codMaterial: "MAT-005", descricao: "Tecido Malha Bambu Queen", un: "M", categoria: "Tecido", estoqueMAO: 45, estoqueBEL: 12, estoqueAGR: 30 },
  { codMaterial: "MAT-006", descricao: "Tecido Malha Bambu King", un: "M", categoria: "Tecido", estoqueMAO: 35, estoqueBEL: 10, estoqueAGR: 20 },
  { codMaterial: "MAT-007", descricao: "Cola Spray Industrial", un: "LT", categoria: "Insumo", estoqueMAO: 50, estoqueBEL: 25, estoqueAGR: 40 },
  { codMaterial: "MAT-008", descricao: "Kit Parafusos Fixação Baú", un: "KIT", categoria: "Ferragem", estoqueMAO: 100, estoqueBEL: 60, estoqueAGR: 45 },
  { codMaterial: "MAT-009", descricao: "Zíper Capa Protetora Queen", un: "UN", categoria: "Aviamento", estoqueMAO: 80, estoqueBEL: 30, estoqueAGR: 55 },
  { codMaterial: "MAT-010", descricao: "Espuma Viscoelástica Pillow", un: "UN", categoria: "Espuma", estoqueMAO: 40, estoqueBEL: 15, estoqueAGR: 25 },
];


