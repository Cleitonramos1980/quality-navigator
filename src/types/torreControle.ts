// ── Torre de Controle de Exceções ──

export type ExcecaoCategoria =
  | "PATIO" | "PORTARIA" | "FROTA" | "NF_TRANSITO" | "TRANSPORTADORA"
  | "VISITANTE" | "DOCUMENTACAO" | "SLA" | "OPERACIONAL";

export type ExcecaoStatus =
  | "ABERTA" | "EM_ANALISE" | "EM_TRATATIVA" | "ESCALADA"
  | "MONITORADA" | "RESOLVIDA" | "ENCERRADA" | "RECORRENTE";

export type ExcecaoCriticidade = "BAIXA" | "MEDIA" | "ALTA" | "CRITICA";

export interface ExcecaoTorre {
  id: string;
  titulo: string;
  descricao: string;
  categoria: ExcecaoCategoria;
  criticidade: ExcecaoCriticidade;
  status: ExcecaoStatus;
  origem: string;
  origemId: string;
  origemRota?: string;
  responsavel?: string;
  criadoEm: string;
  atualizadoEm: string;
  prazo?: string;
  venceEm?: string;
  reincidencias: number;
  acaoSugerida?: string;
  tratativa?: string;
  justificativa?: string;
  historico: ExcecaoEvento[];
  tags: string[];
  planta: string;
}

export interface ExcecaoEvento {
  id: string;
  tipo: string;
  descricao: string;
  dataHora: string;
  usuario: string;
}

export interface TorreKPIs {
  totalAbertas: number;
  criticas: number;
  slaEstourado: number;
  semResponsavel: number;
  nfsEmRisco: number;
  docasCongestionadas: number;
  permanenciaFora: number;
  pendenciasDocumentais: number;
  transportadorasIrregulares: number;
  semTratativa: number;
  resolvidasHoje: number;
  reincidentes: number;
}

export const EXCECAO_CATEGORIA_LABELS: Record<ExcecaoCategoria, string> = {
  PATIO: "Pátio / Docas",
  PORTARIA: "Portaria",
  FROTA: "Frota",
  NF_TRANSITO: "NF em Trânsito",
  TRANSPORTADORA: "Transportadora",
  VISITANTE: "Visitante",
  DOCUMENTACAO: "Documentação",
  SLA: "SLA Operacional",
  OPERACIONAL: "Operação Geral",
};

export const EXCECAO_STATUS_LABELS: Record<ExcecaoStatus, string> = {
  ABERTA: "Aberta",
  EM_ANALISE: "Em Análise",
  EM_TRATATIVA: "Em Tratativa",
  ESCALADA: "Escalada",
  MONITORADA: "Monitorada",
  RESOLVIDA: "Resolvida",
  ENCERRADA: "Encerrada",
  RECORRENTE: "Recorrente",
};

export const EXCECAO_STATUS_COLORS: Record<ExcecaoStatus, string> = {
  ABERTA: "bg-destructive/15 text-destructive",
  EM_ANALISE: "bg-warning/15 text-warning",
  EM_TRATATIVA: "bg-info/15 text-info",
  ESCALADA: "bg-destructive/15 text-destructive",
  MONITORADA: "bg-primary/15 text-primary",
  RESOLVIDA: "bg-success/15 text-success",
  ENCERRADA: "bg-muted text-muted-foreground",
  RECORRENTE: "bg-destructive/15 text-destructive",
};

export const CRITICIDADE_LABELS: Record<ExcecaoCriticidade, string> = {
  BAIXA: "Baixa",
  MEDIA: "Média",
  ALTA: "Alta",
  CRITICA: "Crítica",
};

export const CRITICIDADE_COLORS: Record<ExcecaoCriticidade, string> = {
  BAIXA: "bg-muted text-muted-foreground",
  MEDIA: "bg-warning/15 text-warning",
  ALTA: "bg-destructive/15 text-destructive",
  CRITICA: "bg-foreground/10 text-foreground font-bold",
};
