import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import KPICard from "@/components/KPICard";
import { getSACDashboard, getAtendimentos } from "@/services/sac";
import { getRequisicaoDashboardData } from "@/services/sacRequisicoes";
import { REQUISICAO_PRIORIDADE_COLORS, REQUISICAO_PRIORIDADE_LABELS } from "@/types/sacRequisicao";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Headphones, Clock, UserCheck, CheckCircle, Archive, Package, PackageCheck, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

const colorByIndex = (i: number) => `hsl(${(i * 67) % 360}, 65%, 50%)`;

const SACDashboardPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dashboard, setDashboard] = useState<any>({ porStatus: [], porTipo: [], porPlanta: [], porDia: [] });
  const [reqData, setReqData] = useState<any>({ pendentes: 0, atendidasMes: 0, porPlanta: [], ultimasPendentes: [] });
  const [atendimentos, setAtendimentos] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const [dashboardRes, reqRes, atendRes] = await Promise.allSettled([
        getSACDashboard(),
        getRequisicaoDashboardData(),
        getAtendimentos(),
      ]);

      if (cancelled) return;

      if (dashboardRes.status === "fulfilled") {
        setDashboard(dashboardRes.value);
      } else {
        const message = dashboardRes.reason instanceof Error ? dashboardRes.reason.message : "Falha ao carregar dashboard SAC.";
        toast({ title: "Erro no dashboard SAC", description: message, variant: "destructive" });
      }

      if (reqRes.status === "fulfilled") {
        setReqData(reqRes.value);
      } else {
        const message = reqRes.reason instanceof Error ? reqRes.reason.message : "Falha ao carregar dashboard de requisições.";
        toast({ title: "Erro nas requisições", description: message, variant: "destructive" });
      }

      if (atendRes.status === "fulfilled") {
        setAtendimentos(atendRes.value);
      } else {
        const message = atendRes.reason instanceof Error ? atendRes.reason.message : "Falha ao carregar atendimentos.";
        toast({ title: "Erro ao carregar atendimentos", description: message, variant: "destructive" });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [toast]);

  const abertos = useMemo(() => atendimentos.filter((a) => a.status === "ABERTO"), [atendimentos]);
  const aguardando = useMemo(() => atendimentos.filter((a) => a.status === "AGUARDANDO_CLIENTE"), [atendimentos]);
  const maisAntigos = [...abertos].sort((a, b) => a.abertoAt.localeCompare(b.abertoAt)).slice(0, 10);
  const aguardandoTop = [...aguardando].sort((a, b) => a.abertoAt.localeCompare(b.abertoAt)).slice(0, 10);
  const porDia = dashboard.porDia?.map((d: any) => ({ dia: d.date, count: d.value })) ?? [];
  const getKpi = (status: string) => dashboard.porStatus?.find((s: any) => s.name === status)?.value ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard SAC</h1>
        <p className="text-sm text-muted-foreground">Visão geral dos atendimentos ao cliente</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KPICard title="Abertos" value={getKpi("ABERTO")} icon={<Headphones className="w-5 h-5" />} />
        <KPICard title="Em Análise" value={getKpi("EM_ANALISE")} icon={<Clock className="w-5 h-5" />} />
        <KPICard title="Aguard. Cliente" value={getKpi("AGUARDANDO_CLIENTE")} icon={<UserCheck className="w-5 h-5" />} />
        <KPICard title="Resolvidos" value={getKpi("RESOLVIDO")} icon={<CheckCircle className="w-5 h-5" />} />
        <KPICard title="Encerrados" value={getKpi("ENCERRADO")} icon={<Archive className="w-5 h-5" />} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card><CardHeader className="pb-2"><CardTitle className="text-base">Chamados por Status</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={250}><BarChart data={dashboard.porStatus}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-base">Chamados por Tipo</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={250}><PieChart><Pie data={dashboard.porTipo} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>{dashboard.porTipo?.map((_: any, i: number) => <Cell key={i} fill={colorByIndex(i)} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-base">Chamados por Planta</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={250}><BarChart data={dashboard.porPlanta}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-base">Chamados por Dia</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={250}><LineChart data={porDia}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="dia" /><YAxis /><Tooltip /><Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} /></LineChart></ResponsiveContainer></CardContent></Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card><CardHeader className="pb-2"><CardTitle className="text-base">Chamados Abertos Mais Antigos</CardTitle></CardHeader><CardContent>{maisAntigos.length === 0 ? <p className="text-sm text-muted-foreground py-4 text-center">Nenhum chamado aberto</p> : <div className="space-y-2">{maisAntigos.map((a) => <div key={a.id} className="flex items-center justify-between py-2 border-b border-border last:border-0"><div><span className="text-sm font-mono font-medium text-foreground">{a.id}</span><p className="text-xs text-muted-foreground">{a.clienteNome}</p></div><span className="text-xs text-muted-foreground">{a.abertoAt}</span></div>)}</div>}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-base">Aguardando Cliente</CardTitle></CardHeader><CardContent>{aguardandoTop.length === 0 ? <p className="text-sm text-muted-foreground py-4 text-center">Nenhum chamado aguardando</p> : <div className="space-y-2">{aguardandoTop.map((a) => <div key={a.id} className="flex items-center justify-between py-2 border-b border-border last:border-0"><div><span className="text-sm font-mono font-medium text-foreground">{a.id}</span><p className="text-xs text-muted-foreground">{a.clienteNome}</p></div><span className="text-xs text-muted-foreground">{a.atualizadoAt}</span></div>)}</div>}</CardContent></Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Requisições de Material</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <KPICard title="Req. Pendentes" value={reqData.pendentes} icon={<Package className="w-5 h-5" />} />
          <KPICard title="Req. Atendidas (mês)" value={reqData.atendidasMes} icon={<PackageCheck className="w-5 h-5" />} />
          <Card><CardHeader className="pb-2"><CardTitle className="text-base">Requisições por Planta</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={100}><BarChart data={reqData.porPlanta} layout="vertical"><XAxis type="number" /><YAxis type="category" dataKey="name" width={40} /><Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} /></BarChart></ResponsiveContainer></CardContent></Card>
        </div>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Últimas Requisições Pendentes</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/sac/requisicoes")}>Ir para requisições <ArrowRight className="w-4 h-4 ml-1" /></Button>
          </CardHeader>
          <CardContent>
            {reqData.ultimasPendentes.length === 0 ? <p className="text-sm text-muted-foreground py-4 text-center">Nenhuma requisição pendente</p> : <div className="space-y-2">{reqData.ultimasPendentes.map((r: any) => <div key={r.id} className="flex items-center justify-between py-2 border-b border-border last:border-0"><div className="flex items-center gap-3"><span className="text-sm font-mono font-medium text-foreground">{r.id}</span><span className="text-sm text-muted-foreground">{r.clienteNome}</span><span className={cn("px-2 py-0.5 rounded text-xs font-medium", REQUISICAO_PRIORIDADE_COLORS[r.prioridade])}>{REQUISICAO_PRIORIDADE_LABELS[r.prioridade]}</span></div><span className="text-xs text-muted-foreground">{r.criadoAt}</span></div>)}</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SACDashboardPage;
