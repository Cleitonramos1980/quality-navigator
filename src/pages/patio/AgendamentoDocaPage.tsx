import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CalendarDays, Clock, Truck, Layers, AlertTriangle, CheckCircle2,
  ArrowRight, Filter, BarChart3, Timer, XCircle, RefreshCw,
} from "lucide-react";
import KPICard from "@/components/KPICard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAgendamentosSlots, getDockCapacity, getAgendamentoKPIs } from "@/services/agendamento";
import type { AgendamentoDockSlot, DockCapacity, AgendamentoKPIs } from "@/types/agendamento";
import { AGENDAMENTO_STATUS_LABELS, AGENDAMENTO_STATUS_COLORS, PRIORIDADE_COLORS } from "@/types/agendamento";

const SLOT_COLORS: Record<string, string> = {
  livre: "bg-success/20",
  agendado: "bg-info/20",
  ocupado: "bg-warning/20",
  conflito: "bg-destructive/20",
  manutencao: "bg-muted",
};

const AgendamentoDocaPage = () => {
  const [slots, setSlots] = useState<AgendamentoDockSlot[]>([]);
  const [capacity, setCapacity] = useState<DockCapacity[]>([]);
  const [kpis, setKpis] = useState<AgendamentoKPIs | null>(null);
  const [tab, setTab] = useState("grade");
  const [filtroStatus, setFiltroStatus] = useState("ALL");

  useEffect(() => {
    getAgendamentosSlots().then(setSlots);
    getDockCapacity().then(setCapacity);
    getAgendamentoKPIs().then(setKpis);
  }, []);

  const filteredSlots = useMemo(() => {
    let list = slots;
    if (filtroStatus !== "ALL") list = list.filter(s => s.status === filtroStatus);
    return list.sort((a, b) => new Date(a.dataHoraPrevista).getTime() - new Date(b.dataHoraPrevista).getTime());
  }, [slots, filtroStatus]);

  const horasGrade = capacity[0]?.slots.map(s => s.hora) || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <CalendarDays className="h-6 w-6 text-primary" /> Agendamento de Docas
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Planejamento, priorização e alocação inteligente de docas e pátio
        </p>
      </div>

      {/* KPIs */}
      {kpis && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <KPICard title="Taxa Ocupação" value={`${kpis.taxaOcupacao}%`} icon={<Layers className="w-5 h-5" />} subtitle="docas hoje" />
          <KPICard title="Tempo Médio Espera" value={`${kpis.tempoMedioEspera} min`} icon={<Clock className="w-5 h-5" />} />
          <KPICard title="Dentro da Janela" value={`${kpis.dentroJanela}%`} icon={<CheckCircle2 className="w-5 h-5" />} subtitle="% pontualidade" />
          <KPICard title="Atrasos Hoje" value={kpis.atrasosDia} icon={<AlertTriangle className="w-5 h-5" />} subtitle={`${kpis.noShow} no-show`} />
          <KPICard title="Throughput" value={`${kpis.throughputDoca}/h`} icon={<BarChart3 className="w-5 h-5" />} subtitle="op/doca/dia" />
        </div>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="grade">Grade por Doca</TabsTrigger>
          <TabsTrigger value="lista">Lista de Agendamentos</TabsTrigger>
          <TabsTrigger value="fila">Fila do Dia</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Grade por Doca */}
      {tab === "grade" && (
        <div className="glass-card rounded-lg p-5 overflow-x-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Capacidade por Faixa Horária — Hoje</h3>
            <div className="flex gap-2 text-[10px]">
              {Object.entries(SLOT_COLORS).map(([key, color]) => (
                <span key={key} className="flex items-center gap-1">
                  <span className={`inline-block h-3 w-3 rounded ${color}`} />
                  {key === "livre" ? "Livre" : key === "agendado" ? "Agendado" : key === "ocupado" ? "Ocupado" : key === "conflito" ? "Conflito" : "Manutenção"}
                </span>
              ))}
            </div>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="text-left font-semibold text-muted-foreground py-2 px-2 w-24">Doca</th>
                {horasGrade.map(h => (
                  <th key={h} className="text-center font-medium text-muted-foreground py-2 px-1 min-w-[52px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {capacity.map(dock => (
                <tr key={dock.docaId} className="border-t border-border">
                  <td className="font-semibold text-foreground py-2 px-2">{dock.docaNome}</td>
                  {dock.slots.map((slot, idx) => (
                    <td key={idx} className="py-2 px-1 text-center">
                      <div className={`h-8 rounded flex items-center justify-center ${SLOT_COLORS[slot.status]}`}>
                        {slot.status === "conflito" && <AlertTriangle className="h-3 w-3 text-destructive" />}
                        {slot.status === "manutencao" && <XCircle className="h-3 w-3 text-muted-foreground" />}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Lista de Agendamentos */}
      {tab === "lista" && (
        <div className="glass-card rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Agendamentos do Dia</h3>
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                {Object.entries(AGENDAMENTO_STATUS_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Janela</TableHead>
                <TableHead>Transportadora</TableHead>
                <TableHead>Placa</TableHead>
                <TableHead>Operação</TableHead>
                <TableHead>Doca</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>SLA</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Pendências</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSlots.length === 0 && (
                <TableRow><TableCell colSpan={11} className="text-center text-muted-foreground py-8">Nenhum agendamento encontrado.</TableCell></TableRow>
              )}
              {filteredSlots.map(slot => (
                <TableRow key={slot.id} className={slot.status === "ATRASADO" ? "bg-destructive/5" : slot.status === "NAO_COMPARECEU" ? "bg-muted/50" : undefined}>
                  <TableCell className="font-mono text-xs font-medium">{slot.codigo}</TableCell>
                  <TableCell className="text-xs">
                    <div>{new Date(slot.janelaInicio).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</div>
                    <div className="text-muted-foreground">até {new Date(slot.janelaFim).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</div>
                  </TableCell>
                  <TableCell className="text-xs">{slot.transportadoraNome}</TableCell>
                  <TableCell className="font-mono text-xs">{slot.placa || "—"}</TableCell>
                  <TableCell><Badge variant="secondary" className="text-[10px]">{slot.tipoOperacao}</Badge></TableCell>
                  <TableCell className="text-xs font-medium">{slot.docaPrevistaNome || "—"}</TableCell>
                  <TableCell className="text-xs">{slot.duracaoPrevistaMin} min</TableCell>
                  <TableCell>
                    <Badge className={`text-[10px] ${PRIORIDADE_COLORS[slot.prioridade]}`}>{slot.prioridade}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs font-bold ${slot.sla >= 80 ? "text-success" : slot.sla >= 50 ? "text-warning" : "text-destructive"}`}>
                      {slot.sla}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-[10px] ${AGENDAMENTO_STATUS_COLORS[slot.status]}`}>
                      {AGENDAMENTO_STATUS_LABELS[slot.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[180px]">
                    {slot.pendencias.length > 0 ? (
                      <div className="space-y-0.5">
                        {slot.pendencias.map((p, i) => (
                          <p key={i} className="text-[10px] text-destructive leading-tight">{p}</p>
                        ))}
                      </div>
                    ) : <span className="text-xs text-muted-foreground">—</span>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Fila do Dia */}
      {tab === "fila" && (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="glass-card rounded-lg p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Timer className="h-4 w-4 text-warning" /> Atrasos & Gargalos
              </h3>
              <div className="space-y-3">
                {slots.filter(s => ["ATRASADO", "NAO_COMPARECEU", "REMARCADO"].includes(s.status)).map(s => (
                  <div key={s.id} className="flex items-start gap-3 rounded-md border border-destructive/20 bg-destructive/5 p-3">
                    <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground">{s.codigo} — {s.transportadoraNome}</p>
                      <p className="text-[10px] text-muted-foreground">{s.tipoOperacao} · {s.docaPrevistaNome || "Sem doca"} · {s.placa || "Sem placa"}</p>
                      {s.pendencias.map((p, i) => (
                        <p key={i} className="text-[10px] text-destructive mt-0.5">{p}</p>
                      ))}
                    </div>
                    <Badge className={`text-[10px] shrink-0 ${AGENDAMENTO_STATUS_COLORS[s.status]}`}>
                      {AGENDAMENTO_STATUS_LABELS[s.status]}
                    </Badge>
                  </div>
                ))}
                {slots.filter(s => ["ATRASADO", "NAO_COMPARECEU", "REMARCADO"].includes(s.status)).length === 0 && (
                  <div className="text-center py-6">
                    <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-success" />
                    <p className="text-xs text-muted-foreground">Nenhum gargalo identificado</p>
                  </div>
                )}
              </div>
            </div>

            <div className="glass-card rounded-lg p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" /> Próximas Operações
              </h3>
              <div className="space-y-3">
                {slots.filter(s => ["AGENDADO", "CONFIRMADO", "EM_DESLOCAMENTO"].includes(s.status))
                  .sort((a, b) => new Date(a.dataHoraPrevista).getTime() - new Date(b.dataHoraPrevista).getTime())
                  .map(s => (
                    <div key={s.id} className="flex items-center gap-3 rounded-md border border-border p-3">
                      <div className="text-center min-w-[50px]">
                        <p className="text-sm font-bold text-foreground">
                          {new Date(s.dataHoraPrevista).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{s.duracaoPrevistaMin} min</p>
                      </div>
                      <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground">{s.transportadoraNome}</p>
                        <p className="text-[10px] text-muted-foreground">{s.tipoOperacao} · {s.docaPrevistaNome || "Doca a definir"}</p>
                      </div>
                      <Badge className={`text-[10px] shrink-0 ${AGENDAMENTO_STATUS_COLORS[s.status]}`}>
                        {AGENDAMENTO_STATUS_LABELS[s.status]}
                      </Badge>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* KPIs adicionais */}
          {kpis && (
            <div className="glass-card rounded-lg p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Indicadores do Dia</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
                <div><p className="text-2xl font-bold text-foreground">{kpis.tempoMedioOperacao} min</p><p className="text-xs text-muted-foreground">Tempo médio operação</p></div>
                <div><p className="text-2xl font-bold text-foreground">{kpis.permanenciaMedia} min</p><p className="text-xs text-muted-foreground">Permanência média</p></div>
                <div><p className="text-2xl font-bold text-warning">{kpis.remarcacoes}</p><p className="text-xs text-muted-foreground">Remarcações</p></div>
                <div><p className="text-2xl font-bold text-destructive">{kpis.conflitoAgenda}</p><p className="text-xs text-muted-foreground">Conflitos</p></div>
                <div><p className={`text-2xl font-bold ${kpis.dentroJanela >= 80 ? "text-success" : kpis.dentroJanela >= 60 ? "text-warning" : "text-destructive"}`}>{kpis.dentroJanela}%</p><p className="text-xs text-muted-foreground">Dentro da janela</p></div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AgendamentoDocaPage;
