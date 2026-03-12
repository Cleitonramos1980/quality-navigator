// Types for operational modules — Torre de Controle

export type Criticidade = "BAIXA" | "MEDIA" | "ALTA" | "CRITICA";

// ── Acessos / Portaria ──
export type AcessoStatus =
  | "PRE_AUTORIZADO" | "AGUARDANDO_PREENCHIMENTO" | "AGUARDANDO_VALIDACAO"
  | "APROVADO" | "ENTRADA_LIBERADA" | "ENTRADA_REGISTRADA"
  | "EM_PERMANENCIA" | "SAIDA_REGISTRADA" | "ENCERRADO" | "RECUSADO" | "EXPIRADO";

export type TipoAcesso = "VISITANTE" | "MOTORISTA" | "PRESTADOR" | "FUNCIONARIO" | "ENTREGA";

export interface Acesso {
  id: string;
  tipo: TipoAcesso;
  nome: string;
  documento: string;
  empresa: string;
  placa?: string;
  tipoVeiculo?: string;
  responsavelInterno: string;
  setorDestino: string;
  horarioPrevisto: string;
  horarioReal?: string;
  horarioSaida?: string;
  status: AcessoStatus;
  criticidade: Criticidade;
  motivo: string;
  selfieUrl?: string;
  qrCode?: string;
  planta: string;
  criadoEm: string;
  criadoPor: string;
  ultimaAtualizacao: string;
  obs?: string;
}

// ── Visitantes ──
export type VisitanteStatus =
  | "CONVITE_CRIADO" | "LINK_ENVIADO" | "CADASTRO_PREENCHIDO"
  | "AGUARDANDO_VALIDACAO" | "APROVADO" | "QR_GERADO"
  | "ENTRADA_REALIZADA" | "VISITA_EM_ANDAMENTO" | "SAIDA_REALIZADA"
  | "ENCERRADO" | "REJEITADO" | "EXPIRADO";

export interface Visitante {
  id: string;
  nome: string;
  documento: string;
  empresa: string;
  telefone: string;
  email?: string;
  selfieUrl?: string;
  responsavelInterno: string;
  setorDestino: string;
  motivoVisita: string;
  status: VisitanteStatus;
  possuiVeiculo: boolean;
  veiculoId?: string;
  dataVisitaPrevista: string;
  ultimaVisita?: string;
  qrCodeUrl?: string;
  linkPreenchimento?: string;
  criadoEm: string;
  criadoPor: string;
  ultimaAtualizacao: string;
  planta: string;
}

// ── Veículos de Visitantes ──
export type VeiculoVisitanteStatus =
  | "AGUARDANDO_CHEGADA" | "NA_PORTARIA" | "ESTACIONADO"
  | "EM_CIRCULACAO_INTERNA" | "SAIDA_LIBERADA" | "SAIU" | "ENCERRADO";

export interface VeiculoVisitante {
  id: string;
  placa: string;
  tipo: string;
  modelo: string;
  cor: string;
  visitanteId: string;
  visitanteNome: string;
  empresaOrigem: string;
  localVaga?: string;
  horarioEntrada?: string;
  horarioSaida?: string;
  status: VeiculoVisitanteStatus;
  planta: string;
}

// ── Frota ──
export type FrotaStatus =
  | "DISPONIVEL" | "EM_DESLOCAMENTO" | "PARADA_PROGRAMADA"
  | "PARADA_NAO_PROGRAMADA" | "EM_MANUTENCAO" | "BLOQUEADO";

export interface VeiculoFrota {
  id: string;
  placa: string;
  tipo: string;
  modelo: string;
  ano: number;
  setor: string;
  motoristaResponsavel: string;
  status: FrotaStatus;
  ultimaMovimentacao: string;
  quilometragem: number;
  proximaManutencao?: string;
  alertas: string[];
  planta: string;
}

