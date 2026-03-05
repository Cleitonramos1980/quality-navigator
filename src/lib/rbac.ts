// RBAC granular — permissões por ação para Assistência Técnica
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

// Perfis padrão com permissões de Assistência
export type PerfilNome = "ADMIN" | "SAC" | "QUALIDADE" | "AUDITOR" | "ASSISTENCIA" | "ALMOX" | "TECNICO" | "DIRETORIA";

export const PERFIL_ASSIST_PERMISSIONS: Record<PerfilNome, AssistPermission[]> = {
  ADMIN: [
    "ASSIST_OS_VIEW", "ASSIST_OS_CREATE", "ASSIST_OS_EDIT", "ASSIST_OS_CHANGE_STATUS", "ASSIST_OS_CLOSE",
    "ASSIST_INSPECAO_VIEW", "ASSIST_INSPECAO_CREATE", "ASSIST_INSPECAO_EDIT", "ASSIST_INSPECAO_APROVAR",
    "ASSIST_REQ_VIEW", "ASSIST_REQ_CREATE", "ASSIST_REQ_ATENDER", "ASSIST_REQ_TRANSFERIR", "ASSIST_REQ_RECEBER",
    "ASSIST_CONSUMO_VIEW", "ASSIST_CONSUMO_CREATE", "ASSIST_CONSUMO_EDIT",
    "ASSIST_ESTOQUE_VIEW", "ASSIST_DASH_VIEW",
  ],
  SAC: ["ASSIST_OS_VIEW", "ASSIST_OS_CREATE", "ASSIST_REQ_VIEW", "ASSIST_DASH_VIEW"],
  QUALIDADE: ["ASSIST_OS_VIEW", "ASSIST_INSPECAO_VIEW", "ASSIST_DASH_VIEW"],
  AUDITOR: ["ASSIST_OS_VIEW", "ASSIST_DASH_VIEW"],
  ASSISTENCIA: [
    "ASSIST_OS_VIEW", "ASSIST_OS_CREATE", "ASSIST_OS_EDIT", "ASSIST_OS_CHANGE_STATUS", "ASSIST_OS_CLOSE",
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
};

// Simulated current user (mock) — change perfil to test different roles
let currentUserPerfil: PerfilNome = "ADMIN";

export function setCurrentPerfil(perfil: PerfilNome) {
  currentUserPerfil = perfil;
}

export function getCurrentPerfil(): PerfilNome {
  return currentUserPerfil;
}

export function hasPermission(perm: AssistPermission): boolean {
  const perms = PERFIL_ASSIST_PERMISSIONS[currentUserPerfil];
  return perms?.includes(perm) ?? false;
}

export function getCurrentUserName(): string {
  const names: Record<PerfilNome, string> = {
    ADMIN: "Carlos Silva",
    SAC: "Maria Costa",
    QUALIDADE: "Ana Souza",
    AUDITOR: "Pedro Almeida",
    ASSISTENCIA: "João Técnico",
    ALMOX: "Marcos Almoxarifado",
    TECNICO: "João Técnico",
    DIRETORIA: "Fernando Oliveira",
  };
  return names[currentUserPerfil];
}
