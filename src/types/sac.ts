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
  status: SACStatus;
  abertoAt: string;
  atualizadoAt: string;
  encerradoAt?: string;
  timeline?: SACTimelineEntry[];
}

export interface SACTimelineEntry {
  id: string;
  data: string;
  usuario: string;
  acao: string;
  descricao: string;
}