export interface DeslocamentoFrota {
  id: string;
  veiculoId: string;
  placa: string;
  motorista: string;
  origem: string;
  destino: string;
  horarioSaida: string;
  horarioPrevistoChegada: string;
  horarioRealChegada?: string;
  status: "EM_ROTA" | "ATRASADO" | "CONCLUIDO" | "PARADO";
  kmPercorrido?: number;
}

// ── Terceiros / Transportadoras ──
export interface Transportadora {
  id: string;
  nome: string;
  cnpj: string;
  contato: string;
  telefone: string;
  status: "ATIVA" | "INATIVA" | "BLOQUEADA";
  rntrc: string;
  qtdOperacoes: number;
  mediaAtraso: number; // minutos
  slaScore: number;
}

export interface MotoristaTerceiro {
  id: string;
  nome: string;
  documento: string;
  transportadoraId: string;
  transportadoraNome: string;
  telefone: string;
  status: "ATIVO" | "BLOQUEADO" | "INATIVO";
  ultimaEntrada?: string;
}

export interface VeiculoTerceiro {
  id: string;
  placa: string;
  tipo: string;
  transportadoraId: string;
  transportadoraNome: string;
  motoristaId: string;
  motoristaNome: string;
  statusOperacao: "FILA_EXTERNA" | "FILA_INTERNA" | "AGUARDANDO_BALANCA" | "NO_PATIO" | "AGUARDANDO_DOCA" | "EM_DOCA" | "CARREGANDO" | "DESCARREGANDO" | "LIBERADO" | "SAIU" | "OCORRENCIA_ABERTA";
  localizacao: string;
  docaAtual?: string;
}

export type TipoOperacao = "CARGA" | "DESCARGA" | "COLETA" | "DEVOLUCAO" | "TRANSFERENCIA" | "MANUTENCAO_SERVICO";

export interface OperacaoTerceiro {
  id: string;
  tipo: TipoOperacao;
  transportadoraId: string;
  transportadoraNome: string;
  motoristaId: string;
  motoristaNome: string;
  veiculoId: string;
  placa: string;
  docaId?: string;
  docaNome?: string;
  horarioPrevisto: string;
  horarioChegada?: string;
  horarioInicio?: string;
  horarioFim?: string;
  horarioSaida?: string;
  status: "AGENDADA" | "EM_FILA" | "EM_ANDAMENTO" | "CONCLUIDA" | "CANCELADA" | "ATRASADA";
  tempoTotal?: number; // minutes
  nfVinculada?: string;
  planta: string;
}

export interface AgendamentoDoca {
  id: string;
  docaId: string;
  docaNome: string;
  transportadoraId: string;
  transportadoraNome: string;
  operacao: TipoOperacao;
  horarioPrevisto: string;
  etaEstimado?: string;
  status: "CONFIRMADO" | "PENDENTE" | "EM_ANDAMENTO" | "CONCLUIDO" | "CANCELADO" | "JANELA_PERDIDA" | "REPLANEJADO";
  placa?: string;
  motorista?: string;
  planta: string;
}

// ── Pátio / Docas ──
export interface Doca {
  id: string;
  nome: string;
  status: "LIVRE" | "OCUPADA" | "MANUTENCAO";
  veiculoAtual?: string;
  placaAtual?: string;
  operacaoAtual?: string;
  tempoOcupacao?: number; // minutes
  planta: string;
}

export interface FilaPatio {
  id: string;
  ordem: number;
  placa: string;
  tipoVeiculo: string;
  transportadora: string;
  operacao: TipoOperacao;
  horarioChegada: string;
  tempoAguardando: number; // minutes
  prioridade: "NORMAL" | "ALTA" | "URGENTE";
  status: "FILA_EXTERNA" | "FILA_INTERNA" | "AGUARDANDO_BALANCA" | "NO_PATIO" | "AGUARDANDO_DOCA";
}

