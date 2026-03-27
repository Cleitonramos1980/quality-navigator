import { expect, test, type Page } from "@playwright/test";
import { authenticateWithRealSession } from "./helpers/authRealSession";

function uniqueSuffix(): string {
  return `${Date.now()}-${Math.floor(Math.random() * 1_000)}`;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function fillInputByLabel(page: Page, label: string, value: string): Promise<void> {
  const exactLabel = new RegExp(`^\\s*${escapeRegex(label)}\\s*\\*?\\s*$`, "i");
  const fieldLabel = page.locator("label").filter({ hasText: exactLabel }).first();
  await fieldLabel.locator("xpath=following::input[1]").fill(value);
}

async function fillTextareaByLabel(page: Page, label: string, value: string): Promise<void> {
  const exactLabel = new RegExp(`^\\s*${escapeRegex(label)}\\s*\\*?\\s*$`, "i");
  const fieldLabel = page.locator("label").filter({ hasText: exactLabel }).first();
  await fieldLabel.locator("xpath=following::textarea[1]").fill(value);
}

test.describe("SESMT CRUD real backend", () => {
  test("Modulo EPI: criar, editar, evidenciar e validar persistencia apos refresh", async ({ page, request }) => {
    test.setTimeout(180_000);
    await authenticateWithRealSession(page, request, "teste@admin.com");

    const code = uniqueSuffix();
    const titulo = `E2E EPI ${code}`;
    const descricaoAtualizada = `Descricao atualizada ${code}`;

    await page.goto("/sesmt/operacao/epi");
    await expect(page.getByRole("heading", { name: "EPI" })).toBeVisible();

    await fillInputByLabel(page, "Titulo", titulo);
    await fillInputByLabel(page, "Responsavel", "QA Automacao");
    await fillInputByLabel(page, "CA", `CA-${code}`);
    await fillTextareaByLabel(page, "Descricao", "Criacao automatizada de registro EPI.");

    await page.getByRole("button", { name: /Criar Registro/i }).click();
    await expect(page.getByText(titulo).first()).toBeVisible();

    await page.getByText(titulo).first().click();
    const descricaoLabel = page.locator("label").filter({ hasText: /^Descricao$/i }).first();
    const descricaoField = descricaoLabel.locator("xpath=following::textarea[1]");
    await expect(descricaoField).toHaveValue("Criacao automatizada de registro EPI.");

    await fillTextareaByLabel(page, "Descricao", descricaoAtualizada);
    await expect(descricaoField).toHaveValue(descricaoAtualizada);
    const updateResponsePromise = page.waitForResponse((response) =>
      response.request().method() === "PUT"
      && response.url().includes("/api/sesmt/modules/epi/records/")
      && response.status() === 200,
    );
    await page.getByRole("button", { name: /Atualizar Registro/i }).click();
    await updateResponsePromise;
    await expect(page.getByText(titulo).first()).toBeVisible();

    await page.getByPlaceholder("Descreva a evidencia...").fill(`Evidencia ${code}`);
    await page.getByRole("button", { name: /Adicionar Evidencia/i }).click();
    await expect(page.getByText(`Evidencia ${code}`).first()).toBeVisible();

    await page.reload();
    await page.getByPlaceholder("Buscar por titulo, responsavel ou setor").fill(titulo);
    await expect(page.getByText(titulo).first()).toBeVisible();
    await page.getByText(titulo).first().click();
    const descricaoReloadLabel = page.locator("label").filter({ hasText: /^Descricao$/i }).first();
    const descricaoReloadField = descricaoReloadLabel.locator("xpath=following::textarea[1]");
    await expect(descricaoReloadField).toHaveValue(descricaoAtualizada);
  });

  test("Modulo sensivel (Exames): criar registro com perfil autorizado", async ({ page, request }) => {
    test.setTimeout(120_000);
    await authenticateWithRealSession(page, request, "teste@admin.com");

    const code = uniqueSuffix();
    const titulo = `E2E EXAMES ${code}`;

    await page.goto("/sesmt/pessoas-e-saude/exames");
    await expect(page.getByRole("heading", { name: "Exames" })).toBeVisible();

    await fillInputByLabel(page, "Titulo", titulo);
    await fillInputByLabel(page, "Responsavel", "QA Ocupacional");
    await fillInputByLabel(page, "Tipo de exame", "Audiometria");
    await fillTextareaByLabel(page, "Descricao", "Registro de exames para validacao E2E.");

    await page.getByRole("button", { name: /Criar Registro/i }).click();
    await expect(page.getByText(titulo).first()).toBeVisible();
  });
});
