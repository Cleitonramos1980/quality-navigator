import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Shield, TrendingUp, Radar, HeartPulse, AlertTriangle } from "lucide-react";
import {
  Bar, BarChart, CartesianGrid, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { StatusBadgeInline, CriticidadeBadgeInline } from "@/components/sesmt/SesmtStatusBadge";
import ApiStatusBanner from "@/components/layout/ApiStatusBanner";
import {
  getSesmtIndicatorsDashboard, getSesmtMasterDashboard,
  getSesmtMaturityDashboard, getSesmtOccupationalDashboard,
  getSesmtPredictiveDashboard,
} from "@/services/sesmt";
import { getSesmtNodeByModuleKey } from "@/lib/sesmtMenu";

const VIEW_LABELS: Record<string, string> = {
  "painel-mestre": "Painel Mestre SESMT",
  "indice-maturidade": "Indice de Maturidade SST",
  "painel-preditivo": "Painel Preditivo",
  indicadores: "Indicadores",
  "gerencial-ocupacional": "Gerencial Ocupacional",
};

const DEFAULT_UNIT = "ALL";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}
function asArray<T = Record<string, unknown>>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}
function asNumber(value: unknown, fallback = 0): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}
function formatDateTime(value: unknown): string {
  if (!value) return "-";
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString("pt-BR");
}

