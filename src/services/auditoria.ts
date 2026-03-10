import { apiPost } from "@/services/api";
import type { AuditLogEntry } from "@/services/admin";
import { getCurrentUserName } from "@/lib/rbac";

export async function registrarAuditoria(
  acao: string,
  entidade: string,
  entidadeId: string,
  detalhes: string,
): Promise<AuditLogEntry> {
  return apiPost<AuditLogEntry>("/admin/audit-log", {
    data: new Date().toISOString().replace("T", " ").slice(0, 16),
    usuario: getCurrentUserName(),
    acao,
    entidade,
    entidadeId,
    detalhes,
  });
}


