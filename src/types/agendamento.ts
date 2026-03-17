// ── Agendamento Inteligente de Doca / Pátio ──

import type { TipoOperacao } from "@/types/operacional";

export type AgendamentoStatus =
  | "AGENDADO" | "CONFIRMADO" | "EM_DESLOCAMENTO" | "CHEGOU"
  | "EM_FILA" | "EM_DOCA" | "EM_OPERACAO" | "CONCLUIDO"
  | "ATRASADO" | "NAO_COMPARECEU" | "CANCELADO" | "REMARCADO";

export type AgendamentoPrioridade = "NORMAL" | "ALTA" | "URGENTE" | "CRITICA";

export interface AgendamentoDockSlot {
  id: string;
  codigo: string;
  unidade: string;
  dataHoraPrevista: string;
  janelaInicio: string;
  janelaFim: string;
  dataHoraRealChegada?: string;
  transportadoraId: string;
  transportadoraNome: string;
  motoristaId?: string;
  motoristaNome?: string;
  veiculoId?: string;
  placa?: string;
  tipoOperacao: TipoOperacao;
  docaPrevistaId?: string;
  docaPrevistaNome?: string;
  docaRealId?: string;
  docaRealNome?: string;
  status: AgendamentoStatus;
  prioridade: AgendamentoPrioridade;
  duracaoPrevistaMin: number;
  toleranciaMin: number;
  nfVinculada?: string;
  cargaVinculada?: string;
  observacoes?: string;
  pendencias: string[];
  sla: number; // % compliance
  planta: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface DockCapacity {
  docaId: string;
  docaNome: string;
  slots: { hora: string; status: "livre" | "agendado" | "ocupado" | "conflito" | "manutencao" }[];
}

export interface AgendamentoKPIs {
  taxaOcupacao: number;
  tempoMedioEspera: number;
  tempoMedioOperacao: number;
  atrasosDia: number;
  dentroJanela: number;
  noShow: number;
  remarcacoes: number;
  conflitoAgenda: number;
  permanenciaMedia: number;
  throughputDoca: number;
}

export const AGENDAMENTO_STATUS_LABELS: Record<AgendamentoStatus, string> = {
  AGENDADO: "Agendado",
  CONFIRMADO: "Confirmado",
  EM_DESLOCAMENTO: "Em Deslocamento",
  CHEGOU: "Chegou",
  EM_FILA: "Em Fila",
  EM_DOCA: "Em Doca",
  EM_OPERACAO: "Em Operação",
  CONCLUIDO: "Concluído",
  ATRASADO: "Atrasado",
  NAO_COMPARECEU: "Não Compareceu",
  CANCELADO: "Cancelado",
  REMARCADO: "Remarcado",
};

export const AGENDAMENTO_STATUS_COLORS: Record<AgendamentoStatus, string> = {
  AGENDADO: "bg-info/15 text-info",
  CONFIRMADO: "bg-success/15 text-success",
  EM_DESLOCAMENTO: "bg-primary/15 text-primary",
  CHEGOU: "bg-primary/15 text-primary",
  EM_FILA: "bg-warning/15 text-warning",
  EM_DOCA: "bg-primary/15 text-primary",
  EM_OPERACAO: "bg-success/15 text-success",
  CONCLUIDO: "bg-muted text-muted-foreground",
  ATRASADO: "bg-destructive/15 text-destructive",
  NAO_COMPARECEU: "bg-destructive/15 text-destructive",
  CANCELADO: "bg-muted text-muted-foreground",
  REMARCADO: "bg-warning/15 text-warning",
};

export const PRIORIDADE_COLORS: Record<AgendamentoPrioridade, string> = {
  NORMAL: "bg-muted text-muted-foreground",
  ALTA: "bg-warning/15 text-warning",
  URGENTE: "bg-destructive/15 text-destructive",
  CRITICA: "bg-foreground/10 text-foreground font-bold",
};
