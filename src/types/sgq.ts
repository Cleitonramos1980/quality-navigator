// Core types for SQI

export type Planta = "MAO" | "BEL" | "AGR";

export type UserRole = "ADMIN" | "SAC" | "QUALIDADE" | "AUDITOR" | "ASSISTENCIA" | "TECNICO" | "ALMOX" | "DIRETORIA" | "VALIDACAO";
export type Perfil = UserRole;

export type GarantiaStatus = "ABERTO" | "EM_ANALISE" | "APROVADO" | "NEGADO" | "EM_TROCA" | "ENCERRADO";

export type NCStatus = "ABERTA" | "EM_ANALISE" | "EM_ACAO" | "AGUARDANDO_EFICACIA" | "ENCERRADA";

export type CAPAStatus = "ABERTA" | "EM_ANDAMENTO" | "CONCLUIDA" | "VERIFICADA" | "ENCERRADA";

export type AuditStatus = "PLANEJADA" | "EM_EXECUCAO" | "CONCLUIDA" | "CANCELADA";

export type NCTipo = "PRODUTO" | "PROCESSO" | "SISTEMA" | "FORNECEDOR" | "CLIENTE";

export type Gravidade = "BAIXA" | "MEDIA" | "ALTA" | "CRITICA";

export const DEFEITO_OPTIONS = [
  "deformação",
  "ruído",
  "afundamento",
  "tecido",
  "odor",
  "cor desbotada",
  "tecido manchado",
] as const;

export const PLANTA_LABELS: Record<Planta, string> = {
  MAO: "Manaus / AM",
  BEL: "Belém / PA",
  AGR: "Agrestina / PE",
};

export const STATUS_COLORS: Record<string, string> = {
  ABERTO: "bg-info/15 text-info",
  ABERTA: "bg-info/15 text-info",
  EM_ANALISE: "bg-warning/15 text-warning",
  EM_ACAO: "bg-warning/15 text-warning",
  APROVADO: "bg-success/15 text-success",
  NEGADO: "bg-destructive/15 text-destructive",
  EM_TROCA: "bg-accent/15 text-accent-foreground",
  ENCERRADO: "bg-muted text-muted-foreground",
  ENCERRADA: "bg-muted text-muted-foreground",
  AGUARDANDO_EFICACIA: "bg-primary/15 text-primary",
  PLANEJADA: "bg-info/15 text-info",
  EM_EXECUCAO: "bg-warning/15 text-warning",
  CONCLUIDA: "bg-success/15 text-success",
  VERIFICADA: "bg-success/15 text-success",
  CANCELADA: "bg-destructive/15 text-destructive",
  EM_ANDAMENTO: "bg-warning/15 text-warning",
  BAIXA: "bg-success/15 text-success",
  MEDIA: "bg-warning/15 text-warning",
  ALTA: "bg-accent/15 text-accent-foreground",
  CRITICA: "bg-destructive/15 text-destructive",
};

export interface GarantiaCaso {
  id: string;
  codcli: string;
  clienteNome: string;
  numPedido: string;
  numNfVenda: string;
  numNfTroca?: string;
  codprod?: string;
  defeito: string;
  descricao?: string;
  plantaResp: Planta;
  status: GarantiaStatus;
  custoEstimado?: number;
  abertoAt: string;
  encerradoAt?: string;
  obs?: string;
}

export interface NCRegistro {
  id: string;
  codcli?: string;
  clienteNome?: string;
  numPedido?: string;
  numNf?: string;
  codprod?: string;
  motivoId: string;
  tipoNc: NCTipo;
  gravidade: Gravidade;
  descricao: string;
  causaRaiz?: string;
  planoAcao?: string;
  responsavel: string;
  prazo: string;
  status: NCStatus;
  planta: Planta;
  abertoAt: string;
  encerradoAt?: string;
  origem?: string;
  origemId?: string;
}

export interface CAPA {
  id: string;
  origemTipo: "GARANTIA" | "NC" | "AUDITORIA";
  origemId: string;
  descricaoProblema: string;
  causaRaiz?: string;
  planoAcao?: string;
  criterioEficacia?: string;
  responsavel: string;
  dataInicio: string;
  dataPrazo: string;
  dataConclusao?: string;
  status: CAPAStatus;
}

export interface AudExec {
  id: string;
  tplId?: string;
  tplNome: string;
  tipoAuditoria?: string;
  planta: Planta;
  local: string;
  auditor: string;
  escopo?: string;
  status: AuditStatus;
  startedAt: string;
  finishedAt?: string;
}

