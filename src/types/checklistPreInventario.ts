export type ChecklistItemStatus = "PENDENTE" | "EM_ANDAMENTO" | "CONCLUIDO" | "CANCELADO" | "NAO_APLICAVEL";
export type ChecklistCriticidade = "ALTA" | "MEDIA" | "BAIXA";
export type ChecklistGeralStatus = "ABERTO" | "EM_ANDAMENTO" | "CONCLUIDO" | "CANCELADO";

export const STATUS_LABELS: Record<ChecklistItemStatus, string> = {
  PENDENTE: "Pendente",
  EM_ANDAMENTO: "Em Andamento",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
  NAO_APLICAVEL: "Não Aplicável",
};

export const STATUS_COLORS: Record<ChecklistItemStatus, string> = {
  PENDENTE: "bg-warning/15 text-warning",
  EM_ANDAMENTO: "bg-primary/15 text-primary",
  CONCLUIDO: "bg-success/15 text-success",
  CANCELADO: "bg-muted text-muted-foreground",
  NAO_APLICAVEL: "bg-muted text-muted-foreground",
};

export const CRITICIDADE_LABELS: Record<ChecklistCriticidade, string> = {
  ALTA: "Alta",
  MEDIA: "Média",
  BAIXA: "Baixa",
};

export const CRITICIDADE_COLORS: Record<ChecklistCriticidade, string> = {
  ALTA: "bg-destructive/15 text-destructive",
  MEDIA: "bg-warning/15 text-warning",
  BAIXA: "bg-success/15 text-success",
};

export const STATUS_GERAL_LABELS: Record<ChecklistGeralStatus, string> = {
  ABERTO: "Aberto",
  EM_ANDAMENTO: "Em Andamento",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
};

export const SETORES_CHECKLIST = [
  "Espumação", "Aglomerado", "Laminação", "Bordado",
  "Costura reta", "Montagem", "Fechamento", "Embalagem",
  "Marcenaria", "Móveis", "Almoxarifado", "CD", "Lojas", "Avaria",
] as const;

export const EVIDENCIA_TIPOS = [
  "Foto", "Print do sistema bloqueado", "Etiquetas aplicadas", "Relatório do sistema",
] as const;

export interface ChecklistItemHistorico {
  id: string;
  data: string;
  usuario: string;
  acao: string;
  detalhe: string;
}

export interface ChecklistItem {
  id: string;
  blocoId: string;
  descricao: string;
  status: ChecklistItemStatus;
  responsavel: string;
  data: string;
  setor: string;
  criticidade: ChecklistCriticidade;
  evidencia?: string;
  nc?: boolean;
  planoAcao?: string;
  observacao?: string;
  evidencias?: string[];
  historico: ChecklistItemHistorico[];
}

export interface ChecklistBloco {
  id: string;
  ordem: number;
  nome: string;
  itens: ChecklistItem[];
}

export interface ChecklistPreInventario {
  id: string;
  nome: string;
  unidade: string;
  dataPrevistaInventario: string;
  tipoInventario: string;
  responsavelGeral: string;
  statusGeral: ChecklistGeralStatus;
  observacoes?: string;
  criadoPor: string;
  criadoEm: string;
  blocos: ChecklistBloco[];
}
