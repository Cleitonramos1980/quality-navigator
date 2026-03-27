// Workflow governance - controle de transicao de status por papel operacional
import type { OSStatus, OrdemServico, RequisicaoAssistencia } from "@/types/assistencia";
import { getCurrentPerfil, hasPermission, type PerfilNome } from "@/lib/rbac";

export type PapelOperacional =
  | "SAC"
  | "ASSISTENCIA"
  | "INSPECAO"
  | "REPARO"
  | "ALMOX_CD"
  | "VALIDACAO"
  | "SST"
  | "DIRETORIA"
  | "ADMIN";

export const PAPEL_LABELS: Record<PapelOperacional, string> = {
  SAC: "SAC",
  ASSISTENCIA: "Assistencia / Coordenacao",
  INSPECAO: "Inspecao / Qualidade",
  REPARO: "Reparo / Execucao",
  ALMOX_CD: "Almoxarifado / CD",
  VALIDACAO: "Validacao Final",
  SST: "SESMT / SST",
  DIRETORIA: "Diretoria (somente leitura)",
  ADMIN: "Administrador",
};

export const PERFIL_TO_PAPEL: Record<PerfilNome, PapelOperacional> = {
  ADMIN: "ADMIN",
  SAC: "SAC",
  QUALIDADE: "INSPECAO",
  AUDITOR: "DIRETORIA",
  ASSISTENCIA: "ASSISTENCIA",
  ALMOX: "ALMOX_CD",
  TECNICO: "REPARO",
  DIRETORIA: "DIRETORIA",
  VALIDACAO: "VALIDACAO",
  CORPORATIVO_SST: "SST",
  SESMT: "SST",
  TECNICO_SEGURANCA: "SST",
  ENFERMAGEM_TRABALHO: "SST",
  MEDICO_TRABALHO: "SST",
  RH: "SST",
  GESTOR_UNIDADE: "SST",
  LEITOR_RESTRITO: "DIRETORIA",
  GESTOR_CONTRATOS: "SST",
  TERCEIRO_CONSULTA_LIMITADA: "DIRETORIA",
  LIDER_OPERACIONAL: "SST",
  RH_OCUPACIONAL: "SST",
  COMITE_SST: "SST",
  DIRETOR_EXECUTIVO_SST: "DIRETORIA",
};

export const STATUS_RESPONSAVEL: Record<OSStatus, PapelOperacional> = {
  ABERTA: "SAC",
  AGUARDANDO_RECEBIMENTO: "ASSISTENCIA",
  RECEBIDO: "ASSISTENCIA",
  EM_INSPECAO: "INSPECAO",
  AGUARDANDO_PECAS: "ASSISTENCIA",
  EM_REPARO: "REPARO",
  AGUARDANDO_VALIDACAO: "VALIDACAO",
  CONCLUIDA: "VALIDACAO",
  ENCERRADA: "SAC",
  CANCELADA: "SAC",
};

export const FILA_POR_PAPEL: Record<PapelOperacional, OSStatus[]> = {
  SAC: ["ABERTA", "CONCLUIDA"],
  ASSISTENCIA: ["AGUARDANDO_RECEBIMENTO", "RECEBIDO", "AGUARDANDO_PECAS"],
  INSPECAO: ["EM_INSPECAO"],
  REPARO: ["EM_REPARO"],
  VALIDACAO: ["AGUARDANDO_VALIDACAO"],
  SST: [],
  ALMOX_CD: [],
  DIRETORIA: [],
  ADMIN: [],
};

export const PAPEIS_PODEM_CRIAR_OS: PapelOperacional[] = ["SAC", "ADMIN"];

export interface GateResult {
  ok: boolean;
  missing: string[];
}