// ── Monitoramento ──
export interface AlertaOperacional {
  id: string;
  tipo: string;
  descricao: string;
  origem: string;
  origemId: string;
  criticidade: Criticidade;
  responsavel: string;
  status: "ATIVO" | "RECONHECIDO" | "RESOLVIDO";
  criadoEm: string;
  resolvidoEm?: string;
  acaoSugerida?: string;
}

export interface ExcecaoOperacional {
  id: string;
  tipo: string;
  origem: string;
  origemId?: string;
  descricao: string;
  criticidade: Criticidade;
  responsavel: string;
  status: "ABERTA" | "EM_TRATAMENTO" | "RESOLVIDA" | "ESCALADA";
  abertura: string;
  prazo: string;
  acaoSugerida: string;
  sacVinculado?: string;
  ncVinculada?: string;
}

export interface EventoTimeline {
  id: string;
  tipo: string;
  descricao: string;
  dataHora: string;
  usuario: string;
  detalhes?: string;
}

// ── NF em Trânsito ──
export type NFTransitoStatus =
  | "EMITIDA" | "VINCULADA_A_CARGA" | "CARREGAMENTO_CONCLUIDO"
  | "SAIDA_REGISTRADA" | "EM_TRANSITO" | "CHECKPOINT_RECEBIDO"
  | "AGUARDANDO_CONFIRMACAO" | "RECEBIMENTO_CONFIRMADO"
  | "ENCERRADA" | "EM_RISCO" | "CRITICA";

export type NFCriticidade = "VERDE" | "AMARELO" | "VERMELHO" | "CRITICO";

export interface NFTransito {
  id: string;
  numero: string;
  chaveNfe: string;
  cliente: string;
  destino: string;
  uf: string;
  valor: number;
  peso?: number;
  volumes?: number;
  dataEmissao: string;
  dataSaidaPrevista: string;
  dataSaidaReal?: string;
  dataEntregaPrevista: string;
  dataEntregaReal?: string;
  diasEmTransito: number;
  status: NFTransitoStatus;
  criticidade: NFCriticidade;
  scoreRisco: number;
  motivoRisco?: string;
  acaoRecomendada?: string;
  // Vinculação fiscal-logística
  pedido?: string;
  carga?: string;
  mdfeNumero?: string;
  mdfeStatus?: string;
  cteNumero?: string;
  cteStatus?: string;
  veiculoId?: string;
  placa?: string;
  motoristaId?: string;
  motoristaNome?: string;
  transportadoraId?: string;
  transportadoraNome: string;
  // Checkpoints
  checkpoints: NFCheckpoint[];
  alertas: string[];
  planta: string;
}

export interface NFCheckpoint {
  id: string;
  tipo: string;
  descricao: string;
  dataHora: string;
  localizacao?: string;
  responsavel?: string;
}

export interface ExcecaoFiscal {
  id: string;
  tipo: string;
  nfId: string;
  nfNumero: string;
  descricao: string;
  criticidade: NFCriticidade;
  status: "ABERTA" | "EM_TRATAMENTO" | "RESOLVIDA";
  criadoEm: string;
  responsavel?: string;
}

