import { useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Search, LayoutDashboard, Headphones, Wrench, ClipboardCheck, Settings,
  DoorOpen, Users, Truck, Activity, FileText, PackageSearch, Layers, Eye, UserPlus, QrCode, Car,
} from "lucide-react";
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
import type { NavModulo } from "@/lib/workflowOs";
import { prefetchRoute } from "@/lib/routePrefetch";
import { useUxMetrics } from "@/hooks/useUxMetrics";

interface CommandRoute {
  label: string;
  path: string;
  icon: ComponentType<{ className?: string }>;
  modulo: "dashboard" | "sac" | "qualidade" | "inspecoes" | "inventario" | "assistencia" | "admin" | "operacional";
  group: string;
}

const COMMAND_ROUTES: CommandRoute[] = [
  // Operacional — Portaria & Visitantes
  { label: "Dashboard Operacional", path: "/", icon: LayoutDashboard, modulo: "dashboard", group: "Painel Principal" },
  { label: "Acessos / Portaria", path: "/portaria", icon: DoorOpen, modulo: "operacional", group: "Portaria & Visitantes" },
  { label: "Novo Acesso", path: "/portaria/novo", icon: DoorOpen, modulo: "operacional", group: "Portaria & Visitantes" },
  { label: "Presença / Evacuação", path: "/portaria/presenca", icon: Users, modulo: "operacional", group: "Portaria & Visitantes" },
  { label: "Leitura de QR Code", path: "/portaria/leitura-qr", icon: QrCode, modulo: "operacional", group: "Portaria & Visitantes" },
  { label: "Leitura de Placa", path: "/portaria/leitura-placa", icon: Car, modulo: "operacional", group: "Portaria & Visitantes" },
  { label: "Visitantes", path: "/visitantes", icon: Users, modulo: "operacional", group: "Portaria & Visitantes" },
  { label: "Nova Pré-autorização", path: "/visitantes/pre-autorizacao", icon: UserPlus, modulo: "operacional", group: "Portaria & Visitantes" },
  { label: "Veículos de Visitantes", path: "/veiculos-visitantes", icon: Car, modulo: "operacional", group: "Portaria & Visitantes" },

  // Operacional — Frota & Logística
  { label: "Frota", path: "/frota", icon: Truck, modulo: "operacional", group: "Frota & Logística" },
  { label: "Novo Despacho", path: "/frota/despacho", icon: Truck, modulo: "operacional", group: "Frota & Logística" },
  { label: "Terceiros / Transportadoras", path: "/terceiros", icon: Truck, modulo: "operacional", group: "Frota & Logística" },
  { label: "Pátio e Docas", path: "/patio", icon: Layers, modulo: "operacional", group: "Frota & Logística" },
  { label: "Agendamento de Docas", path: "/patio/agendamento", icon: Layers, modulo: "operacional", group: "Frota & Logística" },

  // Operacional — Torre de Controle
  { label: "Torre de Controle de Exceções", path: "/torre-controle", icon: Activity, modulo: "operacional", group: "Torre de Controle" },

  // Operacional — Monitoramento & NF
  { label: "Monitoramento", path: "/monitoramento", icon: Activity, modulo: "operacional", group: "Monitoramento & Fiscal" },
  { label: "NF em Trânsito", path: "/nf-transito", icon: FileText, modulo: "operacional", group: "Monitoramento & Fiscal" },
  { label: "Cadeia de Custódia Digital", path: "/custodia", icon: FileText, modulo: "operacional", group: "Monitoramento & Fiscal" },

  // SAC
  { label: "Dashboard SAC", path: "/sac/dashboard", icon: Headphones, modulo: "sac", group: "SAC" },
  { label: "Atendimentos SAC", path: "/sac/atendimentos", icon: Headphones, modulo: "sac", group: "SAC" },
  { label: "Novo Atendimento SAC", path: "/sac/novo", icon: Headphones, modulo: "sac", group: "SAC" },
  { label: "Pesquisa SAC", path: "/sac/pesquisa", icon: Headphones, modulo: "sac", group: "SAC" },
  { label: "Avaliações SAC", path: "/sac/avaliacoes", icon: Headphones, modulo: "sac", group: "SAC" },
  { label: "Requisições SAC", path: "/sac/requisicoes", icon: Headphones, modulo: "sac", group: "SAC" },
  { label: "Garantias", path: "/garantias", icon: Headphones, modulo: "sac", group: "SAC" },

  // Qualidade
  { label: "Não Conformidades", path: "/nao-conformidades", icon: ClipboardCheck, modulo: "qualidade", group: "Qualidade" },

  // Inspeções
  { label: "Dashboard de Inspeções", path: "/inspecoes", icon: Eye, modulo: "inspecoes" as any, group: "Inspeções" },
  { label: "Modelos de Inspeção", path: "/inspecoes/modelos", icon: ClipboardCheck, modulo: "inspecoes" as any, group: "Inspeções" },
  { label: "Nova Inspeção", path: "/inspecoes/nova", icon: ClipboardCheck, modulo: "inspecoes" as any, group: "Inspeções" },
  { label: "Histórico de Inspeções", path: "/inspecoes/historico", icon: ClipboardCheck, modulo: "inspecoes" as any, group: "Inspeções" },
  { label: "Tipos de Não Conformidade", path: "/inspecoes/tipos-nc", icon: ClipboardCheck, modulo: "inspecoes" as any, group: "Inspeções" },
  { label: "Dashboard de Molas", path: "/inspecoes/molas", icon: Activity, modulo: "inspecoes" as any, group: "Inspeções" },
  { label: "Nova Inspeção de Molas", path: "/inspecoes/molas/nova", icon: Activity, modulo: "inspecoes" as any, group: "Inspeções" },
  { label: "Histórico de Molas", path: "/inspecoes/molas/historico", icon: Activity, modulo: "inspecoes" as any, group: "Inspeções" },
  { label: "Padrões de Molas", path: "/inspecoes/molas/padroes", icon: Activity, modulo: "inspecoes" as any, group: "Inspeções" },
  { label: "CAPA", path: "/capa", icon: ClipboardCheck, modulo: "qualidade", group: "Qualidade" },
  { label: "Auditorias", path: "/auditorias", icon: ClipboardCheck, modulo: "qualidade", group: "Qualidade" },
  { label: "Metrologia / MSA", path: "/qualidade/metrologia", icon: ClipboardCheck, modulo: "qualidade", group: "Qualidade" },
  { label: "KPIs Industriais", path: "/qualidade/kpis-industriais", icon: ClipboardCheck, modulo: "qualidade", group: "Qualidade" },
  { label: "Risco / SLA", path: "/qualidade/risco-sla", icon: ClipboardCheck, modulo: "qualidade", group: "Qualidade" },
  { label: "Auditorias em Camadas", path: "/qualidade/auditorias-camadas", icon: ClipboardCheck, modulo: "qualidade", group: "Qualidade" },
  { label: "Core Tools Fornecedor", path: "/qualidade/core-tools", icon: ClipboardCheck, modulo: "qualidade", group: "Qualidade" },
  { label: "ISO 9001 Readiness", path: "/qualidade/iso-readiness", icon: ClipboardCheck, modulo: "qualidade", group: "Qualidade" },

  // Inventário
  { label: "Dashboard de Inventário", path: "/qualidade/inventario", icon: PackageSearch, modulo: "inventario", group: "Inventário" },
  { label: "Gerar Inventário", path: "/qualidade/inventario/novo-plano", icon: PackageSearch, modulo: "inventario", group: "Inventário" },
  { label: "Digitação de Inventário", path: "/qualidade/inventario/digitacao", icon: PackageSearch, modulo: "inventario", group: "Inventário" },
  { label: "Contagens", path: "/qualidade/inventario/contagens", icon: PackageSearch, modulo: "inventario", group: "Inventário" },

  // Assistência Técnica
  { label: "Dashboard Assistência", path: "/assistencia/dashboard", icon: Wrench, modulo: "assistencia", group: "Assistência Técnica" },
  { label: "Ordens de Serviço", path: "/assistencia/os", icon: Wrench, modulo: "assistencia", group: "Assistência Técnica" },
  { label: "Nova Ordem de Serviço", path: "/assistencia/os/nova", icon: Wrench, modulo: "assistencia", group: "Assistência Técnica" },
  { label: "Requisições de Material", path: "/assistencia/requisicoes", icon: Wrench, modulo: "assistencia", group: "Assistência Técnica" },
  { label: "Estoque", path: "/assistencia/estoque", icon: Wrench, modulo: "assistencia", group: "Assistência Técnica" },

  // Administração
  { label: "Administração", path: "/admin", icon: Settings, modulo: "admin", group: "Administração" },
  { label: "Usuários", path: "/administracao/usuarios", icon: Settings, modulo: "admin", group: "Administração" },
  { label: "Perfis", path: "/administracao/perfis", icon: Settings, modulo: "admin", group: "Administração" },
  { label: "Log de Auditoria", path: "/administracao/log-auditoria", icon: Settings, modulo: "admin", group: "Administração" },
  { label: "Parâmetros", path: "/administracao/parametros", icon: Settings, modulo: "admin", group: "Administração" },
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

  const groups = useMemo(() => {
    const map = new Map<string, typeof routes>();
    routes.forEach((r) => {
      if (!map.has(r.group)) map.set(r.group, []);
      map.get(r.group)!.push(r);
    });
    return Array.from(map.entries());
  }, [routes]);

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
      <CommandInput placeholder="Buscar tela ou ação..." />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
        {groups.map(([groupLabel, groupRoutes]) => (
          <CommandGroup key={groupLabel} heading={groupLabel}>
            {groupRoutes.map((route) => {
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
        ))}
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
