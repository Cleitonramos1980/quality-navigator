import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, CheckCircle, Clock, AlertTriangle, XCircle, ShieldCheck, TrendingUp, Store, Plus } from "lucide-react";
import KPICard from "@/components/KPICard";
import ExportActionsBar from "@/components/inventario/ExportActionsBar";
import InventoryStatusPill from "@/components/inventario/InventoryStatusPill";
import { mockContagens, mockLojas } from "@/data/mockInventarioData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const InventarioDashboardPage = () => {
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState("hoje");

  const hoje = "2026-03-12";
  const contagensHoje = mockContagens.filter((c) => c.data === hoje);
  const previstas = contagensHoje.length;
  const concluidas = contagensHoje.filter((c) => c.status === "CONCLUIDO" || c.status === "VALIDADO").length;
  const emAndamento = contagensHoje.filter((c) => c.status === "EM_ANDAMENTO").length;
  const naoIniciadas = contagensHoje.filter((c) => c.status === "NAO_INICIADO").length;
  const naoFeitas = contagensHoje.filter((c) => c.status === "NAO_FEITO").length;
  const validadas = contagensHoje.filter((c) => c.status === "VALIDADO").length;
  const aderencia = previstas > 0 ? Math.round((concluidas / previstas) * 100) : 0;

  const statusData = [
    { name: "Validado", value: validadas, fill: "hsl(var(--primary))" },
    { name: "Concluído", value: concluidas - validadas, fill: "hsl(var(--success))" },
    { name: "Em Andamento", value: emAndamento, fill: "hsl(var(--warning))" },
    { name: "Não Iniciado", value: naoIniciadas, fill: "hsl(var(--muted-foreground))" },
    { name: "Não Feito", value: naoFeitas, fill: "hsl(var(--destructive))" },
  ].filter((d) => d.value > 0);

  const lojaRanking = mockLojas.slice(0, 6).map((l) => {
    const cs = mockContagens.filter((c) => c.lojaId === l.id);
    const done = cs.filter((c) => c.status === "VALIDADO" || c.status === "CONCLUIDO").length;
    return { nome: l.nome.replace("Loja ", ""), aderencia: cs.length > 0 ? Math.round((done / cs.length) * 100) : 0 };
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard de Inventário</h1>
          <p className="text-sm text-muted-foreground">Acompanhamento de aderência e qualidade das contagens</p>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" onClick={() => navigate("/qualidade/inventario/novo-plano")}>
            <Plus className="h-4 w-4 mr-1" /> Novo Plano
          </Button>
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="hoje">Hoje</SelectItem>
              <SelectItem value="semana">Semana</SelectItem>
              <SelectItem value="quinzena">Quinzena</SelectItem>
              <SelectItem value="mes">Mês</SelectItem>
            </SelectContent>
          </Select>
          <ExportActionsBar />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <KPICard title="Previstas Hoje" value={previstas} icon={<Store className="h-4 w-4" />} onClick={() => navigate("/qualidade/inventario/agenda")} />
        <KPICard title="Concluídas" value={concluidas} icon={<CheckCircle className="h-4 w-4" />} onClick={() => navigate("/qualidade/inventario/contagens")} />
        <KPICard title="Em Andamento" value={emAndamento} icon={<Clock className="h-4 w-4" />} onClick={() => navigate("/qualidade/inventario/contagens")} />
        <KPICard title="Não Iniciadas" value={naoIniciadas} icon={<AlertTriangle className="h-4 w-4" />} onClick={() => navigate("/qualidade/inventario/contagens")} />
        <KPICard title="Não Feitas" value={naoFeitas} icon={<XCircle className="h-4 w-4" />} onClick={() => navigate("/qualidade/inventario/contagens")} />
        <KPICard title="Validadas" value={validadas} icon={<ShieldCheck className="h-4 w-4" />} onClick={() => navigate("/qualidade/inventario/validacao")} />
        <KPICard title="Aderência" value={`${aderencia}%`} icon={<TrendingUp className="h-4 w-4" />} onClick={() => navigate("/qualidade/inventario/relatorios")} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">Status das Contagens (Hoje)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statusData} dataKey="value" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={2}>
                  {statusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {statusData.map((d) => (
                <span key={d.name} className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.fill }} />
                  {d.name}: {d.value}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">Aderência por Loja</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={lojaRanking} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <YAxis dataKey="nome" type="category" width={110} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="aderencia" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm font-medium">Contagens Recentes</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-2 font-medium text-muted-foreground">Número</th>
                  <th className="pb-2 font-medium text-muted-foreground">Loja</th>
                  <th className="pb-2 font-medium text-muted-foreground">Depto</th>
                  <th className="pb-2 font-medium text-muted-foreground">Supervisor</th>
                  <th className="pb-2 font-medium text-muted-foreground">Acuracidade</th>
                  <th className="pb-2 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {mockContagens.slice(0, 6).map((c) => (
                  <tr key={c.id} className="border-b border-border/50 hover:bg-muted/30 cursor-pointer" onClick={() => navigate(`/qualidade/inventario/contagens`)}>
                    <td className="py-2.5 font-mono text-xs">{c.numero}</td>
                    <td className="py-2.5">{c.lojaNome}</td>
                    <td className="py-2.5">{c.departamentoNome}</td>
                    <td className="py-2.5">{c.supervisor}</td>
                    <td className="py-2.5 font-medium">{c.acuracidade > 0 ? `${c.acuracidade}%` : "—"}</td>
                    <td className="py-2.5"><InventoryStatusPill status={c.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventarioDashboardPage;
