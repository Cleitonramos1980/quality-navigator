import { Planta } from "./sgq";

// ── Ordem de Serviço ──

export type OSStatus =
  | "ABERTA"
  | "AGUARDANDO_RECEBIMENTO"
  | "RECEBIDO"
  | "EM_INSPECAO"
  | "AGUARDANDO_PECAS"
  | "EM_REPARO"
  | "AGUARDANDO_VALIDACAO"
  | "CONCLUIDA"
  | "ENCERRADA"
  | "CANCELADA";

export type OSTipo = "GARANTIA" | "ASSISTENCIA" | "CONSERTO" | "INSTALACAO";

export type OSPrioridade = "BAIXA" | "MEDIA" | "ALTA" | "CRITICA";

export type OSOrigemTipo = "SAC" | "GARANTIA" | "NC" | "AVULSA";

export const OS_STATUS_LABELS: Record<OSStatus, string> = {
  ABERTA: "Aberta",
  AGUARDANDO_RECEBIMENTO: "Aguardando Recebimento",
  RECEBIDO: "Recebido",
  EM_INSPECAO: "Em Inspeção",
  AGUARDANDO_PECAS: "Aguardando Peças",
  EM_REPARO: "Em Reparo",
  AGUARDANDO_VALIDACAO: "Aguardando Validação",
  CONCLUIDA: "Concluída",
  ENCERRADA: "Encerrada",
  CANCELADA: "Cancelada",
};

export const OS_STATUS_COLORS: Record<OSStatus, string> = {
  ABERTA: "bg-info/15 text-info",
  AGUARDANDO_RECEBIMENTO: "bg-warning/15 text-warning",
  RECEBIDO: "bg-primary/15 text-primary",
  EM_INSPECAO: "bg-accent/15 text-accent-foreground",
  AGUARDANDO_PECAS: "bg-warning/15 text-warning",
  EM_REPARO: "bg-info/15 text-info",
  AGUARDANDO_VALIDACAO: "bg-primary/15 text-primary",
  CONCLUIDA: "bg-success/15 text-success",
  ENCERRADA: "bg-muted text-muted-foreground",
  CANCELADA: "bg-destructive/15 text-destructive",
};

export const OS_TIPO_LABELS: Record<OSTipo, string> = {
  GARANTIA: "Garantia",
  ASSISTENCIA: "Assistência",
  CONSERTO: "Conserto",
  INSTALACAO: "Instalação",
};

export const OS_PRIORIDADE_LABELS: Record<OSPrioridade, string> = {
  BAIXA: "Baixa",
  MEDIA: "Média",
  ALTA: "Alta",
  CRITICA: "Crítica",
};

export const OS_PRIORIDADE_COLORS: Record<OSPrioridade, string> = {
  BAIXA: "bg-muted text-muted-foreground",
  MEDIA: "bg-info/15 text-info",
  ALTA: "bg-warning/15 text-warning",
  CRITICA: "bg-destructive/15 text-destructive",
};

export interface OrdemServico {
  id: string;
  origemTipo: OSOrigemTipo;
  origemId?: string;
  codcli: string;
  clienteNome: string;
  numPedido?: string;
  nfVenda?: string;
  planta: Planta;
  tipoOs: OSTipo;
  status: OSStatus;
  prioridade: OSPrioridade;
  tecnicoResponsavel: string;
  descricaoProblema: string;
  laudoInspecao?: string;
  decisaoTecnica?: string;
  dataAbertura: string;
  dataPrevista: string;
  dataConclusao?: string;
}

// ── Requisição Assistência ──

export type ReqAssistStatus =
  | "RASCUNHO"
  | "PENDENTE"
  | "EM_SEPARACAO"
  | "EM_TRANSFERENCIA"
  | "RECEBIDA_ASSISTENCIA"
  | "ATENDIDA"
  | "PARCIAL"
  | "NEGADA";

export const REQ_ASSIST_STATUS_LABELS: Record<ReqAssistStatus, string> = {
  RASCUNHO: "Rascunho",
  PENDENTE: "Pendente",
  EM_SEPARACAO: "Em Separação",
  EM_TRANSFERENCIA: "Em Transferência",
  RECEBIDA_ASSISTENCIA: "Recebida na Assistência",
  ATENDIDA: "Atendida",
  PARCIAL: "Parcial",
  NEGADA: "Negada",
};

export const REQ_ASSIST_STATUS_COLORS: Record<ReqAssistStatus, string> = {
  RASCUNHO: "bg-muted text-muted-foreground",
  PENDENTE: "bg-warning/15 text-warning",
  EM_SEPARACAO: "bg-info/15 text-info",
  EM_TRANSFERENCIA: "bg-primary/15 text-primary",
  RECEBIDA_ASSISTENCIA: "bg-accent/15 text-accent-foreground",
  ATENDIDA: "bg-success/15 text-success",
  PARCIAL: "bg-info/15 text-info",
  NEGADA: "bg-destructive/15 text-destructive",
};

export interface ItemReqAssist {
  codMaterial: string;
  descricao: string;
  un: string;
  qtdSolicitada: number;
  qtdAtendida?: number;
  situacao?: "ATENDIDO" | "PARCIAL" | "INDISPONIVEL";
}

export interface RequisicaoAssistencia {
  id: string;
  osId: string;
  cdResponsavel: Planta;
  plantaDestino: Planta;
  status: ReqAssistStatus;
  itens: ItemReqAssist[];
  criadoAt: string;
  atualizadoAt: string;
}

// ── Consumo ──

export interface ConsumoMaterial {
  id: string;
  osId: string;
  reqId?: string;
  codMaterial: string;
  descricao: string;
  un: string;
  qtdConsumida: number;
  tecnico: string;
  dataConsumo: string;
}

// ── RBAC ──

export const ASSIST_PERMISSIONS = [
  "ASSIST_OS_VIEW",
  "ASSIST_OS_CREATE",
  "ASSIST_OS_EDIT",
  "ASSIST_OS_CLOSE",
  "ASSIST_INSPECAO_CREATE",
  "ASSIST_INSPECAO_APROVAR",
  "ASSIST_REQ_CREATE",
  "ASSIST_REQ_ATENDER",
  "ASSIST_REQ_RECEBER",
  "ASSIST_CONSUMO_CREATE",
  "ASSIST_ESTOQUE_VIEW",
  "ASSIST_DASH_VIEW",
] as const;

export type AssistPermission = typeof ASSIST_PERMISSIONS[number];
