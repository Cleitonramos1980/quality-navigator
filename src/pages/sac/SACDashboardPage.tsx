import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import KPICard from "@/components/KPICard";
import StatusBadge from "@/components/StatusBadge";
import { sacDashboardData, mockAtendimentos } from "@/data/mockSACData";
import { SAC_STATUS_LABELS } from "@/types/sac";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import { Headphones, Clock, UserCheck, CheckCircle, Archive } from "lucide-react";

const COLORS = [
  "hsl(200, 80%, 50%)", "hsl(38, 92%, 50%)", "hsl(280, 60%, 50%)",
  "hsl(152, 60%, 40%)", "hsl(220, 15%, 60%)",
];

const SACDashboardPage = () => {
  const abertos = mockAtendimentos.filter((a) => a.status === "ABERTO");
  const aguardando = mockAtendimentos.filter((a) => a.status === "AGUARDANDO_CLIENTE");

  // Top 10 mais antigos abertos
  const maisAntigos = [...abertos].sort((a, b) => a.abertoAt.localeCompare(b.abertoAt)).slice(0, 10);
  const aguardandoTop = [...aguardando].sort((a, b) => a.abertoAt.localeCompare(b.abertoAt)).slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard SAC</h1>
        <p className="text-sm text-muted-foreground">Visão geral dos atendimentos ao cliente</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KPICard title="Abertos" value={sacDashboardData.porStatus[0].value} icon={<Headphones className="w-5 h-5" />} />
        <KPICard title="Em Análise" value={sacDashboardData.porStatus[1].value} icon={<Clock className="w-5 h-5" />} />
        <KPICard title="Aguard. Cliente" value={sacDashboardData.porStatus[2].value} icon={<UserCheck className="w-5 h-5" />} />
        <KPICard title="Resolvidos" value={sacDashboardData.porStatus[3].value} icon={<CheckCircle className="w-5 h-5" />} />
        <KPICard title="Encerrados" value={sacDashboardData.porStatus[4].value} icon={<Archive className="w-5 h-5" />} />
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Chamados por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={sacDashboardData.porStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Chamados por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={sacDashboardData.porTipo} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {sacDashboardData.porTipo.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Chamados por Planta</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={sacDashboardData.porPlanta}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Chamados por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={sacDashboardData.porDia}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="dia" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Lists */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Chamados Abertos Mais Antigos</CardTitle>
          </CardHeader>
          <CardContent>
            {maisAntigos.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Nenhum chamado aberto</p>
            ) : (
              <div className="space-y-2">
                {maisAntigos.map((a) => (
                  <div key={a.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <span className="text-sm font-mono font-medium text-foreground">{a.id}</span>
                      <p className="text-xs text-muted-foreground">{a.clienteNome}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{a.abertoAt}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Aguardando Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            {aguardandoTop.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Nenhum chamado aguardando</p>
            ) : (
              <div className="space-y-2">
                {aguardandoTop.map((a) => (
                  <div key={a.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <span className="text-sm font-mono font-medium text-foreground">{a.id}</span>
                      <p className="text-xs text-muted-foreground">{a.clienteNome}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{a.atualizadoAt}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SACDashboardPage;
