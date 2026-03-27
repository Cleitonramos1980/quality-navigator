import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, CalendarDays, Truck, Clock, MapPin, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import TraceabilityCard from "@/components/operacional/TraceabilityCard";
import AgendamentoActionMenu from "@/components/agendamento/AgendamentoActionMenu";
import ExcecoesRelacionadasPanel from "@/components/custodia/ExcecoesRelacionadasPanel";
import { getAgendamentosSlots, getAgendamentoKPIs } from "@/services/agendamento";
import { toast } from "@/hooks/use-toast";
import type { AgendamentoDockSlot } from "@/types/agendamento";
import { AGENDAMENTO_STATUS_LABELS, AGENDAMENTO_STATUS_COLORS, PRIORIDADE_COLORS } from "@/types/agendamento";

const AgendamentoDetalhePage = () => {
  const { id } = useParams();
  const [data, setData] = useState<AgendamentoDockSlot | null>(null);

  const reload = useCallback(() => {
    if (id) {
      getAgendamentosSlots()
        .then((slots) => {
          const found = slots.find((s) => s.id === id);
          setData(found || null);
        })
        .catch((error) => {
          setData(null);
          const message = error instanceof Error ? error.message : "Falha ao carregar agendamento.";
          toast({ title: "Erro ao carregar agendamento", description: message, variant: "destructive" });
        });
    }
  }, [id]);

  useEffect(reload, [reload]);

  const handleUpdate = (updated: AgendamentoDockSlot) => {
    setData(updated);
  };

  if (!data) return <div className="p-8 text-center text-muted-foreground">Carregando...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/patio/agendamento"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground">{data.codigo}</h1>
            <Badge className={AGENDAMENTO_STATUS_COLORS[data.status]}>{AGENDAMENTO_STATUS_LABELS[data.status]}</Badge>
            <Badge className={PRIORIDADE_COLORS[data.prioridade]}>{data.prioridade}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {data.transportadoraNome} — {data.tipoOperacao}
          </p>
        </div>
        <AgendamentoActionMenu slot={data} onUpdate={handleUpdate} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Header cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass-card rounded-lg p-4 text-center">
              <p className="text-xs text-muted-foreground">Data/Hora Prevista</p>
              <p className="text-sm font-bold">{new Date(data.dataHoraPrevista).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</p>
            </div>
            <div className="glass-card rounded-lg p-4 text-center">
              <p className="text-xs text-muted-foreground">Janela</p>
              <p className="text-sm font-bold">
                {new Date(data.janelaInicio).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                {" — "}
                {new Date(data.janelaFim).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            <div className="glass-card rounded-lg p-4 text-center">
              <p className="text-xs text-muted-foreground">Duração Prevista</p>
              <p className="text-sm font-bold">{data.duracaoPrevistaMin} min</p>
            </div>
            <div className="glass-card rounded-lg p-4 text-center">
              <p className="text-xs text-muted-foreground">SLA</p>
              <p className={`text-sm font-bold ${data.sla >= 80 ? "text-success" : data.sla >= 50 ? "text-warning" : "text-destructive"}`}>{data.sla}%</p>
            </div>
          </div>

          <TraceabilityCard titulo="Dados do Agendamento" dados={[
            { label: "Código", valor: data.codigo },
            { label: "Transportadora", valor: data.transportadoraNome },
            { label: "Motorista", valor: data.motoristaNome || "—" },
            { label: "Placa", valor: data.placa || "—" },
            { label: "Operação", valor: data.tipoOperacao },
            { label: "Doca Prevista", valor: data.docaPrevistaNome || "—" },
            { label: "Doca Real", valor: data.docaRealNome || "—" },
            { label: "Unidade", valor: data.unidade },
            { label: "NF Vinculada", valor: data.nfVinculada || "—" },
            { label: "Tolerância", valor: `${data.toleranciaMin} min` },
          ]} />

          {/* Chegada real */}
          {data.dataHoraRealChegada && (
            <div className="glass-card rounded-lg p-4">
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" /> Chegada Real
              </h3>
              <p className="text-sm text-foreground">{new Date(data.dataHoraRealChegada).toLocaleString("pt-BR")}</p>
            </div>
          )}

          {/* Pendências */}
          {data.pendencias.length > 0 && (
            <div className="glass-card rounded-lg p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Pendências</h3>
              <div className="space-y-1.5">
                {data.pendencias.map((p, i) => (
                  <p key={i} className="text-xs text-destructive">{p}</p>
                ))}
              </div>
            </div>
          )}

          {/* Observações */}
          {data.observacoes && (
            <div className="glass-card rounded-lg p-4">
              <h3 className="text-sm font-semibold text-foreground mb-2">Observações</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{data.observacoes}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <ExcecoesRelacionadasPanel origemId={data.id} origemTipo="Agendamento" />
        </div>
      </div>
    </div>
  );
};

export default AgendamentoDetalhePage;
