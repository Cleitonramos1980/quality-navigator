import { Users, Shield, ScrollText, Settings as SettingsIcon, Activity, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { getUsuarios, getAuditLog, getParametros, getPerfis } from "@/services/admin";
import { listUxMetrics, type UxMetricEntry, type UxMetricEventType } from "@/services/uxMetrics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const METRIC_TYPE_LABEL: Record<UxMetricEventType, string> = {
  PAGE_VIEW: "Page View",
  ACTION: "Ação",
  ERROR: "Erro",
  SCREEN_TIME: "Tempo de Tela",
};

const AdminPage = () => {
  const navigate = useNavigate();
  const [countUsuarios, setCountUsuarios] = useState<number | null>(null);
  const [countPerfis, setCountPerfis] = useState<number | null>(null);
  const [countLog, setCountLog] = useState<number | null>(null);
  const [countParams, setCountParams] = useState<number | null>(null);

  const [uxMetrics, setUxMetrics] = useState<UxMetricEntry[]>([]);
  const [uxLoading, setUxLoading] = useState(false);
  const [uxTypeFilter, setUxTypeFilter] = useState<"ALL" | UxMetricEventType>("ALL");
  const [uxScreenFilter, setUxScreenFilter] = useState("");

  useEffect(() => {
    getUsuarios().then((u) => setCountUsuarios(u.length));
    getPerfis().then((p) => setCountPerfis(p.length));
    getAuditLog().then((l) => setCountLog(l.length));
    getParametros().then((p) => setCountParams(p.length));
    void loadUxMetrics();
  }, []);

  const loadUxMetrics = async () => {
    setUxLoading(true);
    try {
      const data = await listUxMetrics(150);
      setUxMetrics(data);
    } finally {
      setUxLoading(false);
    }
  };

  const sections = useMemo(
    () => [
      { title: "Usuários", desc: "Gerenciar usuários do sistema", icon: Users, count: countUsuarios, path: "/administracao/usuarios" },
      { title: "Perfis de Acesso", desc: "Configurar roles e permissões (RBAC)", icon: Shield, count: countPerfis, path: "/administracao/perfis" },
      { title: "Log de Auditoria", desc: "Registro de todas as ações do sistema", icon: ScrollText, count: countLog, path: "/administracao/log-auditoria" },
      { title: "Parâmetros", desc: "Configurações gerais do sistema", icon: SettingsIcon, count: countParams, path: "/administracao/parametros" },
    ],
    [countUsuarios, countPerfis, countLog, countParams],
  );

  const filteredUxMetrics = useMemo(() => {
    return uxMetrics.filter((metric) => {
      if (uxTypeFilter !== "ALL" && metric.type !== uxTypeFilter) return false;
      if (uxScreenFilter && !metric.screen.toLowerCase().includes(uxScreenFilter.toLowerCase())) return false;
      return true;
    });
  }, [uxMetrics, uxTypeFilter, uxScreenFilter]);

  const uxSummary = useMemo(() => {
    const total = uxMetrics.length;
    const errors = uxMetrics.filter((metric) => metric.type === "ERROR").length;
    const actions = uxMetrics.filter((metric) => metric.type === "ACTION").length;
    const screenTimes = uxMetrics.filter((metric) => metric.type === "SCREEN_TIME" && typeof metric.durationMs === "number");
    const avgScreenTimeMs = screenTimes.length
      ? Math.round(screenTimes.reduce((acc, metric) => acc + (metric.durationMs || 0), 0) / screenTimes.length)
      : 0;
    return { total, errors, actions, avgScreenTimeMs };
  }, [uxMetrics]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Administração</h1>
        <p className="text-sm text-muted-foreground mt-1">Gestão de usuários, permissões e configurações</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map((s) => (
          <div
            key={s.title}
            onClick={() => navigate(s.path)}
            className="glass-card rounded-lg p-5 hover:shadow-md transition-shadow cursor-pointer group"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                <s.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-foreground">{s.title}</h3>
                  {typeof s.count === "number" && <span className="text-xs font-mono text-muted-foreground">{s.count}</span>}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{s.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-lg p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            <div>
              <h3 className="font-medium text-foreground">Métricas UX</h3>
              <p className="text-xs text-muted-foreground">Eventos de usabilidade coletados em runtime</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => { void loadUxMetrics(); }} disabled={uxLoading} className="gap-2">
            <RefreshCw className={`w-3.5 h-3.5 ${uxLoading ? "animate-spin" : ""}`} />
            {uxLoading ? "Atualizando..." : "Atualizar"}
          </Button>
        </div>

        <div className="grid sm:grid-cols-4 gap-3">
          <div className="rounded-md border border-border p-3">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-lg font-semibold text-foreground">{uxSummary.total}</p>
          </div>
          <div className="rounded-md border border-border p-3">
            <p className="text-xs text-muted-foreground">Ações</p>
            <p className="text-lg font-semibold text-foreground">{uxSummary.actions}</p>
          </div>
          <div className="rounded-md border border-border p-3">
            <p className="text-xs text-muted-foreground">Erros</p>
            <p className="text-lg font-semibold text-destructive">{uxSummary.errors}</p>
          </div>
          <div className="rounded-md border border-border p-3">
            <p className="text-xs text-muted-foreground">Tempo Médio de Tela</p>
            <p className="text-lg font-semibold text-foreground">{uxSummary.avgScreenTimeMs} ms</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Select value={uxTypeFilter} onValueChange={(value) => setUxTypeFilter(value as "ALL" | UxMetricEventType)}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os tipos</SelectItem>
              <SelectItem value="PAGE_VIEW">Page View</SelectItem>
              <SelectItem value="ACTION">Ação</SelectItem>
              <SelectItem value="ERROR">Erro</SelectItem>
              <SelectItem value="SCREEN_TIME">Tempo de Tela</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Filtrar por tela..."
            className="max-w-xs"
            value={uxScreenFilter}
            onChange={(event) => setUxScreenFilter(event.target.value)}
          />
        </div>

        <div className="border rounded-lg overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Data/Hora</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Tela</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Sucesso</TableHead>
                <TableHead>Duração</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUxMetrics.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhuma métrica encontrada para os filtros aplicados.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUxMetrics.slice(0, 80).map((metric) => (
                  <TableRow key={metric.id}>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {metric.createdAt ? new Date(metric.createdAt).toLocaleString("pt-BR") : "-"}
                    </TableCell>
                    <TableCell className="text-xs font-medium">{METRIC_TYPE_LABEL[metric.type]}</TableCell>
                    <TableCell className="text-xs font-mono">{metric.screen}</TableCell>
                    <TableCell className="text-xs">{metric.action || "-"}</TableCell>
                    <TableCell className="text-xs">
                      {typeof metric.success === "boolean" ? (metric.success ? "Sim" : "Não") : "-"}
                    </TableCell>
                    <TableCell className="text-xs">{typeof metric.durationMs === "number" ? `${metric.durationMs} ms` : "-"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
