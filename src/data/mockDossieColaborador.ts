export interface Colaborador {
  id: string;
  nome: string;
  matricula: string;
  cpf: string;
  unidade: string;
  setor: string;
  cargo: string;
  funcao: string;
  gestor: string;
  dataAdmissao: string;
  status: "ATIVO" | "AFASTADO" | "FERIAS" | "DESLIGADO";
  grupoRisco?: string;
  situacaoOcupacional: string;
  scoreAtencao: number;
  alertas: string[];
  foto?: string;
}

export interface ExameRegistro {
  id: string;
  tipo: string;
  data: string;
  resultado: string;
  status: "REALIZADO" | "PENDENTE" | "VENCIDO";
  laboratorio?: string;
  custo?: number;
  validade?: string;
  observacao?: string;
}

export interface ASORegistro {
  id: string;
  tipo: "ADMISSIONAL" | "PERIODICO" | "RETORNO" | "MUDANCA_FUNCAO" | "DEMISSIONAL";
  data: string;
  resultado: "APTO" | "INAPTO" | "APTO_COM_RESTRICAO";
  medico: string;
  validade: string;
  status: "VIGENTE" | "VENCIDO" | "PROXIMO_VENCIMENTO";
}

export interface TreinamentoRegistro {
  id: string;
  nome: string;
  tipo: "INTEGRACAO" | "NR" | "RECICLAGEM" | "ESPECIFICO";
  data: string;
  cargaHoraria: number;
  status: "CONCLUIDO" | "PENDENTE" | "VENCIDO" | "EM_ANDAMENTO";
  certificado?: boolean;
  validade?: string;
  instrutor?: string;
}

export interface AtendimentoAmbulatorial {
  id: string;
  data: string;
  tipo: string;
  descricao: string;
  profissional: string;
  status: "CONCLUIDO" | "EM_ANDAMENTO" | "RETORNO_PENDENTE";
  cid?: string;
  restricao?: string;
  sigiloso?: boolean;
}

export interface VacinaRegistro {
  id: string;
  vacina: string;
  dose: string;
  data: string;
  status: "APLICADA" | "PENDENTE" | "ATRASADA";
  campanha?: string;
  proximaDose?: string;
}

export interface MedicacaoRegistro {
  id: string;
  medicamento: string;
  data: string;
  tipo: "DISPENSACAO" | "PRESCRICAO" | "CONTROLE";
  quantidade: number;
  responsavel: string;
}

export interface AcidenteRegistro {
  id: string;
  tipo: "ACIDENTE" | "INCIDENTE" | "QUASE_ACIDENTE";
  data: string;
  descricao: string;
  naturezaLesao?: string;
  causa?: string;
  cat?: string;
  diasAfastamento: number;
  status: "INVESTIGADO" | "EM_INVESTIGACAO" | "ENCERRADO";
  licaoAprendida?: string;
}

export interface AfastamentoRegistro {
  id: string;
  tipo: string;
  dataInicio: string;
  dataFim?: string;
  motivo: string;
  cid?: string;
  diasAfastado: number;
  status: "ATIVO" | "ENCERRADO" | "PRORROGADO";
}

export interface AtestadoRegistro {
  id: string;
  data: string;
  dias: number;
  cid?: string;
  medico: string;
  status: "ACEITO" | "PENDENTE" | "CONTESTADO";
}

export interface LaudoRegistro {
  id: string;
  tipo: string;
  descricao: string;
  data: string;
  vigencia?: string;
  agenteRisco?: string;
  grupoHomogeneo?: string;
  recomendacao?: string;
}

export interface EPIRegistro {
  id: string;
  descricao: string;
  ca: string;
  dataEntrega: string;
  dataDevolucao?: string;
  motivo: "ENTREGA" | "TROCA" | "DEVOLUCAO";
  assinatura: boolean;
}

export interface AdvertenciaRegistro {
  id: string;
  data: string;
  tipo: string;
  descricao: string;
  responsavel: string;
}

export interface DocumentoRegistro {
  id: string;
  nome: string;
  tipo: string;
  data: string;
  tamanho?: string;
  mimeType?: string;
}

