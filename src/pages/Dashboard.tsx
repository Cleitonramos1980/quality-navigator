import { useEffect, useMemo, useState, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, AlertTriangle, TrendingDown, Clock, Inbox, MessageSquare, Star } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import KPICard from "@/components/KPICard";
import { getDashboardQualidade, type DashboardQualidadeData } from "@/services/dashboard";
import { getAtendimentos } from "@/services/sac";
import { getRequisicoes } from "@/services/sacRequisicoes";
import { listarOS } from "@/services/assistencia";
import { getNCs } from "@/services/nc";
import { getCurrentPapel, PAPEL_LABELS } from "@/lib/workflowOs";
import { useUxMetrics } from "@/hooks/useUxMetrics";

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

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardQualidadeData>(emptyData);
  const [inboxItems, setInboxItems] = useState<InboxItem[]>([]);
  const papel = getCurrentPapel();
  const { trackAction } = useUxMetrics("DASHBOARD_QUALIDADE");

  useEffect(() => {
    getDashboardQualidade().then(setDashboardData).catch(() => undefined);
  }, []);

  useEffect(() => {
    const loadInbox = async () => {
      const items: InboxItem[] = [];

      try {
        const osList = await listarOS();
        if (papel === "ASSISTENCIA" || papel === "ADMIN" || papel === "DIRETORIA") {
          items.push({
            title: "OS aguardando recebimento",
            value: osList.filter((os) => os.status === "AGUARDANDO_RECEBIMENTO").length,
            route: "/assistencia/os",
          });
        }
        if (papel === "INSPECAO" || papel === "ADMIN" || papel === "DIRETORIA") {
          items.push({
            title: "OS em inspeção",
            value: osList.filter((os) => os.status === "EM_INSPECAO").length,
            route: "/assistencia/os",
          });
        }
        if (papel === "REPARO" || papel === "ADMIN" || papel === "DIRETORIA") {
          items.push({
            title: "OS em reparo",
            value: osList.filter((os) => os.status === "EM_REPARO").length,
            route: "/assistencia/os",
          });
        }
        if (papel === "VALIDACAO" || papel === "ADMIN" || papel === "DIRETORIA") {
          items.push({
            title: "OS aguardando validação",
            value: osList.filter((os) => os.status === "AGUARDANDO_VALIDACAO").length,
            route: "/assistencia/os",
          });
        }
      } catch {
        // Perfil sem permissão para assistência.
      }

      try {
        const atendimentos = await getAtendimentos();
        if (papel === "SAC" || papel === "ADMIN" || papel === "DIRETORIA") {
          items.push({
            title: "SAC em aberto",
            value: atendimentos.filter((item) => item.status === "ABERTO" || item.status === "EM_ANALISE").length,
            route: "/sac/atendimentos",
          });
        }
      } catch {
        // Perfil sem permissão SAC.
      }

      try {
        const reqSac = await getRequisicoes();
        if (papel === "SAC" || papel === "ADMIN" || papel === "DIRETORIA") {
          items.push({
            title: "Requisições pendentes",
            value: reqSac.filter((item) => item.status === "PENDENTE" || item.status === "RASCUNHO").length,
            route: "/sac/requisicoes",
          });
        }
      } catch {
        // Perfil sem permissão SAC.
      }

      try {
        const ncs = await getNCs();
        if (papel === "INSPECAO" || papel === "ADMIN" || papel === "DIRETORIA" || papel === "SAC") {
          items.push({
            title: "NCs abertas",
            value: ncs.filter((item) => item.status === "ABERTA" || item.status === "EM_ANALISE").length,
            route: "/nao-conformidades",
          });
        }
      } catch {
        // Perfil sem permissão Qualidade.
      }

      setInboxItems(items.filter((item) => item.value > 0).slice(0, 6));
    };

    void loadInbox();
  }, [papel]);

  const inboxTitle = useMemo(() => `Minha Fila — ${PAPEL_LABELS[papel]}`, [papel]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard da Qualidade</h1>
        <p className="text-sm text-muted-foreground mt-1">Visão geral dos indicadores de qualidade</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Taxa de Garantia" value={`${dashboardData.garantiaRate}%`} icon={<TrendingDown className="w-5 h-5" />} subtitle="vs. mês anterior" />
        <KPICard title="Garantias Abertas" value={dashboardData.totalGarantias} icon={<ShieldCheck className="w-5 h-5" />} subtitle="últimos 6 meses" />
        <KPICard title="NCs Ativas" value={dashboardData.totalNCs} icon={<AlertTriangle className="w-5 h-5" />} subtitle="requerem atenção" />
        <KPICard title="Tempo Médio Resolução" value={`${dashboardData.avgResolutionDays}d`} icon={<Clock className="w-5 h-5" />} subtitle="dias" />
      </div>

      <div className="glass-card rounded-lg p-5">
        <div className="flex items-center gap-2 mb-3">
          <Inbox className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">{inboxTitle}</h3>
        </div>
        {inboxItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma pendência crítica no momento.</p>
        ) : (
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
        )}
      </div>

      {dashboardData.avaliacaoSAC && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Satisfação SAC</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Pesquisas Enviadas"
              value={dashboardData.avaliacaoSAC.totalPesquisasEnviadas}
              icon={<MessageSquare className="w-5 h-5" />}
            />
            <KPICard
              title="Pesquisas Respondidas"
              value={dashboardData.avaliacaoSAC.totalPesquisasRespondidas}
              icon={<MessageSquare className="w-5 h-5" />}
            />
            <KPICard
              title="Taxa de Resposta"
              value={`${dashboardData.avaliacaoSAC.taxaResposta}%`}
              icon={<TrendingDown className="w-5 h-5" />}
            />
            <KPICard
              title="Nota Média"
              value={dashboardData.avaliacaoSAC.notaMedia}
              icon={<Star className="w-5 h-5" />}
            />
          </div>

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
    </div>
  );
};

export default Dashboard;
