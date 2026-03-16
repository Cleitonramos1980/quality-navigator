import { useState, useEffect } from "react";
import { Truck, Building2, Users, Clock, AlertTriangle, Calendar, Eye } from "lucide-react";
import KPICard from "@/components/KPICard";
import StatusSemaphore from "@/components/operacional/StatusSemaphore";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getTransportadoras, getMotoristasTerceiros, getVeiculosTerceiros, getOperacoes, getAgendamentos } from "@/services/operacional";
import type { Transportadora, MotoristaTerceiro, VeiculoTerceiro, OperacaoTerceiro, AgendamentoDoca } from "@/types/operacional";
import { Progress } from "@/components/ui/progress";

const TerceirosPage = () => {
  const [tab, setTab] = useState("transportadoras");
  const [transportadoras, setTransportadoras] = useState<Transportadora[]>([]);
  const [motoristas, setMotoristas] = useState<MotoristaTerceiro[]>([]);
  const [veiculos, setVeiculos] = useState<VeiculoTerceiro[]>([]);
  const [operacoes, setOperacoes] = useState<OperacaoTerceiro[]>([]);
  const [agendamentos, setAgendamentos] = useState<AgendamentoDoca[]>([]);

  useEffect(() => {
    getTransportadoras().then(setTransportadoras);
    getMotoristasTerceiros().then(setMotoristas);
    getVeiculosTerceiros().then(setVeiculos);
    getOperacoes().then(setOperacoes);
    getAgendamentos().then(setAgendamentos);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Terceiros / Transportadoras</h1>
        <p className="text-sm text-muted-foreground mt-1">Gestão de transportadoras, motoristas terceiros, operações e agendamentos</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <KPICard title="Transportadoras" value={transportadoras.filter(t => t.status === "ATIVA").length} icon={<Building2 className="w-5 h-5" />} subtitle="ativas" />
        <KPICard title="Motoristas" value={motoristas.filter(m => m.status === "ATIVO").length} icon={<Users className="w-5 h-5" />} subtitle="ativos" />
        <KPICard title="Veículos na Unidade" value={veiculos.length} icon={<Truck className="w-5 h-5" />} />
        <KPICard title="Operações Hoje" value={operacoes.length} icon={<Clock className="w-5 h-5" />} />
        <KPICard title="Janelas Perdidas" value={agendamentos.filter(a => a.status === "JANELA_PERDIDA").length} icon={<AlertTriangle className="w-5 h-5" />} />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="transportadoras">Transportadoras</TabsTrigger>
          <TabsTrigger value="motoristas">Motoristas</TabsTrigger>
          <TabsTrigger value="veiculos">Veículos</TabsTrigger>
          <TabsTrigger value="operacoes">Operações</TabsTrigger>
          <TabsTrigger value="agendamentos">Agendamento de Docas</TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "transportadoras" && (
        <div className="glass-card rounded-lg p-5">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Nome</TableHead><TableHead>CNPJ</TableHead><TableHead>Contato</TableHead><TableHead>RNTRC</TableHead><TableHead>Operações</TableHead><TableHead>Atraso Médio</TableHead><TableHead>SLA Score</TableHead><TableHead>Status</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {transportadoras.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.nome}</TableCell>
                  <TableCell className="font-mono text-xs">{t.cnpj}</TableCell>
                  <TableCell className="text-xs">{t.contato}</TableCell>
                  <TableCell className="text-xs">{t.rntrc}</TableCell>
                  <TableCell>{t.qtdOperacoes}</TableCell>
                  <TableCell className="text-xs">{t.mediaAtraso} min</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={t.slaScore} className="w-16 h-2" />
                      <span className={`text-xs font-medium ${t.slaScore >= 80 ? "text-success" : t.slaScore >= 60 ? "text-warning" : "text-destructive"}`}>{t.slaScore}%</span>
                    </div>
                  </TableCell>
                  <TableCell><StatusSemaphore status={t.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {tab === "motoristas" && (
        <div className="glass-card rounded-lg p-5">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Nome</TableHead><TableHead>Documento</TableHead><TableHead>Transportadora</TableHead><TableHead>Telefone</TableHead><TableHead>Última Entrada</TableHead><TableHead>Status</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {motoristas.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.nome}</TableCell>
                  <TableCell className="text-xs">{m.documento}</TableCell>
                  <TableCell>{m.transportadoraNome}</TableCell>
                  <TableCell className="text-xs">{m.telefone}</TableCell>
                  <TableCell className="text-xs">{m.ultimaEntrada ? new Date(m.ultimaEntrada).toLocaleString("pt-BR") : "—"}</TableCell>
                  <TableCell><StatusSemaphore status={m.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {tab === "veiculos" && (
        <div className="glass-card rounded-lg p-5">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Placa</TableHead><TableHead>Tipo</TableHead><TableHead>Transportadora</TableHead><TableHead>Motorista</TableHead><TableHead>Localização</TableHead><TableHead>Doca</TableHead><TableHead>Status</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {veiculos.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-mono font-medium">{v.placa}</TableCell>
                  <TableCell>{v.tipo}</TableCell>
                  <TableCell>{v.transportadoraNome}</TableCell>
                  <TableCell>{v.motoristaNome}</TableCell>
                  <TableCell>{v.localizacao}</TableCell>
                  <TableCell className="text-xs">{v.docaAtual || "—"}</TableCell>
                  <TableCell><StatusSemaphore status={v.statusOperacao} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {tab === "operacoes" && (
        <div className="glass-card rounded-lg p-5">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Código</TableHead><TableHead>Tipo</TableHead><TableHead>Transportadora</TableHead><TableHead>Motorista</TableHead><TableHead>Placa</TableHead><TableHead>Doca</TableHead><TableHead>Previsto</TableHead><TableHead>Chegada</TableHead><TableHead>NF</TableHead><TableHead>Status</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {operacoes.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-xs">{o.id}</TableCell>
                  <TableCell><span className="status-badge bg-secondary text-secondary-foreground">{o.tipo}</span></TableCell>
                  <TableCell>{o.transportadoraNome}</TableCell>
                  <TableCell>{o.motoristaNome}</TableCell>
                  <TableCell className="font-mono text-xs">{o.placa}</TableCell>
                  <TableCell>{o.docaNome || "—"}</TableCell>
                  <TableCell className="text-xs">{new Date(o.horarioPrevisto).toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</TableCell>
                  <TableCell className="text-xs">{o.horarioChegada ? new Date(o.horarioChegada).toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "—"}</TableCell>
                  <TableCell className="text-xs">{o.nfVinculada || "—"}</TableCell>
                  <TableCell><StatusSemaphore status={o.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {tab === "agendamentos" && (
        <div className="glass-card rounded-lg p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Agendamento de Docas</h3>
          <Table>
            <TableHeader><TableRow>
              <TableHead>Código</TableHead><TableHead>Doca</TableHead><TableHead>Transportadora</TableHead><TableHead>Operação</TableHead><TableHead>Placa</TableHead><TableHead>Motorista</TableHead><TableHead>Previsto</TableHead><TableHead>ETA</TableHead><TableHead>Status</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {agendamentos.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-mono text-xs">{a.id}</TableCell>
                  <TableCell className="font-medium">{a.docaNome}</TableCell>
                  <TableCell>{a.transportadoraNome}</TableCell>
                  <TableCell><span className="status-badge bg-secondary text-secondary-foreground">{a.operacao}</span></TableCell>
                  <TableCell className="font-mono text-xs">{a.placa || "—"}</TableCell>
                  <TableCell className="text-xs">{a.motorista || "—"}</TableCell>
                  <TableCell className="text-xs">{new Date(a.horarioPrevisto).toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</TableCell>
                  <TableCell className="text-xs">{a.etaEstimado ? new Date(a.etaEstimado).toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "—"}</TableCell>
                  <TableCell><StatusSemaphore status={a.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default TerceirosPage;
