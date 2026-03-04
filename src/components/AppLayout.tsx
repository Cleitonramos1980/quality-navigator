import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShieldCheck,
  AlertTriangle,
  ClipboardCheck,
  FileSearch,
  Settings,
  Menu,
  X,
  Factory,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Planta, PLANTA_LABELS } from "@/types/sgq";

interface AppLayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/garantias", label: "Garantias", icon: ShieldCheck },
  { path: "/nao-conformidades", label: "Não Conformidades", icon: AlertTriangle },
  { path: "/capa", label: "CAPA", icon: FileSearch },
  { path: "/auditorias", label: "Auditorias", icon: ClipboardCheck },
  { path: "/admin", label: "Administração", icon: Settings },
];

const AppLayout = ({ children }: AppLayoutProps) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPlanta, setSelectedPlanta] = useState<Planta | "ALL">("ALL");
  const [plantaOpen, setPlantaOpen] = useState(false);

  return (
    <div className="min-h-screen flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sidebar flex flex-col transition-transform duration-200",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-sidebar-border">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <Factory className="w-4 h-4 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-sidebar-primary">SGQ RODRIGUES</h1>
            <p className="text-[10px] text-sidebar-foreground/60 leading-none">Sistema de Gestão da Qualidade</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden text-sidebar-foreground/60 hover:text-sidebar-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Plant selector */}
        <div className="px-3 py-3">
          <div className="relative">
            <button
              onClick={() => setPlantaOpen(!plantaOpen)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md bg-sidebar-accent text-sidebar-accent-foreground text-sm hover:bg-sidebar-muted transition-colors"
            >
              <Factory className="w-4 h-4 text-sidebar-primary" />
              <span className="flex-1 text-left">
                {selectedPlanta === "ALL" ? "Todas as Plantas" : `${selectedPlanta} – ${PLANTA_LABELS[selectedPlanta]}`}
              </span>
              <ChevronDown className={cn("w-4 h-4 transition-transform", plantaOpen && "rotate-180")} />
            </button>
            {plantaOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-sidebar-accent border border-sidebar-border rounded-md overflow-hidden z-10 shadow-lg">
                {(["ALL", "MAO", "BEL", "AGR"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => { setSelectedPlanta(p); setPlantaOpen(false); }}
                    className={cn(
                      "w-full text-left px-3 py-2 text-sm hover:bg-sidebar-muted transition-colors",
                      selectedPlanta === p ? "text-sidebar-primary font-medium" : "text-sidebar-foreground"
                    )}
                  >
                    {p === "ALL" ? "Todas as Plantas" : `${p} – ${PLANTA_LABELS[p as Planta]}`}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-sidebar-primary/15 text-sidebar-primary font-medium"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center text-sidebar-primary text-xs font-bold">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">Administrador</p>
              <p className="text-xs text-sidebar-foreground/50">ADMIN</p>
            </div>
            <LogOut className="w-4 h-4 text-sidebar-foreground/40 hover:text-sidebar-foreground cursor-pointer" />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 border-b border-border bg-card flex items-center px-4 lg:px-6 gap-4 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-muted-foreground hover:text-foreground"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <span className="text-xs text-muted-foreground font-mono">
            {selectedPlanta === "ALL" ? "MULTI-PLANTA" : selectedPlanta}
          </span>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
