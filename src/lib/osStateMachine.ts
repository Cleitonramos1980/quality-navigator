// OS State Machine — formal state/event transitions with RBAC, gates, and side-effects
import type { OrdemServico, OSStatus, RequisicaoAssistencia } from "@/types/assistencia";
import type { PapelOperacional } from "@/lib/workflowOs";
import { getCurrentPapel, PAPEL_LABELS } from "@/lib/workflowOs";
import { hasPermission, getCurrentPerfil, getCurrentUserName } from "@/lib/rbac";
import * as osTransitionLog from "@/services/osTransitionLog";
import { registrarAuditoria } from "@/services/auditoria";

// ── Types ──

export type OSState = OSStatus;

export type OSEventType =
  | "SUBMETER_PARA_RECEBIMENTO"
  | "CONFIRMAR_RECEBIMENTO"
  | "INICIAR_INSPECAO"
  | "FINALIZAR_INSPECAO"
  | "SOLICITAR_PECAS"
  | "INICIAR_REPARO"
  | "ENVIAR_PARA_VALIDACAO"
  | "APROVAR_VALIDACAO"
  | "ENCERRAR_OS"
  | "CANCELAR_OS"
  | "RETORNAR_ETAPA";

export interface OSEvent {
  type: OSEventType;
  payload?: {
    motivo?: string;
    decisaoInspecao?: "REPARAR" | "TROCAR" | "REJEITAR" | "REENTRADA";
    returnToState?: OSState;
  };
}

export type TransitionResult =
  | { ok: true; newState: OSState }
  | { ok: false; reason: string };

export const OS_EVENT_LABELS: Record<OSEventType, string> = {
  SUBMETER_PARA_RECEBIMENTO: "Submeter para Recebimento",
  CONFIRMAR_RECEBIMENTO: "Confirmar Recebimento",
  INICIAR_INSPECAO: "Iniciar Inspeção",
  FINALIZAR_INSPECAO: "Finalizar Inspeção",
  SOLICITAR_PECAS: "Solicitar Peças",
  INICIAR_REPARO: "Iniciar Reparo",
  ENVIAR_PARA_VALIDACAO: "Enviar para Validação",
  APROVAR_VALIDACAO: "Aprovar Validação",
  ENCERRAR_OS: "Encerrar OS",
  CANCELAR_OS: "Cancelar OS",
  RETORNAR_ETAPA: "Retornar Etapa",
};

// ── Transition Definition ──

interface TransitionDef {
  event: OSEventType;
  from: OSState;
  to: OSState | ((evt: OSEvent) => OSState);
  ownerRoles: PapelOperacional[];
  requiredPerm?: string;
  guard?: (os: OrdemServico, reqs: RequisicaoAssistencia[], evt: OSEvent) => { ok: boolean; reason?: string };
}

// ── Guards ──

function guardSubmeterRecebimento(os: OrdemServico): { ok: boolean; reason?: string } {
  const missing: string[] = [];
  if (!os.codcli) missing.push("Cliente (codcli)");
  if (!os.clienteNome) missing.push("Nome do cliente");
  if (!os.planta) missing.push("Planta");
  if (!os.descricaoProblema) missing.push("Descrição do problema");
  if (!os.tipoOs) missing.push("Tipo de OS");
  if (!os.prioridade) missing.push("Prioridade");
  return missing.length ? { ok: false, reason: `Campos obrigatórios: ${missing.join(", ")}` } : { ok: true };
}

function guardConfirmarRecebimento(os: OrdemServico): { ok: boolean; reason?: string } {
  if (!os.recebimentoConfirmado) return { ok: false, reason: "Confirmação de recebimento do produto é obrigatória" };
  return { ok: true };
}

function guardFinalizarInspecao(os: OrdemServico): { ok: boolean; reason?: string } {
  const missing: string[] = [];
  if (!os.laudoInspecao) missing.push("Laudo de inspeção");
  if (!os.decisaoTecnica) missing.push("Decisão técnica");
  return missing.length ? { ok: false, reason: `Campos obrigatórios: ${missing.join(", ")}` } : { ok: true };
}

function guardIniciarReparo(_os: OrdemServico, reqs: RequisicaoAssistencia[]): { ok: boolean; reason?: string } {
  const hasRecebida = reqs.some((r) => r.osId === _os.id && r.status === "RECEBIDA_ASSISTENCIA");
  if (!hasRecebida) return { ok: false, reason: "Requisição recebida na assistência (RECEBIDA_ASSISTENCIA) é obrigatória" };
  return { ok: true };
}

