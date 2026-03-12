export type InventarioStatus =
  | "NAO_INICIADO"
  | "EM_ANDAMENTO"
  | "CONCLUIDO"
  | "VALIDADO"
  | "NAO_FEITO"
  | "ATRASADO"
  | "RECONTAGEM"
  | "CANCELADO";

export type FrequenciaInventario = "DIARIA" | "SEMANAL" | "QUINZENAL" | "MENSAL";

export const FREQUENCIA_LABELS: Record<FrequenciaInventario, string> = {
  DIARIA: "Diária",
  SEMANAL: "Semanal",
  QUINZENAL: "Quinzenal",
  MENSAL: "Mensal",
};

export const INVENTARIO_STATUS_LABELS: Record<InventarioStatus, string> = {
  NAO_INICIADO: "Não Iniciado",
  EM_ANDAMENTO: "Em Andamento",
  CONCLUIDO: "Concluído",
  VALIDADO: "Validado",
  NAO_FEITO: "Não Feito",
  ATRASADO: "Atrasado",
  RECONTAGEM: "Recontagem",
  CANCELADO: "Cancelado",
};

export const INVENTARIO_STATUS_COLORS: Record<InventarioStatus, string> = {
  NAO_INICIADO: "bg-muted text-muted-foreground",
  EM_ANDAMENTO: "bg-warning/15 text-warning",
  CONCLUIDO: "bg-success/15 text-success",
  VALIDADO: "bg-primary/15 text-primary",
  NAO_FEITO: "bg-destructive/15 text-destructive",
  ATRASADO: "bg-destructive/15 text-destructive",
  RECONTAGEM: "bg-accent/15 text-accent-foreground",
  CANCELADO: "bg-muted text-muted-foreground",
};

export interface LojaInventario {
  id: string;
  codigo: string;
  nome: string;
  regional: string;
  gerente: string;
  supervisor: string;
}

export interface DepartamentoInventario {
  id: string;
  codigo: string;
  nome: string;
}

export interface FrequenciaConfig {
  id: string;
  lojaId: string;
  lojaNome: string;
  regional: string;
  gerente: string;
  supervisor: string;
  departamentoId: string;
  departamentoNome: string;
  frequencia: FrequenciaInventario;
  ativo: boolean;
  proximaExecucao: string;
  responsavelPadrao: string;
}

export interface TarefaInventario {
  id: string;
  data: string;
  lojaId: string;
  lojaNome: string;
  regional: string;
  gerente: string;
  supervisor: string;
  departamentoId: string;
  departamentoNome: string;
  frequencia: FrequenciaInventario;
  responsavel: string;
  status: InventarioStatus;
  contagemId?: string;
}

export interface ItemContagem {
  id: string;
  codigoItem: string;
  codigoBarras: string;
  descricao: string;
  estoqueSistema: number;
  quantidadeContada: number | null;
  diferenca: number | null;
  motivoDivergencia?: string;
  observacao?: string;
}

export interface Contagem {
  id: string;
  numero: string;
  tarefaId: string;
  data: string;
  lojaId: string;
  lojaNome: string;
  regional: string;
  gerente: string;
  supervisor: string;
  departamentoId: string;
  departamentoNome: string;
  frequencia: FrequenciaInventario;
  responsavel: string;
  status: InventarioStatus;
  itens: ItemContagem[];
  itensContados: number;
  itensDivergentes: number;
  acuracidade: number;
  iniciadoEm?: string;
  concluidoEm?: string;
  validadoEm?: string;
  validadoPor?: string;
  recontagem?: boolean;
  recontagemOrigem?: string;
}

export interface DivergenciaDiaria {
  data: string;
  lojaId: string;
  lojaNome: string;
  supervisor: string;
  departamento: string;
  frequencia: FrequenciaInventario;
  itensContados: number;
  itensDivergentes: number;
  acuracidade: number;
  status: InventarioStatus;
  contagemId: string;
  nivel: "ok" | "atencao" | "alta" | "sem_contagem";
}