export function validateGate(
  os: OrdemServico,
  from: OSStatus,
  to: OSStatus,
  reqs: RequisicaoAssistencia[] = [],
): GateResult {
  const missing: string[] = [];

  if (from === "ABERTA" && to === "AGUARDANDO_RECEBIMENTO") {
    if (!os.codcli) missing.push("Cliente (codcli)");
    if (!os.clienteNome) missing.push("Nome do cliente");
    if (!os.planta) missing.push("Planta");
    if (!os.descricaoProblema) missing.push("Descricao do problema");
    if (!os.tipoOs) missing.push("Tipo de OS");
    if (!os.prioridade) missing.push("Prioridade");
  }

  if (from === "RECEBIDO" && to === "EM_INSPECAO") {
    if (!os.recebimentoConfirmado) missing.push("Confirmacao de recebimento do produto");
  }

  if (from === "EM_INSPECAO" && (to === "AGUARDANDO_PECAS" || to === "EM_REPARO")) {
    if (!os.laudoInspecao) missing.push("Laudo de inspecao");
    if (!os.decisaoTecnica) missing.push("Decisao tecnica");
  }

  if (from === "AGUARDANDO_PECAS" && to === "EM_REPARO") {
    const hasRecebida = reqs.some((r) => r.osId === os.id && r.status === "RECEBIDA_ASSISTENCIA");
    if (!hasRecebida) missing.push("Requisicao recebida na assistencia (RECEBIDA_ASSISTENCIA)");
  }

  if (from === "EM_REPARO" && to === "AGUARDANDO_VALIDACAO") {
    if (!os.relatorioReparo) missing.push("Relatorio/execucao do reparo");
  }

  if (from === "AGUARDANDO_VALIDACAO" && to === "CONCLUIDA") {
    if (!os.validacaoAprovada) missing.push("Validacao aprovada");
  }

  if (from === "CONCLUIDA" && to === "ENCERRADA") {
    if (!os.mensagemEncerramento) missing.push("Mensagem de encerramento / comunicacao ao cliente");
  }

  return { ok: missing.length === 0, missing };
}

export interface TransitionResult {
  allowed: boolean;
  reason: string;
}

export function canTransitionOS(
  os: OrdemServico,
  targetStatus: OSStatus,
  direction: "forward" | "back",
  reqs: RequisicaoAssistencia[] = [],
): TransitionResult {
  const perfil = getCurrentPerfil();
  const papel = PERFIL_TO_PAPEL[perfil];

  if (papel === "ADMIN") {
    if (direction === "forward") {
      const gate = validateGate(os, os.status, targetStatus, reqs);
      if (!gate.ok) {
        return { allowed: false, reason: `Campos obrigatorios: ${gate.missing.join(", ")}` };
      }
    }
    return { allowed: true, reason: "" };
  }

  if (papel === "DIRETORIA" || papel === "SST") {
    return { allowed: false, reason: "Perfil sem permissao de alterar fluxo operacional de OS." };
  }

  if (!hasPermission("ASSIST_OS_CHANGE_STATUS")) {
    return { allowed: false, reason: "Sem permissao: ASSIST_OS_CHANGE_STATUS" };
  }

  const responsavel = STATUS_RESPONSAVEL[os.status];
  if (papel !== responsavel) {
    return {
      allowed: false,
      reason: `Etapa "${os.status}" e responsabilidade de ${PAPEL_LABELS[responsavel]}. Seu papel: ${PAPEL_LABELS[papel]}.`,
    };
  }

  if (direction === "forward") {
    const gate = validateGate(os, os.status, targetStatus, reqs);
    if (!gate.ok) {
      return { allowed: false, reason: `Campos obrigatorios: ${gate.missing.join(", ")}` };
    }
  }

  return { allowed: true, reason: "" };
}

export function getCurrentPapel(): PapelOperacional {
  return PERFIL_TO_PAPEL[getCurrentPerfil()];
}

export function canCreateOS(): boolean {
  const papel = getCurrentPapel();
  return PAPEIS_PODEM_CRIAR_OS.includes(papel) && hasPermission("ASSIST_OS_CREATE");
}

export function getDefaultRouteForPerfil(perfil: PerfilNome): string {
  const papel = PERFIL_TO_PAPEL[perfil];
  switch (papel) {
    case "SAC":
      return "/sac/dashboard";
    case "INSPECAO":
    case "REPARO":
    case "VALIDACAO":
    case "ASSISTENCIA":
      return "/assistencia/dashboard";
    case "ALMOX_CD":
      return "/assistencia/requisicoes";
    case "SST":
      return "/sesmt/visao-executiva/painel-mestre";
    case "DIRETORIA":
    case "ADMIN":
    default:
      return "/";
  }
}

