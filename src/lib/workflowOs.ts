// Workflow governance — controle de transição de status por papel operacional
import type { OSStatus, OrdemServico, RequisicaoAssistencia } from "@/types/assistencia";
import { getCurrentPerfil, hasPermission, type PerfilNome } from "@/lib/rbac";

// Papéis operacionais
export type PapelOperacional = "SAC" | "ASSISTENCIA" | "INSPECAO" | "REPARO" | "ALMOX_CD" | "VALIDACAO" | "DIRETORIA" | "ADMIN";

export const PAPEL_LABELS: Record<PapelOperacional, string> = {
  SAC: "SAC",
  ASSISTENCIA: "Assistência / Coordenação",
  INSPECAO: "Inspeção / Qualidade",
  REPARO: "Reparo / Execução",
  ALMOX_CD: "Almoxarifado / CD",
  VALIDACAO: "Validação Final",
  DIRETORIA: "Diretoria (somente leitura)",
  ADMIN: "Administrador",
};

// Mapeamento perfil do sistema → papel operacional
export const PERFIL_TO_PAPEL: Record<PerfilNome, PapelOperacional> = {
  ADMIN: "ADMIN",
  SAC: "SAC",
  QUALIDADE: "INSPECAO",
  AUDITOR: "DIRETORIA",       // auditor = somente leitura no contexto OS
  ASSISTENCIA: "ASSISTENCIA",
  ALMOX: "ALMOX_CD",
  TECNICO: "REPARO",
  DIRETORIA: "DIRETORIA",
  VALIDACAO: "VALIDACAO",
};

// Responsável por status
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

// Status que cada papel pode ver na "Minha Fila"
export const FILA_POR_PAPEL: Record<PapelOperacional, OSStatus[]> = {
  SAC: ["ABERTA", "CONCLUIDA"],
  ASSISTENCIA: ["AGUARDANDO_RECEBIMENTO", "RECEBIDO", "AGUARDANDO_PECAS"],
  INSPECAO: ["EM_INSPECAO"],
  REPARO: ["EM_REPARO"],
  VALIDACAO: ["AGUARDANDO_VALIDACAO"],
  ALMOX_CD: [],  // almox vê requisições, não OS
  DIRETORIA: [],  // vê tudo somente leitura
  ADMIN: [],      // admin vê tudo
};

// Papéis que podem CRIAR OS
export const PAPEIS_PODEM_CRIAR_OS: PapelOperacional[] = ["SAC", "ADMIN"];

// Gates: campos obrigatórios por transição
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

  // ABERTA → AGUARDANDO_RECEBIMENTO
  if (from === "ABERTA" && to === "AGUARDANDO_RECEBIMENTO") {
    if (!os.codcli) missing.push("Cliente (codcli)");
    if (!os.clienteNome) missing.push("Nome do cliente");
    if (!os.planta) missing.push("Planta");
    if (!os.descricaoProblema) missing.push("Descrição do problema");
    if (!os.tipoOs) missing.push("Tipo de OS");
    if (!os.prioridade) missing.push("Prioridade");
  }

  // RECEBIDO → EM_INSPECAO
  if (from === "RECEBIDO" && to === "EM_INSPECAO") {
    if (!os.recebimentoConfirmado) missing.push("Confirmação de recebimento do produto");
  }

  // EM_INSPECAO → AGUARDANDO_PECAS ou EM_REPARO
  if (from === "EM_INSPECAO" && (to === "AGUARDANDO_PECAS" || to === "EM_REPARO")) {
    if (!os.laudoInspecao) missing.push("Laudo de inspeção");
    if (!os.decisaoTecnica) missing.push("Decisão técnica");
  }

  // AGUARDANDO_PECAS → EM_REPARO
  if (from === "AGUARDANDO_PECAS" && to === "EM_REPARO") {
    const hasRecebida = reqs.some((r) => r.osId === os.id && r.status === "RECEBIDA_ASSISTENCIA");
    if (!hasRecebida) missing.push("Requisição recebida na assistência (RECEBIDA_ASSISTENCIA)");
  }

  // EM_REPARO → AGUARDANDO_VALIDACAO
  if (from === "EM_REPARO" && to === "AGUARDANDO_VALIDACAO") {
    if (!os.relatorioReparo) missing.push("Relatório/execução do reparo");
  }

  // AGUARDANDO_VALIDACAO → CONCLUIDA
  if (from === "AGUARDANDO_VALIDACAO" && to === "CONCLUIDA") {
    if (!os.validacaoAprovada) missing.push("Validação aprovada");
  }

  // CONCLUIDA → ENCERRADA
  if (from === "CONCLUIDA" && to === "ENCERRADA") {
    if (!os.mensagemEncerramento) missing.push("Mensagem de encerramento / comunicação ao cliente");
  }

  return { ok: missing.length === 0, missing };
}

