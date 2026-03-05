import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Wrench, ClipboardList, Package, BarChart3, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getDashboardCounters, listarOS, listarReqAssistencia } from "@/services/assistencia";
import { OS_STATUS_LABELS, OS_STATUS_COLORS, OS_PRIORIDADE_COLORS, OS_PRIORIDADE_LABELS, REQ_ASSIST_STATUS_LABELS, REQ_ASSIST_STATUS_COLORS } from "@/types/assistencia";
import type { OrdemServico, RequisicaoAssistencia } from "@/types/assistencia";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const CHART_COLORS = [
  "hsl(200, 80%, 50%)",
  "hsl(38, 92%, 50%)",
  "hsl(152, 60%, 40%)",
  "hsl(220, 70%, 45%)",
  "hsl(0, 72%, 51%)",
];

const AssistenciaDashboardPage = () => {
  const navigate = useNavigate();
  const [counters, setCounters] = useState<Awaited<ReturnType<typeof getDashboardCounters>> | null>(null);
  const [osList, setOsList] = useState<OrdemServico[]>([]);
  const [reqList, setReqList] = useState<RequisicaoAssistencia[]>([]);

  useEffect(() => {
    getDashboardCounters().then(setCounters);
    listarOS().then(setOsList);
    listarReqAssistencia().then(setReqList);
  }, []);

  if (!counters) return null;

  const plantaData = Object.entries(counters.osPorPlanta).map(([name, value]) => ({ name, value }));
  const osAtivas = osList.filter((o) => !["CONCLUIDA", "ENCERRADA", "CANCELADA"].includes(o.status)).slice(0, 5);
  const reqPendentes = reqList.filter((r) => !["ATENDIDA", "NEGADA"].includes(r.status)).slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Assistência Técnica</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Dashboard operacional</p>
        </div>
        <Button onClick={() => navigate("/assistencia/os")} className="gap-2">
          <ClipboardList className="w-4 h-4" /> Ordens de Serviço
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "OS Ativas", value: counters.osAbertas, icon: Wrench, color: "text-info" },
          { label: "OS Concluídas", value: counters.osConcluidas, icon: ClipboardList, color: "text-success" },
          { label: "OS Canceladas", value: counters.osCanceladas, icon: ClipboardList, color: "text-destructive" },
          { label: "Req. Pendentes", value: counters.reqPendentes, icon: Package, color: "text-warning" },
          { label: "Req. Atendidas", value: counters.reqAtendidas, icon: Package, color: "text-success" },
          { label: "Consumos", value: counters.consumoTotal, icon: BarChart3, color: "text-primary" },
        ].map((kpi) => (
          <Card key={kpi.label} className="glass-card">
            <CardContent className="pt-4 pb-3 px-4">
              <div className="flex items-center justify-between mb-1">
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* OS por Planta */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">OS por Planta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={plantaData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {plantaData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* OS por Status */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">OS por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(counters.osPorStatus)
                .filter(([, v]) => v > 0)
                .map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between px-3 py-2 rounded-md bg-muted/50">
                    <span className="text-xs text-muted-foreground">{OS_STATUS_LABELS[status as keyof typeof OS_STATUS_LABELS]}</span>
                    <Badge variant="secondary" className="text-xs">{count}</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* OS Ativas */}
        <Card className="glass-card">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Últimas OS Ativas</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/assistencia/os")} className="text-xs gap-1">
              Ver todas <ArrowRight className="w-3 h-3" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">ID</TableHead>
                  <TableHead className="text-xs">Cliente</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Prioridade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {osAtivas.map((os) => (
                  <TableRow key={os.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/assistencia/os/${os.id}`)}>
                    <TableCell className="text-xs font-mono">{os.id}</TableCell>
                    <TableCell className="text-xs">{os.clienteNome}</TableCell>
                    <TableCell><Badge className={`text-[10px] ${OS_STATUS_COLORS[os.status]}`}>{OS_STATUS_LABELS[os.status]}</Badge></TableCell>
                    <TableCell><Badge className={`text-[10px] ${OS_PRIORIDADE_COLORS[os.prioridade]}`}>{OS_PRIORIDADE_LABELS[os.prioridade]}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Req Pendentes */}
        <Card className="glass-card">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Requisições em Andamento</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/assistencia/requisicoes")} className="text-xs gap-1">
              Ver todas <ArrowRight className="w-3 h-3" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">ID</TableHead>
                  <TableHead className="text-xs">OS</TableHead>
                  <TableHead className="text-xs">CD → Destino</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reqPendentes.map((r) => (
                  <TableRow key={r.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="text-xs font-mono">{r.id}</TableCell>
                    <TableCell className="text-xs font-mono">{r.osId}</TableCell>
                    <TableCell className="text-xs">{r.cdResponsavel} → {r.plantaDestino}</TableCell>
                    <TableCell><Badge className={`text-[10px] ${REQ_ASSIST_STATUS_COLORS[r.status]}`}>{REQ_ASSIST_STATUS_LABELS[r.status]}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AssistenciaDashboardPage;
