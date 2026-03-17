import { apiGet, apiPost, ApiError } from "@/services/api";
import type { PerfilNome } from "@/lib/rbac";

export interface AuthLoginResponse {
  token: string;
  user: {
    id: string;
    nome: string;
    email: string;
    perfil: PerfilNome;
    ativo?: boolean;
  };
  expiresIn: number;
}

/* ---------- Usuários locais de fallback (quando backend indisponível) ---------- */
interface LocalUser {
  id: string;
  nome: string;
  email: string;
  password: string;
  perfil: PerfilNome;
}

const LOCAL_USERS: LocalUser[] = [
  { id: "usr-001", nome: "Cleiton Ramos", email: "cleiton.ramos@hotmail.com", password: "123456", perfil: "ADMIN" },
  { id: "usr-002", nome: "Atendente SAC", email: "sac@rodrigues.com.br", password: "123456", perfil: "SAC" },
  { id: "usr-003", nome: "Qualidade", email: "qualidade@rodrigues.com.br", password: "123456", perfil: "QUALIDADE" },
  { id: "usr-004", nome: "Diretor", email: "diretoria@rodrigues.com.br", password: "123456", perfil: "DIRETORIA" },
  { id: "usr-005", nome: "Técnico", email: "tecnico@rodrigues.com.br", password: "123456", perfil: "TECNICO" },
  { id: "usr-006", nome: "Teste", email: "teste@admin.com", password: "123", perfil: "ADMIN" },
];

function localLogin(email: string, password: string): AuthLoginResponse {
  const user = LOCAL_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user || user.password !== password) {
    throw new Error("E-mail ou senha inválidos.");
  }
  return {
    token: `local-jwt-${user.id}-${Date.now()}`,
    user: { id: user.id, nome: user.nome, email: user.email, perfil: user.perfil, ativo: true },
    expiresIn: 86400,
  };
}

export async function login(email: string, password: string): Promise<AuthLoginResponse> {
  try {
    return await apiPost<AuthLoginResponse>("/auth/login", { email, password });
  } catch (error) {
    // Se o backend está indisponível (404, rede, etc.), usa fallback local
    const isBackendUnavailable =
      (error instanceof ApiError && (error.status === 404 || error.status === 0 || error.status === 408)) ||
      (error instanceof Error && error.message.toLowerCase().includes("failed to fetch"));

    if (isBackendUnavailable) {
      return localLogin(email, password);
    }
    throw error;
  }
}

export async function getMe(): Promise<AuthLoginResponse["user"]> {
  return apiGet<AuthLoginResponse["user"]>("/auth/me");
}
