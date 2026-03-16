import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Headphones, ShieldCheck, AlertTriangle, ClipboardCheck, Truck, Users, FileText,
  Package, ArrowRight, Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getAtendimentos } from "@/services/sac";
import { getNCs } from "@/services/nc";
import { getDashboardOperacional, getNFsTransito } from "@/services/operacional";
import { getContagens } from "@/services/inventario";
import type { DashboardOperacionalData } from "@/services/operacional";
import AlertsPanel, { type AlertItem } from "./AlertsPanel";

interface ModuleMetric {
  label: string;
  value: number;
  icon: React.ReactNode;
  route: string;
  severity?: "ok" | "warn" | "critical";
}

const ExecutiveSummaryPanel = () => {
  const [metrics, setMetrics] = useState<ModuleMetric[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const m: ModuleMetric[] = [];
      const a: AlertItem[] = [];

      try {
        const atendimentos = await getAtendimentos();
        const abertos = atendimentos.filter((x) => x.status === "ABERTO" || x.status === "EM_ANALISE").length;
        m.push({ label: "SAC Abertos", value: abertos, icon: <Headphones className="h-4 w-4" />, route: "/sac/atendimentos", severity: abertos > 10 ? "critical" : abertos > 5 ? "warn" : "ok" });
        if (abertos > 10) a.push({ id: "sac-critical", severity: "critical", title: `${abertos} atendimentos SAC aguardando resolução`, module: "SAC", route: "/sac/atendimentos" });
      } catch { /* service unavailable */ }

      try {
        const ncs = await getNCs();
        const abertas = ncs.filter((x) => x.status === "ABERTA" || x.status === "EM_ANALISE").length;
        m.push({ label: "NCs Ativas", value: abertas, icon: <AlertTriangle className="h-4 w-4" />, route: "/nao-conformidades", severity: abertas > 5 ? "warn" : "ok" });
        if (abertas > 5) a.push({ id: "nc-high", severity: "high", title: `${abertas} não conformidades abertas requerem ação`, module: "Qualidade", route: "/nao-conformidades" });
      } catch { /* ignore */ }

      try {
        const contagens = await getContagens();
        const pendentes = contagens.filter((c) => c.status === "NAO_INICIADO" || c.status === "ATRASADO").length;
        m.push({ label: "Inv. Pendentes", value: pendentes, icon: <Package className="h-4 w-4" />, route: "/qualidade/inventario/contagens", severity: pendentes > 3 ? "warn" : "ok" });
        const atrasadas = contagens.filter((c) => c.status === "ATRASADO").length;
        if (atrasadas > 0) a.push({ id: "inv-delayed", severity: "high", title: `${atrasadas} contagens atrasadas no inventário`, module: "Inventário", route: "/qualidade/inventario/contagens" });
      } catch { /* ignore */ }

      try {
        const d: DashboardOperacionalData = await getDashboardOperacional();
        m.push({ label: "Frota Desloc.", value: d.frotaEmDeslocamento, icon: <Truck className="h-4 w-4" />, route: "/frota" });
        m.push({ label: "Presentes", value: d.visitantesPresentes + d.terceirosNaUnidade, icon: <Users className="h-4 w-4" />, route: "/portaria" });

        if (d.nfsEmRisco > 0) {
          m.push({ label: "NFs Risco", value: d.nfsEmRisco, icon: <FileText className="h-4 w-4" />, route: "/nf-transito", severity: "critical" });
          a.push({ id: "nf-risk", severity: "critical", title: `${d.nfsEmRisco} notas fiscais em risco de extravio`, description: `R$ ${(d.valorEmRisco / 1000).toFixed(0)}k em valor exposto`, module: "NF Trânsito", route: "/nf-transito" });
        }
        if (d.alertasAtivos > 0) a.push({ id: "ops-alerts", severity: "medium", title: `${d.alertasAtivos} alertas operacionais ativos`, module: "Operacional", route: "/monitoramento" });
      } catch { /* ignore */ }

      setMetrics(m);
      setAlerts(a.sort((x, y) => {
        const order = { critical: 0, high: 1, medium: 2, low: 3 };
        return order[x.severity] - order[y.severity];
      }));
      setLoading(false);
    };

    void load();
  }, []);

  if (loading) {
    return (
      <div className="glass-card rounded-lg p-5 animate-pulse">
        <div className="h-4 w-48 bg-muted rounded mb-4" />
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-muted rounded" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Activity className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Resumo Executivo</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {metrics.map((m) => (
          <Link
            key={m.label}
            to={m.route}
            className={cn(
              "rounded-lg border p-3 transition-all hover:shadow-md hover:ring-1 hover:ring-primary/20",
              m.severity === "critical" && "border-destructive/40 bg-destructive/5",
              m.severity === "warn" && "border-warning/40 bg-warning/5",
              (!m.severity || m.severity === "ok") && "border-border bg-card",
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={cn(
                "p-1.5 rounded-md",
                m.severity === "critical" ? "bg-destructive/10 text-destructive" :
                  m.severity === "warn" ? "bg-warning/10 text-warning" :
                    "bg-primary/10 text-primary",
              )}>
                {m.icon}
              </span>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
            </div>
            <p className="text-xl font-bold text-foreground">{m.value}</p>
            <p className="text-xs text-muted-foreground truncate">{m.label}</p>
          </Link>
        ))}
      </div>

      {alerts.length > 0 && <AlertsPanel alerts={alerts} title="Itens que Requerem Atenção" maxItems={4} />}
    </div>
  );
};

export default ExecutiveSummaryPanel;
