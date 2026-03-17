import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ShieldAlert, AlertTriangle, Clock, Users, Filter, Eye, ExternalLink,
  CheckCircle2, XCircle, ArrowUpRight, BarChart3, Timer, FileWarning,
  Truck, Layers, DoorOpen, FileText, Shield,
} from "lucide-react";
import KPICard from "@/components/KPICard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getExcecoesTorre, getTorreKPIs } from "@/services/torreControle";
import type { ExcecaoTorre, TorreKPIs } from "@/types/torreControle";
import {
  EXCECAO_CATEGORIA_LABELS, EXCECAO_STATUS_LABELS, EXCECAO_STATUS_COLORS,
  CRITICIDADE_LABELS, CRITICIDADE_COLORS,
} from "@/types/torreControle";
import type { ExcecaoCategoria, ExcecaoCriticidade, ExcecaoStatus } from "@/types/torreControle";

const CATEGORY_ICONS: Record<string, typeof ShieldAlert> = {
  PATIO: Layers, PORTARIA: DoorOpen, FROTA: Truck, NF_TRANSITO: FileText,
  TRANSPORTADORA: Truck, VISITANTE: Users, DOCUMENTACAO: FileWarning,
  SLA: Timer, OPERACIONAL: Shield,
};

const TorreControlePage = () => {
  const [excecoes, setExcecoes] = useState<ExcecaoTorre[]>([]);
  const [kpis, setKpis] = useState<TorreKPIs | null>(null);
  const [tab, setTab] = useState("todas");
  const [busca, setBusca] = useState("");
  const [filtroCat, setFiltroCat] = useState<string>("ALL");
  const [filtroCrit, setFiltroCrit] = useState<string>("ALL");
  const [filtroStatus, setFiltroStatus] = useState<string>("ALL");

  useEffect(() => {
    getExcecoesTorre().then(setExcecoes);
    getTorreKPIs().then(setKpis);
  }, []);

  const filtered = useMemo(() => {
    let list = excecoes;
    if (tab === "criticas") list = list.filter(e => e.criticidade === "CRITICA" || e.criticidade === "ALTA");
    if (tab === "vencendo") list = list.filter(e => e.venceEm && new Date(e.venceEm) <= new Date(Date.now() + 2 * 60 * 60 * 1000));
    if (tab === "sem-responsavel") list = list.filter(e => !e.responsavel);
    if (tab === "reincidentes") list = list.filter(e => e.reincidencias > 0);
    if (filtroCat !== "ALL") list = list.filter(e => e.categoria === filtroCat);
    if (filtroCrit !== "ALL") list = list.filter(e => e.criticidade === filtroCrit);
    if (filtroStatus !== "ALL") list = list.filter(e => e.status === filtroStatus);
    if (busca) {
      const q = busca.toLowerCase();
      list = list.filter(e => e.titulo.toLowerCase().includes(q) || e.descricao.toLowerCase().includes(q) || e.id.toLowerCase().includes(q));
    }
    return list.sort((a, b) => {
      const critOrder: Record<string, number> = { CRITICA: 0, ALTA: 1, MEDIA: 2, BAIXA: 3 };
      return (critOrder[a.criticidade] ?? 9) - (critOrder[b.criticidade] ?? 9);
    });
  }, [excecoes, tab, busca, filtroCat, filtroCrit, filtroStatus]);

  const catCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    excecoes.filter(e => e.status !== "RESOLVIDA" && e.status !== "ENCERRADA").forEach(e => {
      counts[e.categoria] = (counts[e.categoria] || 0) + 1;
    });
    return counts;
  }, [excecoes]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-destructive" /> Torre de Controle de Exceções
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Centro de priorização operacional — o que exige ação imediata
        </p>
      </div>

      {/* KPIs */}
      {kpis && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <KPICard title="Abertas" value={kpis.totalAbertas} icon={<AlertTriangle className="w-5 h-5" />} subtitle="exceções ativas" onClick={() => setTab("todas")} />
          <KPICard title="Críticas" value={kpis.criticas} icon={<ShieldAlert className="w-5 h-5" />} subtitle="ação imediata" onClick={() => setTab("criticas")} />
          <KPICard title="SLA Estourado" value={kpis.slaEstourado} icon={<Clock className="w-5 h-5" />} subtitle="prazo vencido" onClick={() => setTab("vencendo")} />
          <KPICard title="Sem Responsável" value={kpis.semResponsavel} icon={<Users className="w-5 h-5" />} subtitle="sem dono" onClick={() => setTab("sem-responsavel")} />
          <KPICard title="NFs em Risco" value={kpis.nfsEmRisco} icon={<FileText className="w-5 h-5" />} />
          <KPICard title="Resolvidas Hoje" value={kpis.resolvidasHoje} icon={<CheckCircle2 className="w-5 h-5" />} subtitle="no dia" />
        </div>
      )}

      {/* Category cards */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-9 gap-2">
        {(Object.keys(EXCECAO_CATEGORIA_LABELS) as ExcecaoCategoria[]).map(cat => {
          const Icon = CATEGORY_ICONS[cat] || Shield;
          const count = catCounts[cat] || 0;
          const active = filtroCat === cat;
          return (
            <button
              key={cat}
              onClick={() => setFiltroCat(active ? "ALL" : cat)}
              className={`rounded-lg border p-3 text-center transition-all hover:shadow-sm ${active ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border"}`}
            >
              <Icon className={`h-4 w-4 mx-auto mb-1 ${count > 0 ? "text-destructive" : "text-muted-foreground"}`} />
              <p className={`text-lg font-bold ${count > 0 ? "text-foreground" : "text-muted-foreground"}`}>{count}</p>
              <p className="text-[10px] text-muted-foreground leading-tight">{EXCECAO_CATEGORIA_LABELS[cat]}</p>
            </button>
          );
        })}
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="todas">Todas ({excecoes.filter(e => e.status !== "RESOLVIDA" && e.status !== "ENCERRADA").length})</TabsTrigger>
            <TabsTrigger value="criticas">Críticas</TabsTrigger>
            <TabsTrigger value="vencendo">Vencendo</TabsTrigger>
            <TabsTrigger value="sem-responsavel">Sem Dono</TabsTrigger>
            <TabsTrigger value="reincidentes">Reincidentes</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex-1" />
        <Input placeholder="Buscar exceção..." value={busca} onChange={e => setBusca(e.target.value)} className="max-w-[200px]" />
        <Select value={filtroCrit} onValueChange={setFiltroCrit}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Criticidade" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todas</SelectItem>
            {(["CRITICA", "ALTA", "MEDIA", "BAIXA"] as ExcecaoCriticidade[]).map(c => (
              <SelectItem key={c} value={c}>{CRITICIDADE_LABELS[c]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos</SelectItem>
            {(Object.keys(EXCECAO_STATUS_LABELS) as ExcecaoStatus[]).map(s => (
              <SelectItem key={s} value={s}>{EXCECAO_STATUS_LABELS[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Exception List */}
      <div className="glass-card rounded-lg p-5">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">Crit.</TableHead>
              <TableHead>Exceção</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Prazo</TableHead>
              <TableHead>Reinc.</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-12">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-success" />
                  <p className="font-medium">Nenhuma exceção encontrada</p>
                  <p className="text-xs">Todos os indicadores estão dentro dos limites operacionais</p>
                </TableCell>
              </TableRow>
            )}
            {filtered.map(exc => {
              const Icon = CATEGORY_ICONS[exc.categoria] || Shield;
              const prazoVencido = exc.prazo && new Date(exc.prazo) < new Date();
              return (
                <TableRow key={exc.id} className={exc.criticidade === "CRITICA" ? "bg-destructive/5" : undefined}>
                  <TableCell>
                    <Badge className={`text-[10px] ${CRITICIDADE_COLORS[exc.criticidade]}`}>
                      {CRITICIDADE_LABELS[exc.criticidade]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium text-foreground leading-tight">{exc.titulo}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{exc.descricao}</p>
                      <div className="flex gap-1 mt-1">
                        {exc.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="inline-block rounded bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      {EXCECAO_CATEGORIA_LABELS[exc.categoria]}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">
                    {exc.responsavel || <span className="text-destructive font-medium">Sem dono</span>}
                  </TableCell>
                  <TableCell className={`text-xs font-medium ${prazoVencido ? "text-destructive" : "text-foreground"}`}>
                    {exc.prazo ? new Date(exc.prazo).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—"}
                    {prazoVencido && <span className="block text-[10px]">VENCIDO</span>}
                  </TableCell>
                  <TableCell className="text-xs text-center">
                    {exc.reincidencias > 0 ? (
                      <Badge variant="destructive" className="text-[10px]">{exc.reincidencias}x</Badge>
                    ) : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-[10px] ${EXCECAO_STATUS_COLORS[exc.status]}`}>
                      {EXCECAO_STATUS_LABELS[exc.status]}
                    </Badge>
                  </TableCell>
                   <TableCell>
                     <div className="flex gap-1">
                       <Button variant="ghost" size="sm" asChild title="Ver detalhe">
                         <Link to={`/torre-controle/${exc.id}`}><Eye className="h-3.5 w-3.5" /></Link>
                       </Button>
                       {exc.origemRota && (
                         <Button variant="ghost" size="sm" asChild title="Ver origem">
                           <Link to={exc.origemRota}><ExternalLink className="h-3.5 w-3.5" /></Link>
                         </Button>
                       )}
                     </div>
                   </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Timeline de eventos recentes */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass-card rounded-lg p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" /> Eventos Recentes
          </h3>
          <div className="space-y-3">
            {excecoes
              .flatMap(e => e.historico.map(h => ({ ...h, excecaoId: e.id, excecaoTitulo: e.titulo })))
              .sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime())
              .slice(0, 8)
              .map(evt => (
                <div key={evt.id} className="flex items-start gap-3 border-l-2 border-border pl-3 py-1">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground">{evt.descricao}</p>
                    <p className="text-[10px] text-muted-foreground">{evt.excecaoTitulo}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {new Date(evt.dataHora).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
          </div>
        </div>

        <div className="glass-card rounded-lg p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" /> Resumo por Categoria
          </h3>
          <div className="space-y-2">
            {(Object.keys(EXCECAO_CATEGORIA_LABELS) as ExcecaoCategoria[]).map(cat => {
              const count = catCounts[cat] || 0;
              const total = excecoes.filter(e => e.status !== "RESOLVIDA" && e.status !== "ENCERRADA").length || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={cat} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-28 truncate">{EXCECAO_CATEGORIA_LABELS[cat]}</span>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-bold text-foreground w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TorreControlePage;
