import { apiGet, apiPost, apiPut } from "@/services/api";
import type { Perfil } from "@/types/sgq";

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: Perfil;
  ativo: boolean;
}

export interface AuditLogEntry {
  id: string;
  data: string;
  usuario: string;
  acao: string;
  entidade: string;
  entidadeId: string;
  detalhes: string;
}

export interface Parametro {
  chave: string;
  valor: string;
  descricao: string;
  id?: string;
}

export async function getUsuarios(): Promise<Usuario[]> {
  return apiGet<Usuario[]>("/admin/usuarios");
}

export async function createUsuario(payload: Omit<Usuario, "id">): Promise<Usuario> {
  return apiPost<Usuario>("/admin/usuarios", payload);
}

export async function updateUsuario(id: string, payload: Partial<Usuario>): Promise<Usuario> {
  return apiPut<Usuario>(`/admin/usuarios/${id}`, payload);
}

export async function getPerfis(): Promise<Perfil[]> {
  return apiGet<Perfil[]>("/admin/perfis");
}

export async function getAuditLog(): Promise<AuditLogEntry[]> {
  return apiGet<AuditLogEntry[]>("/admin/audit-log");
}

export async function getParametros(): Promise<Parametro[]> {
  return apiGet<Parametro[]>("/admin/parametros");
}

export async function updateParametro(chave: string, valor: string): Promise<Parametro> {
  return apiPut<Parametro>(`/admin/parametros/${chave}`, { valor });
}


