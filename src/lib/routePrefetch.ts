type Prefetcher = () => Promise<unknown>;

const prefetchMap: Record<string, Prefetcher> = {
  "/": () => import("@/pages/Dashboard"),
  "/sac/dashboard": () => import("@/pages/sac/SACDashboardPage"),
  "/sac/atendimentos": () => import("@/pages/sac/AtendimentosPage"),
  "/sac/novo": () => import("@/pages/sac/NovoAtendimentoPage"),
  "/sac/pesquisa": () => import("@/pages/sac/PesquisaSACPage"),
  "/sac/requisicoes": () => import("@/pages/sac/requisicoes/RequisicaoListPage"),
  "/garantias": () => import("@/pages/GarantiasPage"),
  "/nao-conformidades": () => import("@/pages/NCPage"),
  "/capa": () => import("@/pages/CAPAPage"),
  "/auditorias": () => import("@/pages/AuditoriasPage"),
  "/qualidade/metrologia": () => import("@/pages/qualidade/MetrologiaQualidadePage"),
  "/qualidade/kpis-industriais": () => import("@/pages/qualidade/KpisIndustriaisPage"),
  "/qualidade/risco-sla": () => import("@/pages/qualidade/RiscoSlaQualidadePage"),
  "/qualidade/auditorias-camadas": () => import("@/pages/qualidade/AuditoriasCamadasPage"),
  "/assistencia/dashboard": () => import("@/pages/assistencia/AssistenciaDashboardPage"),
  "/assistencia/os": () => import("@/pages/assistencia/OSListPage"),
  "/assistencia/os/nova": () => import("@/pages/assistencia/NovaOSPage"),
  "/assistencia/requisicoes": () => import("@/pages/assistencia/ReqAssistListPage"),
  "/assistencia/estoque": () => import("@/pages/assistencia/EstoquePage"),
  "/assistencia/consumo": () => import("@/pages/assistencia/ConsumoOSPage"),
  "/admin": () => import("@/pages/AdminPage"),
  "/administracao/usuarios": () => import("@/pages/admin/UsuariosPage"),
  "/administracao/perfis": () => import("@/pages/admin/PerfisPage"),
  "/administracao/log-auditoria": () => import("@/pages/admin/LogAuditoriaPage"),
  "/administracao/parametros": () => import("@/pages/admin/ParametrosPage"),
  "/qualidade/core-tools": () => import("@/pages/qualidade/CoreToolsFornecedoresPage"),
  "/qualidade/iso-readiness": () => import("@/pages/qualidade/IsoReadinessPage"),
};

const prefetched = new Set<string>();

export function prefetchRoute(path: string): void {
  const exact = prefetchMap[path];
  if (exact && !prefetched.has(path)) {
    prefetched.add(path);
    void exact();
    return;
  }

  const key = Object.keys(prefetchMap).find((candidate) => path.startsWith(candidate));
  if (!key || prefetched.has(key)) return;
  prefetched.add(key);
  void prefetchMap[key]();
}
