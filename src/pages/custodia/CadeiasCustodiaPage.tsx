import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Shield, FileText, AlertTriangle, Clock, Eye, TrendingUp, CheckCircle2,
  Package, Truck, MapPin, ArrowRight, Camera, FileSignature,
} from "lucide-react";
import KPICard from "@/components/KPICard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCustodias, getCustodiaKPIs } from "@/services/custodia";
import type { CustodiaNF, CustodiaKPIs } from "@/types/custodiaDigital";
import { CUSTODIA_STATUS_LABELS, CUSTODIA_STATUS_COLORS } from "@/types/custodiaDigital";
import AgingChart, { type AgingBucket } from "@/components/dashboard/AgingChart";

const EVIDENCE_ICONS: Record<string, typeof Camera> = {
  COMPROVANTE_SAIDA: FileText,
  COMPROVANTE_CHEGADA: MapPin,
  PROVA_ENTREGA: Package,
  ASSINATURA: FileSignature,
  FOTO: Camera,
  DOCUMENTO: FileText,
};

const CadeiasCustodiaPage = () => {
  const [custodias, setCustodias] = useState<CustodiaNF[]>([]);
  const [kpis, setKpis] = useState<CustodiaKPIs | null>(null);
  const [tab, setTab] = useState("dashboard");
  const [busca, setBusca] = useState("");

  useEffect(() => {
    getCustodias().then(setCustodias);
    getCustodiaKPIs().then(setKpis);
  }, []);

  const filtered = useMemo(() => {
    let list = custodias;
    if (tab === "risco") list = list.filter(c => c.status === "EM_RISCO" || c.scoreRisco > 50);
    if (busca) {
      const q = busca.toLowerCase();
      list = list.filter(c => c.nfNumero.toLowerCase().includes(q) || c.cliente.toLowerCase().includes(q));
    }
    return list;
  }, [custodias, tab, busca]);

  const agingData = useMemo((): AgingBucket[] => {
    const buckets = [
      { label: "0-2 dias", max: 2, count: 0, severity: "ok" as const },
      { label: "3-4 dias", max: 4, count: 0, severity: "ok" as const },
      { label: "5-6 dias", max: 6, count: 0, severity: "warn" as const },
      { label: "7+ dias", max: Infinity, count: 0, severity: "critical" as const },
    ];
    custodias.forEach(c => {
      const b = buckets.find(b => c.diasEmTransito <= b.max);
      if (b) b.count += 1;
    });
    return buckets.filter(b => b.count > 0);
  }, [custodias]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" /> Cadeia de Custódia Digital
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Rastreabilidade ponta a ponta — da emissão à prova de entrega
        </p>
      </div>

      {/* KPIs */}
      {kpis && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <KPICard title="Em Trânsito" value={kpis.nfsEmTransito} icon={<Truck className="w-5 h-5" />} />
          <KPICard title="Em Risco" value={kpis.nfsEmRisco} icon={<AlertTriangle className="w-5 h-5" />} subtitle="requerem ação" onClick={() => setTab("risco")} />
          <KPICard title="Sem Confirmação" value={kpis.nfsSemConfirmacao} icon={<Clock className="w-5 h-5" />} subtitle="aguardando" />
          <KPICard title="Lead Time" value={`${kpis.leadTimeMedio}d`} icon={<TrendingUp className="w-5 h-5" />} subtitle="média" />
          <KPICard title="SLA Rota" value={`${kpis.slaRota}%`} icon={<CheckCircle2 className="w-5 h-5" />} subtitle="cumprimento" />
        </div>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="lista">Documentos</TabsTrigger>
          <TabsTrigger value="risco">Painel de Risco</TabsTrigger>
          <TabsTrigger value="aging">Aging</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Dashboard */}
      {tab === "dashboard" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="glass-card rounded-lg p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Jornada das NFs Ativas</h3>
            <div className="space-y-4">
              {custodias.filter(c => c.status !== "ENCERRADA").map(c => (
                <div key={c.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-bold text-foreground">{c.nfNumero}</p>
                      <p className="text-xs text-muted-foreground">{c.cliente}</p>
                    </div>
                    <Badge className={`text-[10px] ${CUSTODIA_STATUS_COLORS[c.status]}`}>
                      {CUSTODIA_STATUS_LABELS[c.status]}
                    </Badge>
                  </div>
                  {/* Mini timeline */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-1">
                    {c.eventos.map((ev, idx) => (
                      <div key={ev.id} className="flex items-center gap-1">
                        <div className="rounded-full bg-primary/10 p-1.5" title={ev.descricao}>
                          <CheckCircle2 className="h-3 w-3 text-primary" />
                        </div>
                        {idx < c.eventos.length - 1 && (
                          <div className="w-4 h-px bg-border" />
                        )}
                      </div>
                    ))}
                    {c.status !== "ENTREGUE" && c.status !== "ENCERRADA" && (
                      <>
                        <div className="w-4 h-px bg-border" />
                        <div className="rounded-full border-2 border-dashed border-muted-foreground/30 p-1.5">
                          <Clock className="h-3 w-3 text-muted-foreground/50" />
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
                    <span>{c.eventos.length} etapas registradas</span>
                    <span>{c.evidencias.length} evidências</span>
                    <span>{c.diasEmTransito}d em trânsito</span>
                    {c.scoreRisco > 0 && (
                      <span className={c.scoreRisco > 50 ? "text-destructive font-bold" : "text-warning"}>
                        Risco: {c.scoreRisco}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {kpis && (
              <div className="glass-card rounded-lg p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">Indicadores de Custódia</h3>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div><p className="text-2xl font-bold text-foreground">{kpis.leadTimeMedio}d</p><p className="text-xs text-muted-foreground">Lead time médio</p></div>
                  <div><p className={`text-2xl font-bold ${kpis.slaRota >= 80 ? "text-success" : kpis.slaRota >= 60 ? "text-warning" : "text-destructive"}`}>{kpis.slaRota}%</p><p className="text-xs text-muted-foreground">SLA da rota</p></div>
                  <div><p className="text-2xl font-bold text-warning">{kpis.nfsComDivergencia}</p><p className="text-xs text-muted-foreground">Com divergência</p></div>
                  <div><p className="text-2xl font-bold text-destructive">{kpis.nfsAtrasadas}</p><p className="text-xs text-muted-foreground">Atrasadas</p></div>
                </div>
              </div>
            )}

            <div className="glass-card rounded-lg p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Evidências Recentes</h3>
              <div className="space-y-2">
                {custodias.flatMap(c => c.evidencias.map(e => ({ ...e, nfNumero: c.nfNumero })))
                  .sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime())
                  .slice(0, 6)
                  .map(ev => {
                    const Icon = EVIDENCE_ICONS[ev.tipo] || FileText;
                    return (
                      <div key={ev.id} className="flex items-center gap-3 rounded-md border border-border p-2">
                        <Icon className="h-4 w-4 text-primary shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground">{ev.descricao}</p>
                          <p className="text-[10px] text-muted-foreground">{ev.nfNumero} · {ev.responsavel}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {new Date(ev.dataHora).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista / Risco */}
      {(tab === "lista" || tab === "risco") && (
        <div className="glass-card rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">
              {tab === "risco" ? "NFs em Risco" : "Cadeia de Custódia — Documentos"}
            </h3>
            <Input placeholder="Buscar NF ou cliente..." value={busca} onChange={e => setBusca(e.target.value)} className="max-w-xs" />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NF</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Destino</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Veículo</TableHead>
                <TableHead>Etapas</TableHead>
                <TableHead>Evidências</TableHead>
                <TableHead>Dias</TableHead>
                <TableHead>Risco</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={11} className="text-center text-muted-foreground py-8">Nenhum documento encontrado.</TableCell></TableRow>
              )}
              {filtered.map(c => (
                <TableRow key={c.id} className={c.scoreRisco > 75 ? "bg-destructive/5" : undefined}>
                  <TableCell className="font-mono text-xs font-medium">{c.nfNumero}</TableCell>
                  <TableCell className="text-xs">{c.cliente}</TableCell>
                  <TableCell className="text-xs">{c.destino}</TableCell>
                  <TableCell className="text-xs">R$ {c.valor.toLocaleString("pt-BR")}</TableCell>
                  <TableCell className="font-mono text-xs">{c.veiculoPlaca || "—"}</TableCell>
                  <TableCell className="text-xs text-center">{c.eventos.length}</TableCell>
                  <TableCell className="text-xs text-center">{c.evidencias.length}</TableCell>
                  <TableCell className={`font-medium text-xs ${c.diasEmTransito > 5 ? "text-destructive" : "text-foreground"}`}>{c.diasEmTransito}d</TableCell>
                  <TableCell>
                    <span className={`text-xs font-bold ${c.scoreRisco > 50 ? "text-destructive" : c.scoreRisco > 25 ? "text-warning" : "text-success"}`}>
                      {c.scoreRisco}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-[10px] ${CUSTODIA_STATUS_COLORS[c.status]}`}>
                      {CUSTODIA_STATUS_LABELS[c.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/custodia/${c.id}`}><Eye className="h-4 w-4" /></Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Aging */}
      {tab === "aging" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <AgingChart data={agingData} title="Aging — Dias em Custódia" />
          <div className="glass-card rounded-lg p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">NFs com Maior Envelhecimento</h3>
            <div className="space-y-3">
              {[...custodias].sort((a, b) => b.diasEmTransito - a.diasEmTransito).slice(0, 5).map(c => (
                <div key={c.id} className="flex items-center gap-3 rounded-md border border-border p-3">
                  <div className={`text-lg font-bold ${c.diasEmTransito > 5 ? "text-destructive" : c.diasEmTransito > 3 ? "text-warning" : "text-foreground"}`}>
                    {c.diasEmTransito}d
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground">{c.nfNumero} — {c.cliente}</p>
                    <p className="text-[10px] text-muted-foreground">{c.transportadoraNome} · {c.destino}</p>
                  </div>
                  <Badge className={`text-[10px] ${CUSTODIA_STATUS_COLORS[c.status]}`}>
                    {CUSTODIA_STATUS_LABELS[c.status]}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CadeiasCustodiaPage;
