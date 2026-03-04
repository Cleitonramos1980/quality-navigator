// Core types for SGQ Rodrigues

export type Planta = "MAO" | "BEL" | "AGR";

export type UserRole = "ADMIN" | "SAC" | "QUALIDADE" | "AUDITOR" | "DIRETORIA";

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
  defeito: string;
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
}

export interface CAPA {
  id: string;
  origemTipo: "GARANTIA" | "NC" | "AUDITORIA";
  origemId: string;
  descricaoProblema: string;
  causaRaiz?: string;
  planoAcao?: string;
  responsavel: string;
  dataInicio: string;
  dataPrazo: string;
  dataConclusao?: string;
  status: CAPAStatus;
}

export interface AudExec {
  id: string;
  tplNome: string;
  planta: Planta;
  local: string;
  auditor: string;
  status: AuditStatus;
  startedAt: string;
  finishedAt?: string;
}
