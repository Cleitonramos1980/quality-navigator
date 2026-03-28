import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardCheck, ChevronDown, ChevronRight, Search, Printer, FileDown,
  Plus, AlertTriangle, CheckCircle2, Clock, XCircle, Users, Building2,
  Filter, FileWarning, Eye,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { mockChecklists } from "@/data/mockChecklistPreInventario";
import NovoChecklistModal from "@/components/inventario/NovoChecklistModal";
import {
  STATUS_LABELS, STATUS_COLORS, CRITICIDADE_LABELS, CRITICIDADE_COLORS,
  STATUS_GERAL_LABELS, type ChecklistItemStatus, type ChecklistCriticidade,
  type ChecklistBloco,
} from "@/types/checklistPreInventario";

/* ─── KPI Card ──────────────────────────────────────────── */
function KPI({ label, value, icon: Icon, variant = "default" }: { label: string; value: number; icon: any; variant?: string }) {
  const colors: Record<string, string> = {
    default: "text-foreground",
    warning: "text-warning",
    destructive: "text-destructive",
    success: "text-success",
    primary: "text-primary",
    muted: "text-muted-foreground",
  };
  return (
    <div className="glass-card rounded-lg p-3 flex items-center gap-3 min-w-[130px]">
      <Icon className={cn("h-5 w-5 shrink-0", colors[variant])} />
      <div>
        <p className="text-xs text-muted-foreground leading-none">{label}</p>
        <p className={cn("text-lg font-bold leading-tight", colors[variant])}>{value}</p>
      </div>
    </div>
  );
}

/* ─── Status & Crit Pills ──────────────────────────────── */
function StatusPill({ status }: { status: ChecklistItemStatus }) {
  return <span className={cn("status-badge text-[11px]", STATUS_COLORS[status])}>{STATUS_LABELS[status]}</span>;
}
function CritPill({ crit }: { crit: ChecklistCriticidade }) {
  return <span className={cn("status-badge text-[11px]", CRITICIDADE_COLORS[crit])}>{CRITICIDADE_LABELS[crit]}</span>;
}