export interface TimelineEvento {
  id: string;
  data: string;
  tipo: string;
  titulo: string;
  descricao: string;
  icone?: string;
  cor?: string;
}

export interface DossieColaborador {
  colaborador: Colaborador;
  exames: ExameRegistro[];
  asos: ASORegistro[];
  treinamentos: TreinamentoRegistro[];
  atendimentos: AtendimentoAmbulatorial[];
  vacinas: VacinaRegistro[];
  medicacoes: MedicacaoRegistro[];
  acidentes: AcidenteRegistro[];
  afastamentos: AfastamentoRegistro[];
  atestados: AtestadoRegistro[];
  laudos: LaudoRegistro[];
  epis: EPIRegistro[];
  advertencias: AdvertenciaRegistro[];
  documentos: DocumentoRegistro[];
  timeline: TimelineEvento[];
}

// ---------- MOCK DATA ----------

const COLABORADORES: Colaborador[] = [
  {
    id: "COL-001", nome: "Carlos Eduardo Silva", matricula: "MAT-4521", cpf: "123.456.789-00",
    unidade: "MAO", setor: "Produção", cargo: "Operador de Máquinas", funcao: "Operador III",
    gestor: "Ana Souza", dataAdmissao: "2019-03-15", status: "ATIVO",
    grupoRisco: "GHE-02 – Ruído e Poeira", situacaoOcupacional: "Regular com pendências",
    scoreAtencao: 72, alertas: ["ASO próximo do vencimento", "Treinamento NR-12 vencido", "Vacina Hepatite B pendente"],
  },
  {
    id: "COL-002", nome: "Maria Fernanda Costa", matricula: "MAT-3287", cpf: "987.654.321-00",
    unidade: "BEL", setor: "Logística", cargo: "Auxiliar de Logística", funcao: "Auxiliar I",
    gestor: "Bruno Lima", dataAdmissao: "2021-08-01", status: "ATIVO",
    grupoRisco: "GHE-01 – Ergonômico", situacaoOcupacional: "Regular",
    scoreAtencao: 91, alertas: [],
  },
  {
    id: "COL-003", nome: "José Roberto Mendes", matricula: "MAT-1190", cpf: "456.789.123-00",
    unidade: "AGR", setor: "Manutenção", cargo: "Eletricista Industrial", funcao: "Eletricista II",
    gestor: "Carla Reis", dataAdmissao: "2017-01-10", status: "AFASTADO",
    grupoRisco: "GHE-05 – Eletricidade", situacaoOcupacional: "Afastado – acidente de trabalho",
    scoreAtencao: 38, alertas: ["Afastamento ativo", "Retorno ao trabalho pendente", "Exame de retorno não agendado", "Restrição ativa"],
  },
];

const EXAMES_COL001: ExameRegistro[] = [
  { id: "EX-001", tipo: "Audiometria", data: "2025-11-20", resultado: "Normal", status: "REALIZADO", laboratorio: "AudioLab", custo: 85, validade: "2026-11-20" },
  { id: "EX-002", tipo: "Espirometria", data: "2025-10-05", resultado: "Normal", status: "REALIZADO", laboratorio: "PulmoCenter", custo: 120, validade: "2026-10-05" },
  { id: "EX-003", tipo: "Hemograma Completo", data: "2025-09-15", resultado: "Dentro dos parâmetros", status: "REALIZADO", laboratorio: "Lab Norte", custo: 45 },
  { id: "EX-004", tipo: "Raio-X Tórax", data: "2024-06-10", resultado: "Normal", status: "VENCIDO", laboratorio: "RadioDiag", custo: 150, validade: "2025-06-10" },
  { id: "EX-005", tipo: "Acuidade Visual", data: "2026-04-15", resultado: "—", status: "PENDENTE" },
];

const ASOS_COL001: ASORegistro[] = [
  { id: "ASO-001", tipo: "PERIODICO", data: "2025-11-20", resultado: "APTO", medico: "Dr. Ricardo Alves", validade: "2026-11-20", status: "VIGENTE" },
  { id: "ASO-002", tipo: "PERIODICO", data: "2024-11-18", resultado: "APTO", medico: "Dr. Ricardo Alves", validade: "2025-11-18", status: "VENCIDO" },
  { id: "ASO-003", tipo: "ADMISSIONAL", data: "2019-03-14", resultado: "APTO", medico: "Dra. Lúcia Martins", validade: "2020-03-14", status: "VENCIDO" },
];