export type NavModulo = "dashboard" | "sac" | "qualidade" | "sesmt" | "inspecoes" | "inventario" | "assistencia" | "admin" | "operacional";

const MODULO_PAPEIS: Record<NavModulo, PapelOperacional[]> = {
  dashboard: ["SAC", "ASSISTENCIA", "INSPECAO", "REPARO", "ALMOX_CD", "VALIDACAO", "SST", "DIRETORIA", "ADMIN"],
  sac: ["SAC", "ADMIN", "DIRETORIA"],
  qualidade: ["SAC", "ASSISTENCIA", "INSPECAO", "SST", "ADMIN", "DIRETORIA"],
  sesmt: ["SST", "ADMIN", "DIRETORIA", "INSPECAO"],
  inspecoes: ["SAC", "ASSISTENCIA", "INSPECAO", "SST", "ADMIN", "DIRETORIA"],
  inventario: ["SAC", "ASSISTENCIA", "INSPECAO", "ADMIN", "DIRETORIA"],
  assistencia: ["ASSISTENCIA", "INSPECAO", "REPARO", "VALIDACAO", "ALMOX_CD", "ADMIN", "DIRETORIA"],
  admin: ["ADMIN"],
  operacional: ["SAC", "ASSISTENCIA", "INSPECAO", "REPARO", "ALMOX_CD", "VALIDACAO", "SST", "DIRETORIA", "ADMIN"],
};

const SENSITIVE_SESMT_PROFILES = new Set<PerfilNome>([
  "ADMIN",
  "CORPORATIVO_SST",
  "SESMT",
  "MEDICO_TRABALHO",
  "ENFERMAGEM_TRABALHO",
  "RH_OCUPACIONAL",
  "DIRETOR_EXECUTIVO_SST",
]);

const SENSITIVE_SESMT_PATHS = [
  "/sesmt/visao-executiva/gerencial-ocupacional",
  "/sesmt/pessoas-e-saude/saude-ocupacional",
  "/sesmt/pessoas-e-saude/exames",
  "/sesmt/pessoas-e-saude/ambulatorio-prontuario",
  "/sesmt/pessoas-e-saude/medicamentos-vacinas",
];

export function canSeeModulo(modulo: NavModulo): boolean {
  const papel = getCurrentPapel();
  return MODULO_PAPEIS[modulo].includes(papel);
}

export function canSeeSacSubmenu(_path: string): boolean {
  const papel = getCurrentPapel();
  return ["SAC", "ADMIN", "DIRETORIA"].includes(papel);
}

export function canSeeQualidadeSubmenu(_path: string): boolean {
  const papel = getCurrentPapel();
  return MODULO_PAPEIS.qualidade.includes(papel);
}

export function canSeeSesmtSubmenu(_path: string): boolean {
  const papel = getCurrentPapel();
  if (!MODULO_PAPEIS.sesmt.includes(papel)) return false;
  if (!SENSITIVE_SESMT_PATHS.includes(_path)) return true;
  return SENSITIVE_SESMT_PROFILES.has(getCurrentPerfil());
}

export function canSeeInventarioSubmenu(_path: string): boolean {
  const papel = getCurrentPapel();
  return MODULO_PAPEIS.inventario.includes(papel);
}

export function canSeeAssistSubmenu(path: string): boolean {
  const papel = getCurrentPapel();
  if (papel === "ADMIN" || papel === "DIRETORIA") return true;

  if (path === "/assistencia/dashboard") return hasPermission("ASSIST_DASH_VIEW");
  if (path === "/assistencia/os") return hasPermission("ASSIST_OS_VIEW");
  if (path === "/assistencia/os/nova") return hasPermission("ASSIST_OS_CREATE");
  if (path === "/assistencia/requisicoes") return hasPermission("ASSIST_REQ_VIEW");
  if (path === "/assistencia/estoque") return hasPermission("ASSIST_ESTOQUE_VIEW");
  if (path === "/assistencia/consumo") {
    return hasPermission("ASSIST_CONSUMO_VIEW") || hasPermission("ASSIST_CONSUMO_CREATE");
  }
  return true;
}