/* ─── Bloco Accordion ──────────────────────────────────── */
function BlocoSection({ bloco, onItemClick }: { bloco: ChecklistBloco; onItemClick: (itemId: string) => void }) {
  const [open, setOpen] = useState(true);
  const total = bloco.itens.length;
  const concluidos = bloco.itens.filter((i) => i.status === "CONCLUIDO").length;
  const pendentes = bloco.itens.filter((i) => i.status === "PENDENTE").length;
  const criticos = bloco.itens.filter((i) => i.criticidade === "ALTA" && i.status !== "CONCLUIDO").length;
  const ncs = bloco.itens.filter((i) => i.nc).length;
  const pct = total > 0 ? Math.round((concluidos / total) * 100) : 0;

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="glass-card rounded-lg overflow-hidden">
      <CollapsibleTrigger className="w-full flex items-center justify-between gap-2 px-4 py-3 hover:bg-muted/40 transition-colors text-left">
        <div className="flex items-center gap-2 min-w-0">
          {open ? <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />}
          <span className="font-semibold text-sm truncate">{bloco.ordem}. {bloco.nome}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {criticos > 0 && <Badge variant="destructive" className="text-[10px] px-1.5">{criticos} críticos</Badge>}
          {pendentes > 0 && <Badge variant="outline" className="text-[10px] px-1.5 text-warning border-warning/40">{pendentes} pendentes</Badge>}
          {ncs > 0 && <Badge variant="outline" className="text-[10px] px-1.5 text-destructive border-destructive/40">{ncs} NC</Badge>}
          <span className="text-xs text-muted-foreground">{concluidos}/{total}</span>
          <Progress value={pct} className="w-20 h-1.5" />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="border-t overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Item</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground w-28">Status</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground w-32">Responsável</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground w-24">Data</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground w-28">Setor</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground w-20">Criticidade</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground w-32">Evidência</th>
                <th className="px-3 py-2 text-center font-medium text-muted-foreground w-12">NC</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground w-10">Ações</th>
              </tr>
            </thead>
            <tbody>
              {bloco.itens.map((item) => (
                <tr
                  key={item.id}
                  className={cn(
                    "border-b last:border-0 hover:bg-muted/20 cursor-pointer transition-colors",
                    item.nc && "bg-destructive/5",
                  )}
                  onClick={() => onItemClick(item.id)}
                >
                  <td className="px-4 py-2 text-foreground">{item.descricao}</td>
                  <td className="px-3 py-2"><StatusPill status={item.status} /></td>
                  <td className="px-3 py-2 text-muted-foreground text-xs">{item.responsavel}</td>
                  <td className="px-3 py-2 text-muted-foreground text-xs">{item.data}</td>
                  <td className="px-3 py-2 text-muted-foreground text-xs">{item.setor}</td>
                  <td className="px-3 py-2"><CritPill crit={item.criticidade} /></td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">
                    {item.evidencia ? (
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3 text-primary" />
                        {item.evidencia}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/40">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {item.nc ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <FileWarning className="h-4 w-4 text-destructive mx-auto" />
                          </TooltipTrigger>
                          <TooltipContent side="left" className="max-w-[240px]">
                            <p className="text-xs font-medium">NC aberta</p>
                            {item.planoAcao && <p className="text-xs text-muted-foreground mt-0.5">{item.planoAcao}</p>}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <span className="text-muted-foreground/40 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => { e.stopPropagation(); onItemClick(item.id); }}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

/* ─── Main Page ─────────────────────────────────────────── */
export default function ChecklistPreInventarioPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [critFilter, setCritFilter] = useState<string>("all");
  const [setorFilter, setSetorFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string>(mockChecklists[0]?.id ?? "");
  const [quickFilter, setQuickFilter] = useState<string | null>(null);
  const [novoChecklistOpen, setNovoChecklistOpen] = useState(false);

  const checklist = mockChecklists.find((c) => c.id === selectedId);

  /* aggregate KPIs */
  const kpis = useMemo(() => {
    if (!checklist) return { total: 0, pendentes: 0, emAndamento: 0, concluidos: 0, criticos: 0, ncs: 0, semResponsavel: 0, setores: 0 };
    const allItens = checklist.blocos.flatMap((b) => b.itens);
    const setores = new Set(allItens.map((i) => i.setor));
    return {
      total: allItens.length,
      pendentes: allItens.filter((i) => i.status === "PENDENTE").length,
      emAndamento: allItens.filter((i) => i.status === "EM_ANDAMENTO").length,
      concluidos: allItens.filter((i) => i.status === "CONCLUIDO").length,
      criticos: allItens.filter((i) => i.criticidade === "ALTA" && i.status !== "CONCLUIDO").length,
      ncs: allItens.filter((i) => i.nc).length,
      semResponsavel: allItens.filter((i) => !i.responsavel).length,
      setores: setores.size,
    };
  }, [checklist]);

  /* unique setores for filter */
  const allSetores = useMemo(() => {
    if (!checklist) return [];
    const s = new Set(checklist.blocos.flatMap((b) => b.itens).map((i) => i.setor));
    return [...s].sort();
  }, [checklist]);

  /* filter blocos */
  const filteredBlocos = useMemo(() => {
    if (!checklist) return [];
    return checklist.blocos.map((bloco) => ({
      ...bloco,
      itens: bloco.itens.filter((item) => {
        if (search && !item.descricao.toLowerCase().includes(search.toLowerCase()) && !item.responsavel.toLowerCase().includes(search.toLowerCase())) return false;
        if (statusFilter !== "all" && item.status !== statusFilter) return false;
        if (critFilter !== "all" && item.criticidade !== critFilter) return false;
        if (setorFilter !== "all" && item.setor !== setorFilter) return false;
        if (quickFilter === "nc" && !item.nc) return false;
        if (quickFilter === "sem-evidencia" && item.evidencia) return false;
        return true;
      }),
    })).filter((b) => b.itens.length > 0);
  }, [checklist, search, statusFilter, critFilter, setorFilter, quickFilter]);

  const handleItemClick = (itemId: string) => {
    navigate(`/qualidade/inventario/checklist-pre/${selectedId}/item/${itemId}`);
  };

  const applyQuick = (key: string, status?: string, crit?: string) => {
    setStatusFilter(status ?? "all");
    setCritFilter(crit ?? "all");
    setQuickFilter(key === quickFilter ? null : key);
    if (key !== "nc" && key !== "sem-evidencia") setQuickFilter(null);
  };

  return (
    <div className="space-y-4 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" /> Checklist Pré-Inventário
          </h1>
          <p className="text-sm text-muted-foreground">Controle preparatório para execução segura e organizada do inventário</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button size="sm" onClick={() => toast({ title: "Novo checklist", description: "Funcionalidade em construção." })}>
            <Plus className="h-4 w-4 mr-1" />Novo Checklist
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast({ title: "Imprimir", description: "Relatório enviado para impressão." })}>
            <Printer className="h-4 w-4 mr-1" />Imprimir
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast({ title: "Exportar", description: "PDF gerado com sucesso." })}>
            <FileDown className="h-4 w-4 mr-1" />PDF
          </Button>
        </div>
      </div>

      {/* Checklist selector + header info */}
      <div className="glass-card rounded-lg p-3 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <Select value={selectedId} onValueChange={setSelectedId}>
          <SelectTrigger className="w-full sm:w-[360px]"><SelectValue placeholder="Selecione um checklist" /></SelectTrigger>
          <SelectContent>
            {mockChecklists.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.id} — {c.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {checklist && (
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span><strong>Unidade:</strong> {checklist.unidade}</span>
            <span><strong>Data prevista:</strong> {checklist.dataPrevistaInventario}</span>
            <span><strong>Tipo:</strong> {checklist.tipoInventario}</span>
            <span><strong>Responsável:</strong> {checklist.responsavelGeral}</span>
            <span className={cn(
              "status-badge text-[11px]",
              checklist.statusGeral === "CONCLUIDO" ? "bg-success/15 text-success"
                : checklist.statusGeral === "EM_ANDAMENTO" ? "bg-primary/15 text-primary"
                : checklist.statusGeral === "CANCELADO" ? "bg-muted text-muted-foreground"
                : "bg-warning/15 text-warning",
            )}>
              {STATUS_GERAL_LABELS[checklist.statusGeral]}
            </span>
          </div>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        <KPI label="Total de Itens" value={kpis.total} icon={ClipboardCheck} />
        <KPI label="Pendentes" value={kpis.pendentes} icon={Clock} variant="warning" />
        <KPI label="Em Andamento" value={kpis.emAndamento} icon={Filter} variant="primary" />
        <KPI label="Concluídos" value={kpis.concluidos} icon={CheckCircle2} variant="success" />
        <KPI label="Críticos" value={kpis.criticos} icon={AlertTriangle} variant="destructive" />
        <KPI label="NCs Abertas" value={kpis.ncs} icon={FileWarning} variant="destructive" />
        <KPI label="Sem Responsável" value={kpis.semResponsavel} icon={Users} variant="muted" />
        <KPI label="Setores" value={kpis.setores} icon={Building2} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar item ou responsável..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-8 text-sm" />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setQuickFilter(null); }}>
          <SelectTrigger className="w-[150px] h-8 text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {(Object.keys(STATUS_LABELS) as ChecklistItemStatus[]).map((s) => <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={critFilter} onValueChange={(v) => { setCritFilter(v); setQuickFilter(null); }}>
          <SelectTrigger className="w-[130px] h-8 text-sm"><SelectValue placeholder="Criticidade" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {(Object.keys(CRITICIDADE_LABELS) as ChecklistCriticidade[]).map((c) => <SelectItem key={c} value={c}>{CRITICIDADE_LABELS[c]}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={setorFilter} onValueChange={(v) => { setSetorFilter(v); setQuickFilter(null); }}>
          <SelectTrigger className="w-[150px] h-8 text-sm"><SelectValue placeholder="Setor" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os setores</SelectItem>
            {allSetores.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        {/* Quick filters */}
        <div className="flex gap-1 flex-wrap">
          <Button variant={statusFilter === "PENDENTE" && !quickFilter ? "secondary" : "ghost"} size="sm" className="h-7 text-xs px-2" onClick={() => applyQuick("pendentes", "PENDENTE")}>Pendentes</Button>
          <Button variant={critFilter === "ALTA" && !quickFilter ? "secondary" : "ghost"} size="sm" className="h-7 text-xs px-2" onClick={() => applyQuick("criticos", "all", "ALTA")}>Críticos</Button>
          <Button variant={statusFilter === "CONCLUIDO" && !quickFilter ? "secondary" : "ghost"} size="sm" className="h-7 text-xs px-2" onClick={() => applyQuick("concluidos", "CONCLUIDO")}>Concluídos</Button>
          <Button variant={quickFilter === "nc" ? "secondary" : "ghost"} size="sm" className="h-7 text-xs px-2" onClick={() => { setStatusFilter("all"); setCritFilter("all"); setQuickFilter(quickFilter === "nc" ? null : "nc"); }}>Com NC</Button>
          <Button variant={quickFilter === "sem-evidencia" ? "secondary" : "ghost"} size="sm" className="h-7 text-xs px-2" onClick={() => { setStatusFilter("all"); setCritFilter("all"); setQuickFilter(quickFilter === "sem-evidencia" ? null : "sem-evidencia"); }}>Sem Evidência</Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs px-2" onClick={() => { setStatusFilter("all"); setCritFilter("all"); setSetorFilter("all"); setSearch(""); setQuickFilter(null); }}>Limpar</Button>
        </div>
      </div>

      {/* Blocos */}
      <div className="space-y-2">
        {filteredBlocos.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Nenhum item encontrado com os filtros aplicados.</p>}
        {filteredBlocos.map((bloco) => (
          <BlocoSection key={bloco.id} bloco={bloco} onItemClick={handleItemClick} />
        ))}
      </div>
    </div>
  );
}