const TREINAMENTOS_COL001: TreinamentoRegistro[] = [
  { id: "TR-001", nome: "Integração SESMT", tipo: "INTEGRACAO", data: "2019-03-16", cargaHoraria: 8, status: "CONCLUIDO", certificado: true },
  { id: "TR-002", nome: "NR-12 – Segurança em Máquinas", tipo: "NR", data: "2024-02-10", cargaHoraria: 16, status: "VENCIDO", certificado: true, validade: "2026-02-10", instrutor: "Eng. Paulo Barros" },
  { id: "TR-003", nome: "NR-06 – EPI", tipo: "NR", data: "2025-08-20", cargaHoraria: 4, status: "CONCLUIDO", certificado: true, validade: "2027-08-20" },
  { id: "TR-004", nome: "NR-35 – Trabalho em Altura", tipo: "NR", data: "2025-05-12", cargaHoraria: 8, status: "CONCLUIDO", certificado: true, validade: "2027-05-12" },
  { id: "TR-005", nome: "Reciclagem CIPA", tipo: "RECICLAGEM", data: "2026-05-01", cargaHoraria: 20, status: "PENDENTE" },
  { id: "TR-006", nome: "Operação de Empilhadeira", tipo: "ESPECIFICO", data: "2025-01-15", cargaHoraria: 24, status: "CONCLUIDO", certificado: true, validade: "2027-01-15" },
];

const ATENDIMENTOS_COL001: AtendimentoAmbulatorial[] = [
  { id: "ATD-001", data: "2026-02-18", tipo: "Consulta ambulatorial", descricao: "Dor lombar aguda após esforço", profissional: "Enf. Cláudia Menezes", status: "CONCLUIDO", restricao: "Evitar carga acima de 15kg por 7 dias" },
  { id: "ATD-002", data: "2025-11-05", tipo: "Retorno", descricao: "Acompanhamento pós-audiometria", profissional: "Dr. Ricardo Alves", status: "CONCLUIDO" },
  { id: "ATD-003", data: "2025-06-22", tipo: "Emergência", descricao: "Corte superficial em mão direita durante operação", profissional: "Enf. Cláudia Menezes", status: "CONCLUIDO", cid: "S61.0", sigiloso: false },
];

const VACINAS_COL001: VacinaRegistro[] = [
  { id: "VAC-001", vacina: "Tétano (dT)", dose: "Reforço", data: "2024-08-10", status: "APLICADA", proximaDose: "2034-08-10" },
  { id: "VAC-002", vacina: "Hepatite B", dose: "1ª dose", data: "2019-04-02", status: "APLICADA" },
  { id: "VAC-003", vacina: "Hepatite B", dose: "2ª dose", data: "2019-05-02", status: "APLICADA" },
  { id: "VAC-004", vacina: "Hepatite B", dose: "3ª dose", data: "—", status: "PENDENTE" },
  { id: "VAC-005", vacina: "Influenza 2026", dose: "Dose única", data: "—", status: "PENDENTE", campanha: "Campanha Gripe 2026" },
];

const MEDICACOES_COL001: MedicacaoRegistro[] = [
  { id: "MED-001", medicamento: "Dipirona 500mg", data: "2026-02-18", tipo: "DISPENSACAO", quantidade: 4, responsavel: "Enf. Cláudia Menezes" },
  { id: "MED-002", medicamento: "Ibuprofeno 600mg", data: "2025-06-22", tipo: "DISPENSACAO", quantidade: 2, responsavel: "Enf. Cláudia Menezes" },
];

const ACIDENTES_COL001: AcidenteRegistro[] = [
  { id: "ACD-001", tipo: "INCIDENTE", data: "2025-06-22", descricao: "Corte superficial na mão durante operação de máquina de corte", naturezaLesao: "Corte", causa: "Falha no procedimento", diasAfastamento: 0, status: "ENCERRADO", licaoAprendida: "Reforçar uso de luva anticorte" },
  { id: "ACD-002", tipo: "QUASE_ACIDENTE", data: "2024-09-03", descricao: "Peça desprendeu durante usinagem, sem atingir operador", causa: "Desgaste da ferramenta", diasAfastamento: 0, status: "INVESTIGADO", licaoAprendida: "Implementar checklist de ferramentas" },
];

