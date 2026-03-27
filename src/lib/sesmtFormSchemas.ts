export type SesmtSpecificFieldType = "text" | "number" | "date" | "select" | "textarea";

export interface SesmtSpecificField {
  key: string;
  label: string;
  type: SesmtSpecificFieldType;
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
}

export interface SesmtFilterPreset {
  key: string;
  label: string;
  description?: string;
  status?: "ABERTO" | "EM_ANDAMENTO" | "CONCLUIDO" | "ATRASADO";
  criticidade?: "BAIXA" | "MEDIA" | "ALTA" | "CRITICA";
  specificFilters?: Record<string, string>;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

const yesNoOptions = [
  { value: "SIM", label: "Sim" },
  { value: "NAO", label: "Nao" },
];

const controlHierarchyOptions = [
  { value: "ELIMINACAO", label: "Eliminacao" },
  { value: "SUBSTITUICAO", label: "Substituicao" },
  { value: "ENGENHARIA", label: "Engenharia" },
  { value: "ADMINISTRATIVO", label: "Administrativo" },
  { value: "EPI", label: "EPI" },
];

const commonRiskFields: SesmtSpecificField[] = [
  { key: "perigo", label: "Perigo", type: "text", required: true, placeholder: "Ex.: Queda de nivel" },
  { key: "eventoIndesejado", label: "Evento indesejado", type: "text", placeholder: "Ex.: Acidente com afastamento" },
  { key: "consequencia", label: "Consequencia", type: "textarea", placeholder: "Impacto ao colaborador e processo" },
  { key: "causa", label: "Causa", type: "text", placeholder: "Causa principal" },
];

export const SESMT_FORM_SCHEMAS: Record<string, SesmtSpecificField[]> = {
  "atividades-por-nr": [
    { key: "atividade", label: "Atividade NR", type: "text", required: true },
    { key: "periodicidade", label: "Periodicidade", type: "text", placeholder: "Mensal, trimestral, anual" },
    { key: "evidenciaObrigatoria", label: "Evidencia obrigatoria", type: "text" },
    { key: "investimentoPrevisto", label: "Investimento previsto (R$)", type: "number" },
  ],
  "riscos-barreiras-e-controles": [
    ...commonRiskFields,
    { key: "barreira", label: "Barreira", type: "text", required: true },
    { key: "tipoControle", label: "Tipo de controle", type: "select", options: controlHierarchyOptions },
  ],
  "efetividade-dos-controles": [
    { key: "controleAtual", label: "Controle atual", type: "text", required: true },
    { key: "hierarquia", label: "Hierarquia do controle", type: "select", options: controlHierarchyOptions },
    { key: "eficaciaPercentual", label: "Eficacia (%)", type: "number", required: true },
    { key: "oportunidadeMigracao", label: "Migracao para engenharia/eliminacao", type: "textarea" },
  ],
  "plano-de-acao-x-risco": [
    { key: "riscoRelacionamento", label: "ID do risco vinculado", type: "text", required: true },
    { key: "acaoCorretiva", label: "Acao corretiva", type: "textarea", required: true },
    { key: "prazoReavaliacao", label: "Prazo de reavaliacao", type: "date" },
    { key: "riscoResidualReavaliado", label: "Risco residual reavaliado", type: "number" },
  ],
  "laudos-e-vinculos": [
    { key: "tipoLaudo", label: "Tipo de laudo", type: "text", required: true },
    { key: "codigoLaudo", label: "Codigo do laudo", type: "text", required: true },
    { key: "grupoExposto", label: "Grupo exposto", type: "text" },
    { key: "vinculos", label: "Vinculos (funcao/colaborador/EPI/EPC)", type: "textarea" },
  ],
  epi: [
    { key: "ca", label: "CA", type: "text", required: true },
    { key: "fornecedor", label: "Fornecedor", type: "text" },
    { key: "validadeCa", label: "Validade CA", type: "date" },
    { key: "frequenciaTrocaDias", label: "Frequencia de troca (dias)", type: "number" },
    { key: "usoObrigatorio", label: "Uso obrigatorio", type: "select", options: yesNoOptions },
  ],
  epc: [
    { key: "tipoEpc", label: "Tipo EPC", type: "text", required: true },
    { key: "localidade", label: "Localidade", type: "text", required: true },
    { key: "planoManutencao", label: "Plano de manutencao", type: "textarea" },
    { key: "osVinculada", label: "OS vinculada", type: "text" },
  ],
  "inspecoes-e-visitas": [
    { key: "checklistAplicado", label: "Checklist aplicado", type: "text", required: true },
    { key: "achadosCriticos", label: "Achados criticos", type: "number" },
    { key: "reincidencia", label: "Reincidencia", type: "select", options: yesNoOptions },
    { key: "tratativa", label: "Tratativa principal", type: "textarea" },
  ],
  "procedimentos-apr-pt-os": [
    { key: "tipoDocumento", label: "Tipo (Procedimento/APR/PT/OS)", type: "text", required: true },
    { key: "codigoDocumento", label: "Codigo documento", type: "text" },
    { key: "cienciaObrigatoria", label: "Ciencia obrigatoria", type: "select", options: yesNoOptions },
    { key: "versaoVigente", label: "Versao vigente", type: "text" },
  ],
  "comunicacao-de-sst": [
    { key: "tipoComunicacao", label: "Tipo de comunicacao", type: "text", required: true },
    { key: "publicoAlvo", label: "Publico alvo", type: "text", required: true },
    { key: "aceiteCritico", label: "Exige aceite critico", type: "select", options: yesNoOptions },
    { key: "campanha", label: "Campanha/DDS/CIPAT", type: "text" },
  ],
  "participacao-do-trabalhador": [
    { key: "tipoParticipacao", label: "Tipo de participacao", type: "text", required: true },
    { key: "anonimato", label: "Registro anonimo", type: "select", options: yesNoOptions },
    { key: "tratativaStatus", label: "Status tratativa", type: "text" },
    { key: "detalhesParticipacao", label: "Detalhes", type: "textarea" },
  ],
  cipa: [
    { key: "mandatoInicio", label: "Inicio mandato", type: "date", required: true },
    { key: "mandatoFim", label: "Fim mandato", type: "date", required: true },
    { key: "titulares", label: "Qtd titulares", type: "number" },
    { key: "suplentes", label: "Qtd suplentes", type: "number" },
  ],
  "treinamentos-e-integracao": [
    { key: "catalogo", label: "Catalogo/curso", type: "text", required: true },
    { key: "cargaHoraria", label: "Carga horaria", type: "number" },
    { key: "periodicidadeReciclagem", label: "Periodicidade reciclagem", type: "text" },
    { key: "necessidadePorRisco", label: "Necessidade por risco", type: "textarea" },
  ],
  "saude-ocupacional": [
    { key: "tipoAso", label: "Tipo de ASO", type: "text", required: true },
    { key: "statusPcmso", label: "Status PCMSO", type: "text" },
    { key: "grupoHomogeneo", label: "Grupo homogeneo", type: "text" },
    { key: "agenteExposicao", label: "Agente de exposicao", type: "textarea" },
  ],
  exames: [
    { key: "tipoExame", label: "Tipo de exame", type: "text", required: true },
    { key: "laboratorio", label: "Laboratorio", type: "text" },
    { key: "dataConvocacao", label: "Data convocacao", type: "date" },
    { key: "resultadoExame", label: "Resultado", type: "textarea" },
  ],
  "ambulatorio-prontuario": [
    { key: "tipoAtendimento", label: "Tipo atendimento", type: "text", required: true },
    { key: "cid", label: "CID", type: "text" },
    { key: "afastamentoDias", label: "Afastamento (dias)", type: "number" },
    { key: "retornoTrabalho", label: "Retorno ao trabalho", type: "date" },
  ],
  "medicamentos-vacinas": [
    { key: "tipoRegistro", label: "Tipo (medicamento/vacina)", type: "text", required: true },
    { key: "lote", label: "Lote", type: "text" },
    { key: "validadeLote", label: "Validade", type: "date" },
    { key: "coberturaVacinal", label: "Cobertura vacinal (%)", type: "number" },
  ],
  "ergonomia-nr-17": [
    { key: "aetStatus", label: "Status AET/AEP", type: "text", required: true },
    { key: "riscoBiomecanico", label: "Risco biomecanico", type: "text" },
    { key: "recomendacaoErgonomica", label: "Recomendacao", type: "textarea" },
    { key: "acaoErgonomica", label: "Acao vinculada", type: "text" },
  ],
  "sinalizacao-nr-26": [
    { key: "tipoSinalizacao", label: "Tipo de sinalizacao", type: "text", required: true },
    { key: "localImplantacao", label: "Local implantacao", type: "text" },
    { key: "reposicaoPrevista", label: "Reposicao prevista", type: "date" },
    { key: "evidenciaFotografica", label: "Evidencia fotografica", type: "select", options: yesNoOptions },
  ],
  "emergencia-e-incendio": [
    { key: "tipoEquipamento", label: "Tipo equipamento", type: "text", required: true },
    { key: "brigadistasAtivos", label: "Brigadistas ativos", type: "number" },
    { key: "simuladoPrevisto", label: "Data proximo simulado", type: "date" },
    { key: "situacaoPlano", label: "Situacao plano emergencia", type: "text" },
  ],
  residuos: [
    { key: "classificacao", label: "Classificacao residuo", type: "text", required: true },
    { key: "origem", label: "Origem", type: "text" },
    { key: "armazenamento", label: "Armazenamento", type: "text" },
    { key: "destinacao", label: "Destinacao", type: "textarea" },
  ],
  "obras-promat": [
    { key: "codigoObra", label: "Codigo da obra", type: "text", required: true },
    { key: "faseObra", label: "Fase", type: "text" },
    { key: "frenteServico", label: "Frente de servico", type: "text" },
    { key: "statusPromat", label: "Status PROMAT", type: "text" },
  ],
  "documentos-controlados": [
    { key: "codigoDocumento", label: "Codigo", type: "text", required: true },
    { key: "versao", label: "Versao", type: "text" },
    { key: "vigencia", label: "Vigencia", type: "date" },
    { key: "aprovador", label: "Aprovador", type: "text" },
  ],
  "biblioteca-tecnica": [
    { key: "tema", label: "Tema", type: "text", required: true },
    { key: "nrRelacionada", label: "NR relacionada", type: "text" },
    { key: "setorDestino", label: "Setor destino", type: "text" },
    { key: "formato", label: "Formato", type: "text" },
  ],
  "notificacoes-e-respostas": [
    { key: "orgaoNotificador", label: "Orgao notificador", type: "text", required: true },
    { key: "prazoResposta", label: "Prazo resposta", type: "date" },
    { key: "criticidadeNotificacao", label: "Criticidade", type: "text" },
    { key: "statusResposta", label: "Status resposta", type: "text" },
  ],
  "terceiros-e-contratados": [
    { key: "empresaContratada", label: "Empresa contratada", type: "text", required: true },
    { key: "numeroContrato", label: "Numero contrato", type: "text" },
    { key: "pendenciaDocumental", label: "Pendencia documental", type: "text" },
    { key: "incidenteVinculado", label: "Incidente vinculado", type: "text" },
  ],
  "requisitos-legais": [
    { key: "origemLegal", label: "Origem legal", type: "text", required: true },
    { key: "aplicabilidade", label: "Aplicabilidade", type: "text" },
    { key: "criterioAvaliacao", label: "Criterio avaliacao", type: "text" },
    { key: "riscoDescumprimento", label: "Risco descumprimento", type: "text" },
  ],
  "sesmt-legal-dimensionamento": [
    { key: "efetivoUnidade", label: "Efetivo unidade", type: "number", required: true },
    { key: "exigidoLegal", label: "Exigido legal", type: "number", required: true },
    { key: "existente", label: "Existente", type: "number", required: true },
    { key: "memoriaCalculo", label: "Memoria de calculo", type: "textarea" },
  ],
  "custos-sesmt": [
    { key: "categoriaCusto", label: "Categoria", type: "text", required: true },
    { key: "competencia", label: "Competencia", type: "text" },
    { key: "centroCusto", label: "Centro de custo", type: "text" },
    { key: "orcado", label: "Valor orcado", type: "number" },
  ],
  "cadastros-auxiliares": [
    { key: "tipoCadastro", label: "Tipo cadastro", type: "text", required: true },
    { key: "codigo", label: "Codigo", type: "text" },
    { key: "descricaoCadastro", label: "Descricao", type: "textarea" },
    { key: "ativo", label: "Ativo", type: "select", options: yesNoOptions },
  ],
};

const COMMON_FILTER_PRESETS: SesmtFilterPreset[] = [
  {
    key: "criticos-abertos",
    label: "Criticos abertos",
    description: "Prioriza registros abertos com criticidade critica.",
    status: "ABERTO",
    criticidade: "CRITICA",
    sortBy: "vencimentoAt",
    sortDir: "asc",
  },
  {
    key: "atrasados-prioritarios",
    label: "Atrasados",
    description: "Foco em registros atrasados para regularizacao imediata.",
    status: "ATRASADO",
    sortBy: "updatedAt",
    sortDir: "desc",
  },
];

const MODULE_FILTER_PRESETS: Record<string, SesmtFilterPreset[]> = {
  epi: [
    {
      key: "epi-uso-obrigatorio",
      label: "Uso obrigatorio",
      description: "Mostra EPIs com exigencia formal de uso.",
      specificFilters: { usoObrigatorio: "SIM" },
      sortBy: "specific:validadeCa",
      sortDir: "asc",
    },
  ],
  "inspecoes-e-visitas": [
    {
      key: "inspecao-reincidente",
      label: "Reincidencias",
      description: "Prioriza achados reincidentes.",
      specificFilters: { reincidencia: "SIM" },
      sortBy: "specific:achadosCriticos",
      sortDir: "desc",
    },
  ],
  "comunicacao-de-sst": [
    {
      key: "comunicacao-aceite-critico",
      label: "Aceite critico",
      description: "Campanhas e comunicados com aceite obrigatorio.",
      specificFilters: { aceiteCritico: "SIM" },
      sortBy: "updatedAt",
      sortDir: "desc",
    },
  ],
  "sesmt-legal-dimensionamento": [
    {
      key: "dimensionamento-deficit",
      label: "Deficit legal",
      description: "Ordena unidades com maior gap de dimensionamento.",
      sortBy: "specific:exigidoLegal",
      sortDir: "desc",
    },
  ],
  "custos-sesmt": [
    {
      key: "custos-elevados",
      label: "Maiores custos",
      description: "Ordena por maior valor orcado.",
      sortBy: "specific:orcado",
      sortDir: "desc",
    },
  ],
};

function dedupePresets(presets: SesmtFilterPreset[]): SesmtFilterPreset[] {
  const used = new Set<string>();
  return presets.filter((preset) => {
    if (used.has(preset.key)) return false;
    used.add(preset.key);
    return true;
  });
}

function buildSchemaDerivedPresets(moduleKey: string): SesmtFilterPreset[] {
  const schema = SESMT_FORM_SCHEMAS[moduleKey] ?? [];
  const presets: SesmtFilterPreset[] = [];

  const firstSelectField = schema.find((field) => field.type === "select" && (field.options?.length || 0) > 0);
  if (firstSelectField?.options?.length) {
    firstSelectField.options.slice(0, 2).forEach((option, index) => {
      presets.push({
        key: `schema-select-${firstSelectField.key}-${option.value}-${index}`,
        label: `${firstSelectField.label}: ${option.label}`,
        description: `Filtra por ${firstSelectField.label.toLowerCase()} igual a ${option.label.toLowerCase()}.`,
        specificFilters: { [firstSelectField.key]: option.value },
        sortBy: "updatedAt",
        sortDir: "desc",
      });
    });
  }

  const firstNumberField = schema.find((field) => field.type === "number");
  if (firstNumberField) {
    presets.push({
      key: `schema-number-${firstNumberField.key}`,
      label: `Maior ${firstNumberField.label}`,
      description: `Ordena pelos maiores valores de ${firstNumberField.label.toLowerCase()}.`,
      sortBy: `specific:${firstNumberField.key}`,
      sortDir: "desc",
    });
  }

  const firstDateField = schema.find((field) => field.type === "date");
  if (firstDateField) {
    presets.push({
      key: `schema-date-${firstDateField.key}`,
      label: `Proximos ${firstDateField.label}`,
      description: `Ordena pelos prazos mais proximos de ${firstDateField.label.toLowerCase()}.`,
      sortBy: `specific:${firstDateField.key}`,
      sortDir: "asc",
    });
  }

  return presets;
}

export function getSesmtFormSchema(moduleKey: string): SesmtSpecificField[] {
  return SESMT_FORM_SCHEMAS[moduleKey] ?? [];
}

export function getSesmtFilterPresets(moduleKey: string): SesmtFilterPreset[] {
  const custom = MODULE_FILTER_PRESETS[moduleKey] ?? [];
  const derived = buildSchemaDerivedPresets(moduleKey);
  return dedupePresets([...COMMON_FILTER_PRESETS, ...custom, ...derived]).slice(0, 8);
}
