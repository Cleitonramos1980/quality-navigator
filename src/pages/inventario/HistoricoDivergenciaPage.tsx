import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import KPICard from "@/components/KPICard";
import InventoryDivergenceHeatmap from "@/components/inventario/InventoryDivergenceHeatmap";
import ExportActionsBar from "@/components/inventario/ExportActionsBar";
import InventoryStatusPill from "@/components/inventario/InventoryStatusPill";
import { getDivergencias, getLojas } from "@/services/inventario";
import { AlertTriangle, BarChart3, Store, RotateCcw, TrendingDown, ShieldAlert } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { DivergenciaDiaria, InventarioStatus, LojaInventario } from "@/types/inventario";

const HistoricoDivergenciaPage = () => {
  const navigate = useNavigate();
  const [lojaFilter, setLojaFilter] = useState("TODAS");
  const [divergencias, setDivergencias] = useState<DivergenciaDiaria[]>([]);
  const [lojas, setLojas] = useState<LojaInventario[]>([]);

  useEffect(() => {
    getDivergencias().then(setDivergencias);
    getLojas().then(setLojas);
  }, []);

  const filtered = useMemo(() => {
    if (lojaFilter === "TODAS") return divergencias;
    return divergencias.filter((d) => d.lojaId === lojaFilter);
  }, [lojaFilter, divergencias]);

  const comDivergencia = filtered.filter((d) => d.nivel === "alta" || d.nivel === "atencao").length;
  const totalDiv = filtered.reduce((s, d) => s + d.itensDivergentes, 0);
  const avgAcur = filtered.filter((d) => d.acuracidade > 0).reduce((s, d, _, a) => s + d.acuracidade / a.length, 0);
  const comRecontagem = filtered.filter((d) => d.status === "RECONTAGEM").length;
  const semContagem = filtered.filter((d) => d.nivel === "sem_contagem").length;

  // Trend data grouped by date
  const trendMap = new Map<string, { total: number; acurSum: number; divCount: number; count: number }>();
  filtered.forEach((d) => {
    const existing = trendMap.get(d.data) || { total: 0, acurSum: 0, divCount: 0, count: 0 };
    existing.total++;
    if (d.acuracidade > 0) { existing.acurSum += d.acuracidade; existing.count++; }
    if (d.nivel === "alta" || d.nivel === "atencao") existing.divCount++;
    trendMap.set(d.data, existing);
  });
  const trendData = [...trendMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)
    .map(([data, v]) => ({
      data: `${data.slice(8, 10)}/${data.slice(5, 7)}`,
      acuracidade: v.count > 0 ? Math.round(v.acurSum / v.count * 10) / 10 : 0,
      divergentes: v.divCount,
    }));

  // Ranking lojas
  const lojaRanking = lojas.map((l) => {
    const ld = filtered.filter((d) => d.lojaId === l.id);
    const total = ld.reduce((s, d) => s + d.itensDivergentes, 0);
    return { nome: l.nome, divergentes: total };
  }).sort((a, b) => b.divergentes - a.divergentes).slice(0, 6);

  const handleCellClick = (item: DivergenciaDiaria) => {
    navigate("/qualidade/inventario/contagens");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Histórico de Divergência</h1>
          <p className="text-sm text-muted-foreground">Análise visual dia a dia do histórico de divergência por loja</p>
        </div>
        <ExportActionsBar />
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={lojaFilter} onValueChange={setLojaFilter}>
          <SelectTrigger className="w-52"><SelectValue placeholder="Loja" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="TODAS">Todas as Lojas</SelectItem>
            {mockLojas.map((l) => <SelectItem key={l.id} value={l.id}>{l.nome}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard title="Com Divergência" value={comDivergencia} icon={<AlertTriangle className="h-4 w-4" />} />
        <KPICard title="Itens Divergentes" value={totalDiv} icon={<BarChart3 className="h-4 w-4" />} />
        <KPICard title="Acuracidade Média" value={`${Math.round(avgAcur * 10) / 10}%`} icon={<TrendingDown className="h-4 w-4" />} />
        <KPICard title="Sem Contagem" value={semContagem} icon={<Store className="h-4 w-4" />} />
        <KPICard title="Com Recontagem" value={comRecontagem} icon={<RotateCcw className="h-4 w-4" />} />
        <KPICard title="Lojas Reincidentes" value={lojaRanking.filter((l) => l.divergentes > 5).length} icon={<ShieldAlert className="h-4 w-4" />} />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm font-medium">Heatmap de Divergência (últimos 14 dias)</CardTitle></CardHeader>
        <CardContent>
          <InventoryDivergenceHeatmap data={filtered} onCellClick={handleCellClick} />
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">Tendência Diária</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="data" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="acuracidade" stroke="hsl(var(--primary))" strokeWidth={2} name="Acuracidade %" />
                <Line type="monotone" dataKey="divergentes" stroke="hsl(var(--destructive))" strokeWidth={2} name="Divergentes" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">Ranking — Lojas com Maior Divergência</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lojaRanking.map((l, i) => (
                <div key={l.nome} className="flex items-center gap-3">
                  <span className="text-xs font-mono text-muted-foreground w-5">{i + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{l.nome}</div>
                    <div className="h-1.5 rounded-full bg-muted mt-1 overflow-hidden">
                      <div className="h-full rounded-full bg-destructive/70" style={{ width: `${Math.min((l.divergentes / (lojaRanking[0]?.divergentes || 1)) * 100, 100)}%` }} />
                    </div>
                  </div>
                  <span className="text-sm font-bold text-destructive">{l.divergentes}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm font-medium">Detalhamento</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left p-3 font-medium text-muted-foreground">Data</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Loja</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Supervisor</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Depto</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">Contados</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">Divergentes</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">Acuracidade</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(-20).reverse().map((d, i) => (
                  <tr key={`${d.data}-${d.lojaId}-${i}`} className="border-b border-border/50 hover:bg-muted/20 cursor-pointer" onClick={() => d.contagemId && navigate("/qualidade/inventario/contagens")}>
                    <td className="p-3 font-mono text-xs">{d.data}</td>
                    <td className="p-3">{d.lojaNome}</td>
                    <td className="p-3">{d.supervisor}</td>
                    <td className="p-3">{d.departamento}</td>
                    <td className="p-3 text-right">{d.itensContados}</td>
                    <td className="p-3 text-right font-medium">{d.itensDivergentes > 0 ? <span className="text-destructive">{d.itensDivergentes}</span> : "0"}</td>
                    <td className="p-3 text-right">{d.acuracidade > 0 ? `${d.acuracidade}%` : "—"}</td>
                    <td className="p-3"><InventoryStatusPill status={d.status as any} /></td>
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

export default HistoricoDivergenciaPage;
