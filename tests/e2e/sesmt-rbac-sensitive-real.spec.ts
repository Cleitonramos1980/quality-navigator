import { expect, test } from "@playwright/test";
import {
  authenticateWithRealSession,
  ensureRealUser,
  loginReal,
} from "./helpers/authRealSession";

const REAL_API_BASE = process.env.E2E_REAL_API_BASE_URL || "http://127.0.0.1:3333/api";

test("RBAC sensivel SESMT: bloqueio por URL direta e por endpoint backend", async ({ page, request }) => {
  test.setTimeout(180_000);

  const adminSession = await authenticateWithRealSession(page, request, "teste@admin.com");
  await ensureRealUser(request, adminSession, {
    nome: "E2E SAC",
    email: "e2e.sac@sgq.local",
    perfil: "SAC",
    ativo: true,
  });

  const sacSession = await loginReal(request, "e2e.sac@sgq.local");
  expect(sacSession.user.perfil).toBe("SAC");

  await page.goto("/login");
  await page.evaluate((payload) => {
    window.localStorage.removeItem("sgq.currentPerfil");
    window.localStorage.setItem("sgq.authSession", JSON.stringify(payload));
  }, sacSession);

  await page.goto("/sesmt/pessoas-e-saude/exames");
  await expect(page.getByText("Acesso Negado").first()).toBeVisible();

  const sacOccupationalDashboard = await request.get(`${REAL_API_BASE}/sesmt/dashboard/gerencial-ocupacional`, {
    headers: { Authorization: `Bearer ${sacSession.token}` },
  });
  expect(sacOccupationalDashboard.status()).toBe(403);

  const sacSensitiveRecords = await request.get(`${REAL_API_BASE}/sesmt/modules/exames/records`, {
    headers: { Authorization: `Bearer ${sacSession.token}` },
  });
  expect(sacSensitiveRecords.status()).toBe(403);

  const adminOccupationalDashboard = await request.get(`${REAL_API_BASE}/sesmt/dashboard/gerencial-ocupacional`, {
    headers: { Authorization: `Bearer ${adminSession.token}` },
  });
  expect(adminOccupationalDashboard.ok()).toBeTruthy();
});

