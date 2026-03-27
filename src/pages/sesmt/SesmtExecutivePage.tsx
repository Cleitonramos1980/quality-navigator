import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Shield, TrendingUp, Radar, HeartPulse, AlertTriangle } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import KPICard from "@/components/KPICard";
import SectionCard from "@/components/forms/SectionCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  getSesmtIndicatorsDashboard,
  getSesmtMasterDashboard,
  getSesmtMaturityDashboard,
  getSesmtOccupationalDashboard,
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
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asArray<T = Record<string, unknown>>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function asNumber(value: unknown, fallback = 0): number {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function formatDateTime(value: unknown): string {
  if (!value) return "-";
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toLocaleString("pt-BR");
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
      setData(null);
      setAccessDenied(false);
      setLoading(true);
      try {
        if (viewKey === "painel-mestre") {
          setData(await getSesmtMasterDashboard({
            unidade: unidade === DEFAULT_UNIT ? undefined : unidade,
            periodStart: periodStart || undefined,
            periodEnd: periodEnd || undefined,
          }));
        } else if (viewKey === "indice-maturidade") {
          setData(await getSesmtMaturityDashboard({ unidade: unidade === DEFAULT_UNIT ? undefined : unidade }));
        } else if (viewKey === "painel-preditivo") {
          setData(await getSesmtPredictiveDashboard({ unidade: unidade === DEFAULT_UNIT ? undefined : unidade }));
        } else if (viewKey === "indicadores") {
          setData(await getSesmtIndicatorsDashboard({ unidade: unidade === DEFAULT_UNIT ? undefined : unidade }));
        } else if (viewKey === "gerencial-ocupacional") {
          setData(await getSesmtOccupationalDashboard({ unidade: unidade === DEFAULT_UNIT ? undefined : unidade }));
        } else {
          setData(await getSesmtMasterDashboard({ unidade: unidade === DEFAULT_UNIT ? undefined : unidade }));
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Falha ao carregar painel executivo SESMT.";
        const status = typeof error === "object" && error && "status" in error
          ? Number((error as { status?: number }).status)
          : 0;
        setAccessDenied(status === 403);
        setData(null);
        toast({ title: "Erro", description: message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    })();
  }, [viewKey, unidade, periodStart, periodEnd, toast]);

  const headerIcon = useMemo(() => {
    if (viewKey === "painel-preditivo") return <Radar className="w-6 h-6 text-primary" />;
    if (viewKey === "gerencial-ocupacional") return <HeartPulse className="w-6 h-6 text-primary" />;
    if (viewKey === "indice-maturidade") return <TrendingUp className="w-6 h-6 text-primary" />;
    return <Shield className="w-6 h-6 text-primary" />;
  }, [viewKey]);

  const normalizedData = asRecord(data);
  const hasData = data != null
    && (typeof data !== "object" || Array.isArray(data) || Object.keys(normalizedData).length > 0);

  const rankingUnidades = asArray<any>(normalizedData.rankingUnidades);
  const tendencia = asArray<any>(normalizedData.tendencia);
  const visaoNr = asArray<any>(normalizedData.visaoNr);
  const pendenciasPrioritarias = asArray<any>(normalizedData.pendenciasPrioritarias);
  const eixoDetalhado = asArray<any>(normalizedData.eixoDetalhado);
  const riscosFuturos = asArray<any>(normalizedData.riscosFuturos);
  const alertas = asArray<any>(normalizedData.alertas);
  const cards = asArray<any>(normalizedData.cards);
  const statusDistribuicao = asArray<any>(normalizedData.statusDistribuicao);
  const criticidadeDistribuicao = asArray<any>(normalizedData.criticidadeDistribuicao);
  const agendaExames = asArray<any>(normalizedData.agendaExames);
  const historicoAtendimentos = asArray<any>(normalizedData.historicoAtendimentos);
  const kpis = asRecord(normalizedData.kpis);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            {headerIcon}
            {title}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Painel corporativo do modulo SESMT / SST integrado com indicadores, risco e saude ocupacional.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full lg:w-auto lg:min-w-[520px]">
          <Select value={unidade} onValueChange={setUnidade}>
            <SelectTrigger>
              <SelectValue placeholder="Unidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={DEFAULT_UNIT}>Todas as unidades</SelectItem>
              <SelectItem value="MAO">MAO</SelectItem>
              <SelectItem value="BEL">BEL</SelectItem>
              <SelectItem value="AGR">AGR</SelectItem>
            </SelectContent>
          </Select>
          <Input type="date" value={periodStart} onChange={(event) => setPeriodStart(event.target.value)} />
          <Input type="date" value={periodEnd} onChange={(event) => setPeriodEnd(event.target.value)} />
        </div>
      </div>

      {loading && (
        <SectionCard title="Carregando" description="Aguarde, compilando indicadores SESMT/SST.">
          <p className="text-sm text-muted-foreground">Buscando dados do backend...</p>
        </SectionCard>
      )}

      {!loading && accessDenied && (
        <SectionCard title="Acesso Negado" description="Seu perfil nao possui permissao para este painel executivo.">
          <p className="text-sm text-muted-foreground">
            Solicite liberacao ao administrador ou acesse um painel permitido para seu perfil.
          </p>
        </SectionCard>
      )}

      {!loading && !accessDenied && !hasData && (
        <SectionCard title="Sem Dados" description="Nao foi possivel montar o painel com os dados atuais.">
          <p className="text-sm text-muted-foreground">
            Revise os filtros aplicados e tente novamente. Se o problema persistir, verifique a API do modulo SESMT/SST.
          </p>
        </SectionCard>
      )}

      {!loading && !accessDenied && hasData && viewKey === "painel-mestre" && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            <KPICard title="Score Geral" value={`${asNumber(normalizedData.scoreGeral)}%`} icon={<Shield className="w-5 h-5" />} />
            <KPICard title="Docs Vencendo" value={asNumber(normalizedData.documentosVencendo)} icon={<AlertTriangle className="w-5 h-5" />} />
            <KPICard title="ASO Vencendo" value={asNumber(normalizedData.asoVencendo)} icon={<HeartPulse className="w-5 h-5" />} />
            <KPICard title="Treinamentos" value={asNumber(normalizedData.treinamentosVencendo)} icon={<TrendingUp className="w-5 h-5" />} />
            <KPICard title="Inspecoes Atrasadas" value={asNumber(normalizedData.inspecoesAtrasadas)} icon={<AlertTriangle className="w-5 h-5" />} />
            <KPICard title="Acoes Criticas" value={asNumber(normalizedData.acoesCriticasAbertas)} icon={<AlertTriangle className="w-5 h-5" />} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <SectionCard title="Ranking de Unidades" description="Performance consolidada por unidade">
              <div className="space-y-2">
                {rankingUnidades.map((item: any) => (
                  <div key={item.unidade} className="rounded-md border border-border px-3 py-2 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{item.unidade}</p>
                      <p className="text-xs text-muted-foreground">{item.concluidos}/{item.total} concluidos • {item.criticos} criticos</p>
                    </div>
                    <p className="text-sm font-bold">{item.score}%</p>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Tendencia" description="Abertos x concluidos nos ultimos 6 meses">
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={tendencia}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="abertos" stroke="hsl(var(--warning))" strokeWidth={2} />
                    <Line type="monotone" dataKey="concluidos" stroke="hsl(var(--success))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <SectionCard title="Visao por NR" description="Quantidade de registros por norma regulamentadora">
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={visaoNr}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="nr" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>

            <SectionCard title="Pendencias Prioritarias" description="Itens criticos em aberto com prazo mais curto">
              <div className="space-y-2">
                {pendenciasPrioritarias.map((item: any, index: number) => {
                  const node = getSesmtNodeByModuleKey(item.moduleKey);
                  return (
                    <Link key={item.id || `${item.moduleKey || "item"}-${index}`} to={node?.path || "#"} className="block rounded-md border border-border px-3 py-2 hover:bg-muted/30 transition-colors">
                      <p className="text-sm font-medium">{item.titulo}</p>
                      <p className="text-xs text-muted-foreground">{item.unidade} • {item.responsavel} • venc. {item.vencimentoAt || "-"}</p>
                    </Link>
                  );
                })}
              </div>
            </SectionCard>
          </div>
        </>
      )}

      {!loading && !accessDenied && hasData && viewKey === "indice-maturidade" && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KPICard title="Indice de Maturidade" value={`${asNumber(normalizedData.indiceMaturidade)}%`} icon={<TrendingUp className="w-5 h-5" />} />
            <KPICard title="Unidades avaliadas" value={rankingUnidades.length} icon={<Shield className="w-5 h-5" />} />
            <KPICard title="Melhor unidade" value={rankingUnidades[0]?.unidade || "-"} icon={<Shield className="w-5 h-5" />} />
            <KPICard title="Menor score" value={`${rankingUnidades[rankingUnidades.length - 1]?.score || 0}%`} icon={<AlertTriangle className="w-5 h-5" />} />
          </div>

          <SectionCard title="Eixos de maturidade" description="Score configuravel por eixo de SST">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={eixoDetalhado} layout="vertical" margin={{ left: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="eixo" type="category" width={160} />
                  <Tooltip />
                  <Bar dataKey="valor" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>
      )}

      {!loading && !accessDenied && hasData && viewKey === "painel-preditivo" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <SectionCard title="Risco Futuro" description="Projecao de risco por unidade">
            <div className="space-y-2">
              {riscosFuturos.map((item: any) => (
                <div key={item.unidade} className="rounded-md border border-border px-3 py-2">
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-sm">{item.unidade}</p>
                    <p className="text-sm font-bold">{item.riscoFuturo}%</p>
                  </div>
                  <p className="text-xs text-muted-foreground">Reincidencia: {item.reincidencia}% • Degradacao: {item.degradacao}%</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.justificativa}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Alertas Inteligentes" description="Alertas priorizados com justificativa">
            <div className="space-y-2">
              {alertas.length === 0 && <p className="text-sm text-muted-foreground">Sem alertas criticos no momento.</p>}
              {alertas.map((alerta: any, index: number) => (
                <div key={`${alerta.unidade}-${index}`} className="rounded-md border border-border px-3 py-2 bg-muted/20">
                  <p className="text-sm font-semibold">{alerta.unidade} • {alerta.nivel}</p>
                  <p className="text-sm">{alerta.titulo}</p>
                  <p className="text-xs text-muted-foreground">{alerta.descricao}</p>
                  <p className="text-xs text-muted-foreground mt-1">{alerta.justificativa}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}

      {!loading && !accessDenied && hasData && viewKey === "indicadores" && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card: any, index: number) => (
              <KPICard key={`${card.titulo || "card"}-${index}`} title={card.titulo || "Indicador"} value={`${asNumber(card.valor)}${card.unidade || ""}`} subtitle={`Meta ${asNumber(card.meta)}${card.unidade || ""}`} icon={<Shield className="w-5 h-5" />} />
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <SectionCard title="Distribuicao por status" description="Situcao operacional dos registros SST">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusDistribuicao}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="status" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>

            <SectionCard title="Distribuicao por criticidade" description="Concentracao de risco atual">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={criticidadeDistribuicao}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="criticidade" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>
          </div>
        </div>
      )}

      {!loading && !accessDenied && hasData && viewKey === "gerencial-ocupacional" && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KPICard title="Prontuarios" value={asNumber(kpis.totalProntuarios)} icon={<HeartPulse className="w-5 h-5" />} />
            <KPICard title="Exames Pendentes" value={asNumber(kpis.examesPendentes)} icon={<AlertTriangle className="w-5 h-5" />} />
            <KPICard title="Afastamentos" value={asNumber(kpis.afastamentos)} icon={<AlertTriangle className="w-5 h-5" />} />
            <KPICard title="Restricoes Ativas" value={asNumber(kpis.restricoesAtivas)} icon={<AlertTriangle className="w-5 h-5" />} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <SectionCard title="Agenda de Exames" description="Programacao ocupacional das proximas demandas">
              <div className="space-y-2">
                {agendaExames.map((item: any, index: number) => (
                  <div key={item.id || `${item.colaborador || "agenda"}-${index}`} className="rounded-md border border-border px-3 py-2">
                    <p className="text-sm font-medium">{item.colaborador}</p>
                    <p className="text-xs text-muted-foreground">{item.unidade} • venc. {item.vencimentoAt || "-"} • {item.status}</p>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Historico Ambulatorial" description="Ultimos atendimentos ocupacionais registrados">
              <div className="space-y-2">
                {historicoAtendimentos.map((item: any, index: number) => (
                  <div key={item.id || `${item.titulo || "historico"}-${index}`} className="rounded-md border border-border px-3 py-2">
                    <p className="text-sm font-medium">{item.titulo}</p>
                    <p className="text-xs text-muted-foreground">{item.unidade} • {formatDateTime(item.updatedAt)} • {item.status}</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>
      )}
    </div>
  );
};

export default SesmtExecutivePage;