function guardEnviarValidacao(os: OrdemServico): { ok: boolean; reason?: string } {
  if (!os.relatorioReparo) return { ok: false, reason: "Relatório/execução do reparo é obrigatório" };
  return { ok: true };
}

function guardAprovarValidacao(os: OrdemServico): { ok: boolean; reason?: string } {
  if (!os.validacaoAprovada) return { ok: false, reason: "Validação deve ser aprovada" };
  return { ok: true };
}

function guardEncerrarOS(os: OrdemServico): { ok: boolean; reason?: string } {
  if (!os.mensagemEncerramento) return { ok: false, reason: "Mensagem de encerramento / comunicação ao cliente é obrigatória" };
  return { ok: true };
}

function guardRetornarEtapa(_os: OrdemServico, _reqs: RequisicaoAssistencia[], evt: OSEvent): { ok: boolean; reason?: string } {
  if (!evt.payload?.motivo) return { ok: false, reason: "Motivo do retorno é obrigatório" };
  if (!evt.payload?.returnToState) return { ok: false, reason: "Estado de destino é obrigatório" };
  return { ok: true };
}

// ── Forward Transitions ──

const FORWARD_TRANSITIONS: TransitionDef[] = [
  {
    event: "SUBMETER_PARA_RECEBIMENTO",
    from: "ABERTA",
    to: "AGUARDANDO_RECEBIMENTO",
    ownerRoles: ["SAC"],
    requiredPerm: "ASSIST_OS_CHANGE_STATUS",
    guard: (os) => guardSubmeterRecebimento(os),
  },
  {
    event: "CONFIRMAR_RECEBIMENTO",
    from: "AGUARDANDO_RECEBIMENTO",
    to: "RECEBIDO",
    ownerRoles: ["ASSISTENCIA"],
    requiredPerm: "ASSIST_OS_CHANGE_STATUS",
    guard: (os) => guardConfirmarRecebimento(os),
  },
  {
    event: "INICIAR_INSPECAO",
    from: "RECEBIDO",
    to: "EM_INSPECAO",
    ownerRoles: ["ASSISTENCIA", "INSPECAO"],
    requiredPerm: "ASSIST_OS_CHANGE_STATUS",
  },
  {
    event: "FINALIZAR_INSPECAO",
    from: "EM_INSPECAO",
    to: (evt) => {
      const d = evt.payload?.decisaoInspecao;
      if (d === "REPARAR") return "AGUARDANDO_PECAS";
      return "AGUARDANDO_VALIDACAO";
    },
    ownerRoles: ["INSPECAO"],
    requiredPerm: "ASSIST_OS_CHANGE_STATUS",
    guard: (os) => guardFinalizarInspecao(os),
  },
  {
    event: "SOLICITAR_PECAS",
    from: "EM_INSPECAO",
    to: "AGUARDANDO_PECAS",
    ownerRoles: ["INSPECAO", "ASSISTENCIA"],
    requiredPerm: "ASSIST_OS_CHANGE_STATUS",
    guard: (os) => guardFinalizarInspecao(os),
  },
  {
    event: "INICIAR_REPARO",
    from: "AGUARDANDO_PECAS",
    to: "EM_REPARO",
    ownerRoles: ["REPARO", "ASSISTENCIA"],
    requiredPerm: "ASSIST_OS_CHANGE_STATUS",
    guard: (os, reqs) => guardIniciarReparo(os, reqs),
  },
  {
    event: "ENVIAR_PARA_VALIDACAO",
    from: "EM_REPARO",
    to: "AGUARDANDO_VALIDACAO",
    ownerRoles: ["REPARO"],
    requiredPerm: "ASSIST_OS_CHANGE_STATUS",
    guard: (os) => guardEnviarValidacao(os),
  },
  {
    event: "APROVAR_VALIDACAO",
    from: "AGUARDANDO_VALIDACAO",
    to: "CONCLUIDA",
    ownerRoles: ["VALIDACAO"],
    requiredPerm: "ASSIST_OS_CHANGE_STATUS",
    guard: (os) => guardAprovarValidacao(os),
  },
  {
    event: "ENCERRAR_OS",
    from: "CONCLUIDA",
    to: "ENCERRADA",
    ownerRoles: ["SAC"],
    requiredPerm: "ASSIST_OS_CHANGE_STATUS",
    guard: (os) => guardEncerrarOS(os),
  },
];

// ── Cancel (from any active state) ──

const CANCEL_FROM: OSState[] = [
  "ABERTA", "AGUARDANDO_RECEBIMENTO", "RECEBIDO", "EM_INSPECAO",
  "AGUARDANDO_PECAS", "EM_REPARO", "AGUARDANDO_VALIDACAO", "CONCLUIDA",
];

