import { expect, test } from "@playwright/test";
import { installApiMock } from "./helpers/mockApi";
import { authenticateAs } from "./helpers/authSession";

type NavigationActionCase = {
  route: string;
  actionName: string;
  expectedUrl: RegExp;
};

const navigationActions: NavigationActionCase[] = [
  { route: "/sac/atendimentos", actionName: "Novo Atendimento", expectedUrl: /\/sac\/novo$/ },
  { route: "/auditorias", actionName: "Nova Auditoria", expectedUrl: /\/auditorias\/nova$/ },
  { route: "/auditorias", actionName: "Calendário", expectedUrl: /\/auditorias\/calendario$/ },
  { route: "/garantias", actionName: "Nova Garantia", expectedUrl: /\/garantias\/nova$/ },
  { route: "/nao-conformidades", actionName: "Nova NC", expectedUrl: /\/nao-conformidades\/nova$/ },
  { route: "/capa", actionName: "Nova CAPA", expectedUrl: /\/capa\/nova$/ },
];

test.beforeEach(async ({ page }) => {
  await installApiMock(page);
  await authenticateAs(page, "ADMIN");
});

test("Matriz de acoes navegacionais por tela", async ({ page }) => {
  for (const item of navigationActions) {
    await page.goto(item.route);
    await page.getByRole("button", { name: item.actionName }).click();
    await expect(page).toHaveURL(item.expectedUrl);
    await expect(page.getByText("Falha ao carregar a tela")).toHaveCount(0);
  }
});

test("Matriz de acoes de dialogo e feedback em telas administrativas e SESMT", async ({ page }) => {
  await page.goto("/administracao/usuarios");
  await page.getByRole("button", { name: /Novo Usuário/i }).click();
  await expect(page.locator("label", { hasText: "Nome" }).first()).toBeVisible();

  await page.goto("/sesmt/operacao/epi");
  await page.getByRole("button", { name: /Criar Registro/i }).click();
  await expect(page.getByText("Campos obrigatorios")).toBeVisible();
  await expect(page.getByText("Falha ao carregar a tela")).toHaveCount(0);
});
