// Types for the Inspeções module

export type InspecaoItemStatus = "CONFORME" | "NAO_CONFORME" | "NAO_APLICA";

export type InspecaoStatus = "PENDENTE" | "EM_ANDAMENTO" | "CONCLUIDA" | "CANCELADA";

export interface ModeloInspecao {
  id: string;
  nome: string;
  setor: string;
  descricao: string;
  ativo: boolean;
  ordem: number;
  itens: ModeloInspecaoItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ModeloInspecaoItem {
  id: string;
  descricao: string;
  ordem: number;
  obrigatorio: boolean;
  exigeEvidenciaNc: boolean;
  exigeTipoNc: boolean;
  ativo: boolean;
}

export interface ExecucaoInspecao {
  id: string;
  modeloId: string;
  modeloNome: string;
  setor: string;
  executor: string;
  dataHora: string;
  status: InspecaoStatus;
  totalItens: number;
  conformes: number;
  naoConformes: number;
  naoAplica: number;
  taxaConformidade: number;
  observacaoGeral?: string;
  itens: ExecucaoInspecaoItem[];
}

export interface ExecucaoInspecaoItem {
  id: string;
  itemModeloId: string;
  descricao: string;
  ordem: number;
  resultado: InspecaoItemStatus;
  tipoNcId?: string;
  tipoNcNome?: string;
  observacao?: string;
  evidenciaNomeArquivo?: string;
  evidenciaUrl?: string;
  /** Multiple evidence files per item (up to 3) */
  evidencias?: string[];
}

export interface TipoNCInspecao {
  id: string;
  setor: string;
  nome: string;
  categoria: string;
  ativo: boolean;
  observacao?: string;
}

// Molas types
export interface PadraoMola {
  id: string;
  alturaTipo: string;
  item: string;
  descricao: string;
  padrao: string;
  minimo: number;
  maximo: number;
  unidade: string;
  ativo: boolean;
}

export interface InspecaoMola {
  id: string;
  maquina: string;
  statusMaquina: "Operando" | "Manutenção" | "Setup" | "Parada";
  alturaTipo: string;
  linhaPocket: string;
  operador: string;
  dataHora: string;
  observacaoGeral?: string;
  resultado: "APROVADO" | "REPROVADO" | "PARADA_REGISTRADA";
  /** When machine is stopped, dimensional measurements are optional */
  motivoParada?: string;
  medicoes: MedicaoMola[];
}

export interface MedicaoMola {
  id: string;
  padraoId: string;
  item: string;
  descricao: string;
  padrao: number;
  minimo: number;
  maximo: number;
  unidade: string;
  valorMedido: number;
  conforme: boolean;
}

// ── Real legacy sectors (15) ──
export const SETORES_INSPECAO = [
  "ESPUMAÇÃO",
  "ÁREA DE CURA",
  "FLOCADEIRA",
  "LAMINAÇÃO",
  "MOLA",
  "BORDADEIRA",
  "CORTE E COSTURA",
  "MARCENARIA",
  "TAPEÇARIA",
  "FECHAMENTO",
  "MÓVEIS",
  "EMBALAGEM",
  "ALMOXARIFADO",
  "ESTOFAMENTO",
  "EMBALAGEM DE BASE",
] as const;

export const CATEGORIAS_NC = [
  "Dimensional",
  "Visual",
  "Funcional",
  "Material",
  "Processo",
  "Segurança",
  "Limpeza",
  "Documentação",
] as const;

// ── Real legacy machines (4) ──
export const MAQUINAS_MOLA = [
  "01",
  "02",
  "03",
  "04",
] as const;
