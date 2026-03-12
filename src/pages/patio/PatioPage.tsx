import { useMemo } from "react";
import { Truck, Clock, AlertTriangle, ArrowRight, Layers } from "lucide-react";
import KPICard from "@/components/KPICard";
import StatusSemaphore from "@/components/operacional/StatusSemaphore";
import DockStatusCard from "@/components/operacional/DockStatusCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockDocas, mockFilaPatio, mockOperacoes, mockTransportadoras } from "@/data/mockOperacionalData";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

const PatioPage = () => {
  const [tab, setTab] = useState("visao");

  const kpis = useMemo(() => ({
    docasOcupadas: mockDocas.filter((d) => d.status === "OCUPADA").length,
    docasLivres: mockDocas.filter((d) => d.status === "LIVRE").length,
    docasManutencao: mockDocas.filter((d) => d.status === "MANUTENCAO").length,
    filaTotal: mockFilaPatio.length,
    tempoMedioFila: Math.round(mockFilaPatio.reduce((acc, f) => acc + f.tempoAguardando, 0) / (mockFilaPatio.length || 1)),
  }), []);

  // Yard flow blocks
  const yardStages = [
    { label: "Fila Externa", count: mockFilaPatio.filter((f) => f.status === "FILA_EXTERNA").length, color: "bg-info/15 text-info" },
    { label: "Fila Interna", count: mockFilaPatio.filter((f) => f.status === "FILA_INTERNA").length, color: "bg-info/15 text-info" },
    { label: "Balança", count: mockFilaPatio.filter((f) => f.status === "AGUARDANDO_BALANCA").length, color: "bg-warning/15 text-warning" },
    { label: "Pátio", count: mockFilaPatio.filter((f) => f.status === "NO_PATIO").length, color: "bg-primary/15 text-primary" },
    { label: "Aguardando Doca", count: mockFilaPatio.filter((f) => f.status === "AGUARDANDO_DOCA").length, color: "bg-warning/15 text-warning" },
    { label: "Em Doca", count: mockDocas.filter((d) => d.status === "OCUPADA").length, color: "bg-success/15 text-success" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pátio e Docas</h1>
        <p className="text-sm text-muted-foreground mt-1">Visão do pátio, filas, docas, permanência e chamadas operacionais</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <KPICard title="Docas Ocupadas" value={`${kpis.docasOcupadas}/${mockDocas.length}`} icon={<Layers className="w-5 h-5" />} />
        <KPICard title="Docas Livres" value={kpis.docasLivres} icon={<Layers className="w-5 h-5" />} />
        <KPICard title="Na Fila" value={kpis.filaTotal} icon={<Truck className="w-5 h-5" />} />
        <KPICard title="Tempo Médio Fila" value={`${kpis.tempoMedioFila} min`} icon={<Clock className="w-5 h-5" />} />
        <KPICard title="Manutenção" value={kpis.docasManutencao} icon={<AlertTriangle className="w-5 h-5" />} />
      </div>

      {/* Yard Flow Visual */}
      <div className="glass-card rounded-lg p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Fluxo do Pátio</h3>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {yardStages.map((stage, idx) => (
            <div key={stage.label} className="flex items-center gap-2">
              <div className={`rounded-lg border p-4 min-w-[140px] text-center ${stage.color}`}>
                <p className="text-2xl font-bold">{stage.count}</p>
                <p className="text-xs font-medium mt-1">{stage.label}</p>
              </div>
              {idx < yardStages.length - 1 && <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" />}
            </div>
          ))}
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="visao">Docas</TabsTrigger>
          <TabsTrigger value="fila">Fila</TabsTrigger>
          <TabsTrigger value="permanencia">Permanência</TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "visao" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {mockDocas.map((doca) => (
            <DockStatusCard key={doca.id} doca={doca} />
          ))}
        </div>
      )}

      {tab === "fila" && (
        <div className="glass-card rounded-lg p-5">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ordem</TableHead>
                <TableHead>Placa</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Transportadora</TableHead>
                <TableHead>Operação</TableHead>
                <TableHead>Chegada</TableHead>
                <TableHead>Aguardando</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockFilaPatio.map((f) => (
                <TableRow key={f.id}>
                  <TableCell className="font-bold">{f.ordem}</TableCell>
                  <TableCell className="font-mono font-medium">{f.placa}</TableCell>
                  <TableCell>{f.tipoVeiculo}</TableCell>
                  <TableCell>{f.transportadora}</TableCell>
                  <TableCell><span className="status-badge bg-secondary text-secondary-foreground">{f.operacao}</span></TableCell>
                  <TableCell className="text-xs">{new Date(f.horarioChegada).toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</TableCell>
                  <TableCell className={`font-medium ${f.tempoAguardando > 60 ? "text-destructive" : "text-foreground"}`}>{f.tempoAguardando} min</TableCell>
                  <TableCell><StatusSemaphore status={f.prioridade} /></TableCell>
                  <TableCell><StatusSemaphore status={f.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {tab === "permanencia" && (
        <div className="glass-card rounded-lg p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Permanência por Transportadora</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transportadora</TableHead>
                <TableHead>Operações</TableHead>
                <TableHead>Atraso Médio</TableHead>
                <TableHead>SLA Score</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTransportadoras.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.nome}</TableCell>
                  <TableCell>{t.qtdOperacoes}</TableCell>
                  <TableCell className={`font-medium ${t.mediaAtraso > 30 ? "text-destructive" : "text-foreground"}`}>{t.mediaAtraso} min</TableCell>
                  <TableCell className={`font-bold ${t.slaScore >= 80 ? "text-success" : t.slaScore >= 60 ? "text-warning" : "text-destructive"}`}>{t.slaScore}%</TableCell>
                  <TableCell><StatusSemaphore status={t.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default PatioPage;
