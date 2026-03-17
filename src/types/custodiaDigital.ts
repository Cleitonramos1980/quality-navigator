// ── Cadeia de Custódia Digital da NF / Entrega ──

export type CustodiaStatus =
  | "EMITIDA" | "VINCULADA" | "LIBERADA" | "SAIU_PORTARIA"
  | "EM_TRANSITO" | "EM_RISCO" | "CHEGADA_REGISTRADA"
  | "ENTREGUE" | "ENTREGUE_COM_RESSALVA" | "NAO_ENTREGUE"
  | "DEVOLVIDA" | "ENCERRADA";

export interface EvidenciaEntrega {
  id: string;
  tipo: "COMPROVANTE_SAIDA" | "COMPROVANTE_CHEGADA" | "PROVA_ENTREGA" | "ASSINATURA" | "FOTO" | "DOCUMENTO";
  descricao: string;
  url?: string;
  dataHora: string;
  responsavel: string;
  observacao?: string;
  categoria?: string;
  etapaRelacionada?: string;
  nomeArquivo?: string;
  mimeType?: string;
  tamanhoArquivo?: number;
}

export interface CustodiaEvento {
  id: string;
  etapa: string;
  descricao: string;
  dataHora: string;
  localizacao?: string;
  responsavel: string;
  tipo: "EMISSAO" | "VINCULACAO" | "LIBERACAO" | "SAIDA" | "CHECKPOINT" | "CHEGADA" | "TENTATIVA_ENTREGA" | "ENTREGA" | "OCORRENCIA" | "DIVERGENCIA" | "DEVOLUCAO" | "ENCERRAMENTO";
  evidencias?: EvidenciaEntrega[];
}

export interface CustodiaNF {
  id: string;
  nfId: string;
  nfNumero: string;
  status: CustodiaStatus;
  cliente: string;
  destino: string;
  valor: number;
  // Vinculações
  veiculoPlaca?: string;
  motoristaNome?: string;
  transportadoraNome?: string;
  docaSaida?: string;
  operacaoPatio?: string;
  // Datas
  dataEmissao: string;
  dataSaidaPortaria?: string;
  dataChegadaDestino?: string;
  dataEntrega?: string;
  // Entrega
  recebedorNome?: string;
  statusAceite?: "ACEITO" | "ACEITO_COM_RESSALVA" | "RECUSADO" | "PENDENTE";
  divergencia?: string;
  // Evidências e eventos
  eventos: CustodiaEvento[];
  evidencias: EvidenciaEntrega[];
  // Score
  diasEmTransito: number;
  scoreRisco: number;
  planta: string;
}

export interface CustodiaKPIs {
  nfsEmTransito: number;
  nfsEmRisco: number;
  nfsAtrasadas: number;
  nfsSemConfirmacao: number;
  nfsComDivergencia: number;
  entregasComRessalva: number;
  devolucoes: number;
  leadTimeMedio: number;
  slaRota: number;
  envelhecimentoMedio: number;
}

export const CUSTODIA_STATUS_LABELS: Record<CustodiaStatus, string> = {
  EMITIDA: "Emitida",
  VINCULADA: "Vinculada",
  LIBERADA: "Liberada",
  SAIU_PORTARIA: "Saiu da Portaria",
  EM_TRANSITO: "Em Trânsito",
  EM_RISCO: "Em Risco",
  CHEGADA_REGISTRADA: "Chegada Registrada",
  ENTREGUE: "Entregue",
  ENTREGUE_COM_RESSALVA: "Entregue c/ Ressalva",
  NAO_ENTREGUE: "Não Entregue",
  DEVOLVIDA: "Devolvida",
  ENCERRADA: "Encerrada",
};

export const CUSTODIA_STATUS_COLORS: Record<CustodiaStatus, string> = {
  EMITIDA: "bg-info/15 text-info",
  VINCULADA: "bg-info/15 text-info",
  LIBERADA: "bg-success/15 text-success",
  SAIU_PORTARIA: "bg-primary/15 text-primary",
  EM_TRANSITO: "bg-primary/15 text-primary",
  EM_RISCO: "bg-destructive/15 text-destructive",
  CHEGADA_REGISTRADA: "bg-success/15 text-success",
  ENTREGUE: "bg-success/15 text-success",
  ENTREGUE_COM_RESSALVA: "bg-warning/15 text-warning",
  NAO_ENTREGUE: "bg-destructive/15 text-destructive",
  DEVOLVIDA: "bg-destructive/15 text-destructive",
  ENCERRADA: "bg-muted text-muted-foreground",
};
