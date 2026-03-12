import { useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search, LayoutDashboard, Headphones, Wrench, ClipboardCheck, Settings } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { canSeeModulo, canSeeAssistSubmenu, canSeeQualidadeSubmenu, canSeeSacSubmenu } from "@/lib/workflowOs";
import { prefetchRoute } from "@/lib/routePrefetch";
import { useUxMetrics } from "@/hooks/useUxMetrics";

interface CommandRoute {
  label: string;
  path: string;
  icon: ComponentType<{ className?: string }>;
  modulo: "dashboard" | "sac" | "qualidade" | "inventario" | "assistencia" | "admin";
}

const COMMAND_ROUTES: CommandRoute[] = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard, modulo: "dashboard" },
  { label: "Dashboard SAC", path: "/sac/dashboard", icon: Headphones, modulo: "sac" },
  { label: "Atendimentos SAC", path: "/sac/atendimentos", icon: Headphones, modulo: "sac" },
  { label: "Novo Atendimento SAC", path: "/sac/novo", icon: Headphones, modulo: "sac" },
  { label: "Pesquisa SAC", path: "/sac/pesquisa", icon: Headphones, modulo: "sac" },
  { label: "RequisiÃ§Ãµes SAC", path: "/sac/requisicoes", icon: Headphones, modulo: "sac" },
  { label: "Garantias", path: "/garantias", icon: Headphones, modulo: "sac" },
  { label: "NÃ£o Conformidades", path: "/nao-conformidades", icon: ClipboardCheck, modulo: "qualidade" },
  { label: "CAPA", path: "/capa", icon: ClipboardCheck, modulo: "qualidade" },
  { label: "Auditorias", path: "/auditorias", icon: ClipboardCheck, modulo: "qualidade" },
  { label: "Metrologia / MSA", path: "/qualidade/metrologia", icon: ClipboardCheck, modulo: "qualidade" },
  { label: "KPIs Industriais", path: "/qualidade/kpis-industriais", icon: ClipboardCheck, modulo: "qualidade" },
  { label: "Risco / SLA", path: "/qualidade/risco-sla", icon: ClipboardCheck, modulo: "qualidade" },
  { label: "Auditorias em Camadas", path: "/qualidade/auditorias-camadas", icon: ClipboardCheck, modulo: "qualidade" },
  { label: "Core Tools Fornecedor", path: "/qualidade/core-tools", icon: ClipboardCheck, modulo: "qualidade" },
  { label: "ISO 9001 Readiness", path: "/qualidade/iso-readiness", icon: ClipboardCheck, modulo: "qualidade" },
  { label: "Dashboard AssistÃªncia", path: "/assistencia/dashboard", icon: Wrench, modulo: "assistencia" },
  { label: "Ordens de ServiÃ§o", path: "/assistencia/os", icon: Wrench, modulo: "assistencia" },
  { label: "Nova Ordem de ServiÃ§o", path: "/assistencia/os/nova", icon: Wrench, modulo: "assistencia" },
  { label: "RequisiÃ§Ãµes de Material", path: "/assistencia/requisicoes", icon: Wrench, modulo: "assistencia" },
  { label: "Estoque", path: "/assistencia/estoque", icon: Wrench, modulo: "assistencia" },
  { label: "AdministraÃ§Ã£o", path: "/admin", icon: Settings, modulo: "admin" },
  { label: "UsuÃ¡rios", path: "/administracao/usuarios", icon: Settings, modulo: "admin" },
  { label: "Perfis", path: "/administracao/perfis", icon: Settings, modulo: "admin" },
  { label: "Log de Auditoria", path: "/administracao/log-auditoria", icon: Settings, modulo: "admin" },
  { label: "ParÃ¢metros", path: "/administracao/parametros", icon: Settings, modulo: "admin" },
];

function canAccessPath(path: string, modulo: CommandRoute["modulo"]): boolean {
  if (!canSeeModulo(modulo)) return false;
  if (modulo === "sac") return canSeeSacSubmenu(path);
  if (modulo === "qualidade") return canSeeQualidadeSubmenu(path);
  if (modulo === "assistencia") return canSeeAssistSubmenu(path);
  return true;
}

const GlobalCommandPalette = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { trackAction } = useUxMetrics("GLOBAL_COMMAND_PALETTE");

  const routes = useMemo(
    () => COMMAND_ROUTES.filter((item) => canAccessPath(item.path, item.modulo)),
    [],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    routes.forEach((route) => prefetchRoute(route.path));
  }, [open, routes]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Buscar tela ou aÃ§Ã£o..." />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
        <CommandGroup heading="NavegaÃ§Ã£o">
          {routes.map((route) => {
            const active = location.pathname === route.path || location.pathname.startsWith(`${route.path}/`);
            return (
              <CommandItem
                key={route.path}
                value={`${route.label} ${route.path}`}
                onSelect={() => {
                  setOpen(false);
                  trackAction("NAVIGATE", { path: route.path });
                  navigate(route.path);
                }}
                className={active ? "bg-accent" : undefined}
              >
                <route.icon className="mr-2 h-4 w-4" />
                <span>{route.label}</span>
                <CommandShortcut>{route.path}</CommandShortcut>
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
      <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Search className="h-3.5 w-3.5" />
          Busca global
        </span>
        <span>Ctrl+K</span>
      </div>
    </CommandDialog>
  );
};

export default GlobalCommandPalette;

