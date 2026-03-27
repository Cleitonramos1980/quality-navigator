import { expect, type APIRequestContext, type Page } from "@playwright/test";

export interface RealAuthSession {
  token: string;
  user: {
    id: string;
    nome: string;
    email: string;
    perfil: string;
    ativo?: boolean;
  };
}

const REAL_API_BASE = process.env.E2E_REAL_API_BASE_URL || "http://127.0.0.1:3333/api";

function getPasswordCandidates(): string[] {
  const fromEnv = process.env.E2E_AUTH_PASSWORD?.trim();
  const candidates = [
    fromEnv,
    "123456",
    "12345678",
  ].filter((value): value is string => Boolean(value && value.length > 0));
  return [...new Set(candidates)];
}

export async function loginReal(
  request: APIRequestContext,
  email: string,
): Promise<RealAuthSession> {
  const candidates = getPasswordCandidates();
  let lastStatus = 0;
  let lastBody = "";

  for (const password of candidates) {
    const response = await request.post(`${REAL_API_BASE}/auth/login`, {
      data: { email, password },
    });

    if (response.ok()) {
      return (await response.json()) as RealAuthSession;
    }

    lastStatus = response.status();
    lastBody = await response.text();
  }

  throw new Error(
    `Falha no login real para ${email}. Status: ${lastStatus}. Body: ${lastBody || "sem corpo"}.`,
  );
}

export async function authenticateWithRealSession(
  page: Page,
  request: APIRequestContext,
  email: string,
): Promise<RealAuthSession> {
  const session = await loginReal(request, email);
  expect(session.token).toBeTruthy();
  await page.goto("/login");
  await page.evaluate((payload) => {
    window.localStorage.removeItem("sgq.currentPerfil");
    window.localStorage.setItem("sgq.authSession", JSON.stringify(payload));
  }, session);
  return session;
}

export async function ensureRealUser(
  request: APIRequestContext,
  adminSession: RealAuthSession,
  payload: { nome: string; email: string; perfil: string; ativo?: boolean },
): Promise<void> {
  const headers = {
    Authorization: `Bearer ${adminSession.token}`,
    "content-type": "application/json",
  };

  const usersResponse = await request.get(`${REAL_API_BASE}/admin/usuarios`, { headers });
  expect(usersResponse.ok()).toBeTruthy();
  const users = (await usersResponse.json()) as Array<{ email?: string }>;
  const exists = users.some((user) => String(user.email || "").toLowerCase() === payload.email.toLowerCase());
  if (exists) return;

  const createResponse = await request.post(`${REAL_API_BASE}/admin/usuarios`, {
    headers,
    data: {
      nome: payload.nome,
      email: payload.email,
      perfil: payload.perfil,
      ativo: payload.ativo ?? true,
    },
  });
  expect(createResponse.ok()).toBeTruthy();
}

