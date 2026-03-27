import fs from "node:fs";
import path from "node:path";

const APP_ROUTES = [
  "/",
  "/admin",
  "/administracao/log-auditoria",
  "/administracao/parametros",
  "/administracao/perfis",
  "/administracao/usuarios",
  "/assistencia/consumo",
  "/assistencia/dashboard",
  "/assistencia/estoque",
  "/assistencia/os",
  "/assistencia/os/:id",
  "/assistencia/os/:id/consumo",
  "/assistencia/os/nova",
  "/assistencia/requisicoes",
  "/assistencia/requisicoes/:id/receber",
  "/auditorias",
  "/auditorias/calendario",
  "/auditorias/nova",
  "/avaliacao/:token",
  "/capa",
  "/capa/nova",
  "/custodia",
  "/custodia/:id",
  "/frota",
  "/frota/:id",
  "/frota/despacho",
  "/garantias",
  "/garantias/nova",
  "/inspecoes",
  "/inspecoes/execucoes/:id",
  "/inspecoes/historico",
  "/inspecoes/modelos",
  "/inspecoes/modelos/:id",
  "/inspecoes/modelos/novo",
  "/inspecoes/molas",
  "/inspecoes/molas/:id",
  "/inspecoes/molas/historico",
  "/inspecoes/molas/nova",
  "/inspecoes/molas/padroes",
  "/inspecoes/nova",
  "/inspecoes/tipos-nc",
  "/monitoramento",
  "/nao-conformidades",
  "/nao-conformidades/nova",
  "/nf-transito",
  "/nf-transito/:id",
  "/patio",
  "/patio/agendamento",
  "/patio/agendamento/:id",
  "/patio/agendamento/novo",
  "/portaria",
  "/portaria/:id",
  "/portaria/novo",
  "/portaria/placa",
  "/portaria/presenca",
  "/portaria/qr",
  "/portaria/solicitacoes/:id",
  "/qualidade/auditorias-camadas",
  "/qualidade/core-tools",
  "/qualidade/documentos",
  "/qualidade/fornecedores",
  "/qualidade/inventario",
  "/qualidade/inventario/agenda",
  "/qualidade/inventario/configuracao",
  "/qualidade/inventario/contagens",
  "/qualidade/inventario/digitacao",
  "/qualidade/inventario/digitacao/:id",
  "/qualidade/inventario/divergencia",
  "/qualidade/inventario/novo-plano",
  "/qualidade/inventario/relatorios",
  "/qualidade/inventario/validacao/:id",
  "/qualidade/iso-readiness",
  "/qualidade/kpis-industriais",
  "/qualidade/metrologia",
  "/qualidade/mudancas",
  "/qualidade/risco-sla",
  "/qualidade/treinamentos",
  "/sac/:id",
  "/sac/atendimentos",
  "/sac/avaliacoes",
  "/sac/dashboard",
  "/sac/novo",
  "/sac/pesquisa",
  "/sac/requisicoes",
  "/sac/requisicoes/:id",
  "/sac/requisicoes/:id/atender",
  "/sac/requisicoes/nova",
  "/sesmt",
  "/terceiros",
  "/torre-controle",
  "/torre-controle/:id",
  "/veiculos-visitantes",
  "/visitante/cadastro/:token",
  "/visitantes",
  "/visitantes/:id",
  "/visitantes/pre-autorizacao",
  "/404-nao-existe",
];

const ROUTE_REPLACEMENTS: Record<string, string> = {
  ":id": "USR-001",
  ":token": "token-teste",
};

function replaceRouteParams(route: string): string {
  return Object.entries(ROUTE_REPLACEMENTS).reduce(
    (acc, [param, value]) => acc.replaceAll(param, value),
    route,
  );
}

function getSesmtMenuRoutes(): string[] {
  const menuFile = path.resolve(process.cwd(), "src/lib/sesmtMenu.ts");
  if (!fs.existsSync(menuFile)) return [];
  const source = fs.readFileSync(menuFile, "utf8");
  return Array.from(source.matchAll(/path:\s*"([^"]+)"/g)).map((match) => match[1]);
}

export function getRouteInventoryForSmoke(): string[] {
  const appRoutes = APP_ROUTES.map(replaceRouteParams);
  const sesmtRoutes = getSesmtMenuRoutes();
  return [...new Set([...appRoutes, ...sesmtRoutes])];
}