// ── Status Colors extension ──
export const OPERACIONAL_STATUS_COLORS: Record<string, string> = {
  // Acessos
  PRE_AUTORIZADO: "bg-info/15 text-info",
  AGUARDANDO_PREENCHIMENTO: "bg-warning/15 text-warning",
  AGUARDANDO_VALIDACAO: "bg-warning/15 text-warning",
  APROVADO: "bg-success/15 text-success",
  ENTRADA_LIBERADA: "bg-success/15 text-success",
  ENTRADA_REGISTRADA: "bg-primary/15 text-primary",
  EM_PERMANENCIA: "bg-primary/15 text-primary",
  SAIDA_REGISTRADA: "bg-muted text-muted-foreground",
  RECUSADO: "bg-destructive/15 text-destructive",
  EXPIRADO: "bg-destructive/15 text-destructive",
  // Visitantes
  CONVITE_CRIADO: "bg-info/15 text-info",
  LINK_ENVIADO: "bg-info/15 text-info",
  CADASTRO_PREENCHIDO: "bg-warning/15 text-warning",
  QR_GERADO: "bg-success/15 text-success",
  ENTRADA_REALIZADA: "bg-primary/15 text-primary",
  VISITA_EM_ANDAMENTO: "bg-primary/15 text-primary",
  SAIDA_REALIZADA: "bg-muted text-muted-foreground",
  REJEITADO: "bg-destructive/15 text-destructive",
  // Veículos visitantes
  AGUARDANDO_CHEGADA: "bg-info/15 text-info",
  NA_PORTARIA: "bg-warning/15 text-warning",
  ESTACIONADO: "bg-success/15 text-success",
  EM_CIRCULACAO_INTERNA: "bg-primary/15 text-primary",
  SAIDA_LIBERADA: "bg-muted text-muted-foreground",
  SAIU: "bg-muted text-muted-foreground",
  // Frota
  DISPONIVEL: "bg-success/15 text-success",
  EM_DESLOCAMENTO: "bg-primary/15 text-primary",
  PARADA_PROGRAMADA: "bg-info/15 text-info",
  PARADA_NAO_PROGRAMADA: "bg-warning/15 text-warning",
  EM_MANUTENCAO: "bg-accent/15 text-accent-foreground",
  BLOQUEADO: "bg-destructive/15 text-destructive",
  // Terceiros
  FILA_EXTERNA: "bg-info/15 text-info",
  FILA_INTERNA: "bg-info/15 text-info",
  AGUARDANDO_BALANCA: "bg-warning/15 text-warning",
  NO_PATIO: "bg-primary/15 text-primary",
  AGUARDANDO_DOCA: "bg-warning/15 text-warning",
  EM_DOCA: "bg-primary/15 text-primary",
  CARREGANDO: "bg-success/15 text-success",
  DESCARREGANDO: "bg-success/15 text-success",
  LIBERADO: "bg-muted text-muted-foreground",
  OCORRENCIA_ABERTA: "bg-destructive/15 text-destructive",
  // Agendamento
  CONFIRMADO: "bg-success/15 text-success",
  PENDENTE: "bg-warning/15 text-warning",
  JANELA_PERDIDA: "bg-destructive/15 text-destructive",
  REPLANEJADO: "bg-accent/15 text-accent-foreground",
  // Docas
  LIVRE: "bg-success/15 text-success",
  OCUPADA: "bg-warning/15 text-warning",
  MANUTENCAO: "bg-muted text-muted-foreground",
  // NF em Trânsito
  EMITIDA: "bg-info/15 text-info",
  VINCULADA_A_CARGA: "bg-info/15 text-info",
  CARREGAMENTO_CONCLUIDO: "bg-primary/15 text-primary",
  SAIDA_REGISTRADA_NF: "bg-primary/15 text-primary",
  EM_TRANSITO: "bg-primary/15 text-primary",
  CHECKPOINT_RECEBIDO: "bg-success/15 text-success",
  AGUARDANDO_CONFIRMACAO: "bg-warning/15 text-warning",
  RECEBIMENTO_CONFIRMADO: "bg-success/15 text-success",
  EM_RISCO: "bg-destructive/15 text-destructive",
  CRITICA: "bg-destructive/15 text-destructive",
  // Alertas
  ATIVO: "bg-destructive/15 text-destructive",
  RECONHECIDO: "bg-warning/15 text-warning",
  RESOLVIDO: "bg-success/15 text-success",
  // Exceções
  EM_TRATAMENTO: "bg-warning/15 text-warning",
  ESCALADA: "bg-destructive/15 text-destructive",
  RESOLVIDA: "bg-success/15 text-success",
  // Semaphore
  VERDE: "bg-success/15 text-success",
  AMARELO: "bg-warning/15 text-warning",
  VERMELHO: "bg-destructive/15 text-destructive",
  CRITICO_NF: "bg-foreground/15 text-foreground",
};
