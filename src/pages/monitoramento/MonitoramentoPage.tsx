import { useState } from "react";
import { Link } from "react-router-dom";
import { Activity, Users, Truck, Layers, AlertTriangle, Bell, Shield, Eye, Clock } from "lucide-react";
import KPICard from "@/components/KPICard";
import StatusSemaphore from "@/components/operacional/StatusSemaphore";
import RelatedActionsPanel from "@/components/operacional/RelatedActionsPanel";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getDashboardOperacional, getAlertas, getExcecoes, getAcessos } from "@/services/operacional";
import type { AlertaOperacional, ExcecaoOperacional, Acesso } from "@/types/operacional";
import type { DashboardOperacionalData } from "@/services/operacional";

const MonitoramentoPage = () => {
  const [tab, setTab] = useState("tempo-real");
  const d = dashboardOperacional;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Monitoramento em Tempo Real</h1>
        <p className="text-sm text-muted-foreground mt-1">Torre de controle operacional — visão consolidada</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <Link to="/portaria" className="block"><KPICard title="Pessoas Presentes" value={d.visitantesPresentes + d.terceirosNaUnidade} icon={<Users className="w-5 h-5" />} /></Link>
        <Link to="/frota" className="block"><KPICard title="Frota em Deslocamento" value={d.frotaEmDeslocamento} icon={<Truck className="w-5 h-5" />} /></Link>
        <Link to="/patio" className="block"><KPICard title="Docas Ocupadas" value={`${d.docasOcupadas}/${d.docasTotal}`} icon={<Layers className="w-5 h-5" />} /></Link>
        <Link to="/monitoramento?tab=alertas" className="block"><KPICard title="Alertas Ativos" value={d.alertasAtivos} icon={<Bell className="w-5 h-5" />} /></Link>
        <Link to="/nf-transito" className="block"><KPICard title="NFs em Risco" value={d.nfsEmRisco} icon={<AlertTriangle className="w-5 h-5" />} /></Link>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="tempo-real">Operação</TabsTrigger>
          <TabsTrigger value="alertas">Alertas ({mockAlertas.filter(a => a.status === "ATIVO").length})</TabsTrigger>
          <TabsTrigger value="excecoes">Exceções ({mockExcecoes.filter(e => e.status !== "RESOLVIDA").length})</TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "tempo-real" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="glass-card rounded-lg p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4"><Users className="h-4 w-4 text-primary" />Quem está dentro agora</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Visitantes</span><span className="font-semibold">{d.visitantesPresentes}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Veículos Visitantes</span><span className="font-semibold">{d.veiculosVisitantesPresentes}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Terceiros na Unidade</span><span className="font-semibold">{d.terceirosNaUnidade}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Motoristas na Fila</span><span className="font-semibold">{d.filaExterna + d.filaInterna}</span></div>
            </div>
          </div>
          <div className="glass-card rounded-lg p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4"><Activity className="h-4 w-4 text-primary" />Gargalos Operacionais</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Fila Externa</span><span className="font-semibold">{d.filaExterna} veículos</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Veículos Parados</span><span className="font-semibold">{d.veiculosParados}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Tempo Médio Pátio</span><span className="font-semibold">{d.tempoMedioPatio} min</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">SLA Geral</span><span className={`font-bold ${d.slaGeral >= 80 ? "text-success" : d.slaGeral >= 60 ? "text-warning" : "text-destructive"}`}>{d.slaGeral}%</span></div>
            </div>
          </div>
          <div className="glass-card rounded-lg p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4"><Shield className="h-4 w-4 text-primary" />NF em Trânsito</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Em Trânsito</span><span className="font-semibold">{d.nfsEmTransito}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Em Risco</span><span className="font-semibold text-destructive">{d.nfsEmRisco}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Sem Confirmação</span><span className="font-semibold text-warning">{d.nfsSemConfirmacao}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Valor em Risco</span><span className="font-semibold text-destructive">R$ {(d.valorEmRisco / 1000).toFixed(0)}k</span></div>
            </div>
          </div>
          <div className="glass-card rounded-lg p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4"><Clock className="h-4 w-4 text-primary" />Prioridades do Turno</h3>
            <div className="space-y-2">
              {mockAlertas.filter(a => a.status === "ATIVO" && a.criticidade !== "BAIXA").slice(0, 4).map((a) => (
                <div key={a.id} className="flex items-start gap-2 rounded-md border border-border p-2">
                  <StatusSemaphore status={a.criticidade} />
                  <p className="text-xs text-foreground flex-1">{a.descricao}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "alertas" && (
        <div className="glass-card rounded-lg p-5">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Tipo</TableHead><TableHead>Descrição</TableHead><TableHead>Origem</TableHead><TableHead>Criticidade</TableHead><TableHead>Responsável</TableHead><TableHead>Status</TableHead><TableHead>Criado em</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {mockAlertas.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="text-xs font-medium">{a.tipo.replace(/_/g, " ")}</TableCell>
                  <TableCell className="text-xs max-w-xs">{a.descricao}</TableCell>
                  <TableCell className="text-xs">{a.origem}</TableCell>
                  <TableCell><StatusSemaphore status={a.criticidade} /></TableCell>
                  <TableCell className="text-xs">{a.responsavel}</TableCell>
                  <TableCell><StatusSemaphore status={a.status} /></TableCell>
                  <TableCell className="text-xs">{new Date(a.criadoEm).toLocaleString("pt-BR")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {tab === "excecoes" && (
        <div className="space-y-4">
          <div className="glass-card rounded-lg p-5">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Código</TableHead><TableHead>Tipo</TableHead><TableHead>Descrição</TableHead><TableHead>Criticidade</TableHead><TableHead>Responsável</TableHead><TableHead>Prazo</TableHead><TableHead>Status</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {mockExcecoes.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-mono text-xs">{e.id}</TableCell>
                    <TableCell className="text-xs font-medium">{e.tipo}</TableCell>
                    <TableCell className="text-xs max-w-xs">{e.descricao}</TableCell>
                    <TableCell><StatusSemaphore status={e.criticidade} /></TableCell>
                    <TableCell className="text-xs">{e.responsavel}</TableCell>
                    <TableCell className="text-xs">{new Date(e.prazo).toLocaleString("pt-BR")}</TableCell>
                    <TableCell><StatusSemaphore status={e.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <RelatedActionsPanel />
        </div>
      )}
    </div>
  );
};

export default MonitoramentoPage;