const AFASTAMENTOS_COL001: AfastamentoRegistro[] = [
  { id: "AF-001", tipo: "Licença Médica", dataInicio: "2025-01-10", dataFim: "2025-01-14", motivo: "Virose – atestado médico", diasAfastado: 4, status: "ENCERRADO" },
];

const ATESTADOS_COL001: AtestadoRegistro[] = [
  { id: "ATE-001", data: "2025-01-10", dias: 4, cid: "J11", medico: "Dr. Fábio Maia", status: "ACEITO" },
  { id: "ATE-002", data: "2026-02-18", dias: 1, medico: "Enf. Cláudia Menezes", status: "ACEITO" },
];

const LAUDOS_COL001: LaudoRegistro[] = [
  { id: "LAU-001", tipo: "LTCAT", descricao: "Laudo Técnico das Condições Ambientais de Trabalho", data: "2025-03-01", vigencia: "2027-03-01", agenteRisco: "Ruído contínuo 87dB(A)", grupoHomogeneo: "GHE-02", recomendacao: "Manter uso de protetor auricular tipo concha" },
  { id: "LAU-002", tipo: "PPRA/PGR", descricao: "Programa de Gerenciamento de Riscos – Produção", data: "2025-06-15", vigencia: "2026-06-15" },
];

const EPIS_COL001: EPIRegistro[] = [
  { id: "EPI-001", descricao: "Protetor Auricular tipo concha", ca: "CA-14235", dataEntrega: "2025-12-01", motivo: "ENTREGA", assinatura: true },
  { id: "EPI-002", descricao: "Luva anticorte nivel 5", ca: "CA-38921", dataEntrega: "2025-11-15", motivo: "TROCA", assinatura: true },
  { id: "EPI-003", descricao: "Óculos de proteção ampla visão", ca: "CA-19302", dataEntrega: "2025-09-10", motivo: "ENTREGA", assinatura: true },
  { id: "EPI-004", descricao: "Botina com biqueira de aço", ca: "CA-40188", dataEntrega: "2025-07-20", motivo: "ENTREGA", assinatura: true },
  { id: "EPI-005", descricao: "Protetor Auricular tipo concha", ca: "CA-14235", dataEntrega: "2024-06-01", dataDevolucao: "2025-12-01", motivo: "DEVOLUCAO", assinatura: true },
];

const ADVERTENCIAS_COL001: AdvertenciaRegistro[] = [
  { id: "ADV-001", data: "2024-04-18", tipo: "Advertência verbal", descricao: "Uso incorreto de EPI – óculos de proteção fora do posto", responsavel: "Ana Souza" },
];

const DOCUMENTOS_COL001: DocumentoRegistro[] = [
  { id: "DOC-001", nome: "Ficha de registro", tipo: "RH", data: "2019-03-15", mimeType: "application/pdf" },
  { id: "DOC-002", nome: "Certificado NR-12", tipo: "Certificado", data: "2024-02-10", mimeType: "application/pdf" },
  { id: "DOC-003", nome: "ASO Admissional", tipo: "ASO", data: "2019-03-14", mimeType: "application/pdf" },
  { id: "DOC-004", nome: "Termo de responsabilidade EPI", tipo: "EPI", data: "2025-12-01", mimeType: "application/pdf" },
  { id: "DOC-005", nome: "LTCAT 2025", tipo: "Laudo", data: "2025-03-01", mimeType: "application/pdf" },
];

