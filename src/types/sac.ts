import { Planta } from "./sgq";

export type SACStatus = "ABERTO" | "EM_ANALISE" | "AGUARDANDO_CLIENTE" | "RESOLVIDO" | "ENCERRADO";

export type CanalContato = "TELEFONE" | "EMAIL" | "WHATSAPP" | "PRESENCIAL" | "SITE" | "REDES_SOCIAIS";

export type TipoContato = "RECLAMACAO" | "TROCA" | "DUVIDA" | "ELOGIO" | "SUGESTAO" | "INFORMACAO";

export const SAC_STATUS_LABELS: Record<SACStatus, string> = {
  ABERTO: "Aberto",
  EM_ANALISE: "Em Análise",
  AGUARDANDO_CLIENTE: "Aguardando Cliente",
  RESOLVIDO: "Resolvido",
  ENCERRADO: "Encerrado",
};

export const CANAL_LABELS: Record<CanalContato, string> = {
  TELEFONE: "Telefone",
  EMAIL: "E-mail",
  WHATSAPP: "WhatsApp",
  PRESENCIAL: "Presencial",
  SITE: "Site",
  REDES_SOCIAIS: "Redes Sociais",
};

export const TIPO_CONTATO_LABELS: Record<TipoContato, string> = {
  RECLAMACAO: "Reclamação",
  TROCA: "Troca",
  DUVIDA: "Dúvida",
  ELOGIO: "Elogio",
  SUGESTAO: "Sugestão",
  INFORMACAO: "Informação",
};

export const SAC_STATUS_COLORS: Record<SACStatus, string> = {
  ABERTO: "bg-info/15 text-info",
  EM_ANALISE: "bg-warning/15 text-warning",
  AGUARDANDO_CLIENTE: "bg-accent/15 text-accent-foreground",
  RESOLVIDO: "bg-success/15 text-success",
  ENCERRADO: "bg-muted text-muted-foreground",
};

export interface SACAtendimentoAnexo {
  id: string;
  atendimentoId: string;
  nomeArquivo: string;
  mimeType: string;
  tamanho: number;
  caminho: string;
  criadoAt: string;
}

export interface SACAtendimento {
  id: string;
  codcli: string;
  clienteNome: string;
  cgcent: string;
  telefone: string;
  canal: CanalContato;
  tipoContato: TipoContato;
  descricao: string;
  plantaResp: Planta;
  numPedido?: string;
  numNfVenda?: string;
  codprod?: string;
  produtoRelacionado?: string;
  status: SACStatus;
  abertoAt: string;
  atualizadoAt: string;
  encerradoAt?: string;
  timeline?: SACTimelineEntry[];
  anexos?: SACAtendimentoAnexo[];
}

export interface SACTimelineEntry {
  id: string;
  data: string;
  usuario: string;
  acao: string;
  descricao: string;
}

export type SACAvaliacaoCanalEnvio = "WHATSAPP";
export type SACAvaliacaoStatusEnvio =
  | "NAO_ENVIADA"
  | "ENVIADA"
  | "ENTREGUE"
  | "LIDA"
  | "RESPONDIDA"
  | "FALHA"
  | "EXPIRADA";
export type SACAvaliacaoStatusResposta = "NAO_RESPONDIDA" | "RESPONDIDA" | "EXPIRADA";

export interface SACAvaliacaoEnvioLog {
  id: string;
  data: string;
  canal: SACAvaliacaoCanalEnvio;
  telefone: string;
  status: SACAvaliacaoStatusEnvio;
  provider: string;
  erro?: string;
}

export interface SACAvaliacao {
  id: string;
  atendimentoId: string;
  codcli: string;
  clienteNome: string;
  telefone: string;
  planta: Planta;
  responsavelAtendimento?: string;
  encerradoAt?: string;
  token: string;
  link: string;
  canalEnvio: SACAvaliacaoCanalEnvio;
  statusEnvio: SACAvaliacaoStatusEnvio;
  dataEnvio?: string;
  statusResposta: SACAvaliacaoStatusResposta;
  dataResposta?: string;
  nota?: number;
  comentario?: string;
  envioLogs: SACAvaliacaoEnvioLog[];
  createdAt: string;
  updatedAt: string;
}

export interface SACAvaliacaoDashboard {
  totalPesquisasEnviadas: number;
  totalPesquisasRespondidas: number;
  taxaResposta: number;
  notaMedia: number;
  percentualNotasAltas: number;
  percentualNotasBaixas: number;
  pesquisasNaoRespondidas: number;
  evolucaoNotaPorPeriodo: Array<{ periodo: string; notaMedia: number }>;
  avaliacoesPorPlanta: Array<{ name: string; value: number }>;
  avaliacoesPorAtendente: Array<{ name: string; value: number }>;
  distribuicaoNota: Array<{ name: string; value: number }>;
}
