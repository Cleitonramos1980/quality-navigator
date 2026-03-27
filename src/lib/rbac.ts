import { AssistPermission } from "@/types/assistencia";

export const ASSIST_PERMISSION_LABELS: Record<AssistPermission, string> = {
  ASSIST_OS_VIEW: "Visualizar OS",
  ASSIST_OS_CREATE: "Criar OS",
  ASSIST_OS_EDIT: "Editar OS",
  ASSIST_OS_CHANGE_STATUS: "Alterar Status OS",
  ASSIST_OS_CLOSE: "Encerrar OS",
  ASSIST_INSPECAO_VIEW: "Visualizar Inspeção",
  ASSIST_INSPECAO_CREATE: "Criar Inspeção",
  ASSIST_INSPECAO_EDIT: "Editar Inspeção",
  ASSIST_INSPECAO_APROVAR: "Aprovar Inspeção",
  ASSIST_REQ_VIEW: "Visualizar Requisições",
  ASSIST_REQ_CREATE: "Criar Requisição",
  ASSIST_REQ_ATENDER: "Atender Requisição",
  ASSIST_REQ_TRANSFERIR: "Transferir Requisição",
  ASSIST_REQ_RECEBER: "Receber Requisição",
  ASSIST_CONSUMO_VIEW: "Visualizar Consumo",
  ASSIST_CONSUMO_CREATE: "Registrar Consumo",
  ASSIST_CONSUMO_EDIT: "Editar Consumo",
  ASSIST_ESTOQUE_VIEW: "Visualizar Estoque",
  ASSIST_DASH_VIEW: "Visualizar Dashboard",
};

export const ASSIST_PERMISSION_GROUPS = [
  { label: "Ordens de Serviço", perms: ["ASSIST_OS_VIEW", "ASSIST_OS_CREATE", "ASSIST_OS_EDIT", "ASSIST_OS_CHANGE_STATUS", "ASSIST_OS_CLOSE"] as AssistPermission[] },
  { label: "Inspeção Técnica", perms: ["ASSIST_INSPECAO_VIEW", "ASSIST_INSPECAO_CREATE", "ASSIST_INSPECAO_EDIT", "ASSIST_INSPECAO_APROVAR"] as AssistPermission[] },
  { label: "Requisições", perms: ["ASSIST_REQ_VIEW", "ASSIST_REQ_CREATE", "ASSIST_REQ_ATENDER", "ASSIST_REQ_TRANSFERIR", "ASSIST_REQ_RECEBER"] as AssistPermission[] },
  { label: "Consumo", perms: ["ASSIST_CONSUMO_VIEW", "ASSIST_CONSUMO_CREATE", "ASSIST_CONSUMO_EDIT"] as AssistPermission[] },
  { label: "Dashboard / Estoque", perms: ["ASSIST_DASH_VIEW", "ASSIST_ESTOQUE_VIEW"] as AssistPermission[] },
];

export type PerfilNome =
  | "ADMIN"
  | "SAC"
  | "QUALIDADE"
  | "AUDITOR"
  | "ASSISTENCIA"
  | "ALMOX"
  | "TECNICO"
  | "DIRETORIA"
  | "VALIDACAO"
  | "CORPORATIVO_SST"
  | "SESMT"
  | "TECNICO_SEGURANCA"
  | "ENFERMAGEM_TRABALHO"
  | "MEDICO_TRABALHO"
  | "RH"
  | "GESTOR_UNIDADE"
  | "LEITOR_RESTRITO"
  | "GESTOR_CONTRATOS"
  | "TERCEIRO_CONSULTA_LIMITADA"
  | "LIDER_OPERACIONAL"
  | "RH_OCUPACIONAL"
  | "COMITE_SST"
  | "DIRETOR_EXECUTIVO_SST";

