import { ReactNode, useMemo, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ClipboardCheck,
  Factory,
  Headphones,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Wrench,
  X,
  DoorOpen,
  Truck,
  Activity,
  FileText,
  PackageSearch,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Planta, PLANTA_LABELS } from "@/types/sgq";
import { clearAuthSession, getCurrentPerfil, getCurrentUserName, isAuthenticated } from "@/lib/rbac";
import {
  canSeeAssistSubmenu,
  canSeeModulo,
  canSeeQualidadeSubmenu,
  canSeeSacSubmenu,
  getCurrentPapel,
  PAPEL_LABELS,
  type NavModulo,
} from "@/lib/workflowOs";
import { prefetchRoute } from "@/lib/routePrefetch";
import GlobalCommandPalette from "@/components/navigation/GlobalCommandPalette";

interface AppLayoutProps {
  children: ReactNode;
}

interface NavItem {
  path: string;
  label: string;
  icon: any;
  modulo: NavModulo;
  children?: { path: string; label: string }[];
}

const allNavItems: NavItem[] = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard, modulo: "dashboard" },
  {
    path: "/sac/dashboard", label: "SAC", icon: Headphones, modulo: "sac",
    children: [
      { path: "/sac/dashboard", label: "Dashboard SAC" },
      { path: "/sac/atendimentos", label: "Atendimentos" },
      { path: "/sac/novo", label: "Novo Atendimento" },
      { path: "/sac/pesquisa", label: "Pesquisa" },
      { path: "/sac/avaliacoes", label: "Avaliações" },
      { path: "/garantias", label: "Garantias" },
      { path: "/sac/requisicoes", label: "Requisições" },
    ],
  },
  {
    path: "/nao-conformidades", label: "Qualidade", icon: ClipboardCheck, modulo: "qualidade",
    children: [
      { path: "/auditorias", label: "Auditorias" },
      { path: "/nao-conformidades", label: "Não Conformidades" },
      { path: "/capa", label: "CAPA" },
      { path: "/qualidade/metrologia", label: "Metrologia / MSA" },
      { path: "/qualidade/kpis-industriais", label: "KPIs Industriais" },
      { path: "/qualidade/risco-sla", label: "Risco / SLA" },
      { path: "/qualidade/auditorias-camadas", label: "Auditorias em Camadas" },
      { path: "/qualidade/documentos", label: "Documentos" },
      { path: "/qualidade/treinamentos", label: "Treinamentos" },
      { path: "/qualidade/mudancas", label: "Mudanças" },
      { path: "/qualidade/fornecedores", label: "Fornecedores / SCAR" },
      { path: "/qualidade/core-tools", label: "Core Tools Fornecedor" },
      { path: "/qualidade/iso-readiness", label: "ISO 9001 Readiness" },
    ],
  },
  {
    path: "/qualidade/inventario", label: "Inventário", icon: PackageSearch, modulo: "inventario",
    children: [
      { path: "/qualidade/inventario", label: "Dashboard de Inventário" },
      { path: "/qualidade/inventario/novo-plano", label: "Gerar Inventário" },
      { path: "/qualidade/inventario/digitacao", label: "Digitação de Inventário" },
      { path: "/qualidade/inventario/contagens", label: "Contagens" },
    ],
  },
  {
    path: "/assistencia/dashboard", label: "Assistência Técnica", icon: Wrench, modulo: "assistencia",
    children: [
      { path: "/assistencia/os/nova", label: "Nova Ordem de Serviço" },
      { path: "/assistencia/os", label: "Ordens de Serviço" },
      { path: "/assistencia/requisicoes", label: "Requisições de Material" },
      { path: "/assistencia/consumo", label: "Registrar Consumo" },
      { path: "/assistencia/estoque", label: "Estoque" },
    ],
  },
  {
    path: "/admin", label: "Administração", icon: Settings, modulo: "admin",
    children: [
      { path: "/admin", label: "Administração (home)" },
      { path: "/administracao/usuarios", label: "Usuários" },
      { path: "/administracao/perfis", label: "Perfis de Acesso" },
      { path: "/administracao/log-auditoria", label: "Log de Auditoria" },
      { path: "/administracao/parametros", label: "Parâmetros" },
    ],
  },
  {
    path: "/portaria", label: "Acessos / Portaria", icon: DoorOpen, modulo: "operacional",
    children: [
      { path: "/portaria", label: "Lista de Acessos" },
      { path: "/portaria/presenca", label: "Presença / Evacuação" },
      { path: "/visitantes", label: "Visitantes" },
      { path: "/veiculos-visitantes", label: "Veículos Visitantes" },
    ],
  },
  {
    path: "/frota", label: "Frota", icon: Truck, modulo: "operacional",
    children: [
      { path: "/frota", label: "Visão Geral" },
      { path: "/terceiros", label: "Terceiros / Transportadoras" },
      { path: "/patio", label: "Pátio e Docas" },
    ],
  },
  {
    path: "/monitoramento", label: "Monitoramento", icon: Activity, modulo: "operacional",
  },
  {
    path: "/nf-transito", label: "NF em Trânsito", icon: FileText, modulo: "operacional",
  },
];

