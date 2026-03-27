export interface SesmtAttachment {
  id: string;
  nomeArquivo: string;
  mimeType: string;
  tamanho: number;
  caminho: string;
  criadoAt: string;
  criadoPor: string;
}

export interface SesmtEvidence {
  id: string;
  descricao: string;
  tipo: string;
  data: string;
  responsavel: string;
  anexoId?: string;
  criadoAt: string;
  criadoPor: string;
}

export interface SesmtHistoryEntry {
  id: string;
  data: string;
  usuario: string;
  acao: string;
  descricao: string;
}

export interface SesmtRecord {
  id: string;
  moduleKey: string;
  moduleLabel?: string;
  moduleGroup?: string;
  titulo: string;
  descricao: string;
  unidade: string;
  status: string;
  responsavel: string;
  criticidade: "BAIXA" | "MEDIA" | "ALTA" | "CRITICA";
  nr?: string;
  periodoInicio?: string;
  periodoFim?: string;
  setor?: string;
  funcao?: string;
  investimento?: number;
  custo?: number;
  riscoInerente?: number;
  riscoResidual?: number;
  vencimentoAt?: string;
  dadosSaudeSensiveis?: boolean;
  dadosEspecificos?: Record<string, string | number | boolean | null>;
  tags: string[];
  anexos: SesmtAttachment[];
  evidencias: SesmtEvidence[];
  historico: SesmtHistoryEntry[];
  origemVinculada: Array<{ tipo: string; id: string }>;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface SesmtRecordListResult {
  page: number;
  limit: number;
  total: number;
  items: SesmtRecord[];
}

export interface SesmtFavoritePreset {
  moduleKey: string;
  presetKey: string | null;
  status?: string;
  criticidade?: string;
  unidade?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  specificFilters?: Record<string, string>;
  updatedAt: string;
  updatedBy: string;
}

export interface SesmtMenuNode {
  key: string;
  label: string;
  path: string;
}

export interface SesmtMenuGroup {
  key: string;
  label: string;
  children: SesmtMenuNode[];
}

export interface SesmtModuleDefinition {
  key: string;
  path: string;
  groupKey: string;
  groupLabel: string;
  label: string;
  description: string;
  collectionKey: string;
  visibility: "STANDARD" | "SENSITIVE_HEALTH";
  defaultNr?: string;
}

export interface SesmtExecutiveView {
  key: string;
  label: string;
  visibility?: "STANDARD" | "SENSITIVE_HEALTH";
}

export interface SesmtMasterDashboard {
  scoreGeral: number;
  documentosVencendo: number;
  asoVencendo: number;
  treinamentosVencendo: number;
  inspecoesAtrasadas: number;
  acoesCriticasAbertas: number;
  rankingUnidades: Array<{ unidade: string; score: number; total: number; concluidos: number; criticos: number }>;
  visaoNr: Array<{ nr: string; total: number }>;
  custoAnual: number;
  tendencia: Array<{ mes: string; abertos: number; concluidos: number }>;
  pendenciasPrioritarias: Array<{ id: string; titulo: string; unidade: string; responsavel: string; vencimentoAt?: string; moduleKey: string }>;
  generatedAt: string;
  generatedBy: string;
}

export interface SesmtMaturityDashboard {
  indiceMaturidade: number;
  eixoDetalhado: Array<{ eixo: string; peso: number; valor: number }>;
  rankingUnidades: SesmtMasterDashboard["rankingUnidades"];
  generatedAt: string;
}

export interface SesmtPredictiveDashboard {
  riscosFuturos: Array<{ unidade: string; riscoFuturo: number; reincidencia: number; degradacao: number; justificativa: string }>;
  alertas: Array<{ unidade: string; nivel: string; titulo: string; descricao: string; justificativa: string }>;
  generatedAt: string;
}

export interface SesmtIndicatorsDashboard {
  cards: Array<{ titulo: string; valor: number; meta: number; unidade: string }>;
  statusDistribuicao: Array<{ status: string; total: number }>;
  criticidadeDistribuicao: Array<{ criticidade: string; total: number }>;
  visaoNr: Array<{ nr: string; total: number }>;
  tendencia: Array<{ mes: string; abertos: number; concluidos: number }>;
  generatedAt: string;
}

export interface SesmtOccupationalDashboard {
  kpis: {
    totalProntuarios: number;
    examesPendentes: number;
    afastamentos: number;
    restricoesAtivas: number;
  };
  agendaExames: Array<{ id: string; colaborador: string; unidade: string; vencimentoAt?: string; status: string }>;
  historicoAtendimentos: Array<{ id: string; titulo: string; unidade: string; updatedAt: string; status: string }>;
  generatedAt: string;
}

