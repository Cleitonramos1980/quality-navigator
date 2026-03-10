import { apiGet, apiPost } from "@/services/api";
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

export async function login(email: string, password: string): Promise<AuthLoginResponse> {
  return apiPost<AuthLoginResponse>("/auth/login", { email, password });
}

export async function getMe(): Promise<AuthLoginResponse["user"]> {
  return apiGet<AuthLoginResponse["user"]>("/auth/me");
}
