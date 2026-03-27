import { expect, test, type Page } from "@playwright/test";
import { authenticateWithRealSession } from "./helpers/authRealSession";

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function fillInputByLabel(page: Page, label: string, value: string): Promise<void> {
  const exactLabel = new RegExp(`^\\s*${escapeRegex(label)}\\s*\\*?\\s*$`, "i");
  const fieldLabel = page.locator("label").filter({ hasText: exactLabel }).first();
  await fieldLabel.locator("xpath=following::input[1]").fill(value);
}

test.describe("SESMT formulario - cenarios negativos", () => {
  test("bloqueia criacao sem campos obrigatorios", async ({ page, request }) => {
    await authenticateWithRealSession(page, request, "teste@admin.com");
    await page.goto("/sesmt/operacao/epi");

    await page.getByRole("button", { name: /Criar Registro/i }).click();
    await expect(page.getByText("Campos obrigatorios").first()).toBeVisible();
  });

  test("valida numerico dedicado invalido", async ({ page, request }) => {
    await authenticateWithRealSession(page, request, "teste@admin.com");
    await page.goto("/sesmt/operacao/epi");

    await fillInputByLabel(page, "Titulo", `E2E NEG ${Date.now()}`);
    await fillInputByLabel(page, "Responsavel", "QA");
    await fillInputByLabel(page, "CA", `CA-${Date.now()}`);
    await fillInputByLabel(page, "Frequencia de troca (dias)", "abc");

    await page.getByRole("button", { name: /Criar Registro/i }).click();
    await expect(page.getByText(/^Valores numericos invalidos em:/i).first()).toBeVisible();
  });

  test("exibe erro compreensivel quando API falha no create", async ({ page, request }) => {
    await authenticateWithRealSession(page, request, "teste@admin.com");
    await page.route("**/api/sesmt/modules/epi/records", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: { message: "Falha simulada para validacao de UX." } }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto("/sesmt/operacao/epi");
    await fillInputByLabel(page, "Titulo", `E2E API FAIL ${Date.now()}`);
    await fillInputByLabel(page, "Responsavel", "QA");
    await fillInputByLabel(page, "CA", `CA-${Date.now()}`);

    await page.getByRole("button", { name: /Criar Registro/i }).click();
    await expect(page.getByText("Falha simulada para validacao de UX.").first()).toBeVisible();
    await expect(page.getByText("Falha ao carregar a tela")).toHaveCount(0);
  });
});
