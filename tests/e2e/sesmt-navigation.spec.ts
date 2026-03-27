import { expect, test } from "@playwright/test";
import { installApiMock } from "./helpers/mockApi";
import { authenticateAs } from "./helpers/authSession";

test("SESMT visao executiva: rotas principais renderizam sem fallback", async ({ page }) => {
  await installApiMock(page);
  await authenticateAs(page, "ADMIN");

  const routes = [
    { path: "/sesmt/visao-executiva/painel-preditivo", title: "Painel Preditivo" },
    { path: "/sesmt/visao-executiva/indicadores", title: "Indicadores" },
    { path: "/sesmt/visao-executiva/gerencial-ocupacional", title: "Gerencial Ocupacional" },
  ];

  for (const route of routes) {
    await page.goto(route.path);
    await expect(page.getByRole("heading", { level: 1, name: route.title })).toBeVisible();
    await expect(page.getByText("Falha ao carregar a tela")).toHaveCount(0);
  }
});

test("SESMT gerencial ocupacional: 403 mostra estado explicito de acesso negado", async ({ page }) => {
  await installApiMock(page);
  await page.route("**/api/sesmt/dashboard/gerencial-ocupacional**", async (route) => {
    await route.fulfill({
      status: 403,
      contentType: "application/json",
      body: JSON.stringify({ error: { message: "Perfil sem acesso a dados ocupacionais sensiveis." } }),
    });
  });

  await authenticateAs(page, "SAC");
  await page.goto("/sesmt/visao-executiva/gerencial-ocupacional");

  await expect(page.getByText("Acesso Negado")).toBeVisible();
  await expect(page.getByText("Sem Dados")).toHaveCount(0);
  await expect(page.getByText("Falha ao carregar a tela")).toHaveCount(0);
});