const AppLayout = ({ children }: AppLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPlanta, setSelectedPlanta] = useState<Planta | "ALL">("ALL");
  const [plantaOpen, setPlantaOpen] = useState(false);
  const perfil = getCurrentPerfil();
  const papel = getCurrentPapel();
  const userName = getCurrentUserName();
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const isPathActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const handlePrefetch = (path: string) => {
    prefetchRoute(path);
  };

  const navItems = useMemo(() => {
    return allNavItems
      .filter((item) => canSeeModulo(item.modulo))
      .map((item) => {
        if (!item.children) return item;

        let children = item.children;
        if (item.modulo === "sac") {
          children = children.filter((child) => canSeeSacSubmenu(child.path));
        } else if (item.modulo === "qualidade") {
          children = children.filter((child) => canSeeQualidadeSubmenu(child.path));
        } else if (item.modulo === "assistencia") {
          children = children.filter((child) => canSeeAssistSubmenu(child.path));
        }

        return { ...item, children };
      })
      .filter((item) => !item.children || item.children.length > 0);
  }, [perfil]);

  return (
    <div className="h-screen overflow-hidden bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:shadow-lg"
      >
        Pular para o conteúdo
      </a>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col bg-sidebar transition-transform duration-200",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-white/95 p-1">
            <img
              src="/rodrigues-colchoes-logo.png"
              alt="Rodrigues Colchões"
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-sm font-bold text-sidebar-primary">SQI</h1>
            <p className="text-[10px] leading-none text-sidebar-foreground/60">Sistema de Gestão Integrada</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto text-sidebar-foreground/60 hover:text-sidebar-foreground lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-3 py-3">
          <div className="relative">
            <button
              onClick={() => setPlantaOpen(!plantaOpen)}
              className="flex w-full items-center gap-2 rounded-md bg-sidebar-accent px-3 py-2 text-sm text-sidebar-accent-foreground transition-colors hover:bg-sidebar-muted"
            >
              <Factory className="h-4 w-4 text-sidebar-primary" />
              <span className="flex-1 text-left">
                {selectedPlanta === "ALL" ? "Todas as Plantas" : `${selectedPlanta} – ${PLANTA_LABELS[selectedPlanta]}`}
              </span>
              <ChevronDown className={cn("h-4 w-4 transition-transform", plantaOpen && "rotate-180")} />
            </button>
            {plantaOpen && (
              <div className="absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded-md border border-sidebar-border bg-sidebar-accent shadow-lg">
                {(["ALL", "MAO", "BEL", "AGR"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setSelectedPlanta(p);
                      setPlantaOpen(false);
                    }}
                    className={cn(
                      "w-full px-3 py-2 text-left text-sm transition-colors hover:bg-sidebar-muted",
                      selectedPlanta === p ? "font-medium text-sidebar-primary" : "text-sidebar-foreground",
                    )}
                  >
                    {p === "ALL" ? "Todas as Plantas" : `${p} – ${PLANTA_LABELS[p as Planta]}`}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
          {navItems.map((item) => {
            const isActive = isPathActive(item.path) || (item.children?.some((c) => isPathActive(c.path)) ?? false);
            return (
              <div key={item.path}>
                <Link
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  onMouseEnter={() => handlePrefetch(item.path)}
                  onFocus={() => handlePrefetch(item.path)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                    isActive
                      ? "bg-sidebar-primary/15 font-medium text-sidebar-primary"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
                {item.children && isActive && (
                  <div className="ml-7 mt-0.5 space-y-0.5">
                    {item.children.map((child) => (
                      <Link
                        key={`${item.path}-${child.path}-${child.label}`}
                        to={child.path}
                        onClick={() => setSidebarOpen(false)}
                        onMouseEnter={() => handlePrefetch(child.path)}
                        onFocus={() => handlePrefetch(child.path)}
                        className={cn(
                          "block rounded-md px-3 py-1.5 text-xs transition-colors",
                          isPathActive(child.path)
                            ? "font-medium text-sidebar-primary"
                            : "text-sidebar-foreground/50 hover:text-sidebar-foreground/80",
                        )}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="sticky bottom-0 shrink-0 border-t border-sidebar-border bg-sidebar px-3 pb-5 pt-3">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-primary/20 text-xs font-bold text-sidebar-primary">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-sidebar-foreground">{userName}</p>
              <p className="text-xs text-sidebar-foreground/50">{perfil} — {PAPEL_LABELS[papel]}</p>
            </div>
            <LogOut
              className="h-4 w-4 cursor-pointer text-sidebar-foreground/40 hover:text-sidebar-foreground"
              onClick={() => {
                clearAuthSession();
                navigate("/login");
              }}
            />
          </div>
        </div>
      </aside>

      <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden lg:ml-64">
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border bg-card px-4 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-muted-foreground hover:text-foreground lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          <span className="hidden text-xs text-muted-foreground md:inline">Ctrl+K para buscar</span>
          <span className="font-mono text-xs text-muted-foreground">
            {selectedPlanta === "ALL" ? "MULTI-PLANTA" : selectedPlanta}
          </span>
        </header>

        <main id="main-content" className="min-h-0 flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>

      <GlobalCommandPalette />
    </div>
  );
};

export default AppLayout;
