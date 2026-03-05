// Serviço de auditoria — log de ações críticas
import { mockAuditLog, AuditLogEntry } from "@/services/admin";
import { getCurrentUserName } from "@/lib/rbac";

let logCounter = mockAuditLog.length;

export function registrarAuditoria(
  acao: string,
  entidade: string,
  entidadeId: string,
  detalhes: string,
): AuditLogEntry {
  logCounter++;
  const entry: AuditLogEntry = {
    id: `LOG-${String(logCounter).padStart(3, "0")}`,
    data: new Date().toISOString().replace("T", " ").slice(0, 16),
    usuario: getCurrentUserName(),
    acao,
    entidade,
    entidadeId,
    detalhes,
  };
  mockAuditLog.unshift(entry);
  return entry;
}
