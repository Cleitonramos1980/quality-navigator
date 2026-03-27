import { expect, test } from "@playwright/test";
import { authenticateWithRealSession, loginReal } from "./helpers/authRealSession";

const REAL_API_BASE = process.env.E2E_REAL_API_BASE_URL || "http://127.0.0.1:3333/api";

function uniqueCode(): string {
  return `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

test("SESMT consistencia real: create -> lista -> detalhe -> dashboard", async ({ page, request }) => {
  test.setTimeout(180_000);

  const session = await loginReal(request, "teste@admin.com");
  const headers = { Authorization: `Bearer ${session.token}` };

  const baselineResponse = await request.get(`${REAL_API_BASE}/sesmt/dashboard/painel-mestre`, { headers });
  expect(baselineResponse.ok()).toBeTruthy();
  const baseline = (await baselineResponse.json()) as { acoesCriticasAbertas: number };
  const baselineCriticalActions = Number(baseline.acoesCriticasAbertas || 0);

  const suffix = uniqueCode();
  const title = `E2E CONSISTENCIA ${suffix}`;

  const createResponse = await request.post(`${REAL_API_BASE}/sesmt/modules/plano-de-acao-x-risco/records`, {
    headers: {
      ...headers,
      "content-type": "application/json",
    },
    data: {
      titulo: title,
      descricao: "Teste de consistencia entre lista, detalhe e dashboard.",
      unidade: "MAO",
      status: "ABERTO",
      responsavel: "QA Consistencia",
      criticidade: "CRITICA",
      dadosEspecificos: {
        riscoRelacionamento: `RIS-${suffix}`,
        acaoCorretiva: "Acao corretiva automatizada.",
      },
    },
  });
  expect(createResponse.ok()).toBeTruthy();
  const created = (await createResponse.json()) as { id: string; titulo: string };
  expect(created.id).toBeTruthy();

  const listResponse = await request.get(
    `${REAL_API_BASE}/sesmt/modules/plano-de-acao-x-risco/records?search=${encodeURIComponent(title)}`,
    { headers },
  );
  expect(listResponse.ok()).toBeTruthy();
  const listed = (await listResponse.json()) as { total: number; items: Array<{ id: string; titulo: string }> };
  expect(listed.total).toBeGreaterThan(0);
  expect(listed.items.some((item) => item.id === created.id && item.titulo === title)).toBeTruthy();

  const detailResponse = await request.get(
    `${REAL_API_BASE}/sesmt/modules/plano-de-acao-x-risco/records/${encodeURIComponent(created.id)}`,
    { headers },
  );
  expect(detailResponse.ok()).toBeTruthy();
  const detail = (await detailResponse.json()) as { id: string; titulo: string; criticidade: string; status: string };
  expect(detail.id).toBe(created.id);
  expect(detail.titulo).toBe(title);
  expect(detail.criticidade).toBe("CRITICA");
  expect(detail.status).toBe("ABERTO");

  const dashboardAfterResponse = await request.get(`${REAL_API_BASE}/sesmt/dashboard/painel-mestre`, { headers });
  expect(dashboardAfterResponse.ok()).toBeTruthy();
  const dashboardAfter = (await dashboardAfterResponse.json()) as { acoesCriticasAbertas: number };
  expect(Number(dashboardAfter.acoesCriticasAbertas || 0)).toBeGreaterThanOrEqual(baselineCriticalActions + 1);

  await authenticateWithRealSession(page, request, "teste@admin.com");
  await page.goto("/sesmt/riscos-e-controles/plano-de-acao-x-risco");
  await page.getByPlaceholder("Buscar por titulo, responsavel ou setor").fill(title);
  await expect(page.getByText(title).first()).toBeVisible();
});

