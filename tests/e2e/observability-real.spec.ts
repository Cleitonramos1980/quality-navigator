import { expect, test } from "@playwright/test";
import { ensureRealUser, loginReal } from "./helpers/authRealSession";

const REAL_API_BASE = process.env.E2E_REAL_API_BASE_URL || "http://127.0.0.1:3333/api";

test("Observabilidade: endpoint protegido e snapshot valido", async ({ request }) => {
  const adminSession = await loginReal(request, "teste@admin.com");
  const adminHeaders = { Authorization: `Bearer ${adminSession.token}` };

  await request.get(`${REAL_API_BASE}/sesmt/modules`, { headers: adminHeaders });
  await request.get(`${REAL_API_BASE}/sesmt/dashboard/painel-mestre`, { headers: adminHeaders });

  const snapshotResponse = await request.get(`${REAL_API_BASE}/metrics/observability`, { headers: adminHeaders });
  expect(snapshotResponse.ok()).toBeTruthy();
  const snapshot = (await snapshotResponse.json()) as {
    generatedAt: string;
    http: Array<{ route: string; count: number; errorCount: number; avgMs: number; maxMs: number }>;
    oracle: Array<{ queryLabel: string; count: number; errorCount: number; avgMs: number; maxMs: number }>;
  };

  expect(snapshot.generatedAt).toBeTruthy();
  expect(Array.isArray(snapshot.http)).toBeTruthy();
  expect(Array.isArray(snapshot.oracle)).toBeTruthy();

  await ensureRealUser(request, adminSession, {
    nome: "E2E SAC Observabilidade",
    email: "e2e.sac.obs@sgq.local",
    perfil: "SAC",
    ativo: true,
  });

  const sacSession = await loginReal(request, "e2e.sac.obs@sgq.local");
  const sacResponse = await request.get(`${REAL_API_BASE}/metrics/observability`, {
    headers: { Authorization: `Bearer ${sacSession.token}` },
  });
  expect(sacResponse.status()).toBe(403);
});

