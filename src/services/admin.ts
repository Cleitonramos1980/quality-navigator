// Mock admin services — replace with API calls when backend is ready

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: string;
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
}

export const mockUsuarios: Usuario[] = [
  { id: "USR-001", nome: "Carlos Silva", email: "carlos@rodrigues.com.br", perfil: "ADMIN", ativo: true },
  { id: "USR-002", nome: "Ana Souza", email: "ana@rodrigues.com.br", perfil: "QUALIDADE", ativo: true },
  { id: "USR-003", nome: "Roberto Lima", email: "roberto@rodrigues.com.br", perfil: "QUALIDADE", ativo: true },
  { id: "USR-004", nome: "Maria Costa", email: "maria@rodrigues.com.br", perfil: "SAC", ativo: true },
  { id: "USR-005", nome: "Pedro Almeida", email: "pedro@rodrigues.com.br", perfil: "AUDITOR", ativo: true },
  { id: "USR-006", nome: "Laura Mendes", email: "laura@rodrigues.com.br", perfil: "AUDITOR", ativo: false },
  { id: "USR-007", nome: "José Santos", email: "jose@rodrigues.com.br", perfil: "SAC", ativo: true },
  { id: "USR-008", nome: "Fernando Oliveira", email: "fernando@rodrigues.com.br", perfil: "DIRETORIA", ativo: true },
];

export const mockAuditLog: AuditLogEntry[] = [
  { id: "LOG-001", data: "2026-03-04 09:15", usuario: "Carlos Silva", acao: "CRIAR", entidade: "GARANTIA", entidadeId: "GAR-006", detalhes: "Novo caso de garantia criado" },
  { id: "LOG-002", data: "2026-03-04 08:42", usuario: "Ana Souza", acao: "ATUALIZAR", entidade: "NC", entidadeId: "NC-003", detalhes: "Status alterado para EM_ACAO" },
  { id: "LOG-003", data: "2026-03-03 17:30", usuario: "Pedro Almeida", acao: "CONCLUIR", entidade: "AUDITORIA", entidadeId: "AUD-001", detalhes: "Auditoria finalizada" },
  { id: "LOG-004", data: "2026-03-03 14:10", usuario: "Roberto Lima", acao: "CRIAR", entidade: "CAPA", entidadeId: "CAPA-001", detalhes: "CAPA criada a partir de NC-003" },
  { id: "LOG-005", data: "2026-03-02 11:25", usuario: "Maria Costa", acao: "ATUALIZAR", entidade: "GARANTIA", entidadeId: "GAR-002", detalhes: "Evidência anexada" },
];

export const mockParametros: Parametro[] = [
  { chave: "SLA_GARANTIA_DIAS", valor: "30", descricao: "Prazo máximo para resolução de garantia (dias)" },
  { chave: "SLA_NC_DIAS", valor: "15", descricao: "Prazo máximo para resolução de NC (dias)" },
  { chave: "SLA_CAPA_DIAS", valor: "45", descricao: "Prazo máximo para conclusão de CAPA (dias)" },
  { chave: "MAX_ANEXOS", valor: "10", descricao: "Limite de anexos por registro" },
  { chave: "TIPOS_ARQUIVO", valor: "pdf,jpg,png,mp4,docx", descricao: "Tipos de arquivo permitidos para upload" },
];

export async function getUsuarios(): Promise<Usuario[]> {
  return Promise.resolve(mockUsuarios);
}

export async function getAuditLog(): Promise<AuditLogEntry[]> {
  return Promise.resolve(mockAuditLog);
}

export async function getParametros(): Promise<Parametro[]> {
  return Promise.resolve(mockParametros);
}
