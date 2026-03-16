import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { FileText, AlertTriangle, DollarSign, Clock, TrendingUp, Eye, Truck } from "lucide-react";
import KPICard from "@/components/KPICard";
import StatusSemaphore from "@/components/operacional/StatusSemaphore";
import RiskScoreCard from "@/components/operacional/RiskScoreCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getNFsTransito, getExcecoesFiscais, getDashboardOperacional } from "@/services/operacional";
import type { NFTransito, ExcecaoFiscal } from "@/types/operacional";
import type { DashboardOperacionalData } from "@/services/operacional";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(152, 60%, 40%)", "hsl(38, 92%, 50%)", "hsl(0, 72%, 51%)", "hsl(220, 25%, 20%)"];

const defaultDash: DashboardOperacionalData = { visitantesPresentes: 0, veiculosVisitantesPresentes: 0, terceirosNaUnidade: 0, frotaEmDeslocamento: 0, docasOcupadas: 0, docasTotal: 0, alertasAtivos: 0, nfsEmTransito: 0, nfsEmRisco: 0, nfsSemConfirmacao: 0, valorEmTransito: 0, valorEmRisco: 0, mediaDiasTransito: 0, filaExterna: 0, filaInterna: 0, veiculosParados: 0, tempoMedioPatio: 0, slaGeral: 0 };

