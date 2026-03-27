import { expect, test } from "@playwright/test";
import { installApiMock } from "./helpers/mockApi";
import { authenticateAs } from "./helpers/authSession";
import { getRouteInventoryForSmoke } from "./helpers/routeInventory";

const PUBLIC_ROUTES = new Set(["/avaliacao/token-teste", "/visitante/cadastro/token-teste", "/404-nao-existe"]);

test("Smoke global de rotas: sem tela branca, sem fallback e sem crash", async ({ page }) => {
  test.setTimeout(240_000);
  await installApiMock(page);
  await authenticateAs(page, "ADMIN");

  const routes = getRouteInventoryForSmoke();
  const failures: Array<{
    route: string;
    navigationError?: string;
    hasFallback: boolean;
    hasLayout: boolean;
    bodyLength: number;
    pageErrors: string[];
    finalUrl: string;
  }> = [];

  for (const route of routes) {
    const pageErrors: string[] = [];
    const onPageError = (error: Error) => pageErrors.push(String(error?.message || error));
    page.on("pageerror", onPageError);

    let navigationError: string | undefined;
    try {
      await page.goto(route);
      await page.waitForTimeout(350);
    } catch (error) {
      navigationError = String(error instanceof Error ? error.message : error);
    }

    const finalUrl = page.url();
    const bodyText = await page.locator("body").innerText().catch(() => "");
    const bodyLength = bodyText.trim().length;
    const hasFallback = bodyText.includes("Falha ao carregar a tela");
    const hasLayout = (await page.locator("#main-content").count()) > 0;

    page.off("pageerror", onPageError);

    const isPublic = PUBLIC_ROUTES.has(route);
    const shouldHaveLayout = !isPublic;
    const isUnexpectedLoginRedirect = finalUrl.endsWith("/login") && !isPublic;

    const minimumBodyLength = isPublic ? 20 : 80;

    if (
      navigationError
      || hasFallback
      || pageErrors.length > 0
      || bodyLength < minimumBodyLength
      || (shouldHaveLayout && !hasLayout)
      || isUnexpectedLoginRedirect
    ) {
      failures.push({
        route,
        navigationError,
        hasFallback,
        hasLayout,
        bodyLength,
        pageErrors,
        finalUrl,
      });
    }
  }

  expect(failures, JSON.stringify(failures, null, 2)).toEqual([]);
});
