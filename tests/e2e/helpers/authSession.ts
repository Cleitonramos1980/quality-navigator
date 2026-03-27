import type { Page } from "@playwright/test";

export type PerfilCode =
  | "ADMIN"
  | "SAC"
  | "ASSISTENCIA"
  | "QUALIDADE"
  | "TECNICO"
  | "ALMOX"
  | "DIRETORIA"
  | "AUDITOR"
  | "VALIDACAO";

function buildSession(perfil: PerfilCode) {
  const perfilLabel = perfil.toLowerCase();
  return {
    token: `e2e-token-${perfilLabel}`,
    user: {
      id: `e2e-${perfilLabel}`,
      nome: `E2E ${perfil}`,
      email: `${perfilLabel}@sgq.local`,
      perfil,
      ativo: true,
    },
  };
}

export async function authenticateAs(page: Page, perfil: PerfilCode): Promise<void> {
  await page.goto("/login");
  await page.evaluate((session) => {
    window.localStorage.removeItem("sgq.currentPerfil");
    window.localStorage.setItem("sgq.authSession", JSON.stringify(session));
  }, buildSession(perfil));
}
