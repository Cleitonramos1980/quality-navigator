import { expect, test } from "@playwright/test";
import { installApiMock } from "./helpers/mockApi";
import { authenticateAs } from "./helpers/authSession";

test.beforeEach(async ({ page }) => {
  await installApiMock(page);
  await authenticateAs(page, "ADMIN");
});

test("SESMT painel preditivo mostra loading e conclui sem fallback", async ({ page }) => {
  await page.route("**/api/sesmt/dashboard/painel-preditivo**", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 700));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        riscosFuturos: [{ unidade: "MAO", riscoFuturo: 60, reincidencia: 40, degradacao: 65, justificativa: "Teste E2E" }],
        alertas: [],
        generatedAt: "2026-03-27T10:00:00.000Z",
      }),
    });
  });

  await page.goto("/sesmt/visao-executiva/painel-preditivo");
  await expect(page.getByText("Carregando")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "Painel Preditivo" })).toBeVisible();
  await expect(page.getByText("Falha ao carregar a tela")).toHaveCount(0);
});

test("SESMT indicadores mostra estado vazio explicito", async ({ page }) => {
  await page.route("**/api/sesmt/dashboard/indicadores**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({}),
    });
  });

  await page.goto("/sesmt/visao-executiva/indicadores");
  await expect(page.getByRole("heading", { level: 1, name: "Indicadores" })).toBeVisible();
  await expect(page.getByText("Sem Dados")).toBeVisible();
  await expect(page.getByText("Falha ao carregar a tela")).toHaveCount(0);
});

test("SESMT indicadores mostra erro controlado sem tela branca", async ({ page }) => {
  await page.route("**/api/sesmt/dashboard/indicadores**", async (route) => {
    await route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ error: { message: "Falha simulada no dashboard." } }),
    });
  });

  await page.goto("/sesmt/visao-executiva/indicadores");
  await expect(page.getByRole("heading", { level: 1, name: "Indicadores" })).toBeVisible();
  await expect(page.getByText("Falha simulada no dashboard.").first()).toBeVisible();
  await expect(page.getByText("Falha ao carregar a tela")).toHaveCount(0);
});

