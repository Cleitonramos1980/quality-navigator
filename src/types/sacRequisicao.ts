import { Planta } from "./sgq";

export type RequisicaoStatus = "RASCUNHO" | "PENDENTE" | "ATENDIDA" | "PARCIAL" | "NEGADA";
export type RequisicaoMotivo = "MANUTENCAO_CONSERTO" | "TROCA_COMPONENTE" | "ASSISTENCIA_EXTERNA" | "OUTRO";
export type RequisicaoPrioridade = "BAIXA" | "MEDIA" | "ALTA" | "CRITICA";
export type ItemRequisicaoSituacao = "ATENDIDO" | "PARCIAL" | "INDISPONIVEL";

export const REQUISICAO_STATUS_LABELS: Record<RequisicaoStatus, string> = {
  RASCUNHO: "Rascunho",
  PENDENTE: "Pendente",
  ATENDIDA: "Atendida",
  PARCIAL: "Parcial",
  NEGADA: "Negada",
};

export const REQUISICAO_STATUS_COLORS: Record<RequisicaoStatus, string> = {
  RASCUNHO: "bg-muted text-muted-foreground",
  PENDENTE: "bg-warning/15 text-warning",
  ATENDIDA: "bg-success/15 text-success",
  PARCIAL: "bg-info/15 text-info",
  NEGADA: "bg-destructive/15 text-destructive",
};

export const REQUISICAO_MOTIVO_LABELS: Record<RequisicaoMotivo, string> = {
  MANUTENCAO_CONSERTO: "Manutenção/Conserto",
  TROCA_COMPONENTE: "Troca de componente",
  ASSISTENCIA_EXTERNA: "Assistência técnica externa",
  OUTRO: "Outro",
};

export const REQUISICAO_PRIORIDADE_LABELS: Record<RequisicaoPrioridade, string> = {
  BAIXA: "Baixa",
  MEDIA: "Média",
  ALTA: "Alta",
  CRITICA: "Crítica",
};

export const REQUISICAO_PRIORIDADE_COLORS: Record<RequisicaoPrioridade, string> = {
  BAIXA: "bg-muted text-muted-foreground",
  MEDIA: "bg-info/15 text-info",
  ALTA: "bg-warning/15 text-warning",
  CRITICA: "bg-destructive/15 text-destructive",
};

export interface ItemRequisicao {
  codmat: string;
  descricaoMaterial: string;
  un: string;
  qtdSolicitada: number;
  qtdAtendida?: number;
  situacao?: ItemRequisicaoSituacao;
  observacao?: string;
  observacaoAtendente?: string;
}

export interface SACRequisicao {
  id: string;
  atendimentoId?: string;
  codcli: string;
  clienteNome: string;
  cgcent: string;
  numPedido?: string;
  numNfVenda?: string;
  codprod?: string;
  produtoRelacionado?: string;
  plantaCd: Planta;
  motivo: RequisicaoMotivo;
  prioridade: RequisicaoPrioridade;
  observacoes: string;
  itens: ItemRequisicao[];
  status: RequisicaoStatus;
  criadoAt: string;
  atualizadoAt: string;
  atendidoAt?: string;
  atendidoPor?: string;
  observacoesAtendimento?: string;
}

export interface MaterialERP {
  codmat: string;
  descricao: string;
  un: string;
  categoria: string;
  estoqueDisponivel: number;
}



