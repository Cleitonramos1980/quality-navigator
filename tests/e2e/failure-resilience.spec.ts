import { expect, test, type Page } from "@playwright/test";
import { installApiMock } from "./helpers/mockApi";
import { authenticateAs } from "./helpers/authSession";

async function loginSac(page: Page): Promise<void> {
  await authenticateAs(page, "SAC");
}

async function preencherContextoNovoAtendimento(page: Page) {
  await page.getByRole("button", { name: /Buscar Cliente/i }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByPlaceholder("CODCLI").fill("10");
  await dialog.getByRole("button", { name: /Pesquisar/i }).click();
  await expect(dialog.getByText("VISA CREDITO")).toBeVisible();
  await dialog.getByRole("button", { name: "Selecionar" }).first().click();

  await page.getByText("121000060").first().click();
  await page.getByText("133919").first().click();

  const canalLabel = page.locator("label", { hasText: "Canal de Contato" }).first();
  await canalLabel.locator("xpath=following::button[@role='combobox'][1]").click();
  await page.getByRole("option", { name: "E-mail", exact: true }).click();

  const tipoLabel = page.locator("label", { hasText: "Tipo de Contato" }).first();
  await tipoLabel.locator("xpath=following::button[@role='combobox'][1]").click();
  await page.getByRole("option", { name: "Troca", exact: true }).click();

  const plantaLabel = page.locator("label", { hasText: "Planta Responsável" }).first();
  await plantaLabel.locator("xpath=following::button[@role='combobox'][1]").click();
  await page.getByRole("option", { name: "Manaus / AM", exact: true }).click();
}

test("Falha controlada no save SAC mantém tela estável e mostra erro", async ({ page }) => {
  await installApiMock(page);
  await page.route("**/api/sac/atendimentos", async (route) => {
    await route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ error: { message: "Oracle indisponível para gravação" } }),
    });
  });

  await loginSac(page);
  await page.goto("/sac/novo");
  await preencherContextoNovoAtendimento(page);

  const descricao = page.getByPlaceholder("Descreva detalhadamente o problema relatado pelo cliente...");
  await descricao.fill("Teste de resiliência SAC");

  await page.getByRole("button", { name: /Salvar Atendimento/i }).click();

  await expect(page.getByText("Erro ao salvar atendimento").first()).toBeVisible();
  await expect(page.getByText("Oracle indisponível para gravação").first()).toBeVisible();
  await expect(page).toHaveURL(/\/sac\/novo$/);
  await expect(descricao).toHaveValue("Teste de resiliência SAC");
});

test("Falha controlada no Criar OS mantém tela estável e mostra erro", async ({ page }) => {
  await installApiMock(page);
  await page.route("**/api/assistencia/os", async (route) => {
    await route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ error: { message: "Oracle indisponível para OS" } }),
    });
  });

  await loginSac(page);
  await page.goto("/assistencia/os/nova");

  await page.getByRole("button", { name: /Buscar Cliente/i }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByPlaceholder("CODCLI").fill("10");
  await dialog.getByRole("button", { name: /Pesquisar/i }).click();
  await expect(dialog.getByText("VISA CREDITO")).toBeVisible();
  await dialog.getByRole("button", { name: "Selecionar" }).first().click();

  await page.getByText("121000060").first().click();
  await page.getByText("133919").first().click();
  await page.getByPlaceholder("Nome do técnico").fill("Técnico Resiliência");
  const descricaoProblema = page.getByPlaceholder("Descreva o problema relatado...");
  await descricaoProblema.fill("Teste de resiliência OS");

  await page.getByRole("button", { name: /Criar OS/i }).click();

  await expect(page.getByText("Erro ao criar OS").first()).toBeVisible();
  await expect(page.getByText("Oracle indisponível para OS").first()).toBeVisible();
  await expect(page).toHaveURL(/\/assistencia\/os\/nova$/);
  await expect(descricaoProblema).toHaveValue("Teste de resiliência OS");
});
