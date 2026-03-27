import { expect, test, type Page } from "@playwright/test";
import { installApiMock } from "./helpers/mockApi";
import { authenticateAs } from "./helpers/authSession";

type PerfilCode =
  | "ADMIN"
  | "SAC"
  | "ASSISTENCIA"
  | "QUALIDADE"
  | "TECNICO"
  | "ALMOX"
  | "DIRETORIA"
  | "AUDITOR"
  | "VALIDACAO";

type RouteExpectation = {
  path: string;
  allowedPerfis: PerfilCode[];
};

const routeExpectations: RouteExpectation[] = [
  {
    path: "/administracao/usuarios",
    allowedPerfis: ["ADMIN"],
  },
  {
    path: "/sac/novo",
    allowedPerfis: ["ADMIN", "SAC"],
  },
  {
    path: "/assistencia/os/nova",
    allowedPerfis: ["ADMIN", "SAC"],
  },
  {
    path: "/assistencia/requisicoes",
    allowedPerfis: ["ADMIN", "SAC", "ASSISTENCIA", "TECNICO", "ALMOX", "DIRETORIA"],
  },
  {
    path: "/assistencia/estoque",
    allowedPerfis: ["ADMIN", "ASSISTENCIA", "ALMOX", "DIRETORIA"],
  },
];

const perfis: PerfilCode[] = [
  "ADMIN",
  "SAC",
  "ASSISTENCIA",
  "QUALIDADE",
  "TECNICO",
  "ALMOX",
  "DIRETORIA",
  "AUDITOR",
  "VALIDACAO",
];

async function setPerfilAtivo(page: Page, perfil: PerfilCode) {
  await authenticateAs(page, perfil);
}

test("Matriz RBAC por perfil e rota critica", async ({ page }) => {
  await installApiMock(page);

  for (const perfil of perfis) {
    await setPerfilAtivo(page, perfil);

    for (const route of routeExpectations) {
      await page.goto(route.path);
      const allowed = route.allowedPerfis.includes(perfil);
      const deniedVisible = await page.getByText("Acesso Negado").isVisible().catch(() => false);
      if (allowed) {
        if (deniedVisible) {
          throw new Error(`RBAC mismatch: perfil=${perfil} deveria acessar ${route.path}, mas recebeu "Acesso Negado"`);
        }
        await expect(page).toHaveURL(new RegExp(route.path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
      } else {
        if (!deniedVisible) {
          throw new Error(`RBAC mismatch: perfil=${perfil} deveria negar ${route.path}`);
        }
      }
    }
  }
});
