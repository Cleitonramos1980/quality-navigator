import type { SesmtMenuGroup } from "@/types/sesmt";

export const SESMT_MENU_GROUPS: SesmtMenuGroup[] = [
  {
    key: "visao-executiva",
    label: "Visao Executiva",
    children: [
      { key: "painel-mestre", label: "Painel Mestre SESMT", path: "/sesmt/visao-executiva/painel-mestre" },
      { key: "indice-maturidade", label: "Indice de Maturidade SST", path: "/sesmt/visao-executiva/indice-maturidade" },
      { key: "painel-preditivo", label: "Painel Preditivo", path: "/sesmt/visao-executiva/painel-preditivo" },
      { key: "indicadores", label: "Indicadores", path: "/sesmt/visao-executiva/indicadores" },
      { key: "gerencial-ocupacional", label: "Gerencial Ocupacional", path: "/sesmt/visao-executiva/gerencial-ocupacional" },
    ],
  },
  {
    key: "riscos-e-controles",
    label: "Riscos e Controles",
    children: [
      { key: "atividades-por-nr", label: "Atividades por NR", path: "/sesmt/riscos-e-controles/atividades-por-nr" },
      { key: "riscos-barreiras-e-controles", label: "Riscos, Barreiras e Controles", path: "/sesmt/riscos-e-controles/riscos-barreiras-e-controles" },
      { key: "efetividade-dos-controles", label: "Efetividade dos Controles", path: "/sesmt/riscos-e-controles/efetividade-dos-controles" },
      { key: "plano-de-acao-x-risco", label: "Plano de Acao x Risco", path: "/sesmt/riscos-e-controles/plano-de-acao-x-risco" },
      { key: "laudos-e-vinculos", label: "Laudos e Vinculos", path: "/sesmt/riscos-e-controles/laudos-e-vinculos" },
    ],
  },
  {
    key: "operacao",
    label: "Operacao",
    children: [
      { key: "epi", label: "EPI", path: "/sesmt/operacao/epi" },
      { key: "epc", label: "EPC", path: "/sesmt/operacao/epc" },
      { key: "inspecoes-e-visitas", label: "Inspecoes e Visitas", path: "/sesmt/operacao/inspecoes-e-visitas" },
      { key: "procedimentos-apr-pt-os", label: "Procedimentos / APR / PT / OS", path: "/sesmt/operacao/procedimentos-apr-pt-os" },
      { key: "comunicacao-de-sst", label: "Comunicacao de SST", path: "/sesmt/operacao/comunicacao-de-sst" },
      { key: "participacao-do-trabalhador", label: "Participacao do Trabalhador", path: "/sesmt/operacao/participacao-do-trabalhador" },
      { key: "cipa", label: "CIPA", path: "/sesmt/operacao/cipa" },
    ],
  },
  {
    key: "pessoas-e-saude",
    label: "Pessoas e Saude",
    children: [
      { key: "treinamentos-e-integracao", label: "Treinamentos e Integracao", path: "/sesmt/pessoas-e-saude/treinamentos-e-integracao" },
      { key: "saude-ocupacional", label: "Saude Ocupacional", path: "/sesmt/pessoas-e-saude/saude-ocupacional" },
      { key: "exames", label: "Exames", path: "/sesmt/pessoas-e-saude/exames" },
      { key: "ambulatorio-prontuario", label: "Ambulatorio / Prontuario", path: "/sesmt/pessoas-e-saude/ambulatorio-prontuario" },
      { key: "medicamentos-vacinas", label: "Medicamentos / Vacinas", path: "/sesmt/pessoas-e-saude/medicamentos-vacinas" },
      { key: "ergonomia-nr-17", label: "Ergonomia / NR-17", path: "/sesmt/pessoas-e-saude/ergonomia-nr-17" },
      { key: "dossie-colaborador", label: "Dossiê do Colaborador", path: "/sesmt/pessoas-e-saude/dossie-colaborador" },
    ],
  },
  {
    key: "estrutura-e-ambiente",
    label: "Estrutura e Ambiente",
    children: [
      { key: "sinalizacao-nr-26", label: "Sinalizacao / NR-26", path: "/sesmt/estrutura-e-ambiente/sinalizacao-nr-26" },
      { key: "emergencia-e-incendio", label: "Emergencia e Incendio", path: "/sesmt/estrutura-e-ambiente/emergencia-e-incendio" },
      { key: "residuos", label: "Residuos", path: "/sesmt/estrutura-e-ambiente/residuos" },
      { key: "obras-promat", label: "Obras / PROMAT", path: "/sesmt/estrutura-e-ambiente/obras-promat" },
    ],
  },
  {
    key: "governanca-e-conformidade",
    label: "Governanca e Conformidade",
    children: [
      { key: "documentos-controlados", label: "Documentos Controlados", path: "/sesmt/governanca-e-conformidade/documentos-controlados" },
      { key: "biblioteca-tecnica", label: "Biblioteca Tecnica", path: "/sesmt/governanca-e-conformidade/biblioteca-tecnica" },
      { key: "notificacoes-e-respostas", label: "Notificacoes e Respostas", path: "/sesmt/governanca-e-conformidade/notificacoes-e-respostas" },
      { key: "terceiros-e-contratados", label: "Terceiros e Contratados", path: "/sesmt/governanca-e-conformidade/terceiros-e-contratados" },
      { key: "requisitos-legais", label: "Requisitos Legais", path: "/sesmt/governanca-e-conformidade/requisitos-legais" },
      { key: "sesmt-legal-dimensionamento", label: "SESMT Legal / Dimensionamento", path: "/sesmt/governanca-e-conformidade/sesmt-legal-dimensionamento" },
      { key: "custos-sesmt", label: "Custos SESMT", path: "/sesmt/governanca-e-conformidade/custos-sesmt" },
      { key: "cadastros-auxiliares", label: "Cadastros Auxiliares", path: "/sesmt/governanca-e-conformidade/cadastros-auxiliares" },
    ],
  },
];

export const SESMT_MENU_CHILDREN = SESMT_MENU_GROUPS.flatMap((group) => group.children);

export function getSesmtNodeByPath(path: string) {
  return SESMT_MENU_CHILDREN.find((node) => node.path === path) ?? null;
}

export function getSesmtNodeByModuleKey(moduleKey: string) {
  return SESMT_MENU_CHILDREN.find((node) => node.key === moduleKey) ?? null;
}

export function isSesmtExecutivePath(path: string): boolean {
  return path.startsWith("/sesmt/visao-executiva/");
}