export const PERFIL_ASSIST_PERMISSIONS: Record<PerfilNome, AssistPermission[]> = {
  ADMIN: [
    "ASSIST_OS_VIEW", "ASSIST_OS_CREATE", "ASSIST_OS_EDIT", "ASSIST_OS_CHANGE_STATUS", "ASSIST_OS_CLOSE",
    "ASSIST_INSPECAO_VIEW", "ASSIST_INSPECAO_CREATE", "ASSIST_INSPECAO_EDIT", "ASSIST_INSPECAO_APROVAR",
    "ASSIST_REQ_VIEW", "ASSIST_REQ_CREATE", "ASSIST_REQ_ATENDER", "ASSIST_REQ_TRANSFERIR", "ASSIST_REQ_RECEBER",
    "ASSIST_CONSUMO_VIEW", "ASSIST_CONSUMO_CREATE", "ASSIST_CONSUMO_EDIT",
    "ASSIST_ESTOQUE_VIEW", "ASSIST_DASH_VIEW",
  ],
  SAC: ["ASSIST_OS_VIEW", "ASSIST_OS_CREATE", "ASSIST_OS_CHANGE_STATUS", "ASSIST_OS_EDIT", "ASSIST_REQ_VIEW", "ASSIST_REQ_CREATE", "ASSIST_DASH_VIEW"],
  QUALIDADE: ["ASSIST_OS_VIEW", "ASSIST_OS_CHANGE_STATUS", "ASSIST_INSPECAO_VIEW", "ASSIST_INSPECAO_CREATE", "ASSIST_INSPECAO_EDIT", "ASSIST_INSPECAO_APROVAR", "ASSIST_DASH_VIEW"],
  AUDITOR: ["ASSIST_OS_VIEW", "ASSIST_DASH_VIEW"],
  ASSISTENCIA: [
    "ASSIST_OS_VIEW", "ASSIST_OS_EDIT", "ASSIST_OS_CHANGE_STATUS", "ASSIST_OS_CLOSE",
    "ASSIST_INSPECAO_VIEW", "ASSIST_INSPECAO_CREATE", "ASSIST_INSPECAO_EDIT", "ASSIST_INSPECAO_APROVAR",
    "ASSIST_REQ_VIEW", "ASSIST_REQ_CREATE", "ASSIST_REQ_RECEBER",
    "ASSIST_CONSUMO_VIEW", "ASSIST_CONSUMO_CREATE",
    "ASSIST_ESTOQUE_VIEW", "ASSIST_DASH_VIEW",
  ],
  ALMOX: [
    "ASSIST_OS_VIEW",
    "ASSIST_REQ_VIEW", "ASSIST_REQ_ATENDER", "ASSIST_REQ_TRANSFERIR",
    "ASSIST_ESTOQUE_VIEW", "ASSIST_DASH_VIEW",
  ],
  TECNICO: [
    "ASSIST_OS_VIEW", "ASSIST_OS_EDIT", "ASSIST_OS_CHANGE_STATUS",
    "ASSIST_INSPECAO_VIEW", "ASSIST_INSPECAO_CREATE",
    "ASSIST_REQ_VIEW", "ASSIST_REQ_CREATE", "ASSIST_REQ_RECEBER",
    "ASSIST_CONSUMO_VIEW", "ASSIST_CONSUMO_CREATE",
    "ASSIST_DASH_VIEW",
  ],
  DIRETORIA: ["ASSIST_OS_VIEW", "ASSIST_REQ_VIEW", "ASSIST_CONSUMO_VIEW", "ASSIST_ESTOQUE_VIEW", "ASSIST_DASH_VIEW"],
  VALIDACAO: [
    "ASSIST_OS_VIEW", "ASSIST_OS_CHANGE_STATUS",
    "ASSIST_INSPECAO_VIEW", "ASSIST_INSPECAO_APROVAR",
    "ASSIST_DASH_VIEW",
  ],
  CORPORATIVO_SST: [
    "ASSIST_OS_VIEW", "ASSIST_OS_CREATE", "ASSIST_OS_EDIT", "ASSIST_OS_CHANGE_STATUS", "ASSIST_OS_CLOSE",
    "ASSIST_INSPECAO_VIEW", "ASSIST_INSPECAO_CREATE", "ASSIST_INSPECAO_EDIT", "ASSIST_INSPECAO_APROVAR",
    "ASSIST_REQ_VIEW", "ASSIST_REQ_CREATE", "ASSIST_REQ_ATENDER", "ASSIST_REQ_TRANSFERIR", "ASSIST_REQ_RECEBER",
    "ASSIST_CONSUMO_VIEW", "ASSIST_CONSUMO_CREATE", "ASSIST_CONSUMO_EDIT",
    "ASSIST_ESTOQUE_VIEW", "ASSIST_DASH_VIEW",
  ],
  SESMT: [
    "ASSIST_OS_VIEW", "ASSIST_OS_EDIT", "ASSIST_OS_CHANGE_STATUS",
    "ASSIST_INSPECAO_VIEW", "ASSIST_INSPECAO_CREATE", "ASSIST_INSPECAO_EDIT", "ASSIST_INSPECAO_APROVAR",
    "ASSIST_REQ_VIEW", "ASSIST_REQ_CREATE", "ASSIST_REQ_RECEBER",
    "ASSIST_CONSUMO_VIEW", "ASSIST_CONSUMO_CREATE",
    "ASSIST_ESTOQUE_VIEW", "ASSIST_DASH_VIEW",
  ],
  TECNICO_SEGURANCA: ["ASSIST_OS_VIEW", "ASSIST_OS_CHANGE_STATUS", "ASSIST_INSPECAO_VIEW", "ASSIST_INSPECAO_CREATE", "ASSIST_DASH_VIEW"],
  ENFERMAGEM_TRABALHO: ["ASSIST_OS_VIEW", "ASSIST_INSPECAO_VIEW", "ASSIST_DASH_VIEW"],
  MEDICO_TRABALHO: ["ASSIST_OS_VIEW", "ASSIST_INSPECAO_VIEW", "ASSIST_DASH_VIEW"],
  RH: ["ASSIST_OS_VIEW", "ASSIST_REQ_VIEW", "ASSIST_DASH_VIEW"],
  GESTOR_UNIDADE: ["ASSIST_OS_VIEW", "ASSIST_OS_CHANGE_STATUS", "ASSIST_REQ_VIEW", "ASSIST_DASH_VIEW"],
  LEITOR_RESTRITO: ["ASSIST_OS_VIEW", "ASSIST_DASH_VIEW"],
  GESTOR_CONTRATOS: ["ASSIST_OS_VIEW", "ASSIST_REQ_VIEW", "ASSIST_REQ_ATENDER", "ASSIST_DASH_VIEW"],
  TERCEIRO_CONSULTA_LIMITADA: ["ASSIST_OS_VIEW", "ASSIST_DASH_VIEW"],
  LIDER_OPERACIONAL: [
    "ASSIST_OS_VIEW", "ASSIST_OS_EDIT", "ASSIST_OS_CHANGE_STATUS",
    "ASSIST_INSPECAO_VIEW", "ASSIST_INSPECAO_CREATE",
    "ASSIST_REQ_VIEW", "ASSIST_REQ_CREATE", "ASSIST_REQ_RECEBER",
    "ASSIST_DASH_VIEW",
  ],
  RH_OCUPACIONAL: ["ASSIST_OS_VIEW", "ASSIST_INSPECAO_VIEW", "ASSIST_DASH_VIEW"],
  COMITE_SST: ["ASSIST_OS_VIEW", "ASSIST_REQ_VIEW", "ASSIST_INSPECAO_VIEW", "ASSIST_DASH_VIEW"],
  DIRETOR_EXECUTIVO_SST: ["ASSIST_OS_VIEW", "ASSIST_REQ_VIEW", "ASSIST_CONSUMO_VIEW", "ASSIST_ESTOQUE_VIEW", "ASSIST_DASH_VIEW"],
};

