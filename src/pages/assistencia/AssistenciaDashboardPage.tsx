import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Wrench, ClipboardList, Package, BarChart3, ArrowRight, ShieldAlert, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDashboardCounters, listarOS, listarReqAssistencia } from "@/services/assistencia";
import { OS_STATUS_LABELS, OS_STATUS_COLORS, OS_PRIORIDADE_COLORS, OS_PRIORIDADE_LABELS, REQ_ASSIST_STATUS_LABELS, REQ_ASSIST_STATUS_COLORS } from "@/types/assistencia";
import type { OrdemServico, RequisicaoAssistencia } from "@/types/assistencia";
import { getCurrentPapel, FILA_POR_PAPEL, PAPEL_LABELS, canCreateOS } from "@/lib/workflowOs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useToast } from "@/components/ui/use-toast";

const CHART_COLORS = [
  "hsl(200, 80%, 50%)",
  "hsl(38, 92%, 50%)",
  "hsl(152, 60%, 40%)",
  "hsl(220, 70%, 45%)",
  "hsl(0, 72%, 51%)",
];

const AssistenciaDashboardPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [counters, setCounters] = useState<Awaited<ReturnType<typeof getDashboardCounters>> | null>(null);
  const [osList, setOsList] = useState<OrdemServico[]>([]);
  const [reqList, setReqList] = useState<RequisicaoAssistencia[]>([]);
  const [activeTab, setActiveTab] = useState("fila");

  const papel = getCurrentPapel();
  const filaStatuses = FILA_POR_PAPEL[papel];
  const isAlmox = papel === "ALMOX_CD";
  const isDiretoria = papel === "DIRETORIA";
  const isAdmin = papel === "ADMIN";

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const [countersRes, osRes, reqRes] = await Promise.allSettled([
        getDashboardCounters(),
        listarOS(),
        listarReqAssistencia(),
      ]);

      if (cancelled) return;

      if (countersRes.status === "fulfilled") {
        setCounters(countersRes.value);
      } else {
        const message = countersRes.reason instanceof Error ? countersRes.reason.message : "Falha ao carregar indicadores.";
        toast({ title: "Erro no dashboard", description: message, variant: "destructive" });
      }

      if (osRes.status === "fulfilled") {
        setOsList(osRes.value);
      } else {
        const message = osRes.reason instanceof Error ? osRes.reason.message : "Falha ao carregar ordens de serviço.";
        toast({ title: "Erro ao carregar OS", description: message, variant: "destructive" });
      }

      if (reqRes.status === "fulfilled") {
        setReqList(reqRes.value);
      } else {
        const message = reqRes.reason instanceof Error ? reqRes.reason.message : "Falha ao carregar requisições.";
        toast({ title: "Erro ao carregar requisições", description: message, variant: "destructive" });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [toast]);

  if (!counters) return null;

  const plantaData = Object.entries(counters.osPorPlanta).map(([name, value]) => ({ name, value }));

  // Minha fila: OS filtradas por status do papel
  const minhaFila = (filaStatuses.length > 0)
    ? osList.filter((o) => filaStatuses.includes(o.status))
    : (isAdmin || isDiretoria) ? osList.filter((o) => !["ENCERRADA", "CANCELADA"].includes(o.status)) : [];

  // Almox fila: requisições pendentes
  const reqFila = isAlmox
    ? reqList.filter((r) => ["PENDENTE", "EM_SEPARACAO", "EM_TRANSFERENCIA"].includes(r.status))
    : [];

  const osAtivas = osList.filter((o) => !["CONCLUIDA", "ENCERRADA", "CANCELADA"].includes(o.status)).slice(0, 5);
  const reqPendentes = reqList.filter((r) => !["ATENDIDA", "NEGADA"].includes(r.status)).slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Assistência Técnica</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-sm text-muted-foreground">Dashboard operacional</p>
            <Badge variant="outline" className="text-[10px] gap-1">
              <User className="w-3 h-3" />
              {PAPEL_LABELS[papel]}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          {canCreateOS() && (
            <Button onClick={() => navigate("/assistencia/os/nova")} variant="outline" className="gap-2">
              <Wrench className="w-4 h-4" /> Nova OS
            </Button>
          )}
          <Button onClick={() => navigate("/assistencia/os")} className="gap-2">
            <ClipboardList className="w-4 h-4" /> Ordens de Serviço
          </Button>
        </div>
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

      {/* Tabs: Minha Fila / Visão Geral */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="fila" className="gap-1">
            <ShieldAlert className="w-3.5 h-3.5" /> Minha Fila
          </TabsTrigger>
          <TabsTrigger value="geral" className="gap-1">
            <BarChart3 className="w-3.5 h-3.5" /> Visão Geral
          </TabsTrigger>
        </TabsList>

        {/* Minha Fila */}
        <TabsContent value="fila" className="space-y-6">
          {isAlmox ? (
            // Almox: mostra requisições
            <Card className="glass-card">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Minhas Requisições Pendentes</CardTitle>
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
                      <TableHead className="text-xs">Itens</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reqFila.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground text-xs py-6">Nenhuma requisição pendente</TableCell></TableRow>
                    ) : reqFila.map((r) => (
                      <TableRow key={r.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="text-xs font-mono">{r.id}</TableCell>
                        <TableCell className="text-xs font-mono">{r.osId}</TableCell>
                        <TableCell className="text-xs">{r.cdResponsavel} → {r.plantaDestino}</TableCell>
                        <TableCell className="text-xs">{r.itens.length} item(ns)</TableCell>
                        <TableCell><Badge className={`text-[10px] ${REQ_ASSIST_STATUS_COLORS[r.status]}`}>{REQ_ASSIST_STATUS_LABELS[r.status]}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            // Outros papéis: mostra OS da fila
            <Card className="glass-card">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {isDiretoria || isAdmin ? "Todas as OS Ativas" : `OS aguardando ação — ${PAPEL_LABELS[papel]}`}
                </CardTitle>
                <div className="flex items-center gap-1">
                  {filaStatuses.length > 0 && filaStatuses.map((s) => (
                    <Badge key={s} variant="outline" className="text-[10px]">{OS_STATUS_LABELS[s]}</Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">ID</TableHead>
                      <TableHead className="text-xs">Cliente</TableHead>
                      <TableHead className="text-xs">Planta</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs">Prioridade</TableHead>
                      <TableHead className="text-xs">Abertura</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {minhaFila.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground text-xs py-6">Nenhuma OS na sua fila</TableCell></TableRow>
                    ) : minhaFila.map((os) => (
                      <TableRow key={os.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/assistencia/os/${os.id}`)}>
                        <TableCell className="text-xs font-mono">{os.id}</TableCell>
                        <TableCell className="text-xs">{os.clienteNome}</TableCell>
                        <TableCell className="text-xs">{os.planta}</TableCell>
                        <TableCell><Badge className={`text-[10px] ${OS_STATUS_COLORS[os.status]}`}>{OS_STATUS_LABELS[os.status]}</Badge></TableCell>
                        <TableCell><Badge className={`text-[10px] ${OS_PRIORIDADE_COLORS[os.prioridade]}`}>{OS_PRIORIDADE_LABELS[os.prioridade]}</Badge></TableCell>
                        <TableCell className="text-xs text-muted-foreground">{os.dataAbertura}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Visão Geral */}
        <TabsContent value="geral" className="space-y-6">
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AssistenciaDashboardPage;