// ── Back edges (controlled) ──

const BACK_EDGES: Record<OSState, OSState[]> = {
  EM_INSPECAO: ["RECEBIDO"],
  AGUARDANDO_PECAS: ["EM_INSPECAO"],
  EM_REPARO: ["AGUARDANDO_PECAS"],
  AGUARDANDO_VALIDACAO: ["EM_REPARO"],
  CONCLUIDA: ["AGUARDANDO_VALIDACAO"],
  // States with no back edges
  ABERTA: [],
  AGUARDANDO_RECEBIMENTO: [],
  RECEBIDO: [],
  ENCERRADA: [],
  CANCELADA: [],
};

// ── Get available events for current state+user ──

export interface AvailableEvent {
  type: OSEventType;
  label: string;
  variant: "default" | "outline" | "destructive";
  needsDecisao?: boolean;
  needsMotivo?: boolean;
  returnTargets?: OSState[];
}

export function getAvailableEvents(
  os: OrdemServico,
  reqs: RequisicaoAssistencia[] = [],
): AvailableEvent[] {
  const papel = getCurrentPapel();
  const isAdmin = papel === "ADMIN";
  const isDiretoria = papel === "DIRETORIA";

  if (isDiretoria) return [];
  if (os.status === "ENCERRADA" || os.status === "CANCELADA") return [];

  const events: AvailableEvent[] = [];

  // Forward events
  for (const t of FORWARD_TRANSITIONS) {
    if (t.from !== os.status) continue;
    if (!isAdmin && !t.ownerRoles.includes(papel)) continue;
    if (t.requiredPerm && !isAdmin && !hasPermission(t.requiredPerm as any)) continue;

    // Special case: FINALIZAR_INSPECAO needs decisao
    if (t.event === "FINALIZAR_INSPECAO") {
      events.push({
        type: t.event,
        label: OS_EVENT_LABELS[t.event],
        variant: "default",
        needsDecisao: true,
      });
      continue;
    }

    // Skip SOLICITAR_PECAS if FINALIZAR_INSPECAO already added (they overlap on EM_INSPECAO)
    if (t.event === "SOLICITAR_PECAS" && events.some(e => e.type === "FINALIZAR_INSPECAO")) continue;

    events.push({
      type: t.event,
      label: OS_EVENT_LABELS[t.event],
      variant: "default",
    });
  }

  // Cancel
  if (CANCEL_FROM.includes(os.status) && (isAdmin || papel === "SAC")) {
    events.push({
      type: "CANCELAR_OS",
      label: OS_EVENT_LABELS.CANCELAR_OS,
      variant: "destructive",
      needsMotivo: true,
    });
  }

  // Back edges
  const backTargets = BACK_EDGES[os.status] || [];
  if (backTargets.length > 0) {
    // Check owner role for current state
    const fwdForState = FORWARD_TRANSITIONS.find(t => t.from === os.status);
    const ownerRoles = fwdForState?.ownerRoles || [];
    if (isAdmin || ownerRoles.includes(papel)) {
      events.push({
        type: "RETORNAR_ETAPA",
        label: OS_EVENT_LABELS.RETORNAR_ETAPA,
        variant: "outline",
        needsMotivo: true,
        returnTargets: backTargets,
      });
    }
  }

  return events;
}

// ── Dispatch (the single entry point) ──