// Função central: pode transicionar?
// DEPRECATED: Use dispatchOSEvent() from osStateMachine.ts instead.
// Kept for backward compatibility.
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

  // ADMIN override total (still validates gates for forward)
  if (papel === "ADMIN") {
    if (direction === "forward") {
      const gate = validateGate(os, os.status, targetStatus, reqs);
      if (!gate.ok) {
        return { allowed: false, reason: `Campos obrigatórios: ${gate.missing.join(", ")}` };
      }
    }
    return { allowed: true, reason: "" };
  }

  // DIRETORIA = somente leitura
  if (papel === "DIRETORIA") {
    return { allowed: false, reason: "Perfil Diretoria: somente leitura" };
  }

  // Check granular permission ASSIST_OS_CHANGE_STATUS
  if (!hasPermission("ASSIST_OS_CHANGE_STATUS")) {
    return { allowed: false, reason: "Sem permissão: ASSIST_OS_CHANGE_STATUS" };
  }

  // Check: o papel do usuário é o responsável pelo status atual?
  const responsavel = STATUS_RESPONSAVEL[os.status];
  if (papel !== responsavel) {
    return {
      allowed: false,
      reason: `Etapa "${os.status}" é responsabilidade de ${PAPEL_LABELS[responsavel]}. Seu papel: ${PAPEL_LABELS[papel]}.`,
    };
  }

  // Validate gates for forward transitions
  if (direction === "forward") {
    const gate = validateGate(os, os.status, targetStatus, reqs);
    if (!gate.ok) {
      return { allowed: false, reason: `Campos obrigatórios: ${gate.missing.join(", ")}` };
    }
  }

  return { allowed: true, reason: "" };
}

// Helper: get current user papel
export function getCurrentPapel(): PapelOperacional {
  return PERFIL_TO_PAPEL[getCurrentPerfil()];
}

// Helper: can current user create OS?
export function canCreateOS(): boolean {
  const papel = getCurrentPapel();
  return PAPEIS_PODEM_CRIAR_OS.includes(papel) && hasPermission("ASSIST_OS_CREATE");
}

// Helper: get default route for perfil
export function getDefaultRouteForPerfil(perfil: PerfilNome): string {
  const papel = PERFIL_TO_PAPEL[perfil];
  switch (papel) {
    case "SAC": return "/sac/dashboard";
    case "INSPECAO":
    case "REPARO":
    case "VALIDACAO":
    case "ASSISTENCIA": return "/assistencia/dashboard";
    case "ALMOX_CD": return "/assistencia/requisicoes";
    case "DIRETORIA": return "/";
    case "ADMIN": return "/";
    default: return "/";
  }
}

// Visibilidade de módulos no menu
export type NavModulo = "dashboard" | "sac" | "qualidade" | "assistencia" | "admin";

const MODULO_PAPEIS: Record<NavModulo, PapelOperacional[]> = {
  dashboard: ["SAC", "ASSISTENCIA", "INSPECAO", "REPARO", "ALMOX_CD", "VALIDACAO", "DIRETORIA", "ADMIN"],
  sac: ["SAC", "ADMIN", "DIRETORIA"],
  // Mantém acesso existente de perfis operacionais a NC/CAPA/Auditorias, agora agrupados em "Qualidade"
  qualidade: ["SAC", "ASSISTENCIA", "INSPECAO", "ADMIN", "DIRETORIA"],
  assistencia: ["ASSISTENCIA", "INSPECAO", "REPARO", "VALIDACAO", "ALMOX_CD", "ADMIN", "DIRETORIA"],
  admin: ["ADMIN"],
};

export function canSeeModulo(modulo: NavModulo): boolean {
  const papel = getCurrentPapel();
  return MODULO_PAPEIS[modulo].includes(papel);
}

// Submenu visibility for SAC children
export function canSeeSacSubmenu(_path: string): boolean {
  const papel = getCurrentPapel();
  return ["SAC", "ADMIN", "DIRETORIA"].includes(papel);
}

// Submenu visibility for Qualidade children
export function canSeeQualidadeSubmenu(_path: string): boolean {
  const papel = getCurrentPapel();
  return MODULO_PAPEIS.qualidade.includes(papel);
}

// Submenu visibility for assistencia children
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


