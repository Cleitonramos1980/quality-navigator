import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, CheckCircle, Clock, AlertTriangle, XCircle, ShieldCheck, TrendingUp, Store, Plus, RefreshCw, Target, ClipboardCheck, FileWarning, Users, Building2 } from "lucide-react";
import KPICard from "@/components/KPICard";
import ExportActionsBar from "@/components/inventario/ExportActionsBar";
import InventoryStatusPill from "@/components/inventario/InventoryStatusPill";
import { getContagens, getLojas } from "@/services/inventario";
import type { Contagem, LojaInventario } from "@/types/inventario";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useToast } from "@/components/ui/use-toast";
import { mockChecklists } from "@/data/mockChecklistPreInventario";
import { STATUS_LABELS, STATUS_COLORS, CRITICIDADE_COLORS } from "@/types/checklistPreInventario";
import { cn } from "@/lib/utils";

const InventarioDashboardPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [periodo, setPeriodo] = useState("hoje");
  const [contagens, setContagens] = useState<Contagem[]>([]);
  const [lojas, setLojas] = useState<LojaInventario[]>([]);

  useEffect(() => {
    getContagens().then(setContagens).catch((error) => { const message = error instanceof Error ? error.message : "Falha ao carregar dados."; toast({ title: "Erro ao carregar dados", description: message, variant: "destructive" }); });
    getLojas().then(setLojas).catch((error) => { const message = error instanceof Error ? error.message : "Falha ao carregar dados."; toast({ title: "Erro ao carregar dados", description: message, variant: "destructive" }); });
  }, []);

  const hoje = new Date().toISOString().slice(0, 10);
  const contagensHoje = contagens.filter((c) => c.data === hoje);
  const previstas = contagensHoje.length;
  const concluidas = contagensHoje.filter((c) => c.status === "CONCLUIDO" || c.status === "VALIDADO").length;
  const emAndamento = contagensHoje.filter((c) => c.status === "EM_ANDAMENTO").length;
  const naoIniciadas = contagensHoje.filter((c) => c.status === "NAO_INICIADO").length;
  const naoFeitas = contagensHoje.filter((c) => c.status === "NAO_FEITO").length;
  const validadas = contagensHoje.filter((c) => c.status === "VALIDADO").length;
  const aderencia = previstas > 0 ? Math.round((concluidas / previstas) * 100) : 0;
  const contagemParaValidacao = contagens.find((c) => c.status === "CONCLUIDO" || c.status === "VALIDADO");

  const statusData = [
    { name: "Validado", value: validadas, fill: "hsl(var(--primary))" },
    { name: "ConcluÃ­do", value: concluidas - validadas, fill: "hsl(var(--success))" },
    { name: "Em Andamento", value: emAndamento, fill: "hsl(var(--warning))" },
    { name: "NÃ£o Iniciado", value: naoIniciadas, fill: "hsl(var(--muted-foreground))" },
    { name: "NÃ£o Feito", value: naoFeitas, fill: "hsl(var(--destructive))" },
  ].filter((d) => d.value > 0);

  const lojaRanking = lojas.slice(0, 6).map((l) => {
    const cs = contagens.filter((c) => c.lojaId === l.id);
    const done = cs.filter((c) => c.status === "VALIDADO" || c.status === "CONCLUIDO").length;
    return { nome: l.nome.replace("Loja ", ""), aderencia: cs.length > 0 ? Math.round((done / cs.length) * 100) : 0 };
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard de InventÃ¡rio</h1>
          <p className="text-sm text-muted-foreground">Acompanhamento de aderÃªncia e qualidade das contagens</p>
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
              <SelectItem value="mes">MÃªs</SelectItem>
            </SelectContent>
          </Select>
          <ExportActionsBar />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <KPICard title="Previstas Hoje" value={previstas} icon={<Store className="h-4 w-4" />} onClick={() => navigate("/qualidade/inventario/agenda")} />
        <KPICard title="ConcluÃ­das" value={concluidas} icon={<CheckCircle className="h-4 w-4" />} onClick={() => navigate("/qualidade/inventario/contagens")} />
        <KPICard title="Em Andamento" value={emAndamento} icon={<Clock className="h-4 w-4" />} onClick={() => navigate("/qualidade/inventario/contagens")} />
        <KPICard title="NÃ£o Iniciadas" value={naoIniciadas} icon={<AlertTriangle className="h-4 w-4" />} onClick={() => navigate("/qualidade/inventario/contagens")} />
        <KPICard title="NÃ£o Feitas" value={naoFeitas} icon={<XCircle className="h-4 w-4" />} onClick={() => navigate("/qualidade/inventario/contagens")} />
        <KPICard
          title="Validadas"
          value={validadas}
          icon={<ShieldCheck className="h-4 w-4" />}
          onClick={() => navigate(contagemParaValidacao ? `/qualidade/inventario/validacao/${contagemParaValidacao.id}` : "/qualidade/inventario/contagens")}
        />
        <KPICard title="AderÃªncia" value={`${aderencia}%`} icon={<TrendingUp className="h-4 w-4" />} onClick={() => navigate("/qualidade/inventario/relatorios")} />
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
          <CardHeader><CardTitle className="text-sm font-medium">AderÃªncia por Loja</CardTitle></CardHeader>
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

      {/* Premium: Critical Items & Operational Panels */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium flex items-center gap-2"><RefreshCw className="h-4 w-4 text-warning" />Em Recontagem / 3Âª Contagem</CardTitle></CardHeader>
          <CardContent>
            {(() => {
              const recontagens = contagens.filter((c) => c.status === "RECONTAGEM");
              return recontagens.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhuma recontagem pendente</p>
              ) : (
                <div className="space-y-2">
                  {recontagens.slice(0, 5).map((c) => (
                    <div key={c.id} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                      <div>
                        <span className="text-sm font-mono">{c.numero}</span>
                        <p className="text-xs text-muted-foreground">{c.lojaNome} â€” {c.departamentoNome}</p>
                      </div>
                      <InventoryStatusPill status={c.status} />
                    </div>
                  ))}
                </div>
              );
            })()}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm font-medium flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" />Aguardando ValidaÃ§Ã£o</CardTitle></CardHeader>
          <CardContent>
            {(() => {
              const aguardando = contagens.filter((c) => c.status === "CONCLUIDO");
              return aguardando.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Todas validadas</p>
              ) : (
                <div className="space-y-2">
                  {aguardando.slice(0, 5).map((c) => (
                    <div key={c.id} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0 cursor-pointer hover:bg-muted/30" onClick={() => navigate(`/qualidade/inventario/validacao/${c.id}`)}>
                      <div>
                        <span className="text-sm font-mono">{c.numero}</span>
                        <p className="text-xs text-muted-foreground">{c.lojaNome}</p>
                      </div>
                      <span className="text-sm font-medium">{c.acuracidade > 0 ? `${c.acuracidade}%` : "â€”"}</span>
                    </div>
                  ))}
                </div>
              );
            })()}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm font-medium flex items-center gap-2"><Target className="h-4 w-4 text-destructive" />Itens com Maior DivergÃªncia</CardTitle></CardHeader>
          <CardContent>
            {(() => {
              const comDivergencia = contagens.filter((c) => c.itensDivergentes > 0).sort((a, b) => b.itensDivergentes - a.itensDivergentes).slice(0, 5);
              return comDivergencia.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Sem divergÃªncias relevantes</p>
              ) : (
                <div className="space-y-2">
                  {comDivergencia.map((c) => (
                    <div key={c.id} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                      <div>
                        <span className="text-sm font-mono">{c.numero}</span>
                        <p className="text-xs text-muted-foreground">{c.lojaNome}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-destructive">{c.itensDivergentes}</span>
                        <p className="text-xs text-muted-foreground">de {c.itensContados}</p>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
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
                  <th className="pb-2 font-medium text-muted-foreground">NÃºmero</th>
                  <th className="pb-2 font-medium text-muted-foreground">Loja</th>
                  <th className="pb-2 font-medium text-muted-foreground">Depto</th>
                  <th className="pb-2 font-medium text-muted-foreground">Supervisor</th>
                  <th className="pb-2 font-medium text-muted-foreground">Acuracidade</th>
                  <th className="pb-2 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {contagens.slice(0, 6).map((c) => (
                  <tr key={c.id} className="border-b border-border/50 hover:bg-muted/30 cursor-pointer" onClick={() => navigate(`/qualidade/inventario/contagens`)}>
                    <td className="py-2.5 font-mono text-xs">{c.numero}</td>
                    <td className="py-2.5">{c.lojaNome}</td>
                    <td className="py-2.5">{c.departamentoNome}</td>
                    <td className="py-2.5">{c.supervisor}</td>
                    <td className="py-2.5 font-medium">{c.acuracidade > 0 ? `${c.acuracidade}%` : "â€”"}</td>
                    <td className="py-2.5"><InventoryStatusPill status={c.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      {/* ─── Checklist Pré-Inventário Dashboard ─────────────── */}
      <ChecklistPreInventarioDashboard navigate={navigate} />
    </div>
  );
};

/* ─── Checklist Pré-Inventário Section ──────────────────── */
function ChecklistPreInventarioDashboard({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  const checklists = mockChecklists;

  const stats = useMemo(() => {
    const allItens = checklists.flatMap((c) => c.blocos.flatMap((b) => b.itens));
    const total = allItens.length;
    const concluidos = allItens.filter((i) => i.status === "CONCLUIDO").length;
    const pendentes = allItens.filter((i) => i.status === "PENDENTE").length;
    const emAndamento = allItens.filter((i) => i.status === "EM_ANDAMENTO").length;
    const criticos = allItens.filter((i) => i.criticidade === "ALTA" && i.status !== "CONCLUIDO").length;
    const ncs = allItens.filter((i) => i.nc).length;
    const pctGeral = total > 0 ? Math.round((concluidos / total) * 100) : 0;
    return { total, concluidos, pendentes, emAndamento, criticos, ncs, pctGeral };
  }, [checklists]);

  const blocoStats = useMemo(() => {
    return checklists.flatMap((c) =>
      c.blocos.map((b) => {
        const total = b.itens.length;
        const done = b.itens.filter((i) => i.status === "CONCLUIDO").length;
        const criticos = b.itens.filter((i) => i.criticidade === "ALTA" && i.status !== "CONCLUIDO").length;
        return { nome: b.nome, total, done, pct: total > 0 ? Math.round((done / total) * 100) : 0, criticos };
      })
    );
  }, [checklists]);

  const statusPieData = useMemo(() => {
    const allItens = checklists.flatMap((c) => c.blocos.flatMap((b) => b.itens));
    return [
      { name: "Concluído", value: allItens.filter((i) => i.status === "CONCLUIDO").length, fill: "hsl(var(--success))" },
      { name: "Em Andamento", value: allItens.filter((i) => i.status === "EM_ANDAMENTO").length, fill: "hsl(var(--primary))" },
      { name: "Pendente", value: allItens.filter((i) => i.status === "PENDENTE").length, fill: "hsl(var(--warning))" },
      { name: "Cancelado", value: allItens.filter((i) => i.status === "CANCELADO").length, fill: "hsl(var(--muted-foreground))" },
      { name: "N/A", value: allItens.filter((i) => i.status === "NAO_APLICAVEL").length, fill: "hsl(var(--border))" },
    ].filter((d) => d.value > 0);
  }, [checklists]);

  const barData = useMemo(() => {
    return blocoStats.map((b) => ({
      nome: b.nome.length > 18 ? b.nome.slice(0, 18) + "…" : b.nome,
      concluido: b.pct,
    }));
  }, [blocoStats]);

  const itensCriticosAbertos = useMemo(() => {
    return checklists.flatMap((c) =>
      c.blocos.flatMap((b) =>
        b.itens
          .filter((i) => i.criticidade === "ALTA" && i.status !== "CONCLUIDO")
          .map((i) => ({ ...i, blocoNome: b.nome, checklistNome: c.nome }))
      )
    ).slice(0, 6);
  }, [checklists]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Checklist Pré-Inventário</h2>
        </div>
        <Button size="sm" variant="outline" onClick={() => navigate("/qualidade/inventario/checklist-pre")}>
          Ver Checklists
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <KPICard title="Total Itens" value={stats.total} icon={<ClipboardCheck className="h-4 w-4" />} onClick={() => navigate("/qualidade/inventario/checklist-pre")} />
        <KPICard title="Concluídos" value={stats.concluidos} icon={<CheckCircle className="h-4 w-4" />} />
        <KPICard title="Em Andamento" value={stats.emAndamento} icon={<Clock className="h-4 w-4" />} />
        <KPICard title="Pendentes" value={stats.pendentes} icon={<AlertTriangle className="h-4 w-4" />} />
        <KPICard title="Críticos Abertos" value={stats.criticos} icon={<AlertTriangle className="h-4 w-4" />} />
        <KPICard title="NCs Abertas" value={stats.ncs} icon={<FileWarning className="h-4 w-4" />} />
        <KPICard title="Progresso" value={`${stats.pctGeral}%`} icon={<TrendingUp className="h-4 w-4" />} />
      </div>

      {/* Progresso geral */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Progresso Geral do Pré-Inventário</span>
            <span className="text-sm font-bold text-primary">{stats.pctGeral}%</span>
          </div>
          <Progress value={stats.pctGeral} className="h-3" />
          <p className="text-xs text-muted-foreground mt-1.5">{stats.concluidos} de {stats.total} itens concluídos</p>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Status pie */}
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">Distribuição por Status</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusPieData} dataKey="value" cx="50%" cy="50%" outerRadius={80} innerRadius={45} paddingAngle={2}>
                  {statusPieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {statusPieData.map((d) => (
                <span key={d.name} className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.fill }} />
                  {d.name}: {d.value}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Progresso por bloco */}
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">Progresso por Bloco</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                <YAxis dataKey="nome" type="category" width={140} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(val: number) => `${val}%`} />
                <Bar dataKey="concluido" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Blocos detalhados + Itens críticos */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" />Acompanhamento por Bloco</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {blocoStats.map((b) => (
              <div key={b.nome} className="flex items-center gap-3 py-1.5 border-b border-border/50 last:border-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm truncate">{b.nome}</span>
                    <span className="text-xs text-muted-foreground shrink-0 ml-2">{b.done}/{b.total}</span>
                  </div>
                  <Progress value={b.pct} className="h-1.5" />
                </div>
                {b.criticos > 0 && (
                  <Badge variant="destructive" className="text-[10px] px-1.5 shrink-0">{b.criticos}</Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm font-medium flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" />Itens Críticos em Aberto</CardTitle></CardHeader>
          <CardContent>
            {itensCriticosAbertos.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum item crítico pendente 🎉</p>
            ) : (
              <div className="space-y-2">
                {itensCriticosAbertos.map((i) => (
                  <div
                    key={i.id}
                    className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0 cursor-pointer hover:bg-muted/30 rounded px-1"
                    onClick={() => navigate(`/qualidade/inventario/checklist-pre/CKL-001/item/${i.id}`)}
                  >
                    <div className="min-w-0">
                      <p className="text-sm truncate">{i.descricao}</p>
                      <p className="text-xs text-muted-foreground">{i.blocoNome} · {i.responsavel}</p>
                    </div>
                    <span className={cn("status-badge text-[10px] shrink-0", STATUS_COLORS[i.status])}>{STATUS_LABELS[i.status]}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default InventarioDashboardPage;