const NFTransitoDashboardPage = () => {
  const [tab, setTab] = useState("dashboard");
  const [busca, setBusca] = useState("");
  const [d, setD] = useState<DashboardOperacionalData>(defaultDash);
  const [allNFs, setAllNFs] = useState<NFTransito[]>([]);
  const [excecoesFiscais, setExcecoesFiscais] = useState<ExcecaoFiscal[]>([]);

  useEffect(() => {
    getDashboardOperacional().then(setD);
    getNFsTransito().then(setAllNFs);
    getExcecoesFiscais().then(setExcecoesFiscais);
  }, []);

  const nfsFiltradas = useMemo(() => {
    let list = allNFs;
    if (tab === "risco") list = list.filter((nf) => ["EM_RISCO", "CRITICA"].includes(nf.status));
    if (busca) {
      const q = busca.toLowerCase();
      list = list.filter((nf) => nf.numero.toLowerCase().includes(q) || nf.cliente.toLowerCase().includes(q) || nf.transportadoraNome.toLowerCase().includes(q));
    }
    return list;
  }, [tab, busca, allNFs]);

  const criticidadeData = useMemo(() => {
    const counts: Record<string, number> = {};
    allNFs.forEach((nf) => { counts[nf.criticidade] = (counts[nf.criticidade] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [allNFs]);

  const transportadoraData = useMemo(() => {
    const counts: Record<string, number> = {};
    allNFs.forEach((nf) => { counts[nf.transportadoraNome] = (counts[nf.transportadoraNome] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name: name.length > 15 ? name.slice(0, 15) + "…" : name, value }));
  }, [allNFs]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">NF em Trânsito</h1>
        <p className="text-sm text-muted-foreground mt-1">Rastreabilidade fiscal-logística — NF-e, CT-e, MDF-e e confirmação de recebimento</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <KPICard title="NFs em Trânsito" value={d.nfsEmTransito} icon={<FileText className="w-5 h-5" />} onClick={() => setTab("lista")} />
        <KPICard title="Em Risco" value={d.nfsEmRisco} icon={<AlertTriangle className="w-5 h-5" />} subtitle="requerem ação" onClick={() => setTab("risco")} />
        <KPICard title="Valor em Trânsito" value={`R$ ${(d.valorEmTransito / 1000).toFixed(0)}k`} icon={<DollarSign className="w-5 h-5" />} onClick={() => setTab("lista")} />
        <KPICard title="Valor em Risco" value={`R$ ${(d.valorEmRisco / 1000).toFixed(0)}k`} icon={<DollarSign className="w-5 h-5" />} subtitle={`${d.nfsSemConfirmacao} sem confirmação`} onClick={() => setTab("risco")} />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="lista">Documentos</TabsTrigger>
          <TabsTrigger value="risco">Painel de Risco</TabsTrigger>
          <TabsTrigger value="excecoes">Exceções Fiscais ({excecoesFiscais.length})</TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "dashboard" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="glass-card rounded-lg p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">NFs por Criticidade</h3>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={criticidadeData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value">
                    {criticidadeData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="glass-card rounded-lg p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">NFs por Transportadora</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={transportadoraData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="glass-card rounded-lg p-5 lg:col-span-2">
            <h3 className="text-sm font-semibold text-foreground mb-4">KPIs Adicionais</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center"><p className="text-2xl font-bold text-foreground">{d.mediaDiasTransito}</p><p className="text-xs text-muted-foreground">Média dias trânsito</p></div>
              <div className="text-center"><p className="text-2xl font-bold text-success">{allNFs.filter(n => n.status === "RECEBIMENTO_CONFIRMADO").length}</p><p className="text-xs text-muted-foreground">Entregas concluídas</p></div>
              <div className="text-center"><p className="text-2xl font-bold text-warning">{allNFs.filter(n => n.status === "AGUARDANDO_CONFIRMACAO").length}</p><p className="text-xs text-muted-foreground">Aguardando confirmação</p></div>
              <div className="text-center"><p className="text-2xl font-bold text-destructive">{excecoesFiscais.filter(e => e.status === "ABERTA").length}</p><p className="text-xs text-muted-foreground">Exceções abertas</p></div>
            </div>
          </div>
        </div>
      )}

      {(tab === "lista" || tab === "risco") && (
        <div className="glass-card rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">{tab === "risco" ? "Documentos em Risco" : "Documentos em Trânsito"}</h3>
            <Input placeholder="Buscar NF, cliente ou transportadora..." value={busca} onChange={(e) => setBusca(e.target.value)} className="max-w-xs" />
          </div>
          <Table>
            <TableHeader><TableRow>
              <TableHead>NF</TableHead><TableHead>Cliente</TableHead><TableHead>Destino</TableHead><TableHead>Valor</TableHead><TableHead>Transportadora</TableHead><TableHead>Dias</TableHead><TableHead>Risco</TableHead><TableHead>Status</TableHead><TableHead>Ações</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {nfsFiltradas.length === 0 && <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">Nenhum documento encontrado.</TableCell></TableRow>}
              {nfsFiltradas.map((nf) => (
                <TableRow key={nf.id}>
                  <TableCell className="font-mono font-medium">{nf.numero}</TableCell>
                  <TableCell className="text-xs">{nf.cliente}</TableCell>
                  <TableCell className="text-xs">{nf.destino}</TableCell>
                  <TableCell className="text-xs">R$ {nf.valor.toLocaleString("pt-BR")}</TableCell>
                  <TableCell className="text-xs">{nf.transportadoraNome}</TableCell>
                  <TableCell className={`font-medium ${nf.diasEmTransito > 5 ? "text-destructive" : "text-foreground"}`}>{nf.diasEmTransito}d</TableCell>
                  <TableCell><span className={`inline-flex items-center gap-1 text-xs font-bold ${nf.scoreRisco > 50 ? "text-destructive" : nf.scoreRisco > 25 ? "text-warning" : "text-success"}`}>{nf.scoreRisco}</span></TableCell>
                  <TableCell><StatusSemaphore status={nf.status} /></TableCell>
                  <TableCell><Button variant="ghost" size="sm" asChild><Link to={`/nf-transito/${nf.id}`}><Eye className="h-4 w-4" /></Link></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {tab === "excecoes" && (
        <div className="glass-card rounded-lg p-5">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Código</TableHead><TableHead>Tipo</TableHead><TableHead>NF</TableHead><TableHead>Descrição</TableHead><TableHead>Criticidade</TableHead><TableHead>Status</TableHead><TableHead>Responsável</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {excecoesFiscais.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-mono text-xs">{e.id}</TableCell>
                  <TableCell className="text-xs font-medium">{e.tipo}</TableCell>
                  <TableCell className="font-mono text-xs">{e.nfNumero}</TableCell>
                  <TableCell className="text-xs max-w-xs">{e.descricao}</TableCell>
                  <TableCell><StatusSemaphore status={e.criticidade} /></TableCell>
                  <TableCell><StatusSemaphore status={e.status} /></TableCell>
                  <TableCell className="text-xs">{e.responsavel || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default NFTransitoDashboardPage;
