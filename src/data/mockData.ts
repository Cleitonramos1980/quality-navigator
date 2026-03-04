import { GarantiaCaso, NCRegistro, CAPA, AudExec } from "@/types/sgq";

export const mockGarantias: GarantiaCaso[] = [
  { id: "GAR-001", codcli: "1042", clienteNome: "Magazine Luiza", numPedido: "PED-88421", numNfVenda: "NF-112340", defeito: "deformação", plantaResp: "MAO", status: "ABERTO", custoEstimado: 450, abertoAt: "2026-02-28", obs: "Colchão Queen apresenta deformação central após 3 meses" },
  { id: "GAR-002", codcli: "2081", clienteNome: "Casas Bahia", numPedido: "PED-77312", numNfVenda: "NF-109877", numNfTroca: "NF-T-5543", defeito: "ruído", plantaResp: "BEL", status: "EM_ANALISE", custoEstimado: 320, abertoAt: "2026-02-25" },
  { id: "GAR-003", codcli: "3055", clienteNome: "Ponto Frio", numPedido: "PED-66201", numNfVenda: "NF-105432", defeito: "afundamento", plantaResp: "AGR", status: "APROVADO", custoEstimado: 580, abertoAt: "2026-02-20" },
  { id: "GAR-004", codcli: "1042", clienteNome: "Magazine Luiza", numPedido: "PED-88500", numNfVenda: "NF-112500", defeito: "tecido manchado", plantaResp: "MAO", status: "NEGADO", abertoAt: "2026-02-18", encerradoAt: "2026-02-22" },
  { id: "GAR-005", codcli: "4010", clienteNome: "Havan", numPedido: "PED-55100", numNfVenda: "NF-100200", defeito: "odor", plantaResp: "BEL", status: "EM_TROCA", custoEstimado: 290, abertoAt: "2026-02-15" },
  { id: "GAR-006", codcli: "5022", clienteNome: "Riachuelo", numPedido: "PED-44300", numNfVenda: "NF-098700", defeito: "cor desbotada", plantaResp: "AGR", status: "ENCERRADO", custoEstimado: 180, abertoAt: "2026-01-10", encerradoAt: "2026-02-28" },
];

export const mockNCs: NCRegistro[] = [
  { id: "NC-001", codcli: "1042", clienteNome: "Magazine Luiza", motivoId: "MOT-01", tipoNc: "PRODUTO", gravidade: "ALTA", descricao: "Lote de espuma com densidade abaixo do especificado", responsavel: "Carlos Silva", prazo: "2026-03-15", status: "ABERTA", planta: "MAO", abertoAt: "2026-03-01" },
  { id: "NC-002", motivoId: "MOT-03", tipoNc: "PROCESSO", gravidade: "MEDIA", descricao: "Falha na selagem do plástico de embalagem", responsavel: "Ana Souza", prazo: "2026-03-20", status: "EM_ANALISE", planta: "BEL", abertoAt: "2026-02-27" },
  { id: "NC-003", motivoId: "MOT-02", tipoNc: "FORNECEDOR", gravidade: "CRITICA", descricao: "Tecido recebido com coloração divergente do padrão", causaRaiz: "Fornecedor trocou lote de tingimento", responsavel: "Roberto Lima", prazo: "2026-03-10", status: "EM_ACAO", planta: "AGR", abertoAt: "2026-02-20" },
  { id: "NC-004", motivoId: "MOT-04", tipoNc: "SISTEMA", gravidade: "BAIXA", descricao: "Registro de rastreabilidade incompleto no sistema", responsavel: "Maria Costa", prazo: "2026-03-25", status: "AGUARDANDO_EFICACIA", planta: "MAO", abertoAt: "2026-02-10" },
  { id: "NC-005", codcli: "3055", clienteNome: "Ponto Frio", motivoId: "MOT-01", tipoNc: "CLIENTE", gravidade: "MEDIA", descricao: "Reclamação de cliente sobre acabamento irregular", responsavel: "José Santos", prazo: "2026-03-05", status: "ENCERRADA", planta: "BEL", abertoAt: "2026-01-15" },
];

export const mockCAPAs: CAPA[] = [
  { id: "CAPA-001", origemTipo: "NC", origemId: "NC-003", descricaoProblema: "Tecido com coloração divergente", causaRaiz: "Fornecedor sem controle de lote", planoAcao: "Implementar inspeção de recebimento com amostragem", responsavel: "Roberto Lima", dataInicio: "2026-02-21", dataPrazo: "2026-03-21", status: "EM_ANDAMENTO" },
  { id: "CAPA-002", origemTipo: "GARANTIA", origemId: "GAR-001", descricaoProblema: "Deformação prematura em colchões Queen", responsavel: "Carlos Silva", dataInicio: "2026-03-01", dataPrazo: "2026-04-01", status: "ABERTA" },
  { id: "CAPA-003", origemTipo: "AUDITORIA", origemId: "AUD-001", descricaoProblema: "Procedimento de controle de temperatura não seguido", causaRaiz: "Falta de treinamento", planoAcao: "Reciclar treinamento de todos operadores", responsavel: "Ana Souza", dataInicio: "2026-02-10", dataPrazo: "2026-03-10", dataConclusao: "2026-03-05", status: "CONCLUIDA" },
];

export const mockAuditorias: AudExec[] = [
  { id: "AUD-001", tplNome: "Auditoria 5S - Produção", planta: "MAO", local: "Linha de Montagem 1", auditor: "Pedro Almeida", status: "CONCLUIDA", startedAt: "2026-02-15", finishedAt: "2026-02-15" },
  { id: "AUD-002", tplNome: "Auditoria de Processo - Espuma", planta: "BEL", local: "Setor de Espumação", auditor: "Laura Mendes", status: "EM_EXECUCAO", startedAt: "2026-03-01" },
  { id: "AUD-003", tplNome: "Auditoria ISO 9001 - Interna", planta: "AGR", local: "Toda a planta", auditor: "Fernando Oliveira", status: "PLANEJADA", startedAt: "2026-03-15" },
  { id: "AUD-004", tplNome: "Auditoria de Produto Final", planta: "MAO", local: "Expedição", auditor: "Pedro Almeida", status: "PLANEJADA", startedAt: "2026-03-20" },
];

export const dashboardData = {
  garantiaRate: 2.3,
  garantiaRatePrev: 2.8,
  totalGarantias: 47,
  totalNCs: 23,
  totalCAPAs: 12,
  avgResolutionDays: 14.5,
  topDefeitos: [
    { name: "deformação", value: 15 },
    { name: "afundamento", value: 12 },
    { name: "tecido", value: 8 },
    { name: "ruído", value: 6 },
    { name: "odor", value: 4 },
    { name: "cor desbotada", value: 2 },
  ],
  ncByCategoria: [
    { name: "PRODUTO", value: 9 },
    { name: "PROCESSO", value: 6 },
    { name: "FORNECEDOR", value: 4 },
    { name: "SISTEMA", value: 3 },
    { name: "CLIENTE", value: 1 },
  ],
  ncByGravidade: [
    { name: "CRÍTICA", value: 3 },
    { name: "ALTA", value: 7 },
    { name: "MÉDIA", value: 9 },
    { name: "BAIXA", value: 4 },
  ],
  garantiasByMonth: [
    { month: "Set", count: 5 },
    { month: "Out", count: 8 },
    { month: "Nov", count: 6 },
    { month: "Dez", count: 10 },
    { month: "Jan", count: 9 },
    { month: "Fev", count: 9 },
  ],
};