export interface DocumentoQualidade {
  id: string;
  codigo: string;
  titulo: string;
  tipo: string;
  status: string;
  versaoAtual: string;
  elaborador: string;
  revisor: string;
  aprovador: string;
  responsavel?: string;
  setor: string;
  validadeAt?: string;
  aprovadoPor?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TreinamentoQualidade {
  id: string;
  titulo: string;
  tipo: string;
  cargoAlvo: string;
  instrutor: string;
  cargaHoraria: number;
  status: string;
  dataPlanejada: string;
  dataRealizacao?: string;
  validadeMeses?: number;
  observacoes?: string;
}

export interface TreinamentoParticipante {
  id: string;
  treinamentoId: string;
  colaborador: string;
  cargo: string;
  resultado: string;
  status: string;
  concluidoAt?: string;
}

export interface MudancaQualidade {
  id: string;
  titulo: string;
  descricao: string;
  tipo: string;
  area: string;
  solicitante: string;
  risco: "BAIXO" | "MEDIO" | "ALTO" | "CRITICO" | string;
  status: string;
  dataSolicitacao: string;
  dataImplementacao?: string;
  aprovador?: string;
  planoValidacao?: string;
}

export interface FornecedorQualidade {
  id: string;
  codigo: string;
  nome: string;
  categoria: string;
  status: string;
  score: number;
  ultimaAvaliacaoAt?: string;
  responsavel?: string;
}

export interface ScarFornecedor {
  id: string;
  fornecedorId: string;
  titulo: string;
  descricao: string;
  status: string;
  gravidade: "BAIXA" | "MEDIA" | "ALTA" | "CRITICA" | string;
  responsavel: string;
  prazo: string;
  dataAbertura: string;
  dataFechamento?: string;
  acaoCorretiva?: string;
}

export interface InstrumentoMetrologia {
  id: string;
  codigo: string;
  descricao: string;
  tipo: string;
  fabricante?: string;
  numeroSerie?: string;
  planta: Planta;
  local: string;
  statusCalibracao: string;
  ultimaCalibracaoAt?: string;
  proximaCalibracaoAt: string;
  incerteza?: number;
  responsavel: string;
}

export interface EstudoMsa {
  id: string;
  instrumentoId: string;
  caracteristica: string;
  metodo: string;
  rrPercent: number;
  ndc: number;
  resultado: string;
  estudadoAt: string;
  responsavel: string;
  observacoes?: string;
}

export interface IndicadorIndustrial {
  id: string;
  data: string;
  planta: Planta;
  linha: string;
  oee: number;
  fpy: number;
  scrapRate: number;
  reworkRate: number;
  mtbfHoras: number;
  mttrHoras: number;
  paradasNaoPlanejadas?: number;
  fonte?: string;
}

export interface IndicadorIndustrialResumo {
  count: number;
  oeeMedio: number;
  fpyMedio: number;
  scrapMedio: number;
  reworkMedio: number;
  mtbfMedio: number;
  mttrMedio: number;
}

export interface RegraRiscoSla {
  id: string;
  origemTipo: string;
  criticidade: string;
  pontuacaoMin: number;
  pontuacaoMax: number;
  slaHoras: number;
  resposta: string;
}

export interface AvaliacaoRiscoSla {
  id: string;
  origemTipo: string;
  origemId: string;
  criticidade: string;
  impacto: number;
  recorrencia: number;
  detectabilidade: number;
  pontuacao: number;
  slaHoras: number;
  statusSla: string;
  limiteAt: string;
  criadoAt: string;
  justificativa?: string;
}

export interface AuditoriaCamada {
  id: string;
  camada: string;
  planta: Planta;
  area: string;
  processo: string;
  auditor: string;
  frequencia: string;
  status: string;
  proximaExecucaoAt: string;
  ultimaExecucaoAt?: string;
  score?: number;
  achados?: string;
}

export interface GateFornecedor {
  id: string;
  fornecedorId: string;
  coreTool: string;
  status: string;
  evidencia?: string;
  validadoPor?: string;
  validadoAt?: string;
  observacoes?: string;
}

export interface IsoReadinessItem {
  id: string;
  clausula: string;
  titulo: string;
  status: string;
  responsavel: string;
  prazo: string;
  evidencia?: string;
  ultimaRevisaoAt?: string;
  risco: string;
}

export interface IsoReadinessResumo {
  total: number;
  atendidos: number;
  pendentes: number;
  riscoAlto: number;
  percentualAtendimento: number;
}