export async function dispatchOSEvent(
  os: OrdemServico,
  event: OSEvent,
  reqs: RequisicaoAssistencia[] = [],
): Promise<TransitionResult> {
  const papel = getCurrentPapel();
  const perfil = getCurrentPerfil();
  const usuario = getCurrentUserName();
  const isAdmin = papel === "ADMIN";

  // ── Cancel ──
  if (event.type === "CANCELAR_OS") {
    if (!isAdmin && papel !== "SAC") {
      return deny("Somente SAC ou ADMIN podem cancelar OS");
    }
    if (!CANCEL_FROM.includes(os.status)) {
      return deny(`OS no status ${os.status} não pode ser cancelada`);
    }
    await logTransition(os, "CANCELADA", usuario, perfil, papel, event.payload?.motivo);
    return { ok: true, newState: "CANCELADA" };
  }

  // ── Return ──
  if (event.type === "RETORNAR_ETAPA") {
    const guardResult = guardRetornarEtapa(os, reqs, event);
    if (!guardResult.ok) return deny(guardResult.reason!);

    const target = event.payload!.returnToState!;
    const allowed = (BACK_EDGES[os.status] || []).includes(target);
    if (!allowed) return deny(`Retorno de ${os.status} para ${target} não é permitido`);

    // Check owner
    const fwdForState = FORWARD_TRANSITIONS.find(t => t.from === os.status);
    if (!isAdmin && fwdForState && !fwdForState.ownerRoles.includes(papel)) {
      return deny(`Retorno na etapa "${os.status}" é responsabilidade de ${fwdForState.ownerRoles.map(r => PAPEL_LABELS[r]).join("/")}`);
    }

    await logTransition(os, target, usuario, perfil, papel, event.payload?.motivo);
    return { ok: true, newState: target };
  }

  // ── Forward transitions ──
  const transition = FORWARD_TRANSITIONS.find(t => t.event === event.type && t.from === os.status);
  if (!transition) {
    return deny(`Evento "${OS_EVENT_LABELS[event.type]}" não é válido no estado ${os.status}`);
  }

  // RBAC: owner role
  if (!isAdmin && !transition.ownerRoles.includes(papel)) {
    return deny(`Etapa "${os.status}" é responsabilidade de ${transition.ownerRoles.map(r => PAPEL_LABELS[r]).join("/")}. Seu papel: ${PAPEL_LABELS[papel]}.`);
  }

  // RBAC: permission
  if (transition.requiredPerm && !isAdmin && !hasPermission(transition.requiredPerm as any)) {
    return deny(`Sem permissão: ${transition.requiredPerm}`);
  }

  // Guard
  if (transition.guard) {
    const g = transition.guard(os, reqs, event);
    if (!g.ok) return deny(g.reason || "Validação falhou");
  }

  // Compute target state
  const newState = typeof transition.to === "function" ? transition.to(event) : transition.to;

  // Side-effects
  await logTransition(os, newState, usuario, perfil, papel, event.payload?.motivo);

  return { ok: true, newState };
}

// ── Helpers ──

function deny(reason: string): TransitionResult {
  return { ok: false, reason };
}

async function logTransition(
  os: OrdemServico,
  newState: OSState,
  usuario: string,
  perfil: string,
  papel: string,
  motivo?: string,
) {
  await osTransitionLog.append({
    osId: os.id,
    oldStatus: os.status,
    newStatus: newState,
    usuario,
    perfil,
    papel,
    planta: os.planta,
    motivo,
  });
  registrarAuditoria(
    "OS_TRANSICAO",
    "OS",
    os.id,
    `Status: ${os.status} → ${newState}. Perfil: ${perfil}${motivo ? `. Motivo: ${motivo}` : ""}`,
  );
}

// ── Check helpers for backward compat ──

export function canDispatchEvent(
  os: OrdemServico,
  event: OSEvent,
  reqs: RequisicaoAssistencia[] = [],
): { allowed: boolean; reason: string } {
  const papel = getCurrentPapel();
  const isAdmin = papel === "ADMIN";

  if (event.type === "CANCELAR_OS") {
    if (!isAdmin && papel !== "SAC") return { allowed: false, reason: "Somente SAC ou ADMIN" };
    if (!CANCEL_FROM.includes(os.status)) return { allowed: false, reason: "Estado não permite cancelamento" };
    return { allowed: true, reason: "" };
  }

  if (event.type === "RETORNAR_ETAPA") {
    if (!event.payload?.returnToState) return { allowed: false, reason: "Estado de destino não informado" };
    const allowed = (BACK_EDGES[os.status] || []).includes(event.payload.returnToState);
    if (!allowed) return { allowed: false, reason: "Retorno não permitido para este estado" };
    if (!event.payload?.motivo) return { allowed: false, reason: "Motivo obrigatório" };
    return { allowed: true, reason: "" };
  }

  const transition = FORWARD_TRANSITIONS.find(t => t.event === event.type && t.from === os.status);
  if (!transition) return { allowed: false, reason: `Evento inválido para estado ${os.status}` };
  if (!isAdmin && !transition.ownerRoles.includes(papel)) {
    return { allowed: false, reason: `Responsabilidade de ${transition.ownerRoles.map(r => PAPEL_LABELS[r]).join("/")}` };
  }
  if (transition.requiredPerm && !isAdmin && !hasPermission(transition.requiredPerm as any)) {
    return { allowed: false, reason: `Sem permissão: ${transition.requiredPerm}` };
  }
  if (transition.guard) {
    const g = transition.guard(os, reqs, event);
    if (!g.ok) return { allowed: false, reason: g.reason || "Validação falhou" };
  }
  return { allowed: true, reason: "" };
}
