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

test("SESMT preserva contexto (filtros e registro selecionado) em refresh e retorno", async ({ page, request }) => {
  test.setTimeout(180_000);
  await authenticateWithRealSession(page, request, "teste@admin.com");

  const code = uniqueSuffix();
  const titulo = `E2E CONTEXTO ${code}`;

  await page.goto("/sesmt/operacao/epi");
  await fillInputByLabel(page, "Titulo", titulo);
  await fillInputByLabel(page, "Responsavel", "QA Contexto");
  await fillInputByLabel(page, "CA", `CA-${code}`);
  await page.getByRole("button", { name: /Criar Registro/i }).click();
  await expect(page.getByText(titulo).first()).toBeVisible();

  await page.getByPlaceholder("Buscar por titulo, responsavel ou setor").fill(titulo);
  await page.getByText(titulo).first().click();
  await expect(page.getByRole("button", { name: /Atualizar Registro/i })).toBeVisible();

  await expect.poll(() => new URL(page.url()).searchParams.get("m")).toBe("epi");
  await expect.poll(() => new URL(page.url()).searchParams.get("q")).toBe(titulo);
  await expect.poll(() => new URL(page.url()).searchParams.get("record")).toBeTruthy();

  await page.reload();
  await expect(page.getByPlaceholder("Buscar por titulo, responsavel ou setor")).toHaveValue(titulo);
  await expect(page.getByRole("button", { name: /Atualizar Registro/i })).toBeVisible();

  await page.goto("/sesmt/operacao/epc");
  await expect(page.getByRole("heading", { name: "EPC" })).toBeVisible();
  await page.goBack();

  await expect(page).toHaveURL(/\/sesmt\/operacao\/epi\?/);
  await expect(page.getByPlaceholder("Buscar por titulo, responsavel ou setor")).toHaveValue(titulo);
  await expect(page.getByRole("button", { name: /Atualizar Registro/i })).toBeVisible();
});
