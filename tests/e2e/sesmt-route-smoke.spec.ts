import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { installApiMock } from "./helpers/mockApi";
import { authenticateAs } from "./helpers/authSession";

function getSesmtRoutesFromMenuFile(): string[] {
  const menuFile = path.resolve(process.cwd(), "src/lib/sesmtMenu.ts");
  const source = fs.readFileSync(menuFile, "utf8");
  const routes = Array.from(source.matchAll(/path:\s*"([^"]+)"/g)).map((match) => match[1]);
  return [...new Set(routes)];
}

test("SESMT: todos os links do menu carregam sem tela branca", async ({ page }) => {
  test.setTimeout(180_000);
  await installApiMock(page);
  await authenticateAs(page, "ADMIN");

  const routes = getSesmtRoutesFromMenuFile();
  const failures: Array<{
    route: string;
    navigationError?: string;
    bodyLength: number;
    hasFallback: boolean;
    pageErrors: string[];
  }> = [];

  for (const route of routes) {
    const pageErrors: string[] = [];
    const onPageError = (error: Error) => pageErrors.push(String(error?.message || error));
    page.on("pageerror", onPageError);

    let navigationError: string | undefined;
    try {
      await page.goto(route);
      await page.waitForTimeout(300);
    } catch (error) {
      navigationError = String(error instanceof Error ? error.message : error);
    }

    const bodyText = await page.locator("body").innerText().catch(() => "");
    const bodyLength = bodyText.trim().length;
    const hasFallback = bodyText.includes("Falha ao carregar a tela");

    page.off("pageerror", onPageError);

    if (navigationError || hasFallback || pageErrors.length > 0 || bodyLength < 120) {
      failures.push({
        route,
        navigationError,
        bodyLength,
        hasFallback,
        pageErrors,
      });
    }
  }

  expect(failures, JSON.stringify(failures, null, 2)).toEqual([]);
});