const SesmtExecutivePage = () => {
  const { viewKey = "painel-mestre" } = useParams();
  const [unidade, setUnidade] = useState(DEFAULT_UNIT);
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const { toast } = useToast();

  const title = VIEW_LABELS[viewKey] || "Visao Executiva SESMT";

  useEffect(() => {
    void (async () => {
      setData(null); setAccessDenied(false); setLoading(true);
      try {
        if (viewKey === "painel-mestre") setData(await getSesmtMasterDashboard({ unidade: unidade === DEFAULT_UNIT ? undefined : unidade, periodStart: periodStart || undefined, periodEnd: periodEnd || undefined }));
        else if (viewKey === "indice-maturidade") setData(await getSesmtMaturityDashboard({ unidade: unidade === DEFAULT_UNIT ? undefined : unidade }));
        else if (viewKey === "painel-preditivo") setData(await getSesmtPredictiveDashboard({ unidade: unidade === DEFAULT_UNIT ? undefined : unidade }));
        else if (viewKey === "indicadores") setData(await getSesmtIndicatorsDashboard({ unidade: unidade === DEFAULT_UNIT ? undefined : unidade }));
        else if (viewKey === "gerencial-ocupacional") setData(await getSesmtOccupationalDashboard({ unidade: unidade === DEFAULT_UNIT ? undefined : unidade }));
        else setData(await getSesmtMasterDashboard({ unidade: unidade === DEFAULT_UNIT ? undefined : unidade }));
      } catch (error) {
        const message = error instanceof Error ? error.message : "Falha ao carregar painel executivo SESMT.";
        const status = typeof error === "object" && error && "status" in error ? Number((error as any).status) : 0;
        setAccessDenied(status === 403); setData(null);
        toast({ title: "Erro", description: message, variant: "destructive" });
      } finally { setLoading(false); }
    })();
  }, [viewKey, unidade, periodStart, periodEnd, toast]);

  const headerIcon = useMemo(() => {
    if (viewKey === "painel-preditivo") return <Radar className="w-5 h-5 text-primary" />;
    if (viewKey === "gerencial-ocupacional") return <HeartPulse className="w-5 h-5 text-primary" />;
    if (viewKey === "indice-maturidade") return <TrendingUp className="w-5 h-5 text-primary" />;
    return <Shield className="w-5 h-5 text-primary" />;
  }, [viewKey]);

  const d = asRecord(data);
  const hasData = data != null && (typeof data !== "object" || Array.isArray(data) || Object.keys(d).length > 0);
  const rankingUnidades = asArray<any>(d.rankingUnidades);
  const tendencia = asArray<any>(d.tendencia);
  const visaoNr = asArray<any>(d.visaoNr);
  const pendencias = asArray<any>(d.pendenciasPrioritarias);
  const eixoDetalhado = asArray<any>(d.eixoDetalhado);
  const riscosFuturos = asArray<any>(d.riscosFuturos);
  const alertas = asArray<any>(d.alertas);
  const cards = asArray<any>(d.cards);
  const statusDist = asArray<any>(d.statusDistribuicao);
  const critDist = asArray<any>(d.criticidadeDistribuicao);
  const agendaExames = asArray<any>(d.agendaExames);
  const histAtendimentos = asArray<any>(d.historicoAtendimentos);
  const kpis = asRecord(d.kpis);

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Header compacto */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          {headerIcon}
          <div>
            <h1 className="text-xl font-bold text-foreground">{title}</h1>
            <p className="text-xs text-muted-foreground">Painel corporativo SESMT/SST</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={unidade} onValueChange={setUnidade}>
            <SelectTrigger className="h-8 text-xs w-[130px]"><SelectValue placeholder="Unidade" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={DEFAULT_UNIT}>Todas</SelectItem>
              <SelectItem value="MAO">MAO</SelectItem>
              <SelectItem value="BEL">BEL</SelectItem>
              <SelectItem value="AGR">AGR</SelectItem>
            </SelectContent>
          </Select>
          <Input type="date" className="h-8 text-xs w-[130px]" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} />
          <Input type="date" className="h-8 text-xs w-[130px]" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
        </div>
      </div>

      <ApiStatusBanner />

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
          <span className="ml-2 text-sm text-muted-foreground">Compilando indicadores...</span>
        </div>
      )}

      {!loading && accessDenied && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-6 text-center">
          <p className="text-sm font-medium text-foreground">Acesso Negado</p>
          <p className="text-xs text-muted-foreground mt-1">Seu perfil não possui permissão para este painel.</p>
        </div>
      )}

      {!loading && !accessDenied && !hasData && (
        <div className="rounded-lg border border-border bg-card px-4 py-6 text-center">
          <p className="text-sm font-medium text-foreground">Sem Dados</p>
          <p className="text-xs text-muted-foreground mt-1">Revise os filtros e tente novamente.</p>
        </div>
      )}

      {/* ═══ PAINEL MESTRE ═══ */}
      {!loading && !accessDenied && hasData && viewKey === "painel-mestre" && (
        <>
          {/* KPIs inline */}
          <div className="grid gap-2 grid-cols-3 lg:grid-cols-6">
            {[
              { label: "Score Geral", value: `${asNumber(d.scoreGeral)}%`, tone: "" },
              { label: "Docs Vencendo", value: asNumber(d.documentosVencendo), tone: "text-destructive" },
              { label: "ASO Vencendo", value: asNumber(d.asoVencendo), tone: "text-destructive" },
              { label: "Treinamentos", value: asNumber(d.treinamentosVencendo), tone: "text-warning" },
              { label: "Inspeções Atrasadas", value: asNumber(d.inspecoesAtrasadas), tone: "text-destructive" },
              { label: "Ações Críticas", value: asNumber(d.acoesCriticasAbertas), tone: "text-destructive" },
            ].map((c) => (
              <div key={c.label} className="rounded-lg border border-border bg-card px-2.5 py-1.5">
                <p className="text-[10px] text-muted-foreground leading-tight">{c.label}</p>
                <p className={`text-lg font-bold leading-tight ${c.tone || "text-foreground"}`}>{c.value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            {/* Ranking */}
            <div className="rounded-lg border border-border bg-card p-3">
              <h3 className="text-xs font-semibold text-foreground mb-2">Ranking de Unidades</h3>
              <div className="space-y-1.5 max-h-[200px] overflow-auto">
                {rankingUnidades.map((item: any) => (
                  <div key={item.unidade} className="flex items-center justify-between rounded-md border border-border px-2.5 py-1.5">
                    <div>
                      <p className="text-xs font-medium">{item.unidade}</p>
                      <p className="text-[10px] text-muted-foreground">{item.concluidos}/{item.total} • {item.criticos} críticos</p>
                    </div>
                    <p className="text-sm font-bold">{item.score}%</p>
                  </div>
                ))}
              </div>
            </div>
            {/* Tendência */}
            <div className="rounded-lg border border-border bg-card p-3">
              <h3 className="text-xs font-semibold text-foreground mb-2">Tendência — Abertos × Concluídos</h3>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={tendencia}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="mes" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="abertos" stroke="hsl(var(--warning))" strokeWidth={2} />
                    <Line type="monotone" dataKey="concluidos" stroke="hsl(var(--success))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            {/* Visão NR */}
            <div className="rounded-lg border border-border bg-card p-3">
              <h3 className="text-xs font-semibold text-foreground mb-2">Visão por NR</h3>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={visaoNr}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="nr" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* Pendências */}
            <div className="rounded-lg border border-border bg-card p-3">
              <h3 className="text-xs font-semibold text-foreground mb-2">Pendências Prioritárias</h3>
              <div className="space-y-1.5 max-h-[200px] overflow-auto">
                {pendencias.map((item: any, i: number) => {
                  const node = getSesmtNodeByModuleKey(item.moduleKey);
                  return (
                    <Link key={item.id || `p-${i}`} to={node?.path || "#"} className="block rounded-md border border-border px-2.5 py-1.5 hover:bg-muted/30 transition-colors">
                      <p className="text-xs font-medium truncate">{item.titulo}</p>
                      <p className="text-[10px] text-muted-foreground">{item.unidade} • {item.responsavel} • venc. {item.vencimentoAt || "-"}</p>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ═══ MATURIDADE ═══ */}
      {!loading && !accessDenied && hasData && viewKey === "indice-maturidade" && (
        <>
          <div className="grid gap-2 grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Índice Maturidade", value: `${asNumber(d.indiceMaturidade)}%` },
              { label: "Unidades avaliadas", value: rankingUnidades.length },
              { label: "Melhor unidade", value: rankingUnidades[0]?.unidade || "-" },
              { label: "Menor score", value: `${rankingUnidades[rankingUnidades.length - 1]?.score || 0}%` },
            ].map((c) => (
              <div key={c.label} className="rounded-lg border border-border bg-card px-2.5 py-1.5">
                <p className="text-[10px] text-muted-foreground leading-tight">{c.label}</p>
                <p className="text-lg font-bold leading-tight text-foreground">{c.value}</p>
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <h3 className="text-xs font-semibold text-foreground mb-2">Eixos de Maturidade</h3>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={eixoDetalhado} layout="vertical" margin={{ left: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <YAxis dataKey="eixo" type="category" width={160} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="valor" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* ═══ PREDITIVO ═══ */}
      {!loading && !accessDenied && hasData && viewKey === "painel-preditivo" && (
        <div className="grid gap-3 lg:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-3">
            <h3 className="text-xs font-semibold text-foreground mb-2">Risco Futuro</h3>
            <div className="space-y-1.5 max-h-[300px] overflow-auto">
              {riscosFuturos.map((item: any) => (
                <div key={item.unidade} className="rounded-md border border-border px-2.5 py-1.5">
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-medium">{item.unidade}</p>
                    <p className="text-sm font-bold">{item.riscoFuturo}%</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Reincidência: {item.reincidencia}% • Degradação: {item.degradacao}%</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{item.justificativa}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <h3 className="text-xs font-semibold text-foreground mb-2">Alertas Inteligentes</h3>
            <div className="space-y-1.5 max-h-[300px] overflow-auto">
              {alertas.length === 0 && <p className="text-xs text-muted-foreground">Sem alertas críticos.</p>}
              {alertas.map((a: any, i: number) => (
                <div key={`${a.unidade}-${i}`} className="rounded-md border border-border px-2.5 py-1.5 bg-muted/20">
                  <p className="text-xs font-semibold">{a.unidade} • {a.nivel}</p>
                  <p className="text-xs">{a.titulo}</p>
                  <p className="text-[10px] text-muted-foreground">{a.descricao}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ INDICADORES ═══ */}
      {!loading && !accessDenied && hasData && viewKey === "indicadores" && (
        <>
          <div className="grid gap-2 grid-cols-2 lg:grid-cols-4">
            {cards.map((c: any, i: number) => (
              <div key={`${c.titulo || "c"}-${i}`} className="rounded-lg border border-border bg-card px-2.5 py-1.5">
                <p className="text-[10px] text-muted-foreground leading-tight">{c.titulo || "Indicador"}</p>
                <p className="text-lg font-bold leading-tight text-foreground">{asNumber(c.valor)}{c.unidade || ""}</p>
                <p className="text-[10px] text-muted-foreground">Meta {asNumber(c.meta)}{c.unidade || ""}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-3">
              <h3 className="text-xs font-semibold text-foreground mb-2">Distribuição por Status</h3>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusDist}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="status" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-3">
              <h3 className="text-xs font-semibold text-foreground mb-2">Distribuição por Criticidade</h3>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={critDist}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="criticidade" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="total" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Tabelas NR e Tendência */}
          <div className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-3">
              <h3 className="text-xs font-semibold text-foreground mb-2">Visão por NR</h3>
              <Table>
                <TableHeader><TableRow><TableHead className="text-xs">NR</TableHead><TableHead className="text-xs text-right">Total</TableHead></TableRow></TableHeader>
                <TableBody>
                  {asArray<any>(d.visaoNr).map((nr: any) => (
                    <TableRow key={nr.nr}><TableCell className="text-xs py-1.5">{nr.nr}</TableCell><TableCell className="text-xs py-1.5 text-right font-medium">{nr.total}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="rounded-lg border border-border bg-card p-3">
              <h3 className="text-xs font-semibold text-foreground mb-2">Tendência</h3>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={asArray<any>(d.tendencia)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="mes" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="abertos" stroke="hsl(var(--warning))" strokeWidth={2} />
                    <Line type="monotone" dataKey="concluidos" stroke="hsl(var(--success))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ═══ OCUPACIONAL ═══ */}
      {!loading && !accessDenied && hasData && viewKey === "gerencial-ocupacional" && (
        <>
          <div className="grid gap-2 grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Prontuários", value: asNumber(kpis.totalProntuarios) },
              { label: "Exames Pendentes", value: asNumber(kpis.examesPendentes), tone: "text-warning" },
              { label: "Afastamentos", value: asNumber(kpis.afastamentos), tone: "text-destructive" },
              { label: "Restrições Ativas", value: asNumber(kpis.restricoesAtivas), tone: "text-destructive" },
            ].map((c) => (
              <div key={c.label} className="rounded-lg border border-border bg-card px-2.5 py-1.5">
                <p className="text-[10px] text-muted-foreground leading-tight">{c.label}</p>
                <p className={`text-lg font-bold leading-tight ${c.tone || "text-foreground"}`}>{c.value}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="px-3 py-2 border-b border-border">
                <h3 className="text-xs font-semibold text-foreground">Agenda de Exames</h3>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Colaborador</TableHead>
                    <TableHead className="text-xs">Unidade</TableHead>
                    <TableHead className="text-xs">Vencimento</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agendaExames.map((item: any, i: number) => (
                    <TableRow key={item.id || `ae-${i}`}>
                      <TableCell className="text-xs py-1.5">{item.colaborador}</TableCell>
                      <TableCell className="text-xs py-1.5">{item.unidade}</TableCell>
                      <TableCell className="text-xs py-1.5">{item.vencimentoAt || "-"}</TableCell>
                      <TableCell className="py-1.5"><StatusBadgeInline status={item.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="px-3 py-2 border-b border-border">
                <h3 className="text-xs font-semibold text-foreground">Histórico Ambulatorial</h3>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Título</TableHead>
                    <TableHead className="text-xs">Unidade</TableHead>
                    <TableHead className="text-xs">Data</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {histAtendimentos.map((item: any, i: number) => (
                    <TableRow key={item.id || `ha-${i}`}>
                      <TableCell className="text-xs py-1.5 truncate max-w-[180px]">{item.titulo}</TableCell>
                      <TableCell className="text-xs py-1.5">{item.unidade}</TableCell>
                      <TableCell className="text-xs py-1.5">{formatDateTime(item.updatedAt)}</TableCell>
                      <TableCell className="py-1.5"><StatusBadgeInline status={item.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SesmtExecutivePage;
