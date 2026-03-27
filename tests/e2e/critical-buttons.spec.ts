import { expect, test, type Page } from "@playwright/test";
import { installApiMock } from "./helpers/mockApi";
import { authenticateAs } from "./helpers/authSession";

async function loginAs(page: Page, perfil: "ADMIN" | "SAC"): Promise<void> {
  await authenticateAs(page, perfil);
}

async function selectByLabel(page: Page, label: string, option: string): Promise<void> {
  const fieldLabel = page.locator("label", { hasText: label }).first();
  await fieldLabel.locator("xpath=following::button[@role='combobox'][1]").click();
  await page.getByRole("option", { name: option }).first().click();
}

async function fillInputByLabel(page: Page, label: string, value: string): Promise<void> {
  const fieldLabel = page.locator("label", { hasText: label }).first();
  await fieldLabel.locator("xpath=following::input[1]").fill(value);
}

async function fillTextareaByLabel(page: Page, label: string, value: string): Promise<void> {
  const fieldLabel = page.locator("label", { hasText: label }).first();
  await fieldLabel.locator("xpath=following::textarea[1]").fill(value);
}

test.beforeEach(async ({ page }) => {
  await installApiMock(page);
});

test("SAC: Salvar Atendimento funciona", async ({ page }) => {
  await loginAs(page, "SAC");
  await page.goto("/sac/novo");

  await page.getByRole("button", { name: /Buscar Cliente/i }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByPlaceholder("CODCLI").fill("10");
  await dialog.getByRole("button", { name: /Pesquisar/i }).click();
  await expect(dialog.getByText("VISA CREDITO")).toBeVisible();
  await dialog.getByRole("button", { name: "Selecionar" }).first().click();

  await page.getByText("121000060").first().click();
  await page.getByText("133919").first().click();
  await selectByLabel(page, "Canal de Contato", "E-mail");
  await selectByLabel(page, "Tipo de Contato", "Troca");
  await selectByLabel(page, "Planta Responsável", "Manaus / AM");
  await page.getByPlaceholder("Descreva detalhadamente o problema relatado pelo cliente...").fill("Teste E2E SAC");

  await page.getByRole("button", { name: /Salvar Atendimento/i }).click();
  await expect(page).toHaveURL(/\/sac\/atendimentos$/);
});

test("Assistência: Criar OS funciona", async ({ page }) => {
  await loginAs(page, "SAC");
  await page.goto("/assistencia/os/nova");

  await page.getByRole("button", { name: /Buscar Cliente/i }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByPlaceholder("CODCLI").fill("10");
  await dialog.getByRole("button", { name: /Pesquisar/i }).click();
  await expect(dialog.getByText("VISA CREDITO")).toBeVisible();
  await dialog.getByRole("button", { name: "Selecionar" }).first().click();

  await page.getByText("121000060").first().click();
  await page.getByText("133919").first().click();
  await page.getByPlaceholder("Nome do técnico").fill("Tecnico E2E");
  await page.getByPlaceholder("Descreva o problema relatado...").fill("Teste de criação de OS");

  await page.getByRole("button", { name: /Criar OS/i }).click();
  await expect(page).toHaveURL(/\/assistencia\/os\/OS-\d+/);
});

test("Qualidade: botões de salvar (Garantia, NC e CAPA) funcionam", async ({ page }) => {
  await loginAs(page, "ADMIN");

  await page.goto("/garantias/nova");
  await fillInputByLabel(page, "CODCLI", "10");
  await fillInputByLabel(page, "Cliente", "VISA CREDITO");
  await fillInputByLabel(page, "Nº NF Venda", "10");
  await selectByLabel(page, "Defeito", "afundamento");
  await selectByLabel(page, "Planta Responsável", "MAO - Manaus / AM");
  await page.getByRole("button", { name: /Salvar e Iniciar Análise/i }).click();
  await expect(page).toHaveURL(/\/garantias$/);

  await page.goto("/nao-conformidades/nova");
  await selectByLabel(page, "Tipo NC", "CLIENTE");
  await selectByLabel(page, "Gravidade", "MEDIA");
  await selectByLabel(page, "Planta", "MAO - Manaus / AM");
  await fillTextareaByLabel(page, "Descrição", "Teste de NC");
  await fillInputByLabel(page, "Responsável", "Responsável QA");
  await fillInputByLabel(page, "Prazo", "2026-03-20");
  await page.getByRole("button", { name: /^Salvar$/ }).click();
  await expect(page).toHaveURL(/\/nao-conformidades$/);

  await page.goto("/capa/nova");
  await selectByLabel(page, "Tipo de Origem", "NC");
  await fillTextareaByLabel(page, "Descrição do Problema", "Problema detectado em auditoria");
  await fillInputByLabel(page, "Responsável", "Líder CAPA");
  await fillInputByLabel(page, "Prazo", "2026-03-30");
  await page.getByRole("button", { name: /^Salvar$/ }).click();
  await expect(page).toHaveURL(/\/capa$/);
});

test("Auditorias: botão Salvar funciona", async ({ page }) => {
  await loginAs(page, "ADMIN");
  await page.goto("/auditorias/nova");

  await page.getByPlaceholder("Ex: PROCESSO").fill("PROCESSO");
  await selectByLabel(page, "Planta", "MAO - Manaus / AM");
  await fillInputByLabel(page, "Auditor Responsável", "Auditor E2E");
  await fillInputByLabel(page, "Data Início", "2026-03-15");
  await page.getByRole("button", { name: /^Salvar$/ }).click();

  await expect(page).toHaveURL(/\/auditorias$/);
});

test("Admin: botões de salvar de Usuário e Parâmetros funcionam", async ({ page }) => {
  await loginAs(page, "ADMIN");

  await page.goto("/administracao/usuarios");
  await page.getByRole("button", { name: /Novo Usuário/i }).click();
  await fillInputByLabel(page, "Nome", "Usuário E2E");
  await fillInputByLabel(page, "Email", "usuario.e2e@sgq.local");
  await selectByLabel(page, "Perfil", "SAC");
  await page.getByRole("button", { name: /^Salvar$/ }).click();
  await expect(page.getByText("usuario.e2e@sgq.local")).toBeVisible();

  await page.goto("/administracao/parametros");
  const firstParamInput = page.locator("input").first();
  const current = await firstParamInput.inputValue();
  await firstParamInput.fill(`${current}-e2e`);
  await page.getByRole("button", { name: /Salvar Parâmetros/i }).click();
  await expect(page.getByRole("status").filter({ hasText: "Parâmetros salvos" }).first()).toBeVisible();
});