const AUTH_STORAGE_KEY = "sgq.authSession";
const PERFIL_VALUES = new Set<PerfilNome>([
  "ADMIN",
  "SAC",
  "QUALIDADE",
  "AUDITOR",
  "ASSISTENCIA",
  "ALMOX",
  "TECNICO",
  "DIRETORIA",
  "VALIDACAO",
  "CORPORATIVO_SST",
  "SESMT",
  "TECNICO_SEGURANCA",
  "ENFERMAGEM_TRABALHO",
  "MEDICO_TRABALHO",
  "RH",
  "GESTOR_UNIDADE",
  "LEITOR_RESTRITO",
  "GESTOR_CONTRATOS",
  "TERCEIRO_CONSULTA_LIMITADA",
  "LIDER_OPERACIONAL",
  "RH_OCUPACIONAL",
  "COMITE_SST",
  "DIRETOR_EXECUTIVO_SST",
]);

export interface AuthUser {
  id: string;
  nome: string;
  email: string;
  perfil: PerfilNome;
  ativo?: boolean;
}

interface AuthSession {
  token: string;
  user: AuthUser;
}

function readSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as AuthSession;
    if (!parsed?.token || !parsed?.user?.perfil || !PERFIL_VALUES.has(parsed.user.perfil)) return null;
    return parsed;
  } catch {
    return null;
  }
}

let currentSession: AuthSession | null = readSession();

export function setAuthSession(session: AuthSession): void {
  currentSession = session;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  }
}

export function clearAuthSession(): void {
  currentSession = null;
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

export function isAuthenticated(): boolean {
  const session = readSession();
  if (session) currentSession = session;
  return Boolean(currentSession?.token);
}

export function getAuthToken(): string | null {
  const session = readSession();
  if (session) currentSession = session;
  return currentSession?.token ?? null;
}

export function getCurrentPerfil(): PerfilNome {
  const session = readSession();
  if (session) currentSession = session;
  return currentSession?.user?.perfil ?? "AUDITOR";
}

export function hasPermission(perm: AssistPermission): boolean {
  const perfil = getCurrentPerfil();
  const perms = PERFIL_ASSIST_PERMISSIONS[perfil];
  return perms?.includes(perm) ?? false;
}

export function getCurrentUserName(): string {
  const session = readSession();
  if (session) currentSession = session;
  return currentSession?.user?.nome ?? "Usuário";
}

export function getCurrentUserId(): string | null {
  const session = readSession();
  if (session) currentSession = session;
  return currentSession?.user?.id ?? null;
}
