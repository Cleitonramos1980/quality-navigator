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

interface LocalUser {
  id: string;
  nome: string;
  email: string;
  password: string;
  perfil: PerfilNome;
}

const enableLocalFallback =
  import.meta.env.DEV &&
  ((import.meta.env.VITE_ENABLE_LOCAL_AUTH_FALLBACK as string | undefined)?.trim().toLowerCase() === "true");

const LOCAL_USERS: LocalUser[] = [
  {
    id: "local-admin-001",
    nome: "Administrador Local",
    email: "admin.local@sgq.local",
    password: "fallback-dev-123!",
    perfil: "ADMIN",
  },
  {
    id: "local-sac-001",
    nome: "SAC Local",
    email: "sac.local@sgq.local",
    password: "fallback-dev-123!",
    perfil: "SAC",
  },
];

function localLogin(email: string, password: string): AuthLoginResponse {
  const user = LOCAL_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user || user.password !== password) {
    throw new Error("E-mail ou senha invalidos.");
  }

  return {
    token: `local-jwt-${user.id}-${Date.now()}`,
    user: { id: user.id, nome: user.nome, email: user.email, perfil: user.perfil, ativo: true },
    expiresIn: 24 * 60 * 60,
  };
}

export async function login(email: string, password: string): Promise<AuthLoginResponse> {
  try {
    return await apiPost<AuthLoginResponse>("/auth/login", { email, password });
  } catch (error) {
    const isBackendUnavailable =
      (error instanceof ApiError && (error.status === 404 || error.status === 0 || error.status === 408)) ||
      (error instanceof Error && error.message.toLowerCase().includes("failed to fetch"));

    if (enableLocalFallback && isBackendUnavailable) {
      return localLogin(email, password);
    }

    throw error;
  }
}

export async function getMe(): Promise<AuthLoginResponse["user"]> {
  return apiGet<AuthLoginResponse["user"]>("/auth/me");
}
