import { useEffect, useMemo, useState, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck, AlertTriangle, TrendingDown, Clock, Inbox, MessageSquare, Star,
  DoorOpen, Users, Truck, Layers, FileText, Activity, Bell, MapPin, ShieldAlert, CalendarDays, Shield,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import KPICard from "@/components/KPICard";
import StatusSemaphore from "@/components/operacional/StatusSemaphore";
import { getDashboardQualidade, type DashboardQualidadeData } from "@/services/dashboard";
import { getDashboardOperacional, type DashboardOperacionalData } from "@/services/operacional";
import { getAtendimentos } from "@/services/sac";
import { getRequisicoes } from "@/services/sacRequisicoes";
import { listarOS } from "@/services/assistencia";
import { getNCs } from "@/services/nc";
import { getCurrentPapel, PAPEL_LABELS } from "@/lib/workflowOs";
import { useUxMetrics } from "@/hooks/useUxMetrics";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { getSesmtMasterDashboard } from "@/services/sesmt";

const ExecutiveSummaryPanel = lazy(() => import("@/components/dashboard/ExecutiveSummaryPanel"));

interface InboxItem {
  title: string;
  value: number;
  route: string;
}

const COLORS = [
  "hsl(220, 70%, 45%)",
  "hsl(38, 92%, 50%)",
  "hsl(152, 60%, 40%)",
  "hsl(0, 72%, 51%)",
  "hsl(280, 60%, 50%)",
  "hsl(200, 80%, 50%)",
];

const emptyData: DashboardQualidadeData = {
  garantiaRate: 0,
  totalGarantias: 0,
  totalNCs: 0,
  avgResolutionDays: 0,
  topDefeitos: [],
  ncByGravidade: [],
  garantiasByMonth: [],
  ncByCategoria: [],
};

const defaultOp: DashboardOperacionalData = {
  visitantesPresentes: 0, veiculosVisitantesPresentes: 0, terceirosNaUnidade: 0,
  frotaEmDeslocamento: 0, docasOcupadas: 0, docasTotal: 0, alertasAtivos: 0,
  nfsEmTransito: 0, nfsEmRisco: 0, nfsSemConfirmacao: 0, valorEmTransito: 0,
  valorEmRisco: 0, mediaDiasTransito: 0, filaExterna: 0, filaInterna: 0,
  veiculosParados: 0, tempoMedioPatio: 0, slaGeral: 0,
};

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardQualidadeData>(emptyData);
  const [opData, setOpData] = useState<DashboardOperacionalData>(defaultOp);
  const [inboxItems, setInboxItems] = useState<InboxItem[]>([]);
  const [sesmtSummary, setSesmtSummary] = useState({
    scoreGeral: 0,
    acoesCriticasAbertas: 0,
    inspecoesAtrasadas: 0,
    documentosVencendo: 0,
  });
  const [activeView, setActiveView] = useState("operacional");
  const papel = getCurrentPapel();
  const { trackAction } = useUxMetrics("DASHBOARD_PRINCIPAL");

  useEffect(() => {
    getDashboardQualidade()
      .then(setDashboardData)
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Falha ao carregar indicadores de qualidade.";
        toast({ title: "Erro no dashboard de qualidade", description: message, variant: "destructive" });
      });

    getDashboardOperacional()
      .then(setOpData)
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Falha ao carregar indicadores operacionais.";
        toast({ title: "Erro no dashboard operacional", description: message, variant: "destructive" });
      });

    getSesmtMasterDashboard()
      .then((result) => setSesmtSummary({
        scoreGeral: result.scoreGeral,
        acoesCriticasAbertas: result.acoesCriticasAbertas,
        inspecoesAtrasadas: result.inspecoesAtrasadas,
        documentosVencendo: result.documentosVencendo,
      }))
      .catch(() => {
        // SESMT/SST may be restricted by profile; keep dashboard resilient.
      });
  }, []);

  useEffect(() => {
    const loadInbox = async () => {
      const items: InboxItem[] = [];
      try {
        const osList = await listarOS();
        if (["ASSISTENCIA", "ADMIN", "DIRETORIA"].includes(papel))
          items.push({ title: "OS aguardando recebimento", value: osList.filter((os) => os.status === "AGUARDANDO_RECEBIMENTO").length, route: "/assistencia/os" });
        if (["INSPECAO", "ADMIN", "DIRETORIA"].includes(papel))
          items.push({ title: "OS em inspeção", value: osList.filter((os) => os.status === "EM_INSPECAO").length, route: "/assistencia/os" });
      } catch { /* sem permissão */ }
      try {
        const atendimentos = await getAtendimentos();
        if (["SAC", "ADMIN", "DIRETORIA"].includes(papel))
          items.push({ title: "SAC em aberto", value: atendimentos.filter((i) => i.status === "ABERTO" || i.status === "EM_ANALISE").length, route: "/sac/atendimentos" });
      } catch { /* sem permissão */ }
      try {
        const reqSac = await getRequisicoes();
        if (["SAC", "ADMIN", "DIRETORIA"].includes(papel))
          items.push({ title: "Requisições pendentes", value: reqSac.filter((i) => i.status === "PENDENTE" || i.status === "RASCUNHO").length, route: "/sac/requisicoes" });
      } catch { /* sem permissão */ }
      try {
        const ncs = await getNCs();
        if (["INSPECAO", "ADMIN", "DIRETORIA", "SAC"].includes(papel))
          items.push({ title: "NCs abertas", value: ncs.filter((i) => i.status === "ABERTA" || i.status === "EM_ANALISE").length, route: "/nao-conformidades" });
      } catch { /* sem permissão */ }
      setInboxItems(items.filter((item) => item.value > 0).slice(0, 6));
    };
    void loadInbox();
  }, [papel]);

  const inboxTitle = useMemo(() => `Minha Fila — ${PAPEL_LABELS[papel]}`, [papel]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Painel Operacional</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Portaria · Visitantes · Pátio · Frota · NF em Trânsito
          </p>
        </div>
        <Tabs value={activeView} onValueChange={setActiveView}>
          <TabsList>
            <TabsTrigger value="operacional">Operação</TabsTrigger>
            <TabsTrigger value="qualidade">Indicadores</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* ═══ OPERACIONAL VIEW ═══ */}
      {activeView === "operacional" && (
        <>
          {/* KPIs Operacionais */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <Link to="/portaria" className="block">
              <KPICard title="Presentes na Unidade" value={opData.visitantesPresentes + opData.terceirosNaUnidade} icon={<Users className="w-5 h-5" />} subtitle="pessoas agora" />
            </Link>
            <Link to="/visitantes" className="block">
              <KPICard title="Visitantes" value={opData.visitantesPresentes} icon={<DoorOpen className="w-5 h-5" />} subtitle="em permanência" />
            </Link>
            <Link to="/frota" className="block">
              <KPICard title="Frota em Rota" value={opData.frotaEmDeslocamento} icon={<Truck className="w-5 h-5" />} subtitle="deslocamentos" />
            </Link>
            <Link to="/patio" className="block">
              <KPICard title="Docas" value={`${opData.docasOcupadas}/${opData.docasTotal}`} icon={<Layers className="w-5 h-5" />} subtitle="ocupadas" />
            </Link>
            <Link to="/nf-transito" className="block">
              <KPICard title="NFs em Trânsito" value={opData.nfsEmTransito} icon={<FileText className="w-5 h-5" />} subtitle={`${opData.nfsEmRisco} em risco`} />
            </Link>
            <Link to="/torre-controle" className="block">
              <KPICard title="Exceções" value={opData.alertasAtivos} icon={<ShieldAlert className="w-5 h-5" />} subtitle="torre de controle" />
            </Link>
          </div>

          {/* Painel operacional detalhado */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Portaria & Visitantes */}
            <Link to="/portaria/presenca" className="glass-card rounded-lg p-5 hover:shadow-md transition-shadow block">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                <DoorOpen className="h-4 w-4 text-primary" /> Portaria & Visitantes
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Visitantes presentes</span><span className="font-semibold">{opData.visitantesPresentes}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Veículos visitantes</span><span className="font-semibold">{opData.veiculosVisitantesPresentes}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Terceiros na unidade</span><span className="font-semibold">{opData.terceirosNaUnidade}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Motoristas na fila</span><span className="font-semibold">{opData.filaExterna + opData.filaInterna}</span></div>
              </div>
            </Link>

            {/* Pátio & Logística */}
            <Link to="/patio" className="glass-card rounded-lg p-5 hover:shadow-md transition-shadow block">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                <Layers className="h-4 w-4 text-primary" /> Pátio & Logística
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Fila externa</span><span className="font-semibold">{opData.filaExterna} veículos</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Veículos parados</span><span className="font-semibold">{opData.veiculosParados}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Tempo médio pátio</span><span className="font-semibold">{opData.tempoMedioPatio} min</span></div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">SLA Geral</span>
                  <span className={`font-bold ${opData.slaGeral >= 80 ? "text-success" : opData.slaGeral >= 60 ? "text-warning" : "text-destructive"}`}>{opData.slaGeral}%</span>
                </div>
              </div>
            </Link>

            {/* NF em Trânsito */}
            <Link to="/nf-transito" className="glass-card rounded-lg p-5 hover:shadow-md transition-shadow block">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                <FileText className="h-4 w-4 text-primary" /> NF em Trânsito
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Em trânsito</span><span className="font-semibold">{opData.nfsEmTransito}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Em risco</span><span className="font-semibold text-destructive">{opData.nfsEmRisco}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Sem confirmação</span><span className="font-semibold text-warning">{opData.nfsSemConfirmacao}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Valor em risco</span><span className="font-semibold text-destructive">R$ {(opData.valorEmRisco / 1000).toFixed(0)}k</span></div>
              </div>
            </Link>

            <Link to="/sesmt/visao-executiva/painel-mestre" className="glass-card rounded-lg p-5 hover:shadow-md transition-shadow block">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                <Shield className="h-4 w-4 text-primary" /> SESMT / SST
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Score geral</span><span className="font-semibold">{sesmtSummary.scoreGeral}%</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Acoes criticas</span><span className="font-semibold text-destructive">{sesmtSummary.acoesCriticasAbertas}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Inspecoes atrasadas</span><span className="font-semibold">{sesmtSummary.inspecoesAtrasadas}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Documentos vencendo</span><span className="font-semibold">{sesmtSummary.documentosVencendo}</span></div>
              </div>
            </Link>
          </div>

          {/* Inbox */}
          {inboxItems.length > 0 && (
            <div className="glass-card rounded-lg p-5">
              <div className="flex items-center gap-2 mb-3">
                <Inbox className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">{inboxTitle}</h3>
              </div>
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                {inboxItems.map((item) => (
                  <Link
                    key={`${item.route}-${item.title}`}
                    to={item.route}
                    className="rounded-md border border-border px-3 py-2 hover:bg-muted/40 transition-colors"
                    onClick={() => trackAction("OPEN_INBOX_ITEM", { route: item.route, title: item.title })}
                  >
                    <p className="text-xs text-muted-foreground">{item.title}</p>
                    <p className="text-xl font-semibold text-foreground">{item.value}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Satisfação SAC (if available) */}
          {dashboardData.avaliacaoSAC && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Satisfação SAC</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard title="Pesquisas Enviadas" value={dashboardData.avaliacaoSAC.totalPesquisasEnviadas} icon={<MessageSquare className="w-5 h-5" />} />
                <KPICard title="Pesquisas Respondidas" value={dashboardData.avaliacaoSAC.totalPesquisasRespondidas} icon={<MessageSquare className="w-5 h-5" />} />
                <KPICard title="Taxa de Resposta" value={`${dashboardData.avaliacaoSAC.taxaResposta}%`} icon={<TrendingDown className="w-5 h-5" />} />
                <KPICard title="Nota Média" value={dashboardData.avaliacaoSAC.notaMedia} icon={<Star className="w-5 h-5" />} />
              </div>
            </div>
          )}
        </>
      )}

      {/* ═══ QUALIDADE VIEW ═══ */}
      {activeView === "qualidade" && (
        <>
          <Suspense fallback={<div className="glass-card rounded-lg p-5 animate-pulse"><div className="h-4 w-48 bg-muted rounded mb-4" /><div className="grid grid-cols-3 gap-3">{[1,2,3].map(i=><div key={i} className="h-16 bg-muted rounded" />)}</div></div>}>
            <ExecutiveSummaryPanel />
          </Suspense>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard title="Taxa de Garantia" value={`${dashboardData.garantiaRate}%`} icon={<TrendingDown className="w-5 h-5" />} subtitle="vs. mês anterior" />
            <KPICard title="Garantias Abertas" value={dashboardData.totalGarantias} icon={<ShieldCheck className="w-5 h-5" />} subtitle="últimos 6 meses" />
            <KPICard title="NCs Ativas" value={dashboardData.totalNCs} icon={<AlertTriangle className="w-5 h-5" />} subtitle="requerem atenção" />
            <KPICard title="Tempo Médio Resolução" value={`${dashboardData.avgResolutionDays}d`} icon={<Clock className="w-5 h-5" />} subtitle="dias" />
          </div>

          {/* Inbox */}
          {inboxItems.length > 0 && (
            <div className="glass-card rounded-lg p-5">
              <div className="flex items-center gap-2 mb-3">
                <Inbox className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">{inboxTitle}</h3>
              </div>
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                {inboxItems.map((item) => (
                  <Link key={`${item.route}-${item.title}`} to={item.route} className="rounded-md border border-border px-3 py-2 hover:bg-muted/40 transition-colors">
                    <p className="text-xs text-muted-foreground">{item.title}</p>
                    <p className="text-xl font-semibold text-foreground">{item.value}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {dashboardData.avaliacaoSAC && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Satisfação SAC</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="glass-card rounded-lg p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-4">Evolução da Nota por Período</h3>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dashboardData.avaliacaoSAC.evolucaoNotaPorPeriodo}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="periodo" />
                        <YAxis domain={[0, 5]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="notaMedia" stroke="hsl(var(--primary))" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="glass-card rounded-lg p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-4">Distribuição de Notas</h3>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dashboardData.avaliacaoSAC.distribuicaoNota}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="glass-card rounded-lg p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Top Defeitos de Garantia</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashboardData.topDefeitos} layout="vertical" margin={{ left: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={75} />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="glass-card rounded-lg p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">NCs por Gravidade</h3>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={dashboardData.ncByGravidade} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value">
                      {dashboardData.ncByGravidade.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="glass-card rounded-lg p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Tendência de Garantias (6 meses)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dashboardData.garantiasByMonth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ fill: "hsl(var(--accent))", r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="glass-card rounded-lg p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">NCs por Categoria</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashboardData.ncByCategoria}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
