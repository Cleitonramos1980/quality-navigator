// Types for third-party technical assistance inventory control

export type AssistenciaTerceirizadaStatus = "ATIVA" | "INATIVA";

export interface AssistenciaTerceirizada {
  id: string;
  nome: string;
  razaoSocial?: string;
  cnpjCpf?: string;
  contatoPrincipal?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  cidade?: string;
  uf?: string;
  observacoes?: string;
  status: AssistenciaTerceirizadaStatus;
  criadoAt: string;
  atualizadoAt: string;
}

export type TipoItem = "PECA" | "EQUIPAMENTO";

export type ItemAssistenciaStatus =
  | "ENVIADO"
  | "EM_ANALISE"
  | "EM_REPARO"
  | "AGUARDANDO_PECA"
  | "CONSERTADO"
  | "DEVOLVIDO"
  | "ENCERRADO";

export const ITEM_ASSISTENCIA_STATUS_LABELS: Record<ItemAssistenciaStatus, string> = {
  ENVIADO: "Enviado",
  EM_ANALISE: "Em Análise",
  EM_REPARO: "Em Reparo",
  AGUARDANDO_PECA: "Aguardando Peça",
  CONSERTADO: "Consertado",
  DEVOLVIDO: "Devolvido",
  ENCERRADO: "Encerrado",
};

export const ITEM_ASSISTENCIA_STATUS_COLORS: Record<ItemAssistenciaStatus, string> = {
  ENVIADO: "bg-info/15 text-info",
  EM_ANALISE: "bg-warning/15 text-warning",
  EM_REPARO: "bg-primary/15 text-primary",
  AGUARDANDO_PECA: "bg-warning/15 text-warning",
  CONSERTADO: "bg-success/15 text-success",
  DEVOLVIDO: "bg-muted text-muted-foreground",
  ENCERRADO: "bg-muted text-muted-foreground",
};

export const TIPO_ITEM_LABELS: Record<TipoItem, string> = {
  PECA: "Peça",
  EQUIPAMENTO: "Equipamento / Máquina",
};

export interface ItemEmAssistencia {
  id: string;
  assistenciaId: string;
  assistenciaNome: string;
  tipoItem: TipoItem;
  codigoItem: string;
  descricao: string;
  numeroSerie?: string;
  patrimonio?: string;
  quantidade: number;
  quantidadeRetornada: number;
  defeito: string;
  osReferencia?: string;
  status: ItemAssistenciaStatus;
  responsavelEnvio: string;
  dataEnvio: string;
  dataRetorno?: string;
  observacao?: string;
}

export type TipoMovimentacao =
  | "ENVIO_PECA"
  | "ENVIO_EQUIPAMENTO"
  | "RETORNO_PECA"
  | "RETORNO_EQUIPAMENTO"
  | "TROCA_SUBSTITUICAO"
  | "CONSUMO_REPARO"
  | "CANCELAMENTO"
  | "AJUSTE"
  | "BAIXA_ENCERRAMENTO";

export const TIPO_MOVIMENTACAO_LABELS: Record<TipoMovimentacao, string> = {
  ENVIO_PECA: "Envio de Peça",
  ENVIO_EQUIPAMENTO: "Envio de Equipamento",
  RETORNO_PECA: "Retorno de Peça",
  RETORNO_EQUIPAMENTO: "Retorno de Equipamento",
  TROCA_SUBSTITUICAO: "Troca / Substituição",
  CONSUMO_REPARO: "Consumo em Reparo",
  CANCELAMENTO: "Cancelamento",
  AJUSTE: "Ajuste",
  BAIXA_ENCERRAMENTO: "Baixa / Encerramento",
};

export const TIPO_MOVIMENTACAO_COLORS: Record<TipoMovimentacao, string> = {
  ENVIO_PECA: "bg-info/15 text-info",
  ENVIO_EQUIPAMENTO: "bg-info/15 text-info",
  RETORNO_PECA: "bg-success/15 text-success",
  RETORNO_EQUIPAMENTO: "bg-success/15 text-success",
  TROCA_SUBSTITUICAO: "bg-primary/15 text-primary",
  CONSUMO_REPARO: "bg-warning/15 text-warning",
  CANCELAMENTO: "bg-destructive/15 text-destructive",
  AJUSTE: "bg-muted text-muted-foreground",
  BAIXA_ENCERRAMENTO: "bg-muted text-muted-foreground",
};

export type CondicaoRetorno =
  | "CONSERTADO"
  | "SEM_DEFEITO"
  | "TROCA_REALIZADA"
  | "SEM_CONSERTO"
  | "SUCATA"
  | "DEVOLVIDO_PARCIAL";

export const CONDICAO_RETORNO_LABELS: Record<CondicaoRetorno, string> = {
  CONSERTADO: "Consertado",
  SEM_DEFEITO: "Sem Defeito Constatado",
  TROCA_REALIZADA: "Troca Realizada",
  SEM_CONSERTO: "Sem Conserto",
  SUCATA: "Sucata",
  DEVOLVIDO_PARCIAL: "Devolvido Parcial",
};

export interface MovimentacaoAssistencia {
  id: string;
  itemId: string;
  assistenciaId: string;
  assistenciaNome: string;
  tipoMovimentacao: TipoMovimentacao;
  codigoItem: string;
  descricaoItem: string;
  quantidade: number;
  status: string;
  usuario: string;
  dataHora: string;
  condicaoRetorno?: CondicaoRetorno;
  laudoObservacao?: string;
  observacao?: string;
}