const TIMELINE_COL001: TimelineEvento[] = [
  { id: "TL-01", data: "2026-02-18", tipo: "ATENDIMENTO", titulo: "Atendimento ambulatorial", descricao: "Dor lombar – restrição temporária de carga", cor: "info" },
  { id: "TL-02", data: "2025-12-01", tipo: "EPI", titulo: "Entrega de EPI", descricao: "Protetor auricular tipo concha – CA-14235", cor: "success" },
  { id: "TL-03", data: "2025-11-20", tipo: "EXAME", titulo: "Audiometria realizada", descricao: "Resultado normal – Lab AudioLab", cor: "success" },
  { id: "TL-04", data: "2025-11-20", tipo: "ASO", titulo: "ASO Periódico emitido", descricao: "Apto – Dr. Ricardo Alves", cor: "success" },
  { id: "TL-05", data: "2025-11-15", tipo: "EPI", titulo: "Troca de EPI", descricao: "Luva anticorte nivel 5 – CA-38921", cor: "warning" },
  { id: "TL-06", data: "2025-10-05", tipo: "EXAME", titulo: "Espirometria", descricao: "Normal – PulmoCenter", cor: "success" },
  { id: "TL-07", data: "2025-08-20", tipo: "TREINAMENTO", titulo: "NR-06 – EPI concluído", descricao: "4h – certificado emitido", cor: "success" },
  { id: "TL-08", data: "2025-06-22", tipo: "ACIDENTE", titulo: "Incidente – corte superficial", descricao: "Corte na mão durante operação de máquina de corte", cor: "destructive" },
  { id: "TL-09", data: "2025-06-15", tipo: "LAUDO", titulo: "PGR atualizado", descricao: "Programa de Gerenciamento de Riscos – Produção", cor: "info" },
  { id: "TL-10", data: "2025-05-12", tipo: "TREINAMENTO", titulo: "NR-35 concluído", descricao: "8h – Trabalho em Altura", cor: "success" },
  { id: "TL-11", data: "2025-03-01", tipo: "LAUDO", titulo: "LTCAT emitido", descricao: "Ruído 87dB(A) – GHE-02", cor: "info" },
  { id: "TL-12", data: "2025-01-15", tipo: "TREINAMENTO", titulo: "Operação de Empilhadeira", descricao: "24h – concluído com certificado", cor: "success" },
  { id: "TL-13", data: "2025-01-10", tipo: "AFASTAMENTO", titulo: "Licença médica", descricao: "4 dias – virose", cor: "warning" },
  { id: "TL-14", data: "2024-08-10", tipo: "VACINA", titulo: "Tétano (dT) – Reforço", descricao: "Aplicada", cor: "success" },
  { id: "TL-15", data: "2024-04-18", tipo: "ADVERTENCIA", titulo: "Advertência verbal", descricao: "Uso incorreto de EPI – óculos de proteção", cor: "destructive" },
  { id: "TL-16", data: "2024-02-10", tipo: "TREINAMENTO", titulo: "NR-12 concluído", descricao: "16h – Segurança em Máquinas (VENCIDO)", cor: "warning" },
  { id: "TL-17", data: "2019-04-02", tipo: "VACINA", titulo: "Hepatite B – 1ª dose", descricao: "Aplicada", cor: "success" },
  { id: "TL-18", data: "2019-03-16", tipo: "TREINAMENTO", titulo: "Integração SESMT", descricao: "8h – concluído", cor: "success" },
  { id: "TL-19", data: "2019-03-15", tipo: "ADMISSAO", titulo: "Admissão", descricao: "Operador de Máquinas – Unidade MAO", cor: "info" },
];

export const MOCK_DOSSIES: Record<string, DossieColaborador> = {
  "COL-001": {
    colaborador: COLABORADORES[0],
    exames: EXAMES_COL001,
    asos: ASOS_COL001,
    treinamentos: TREINAMENTOS_COL001,
    atendimentos: ATENDIMENTOS_COL001,
    vacinas: VACINAS_COL001,
    medicacoes: MEDICACOES_COL001,
    acidentes: ACIDENTES_COL001,
    afastamentos: AFASTAMENTOS_COL001,
    atestados: ATESTADOS_COL001,
    laudos: LAUDOS_COL001,
    epis: EPIS_COL001,
    advertencias: ADVERTENCIAS_COL001,
    documentos: DOCUMENTOS_COL001,
    timeline: TIMELINE_COL001,
  },
};

export const MOCK_COLABORADORES = COLABORADORES;

export function getDossieByColaboradorId(id: string): DossieColaborador | null {
  return MOCK_DOSSIES[id] ?? null;
}
