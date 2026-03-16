import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, MapPin, User, Building2, Car, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import ContextBanner from "@/components/operacional/ContextBanner";
import TraceabilityCard from "@/components/operacional/TraceabilityCard";
import OperationalTimeline from "@/components/operacional/OperationalTimeline";
import RelatedActionsPanel from "@/components/operacional/RelatedActionsPanel";
import StatusSemaphore from "@/components/operacional/StatusSemaphore";
import { getAcessoById, getTimelinePortaria } from "@/services/operacional";
import type { Acesso, EventoTimeline } from "@/types/operacional";

const AcessoDetalhePage = () => {
  const { id } = useParams();
  const [acesso, setAcesso] = useState<Acesso | null>(null);
  const [timeline, setTimeline] = useState<EventoTimeline[]>([]);

  useEffect(() => {
    if (!id) return;
    getAcessoById(id).then((a) => setAcesso(a || null));
    getTimelinePortaria(id).then(setTimeline);
  }, [id]);

  if (!acesso) return <div className="p-8 text-center text-muted-foreground">Carregando...</div>;

  const bannerTipo = acesso.criticidade === "CRITICA" ? "danger" : acesso.criticidade === "ALTA" ? "warning" : "info";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild><Link to="/portaria"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{acesso.id}</h1>
            <StatusSemaphore status={acesso.status} />
          </div>
          <p className="text-sm text-muted-foreground">{acesso.tipo} — {acesso.nome}</p>
        </div>
        <div className="flex gap-2">
          {["PRE_AUTORIZADO", "AGUARDANDO_VALIDACAO"].includes(acesso.status) && (
            <Button size="sm" className="bg-success hover:bg-success/90 text-success-foreground">Liberar Entrada</Button>
          )}
          {["PRE_AUTORIZADO", "AGUARDANDO_VALIDACAO"].includes(acesso.status) && (
            <Button variant="destructive" size="sm">Recusar</Button>
          )}
          {["ENTRADA_REGISTRADA", "EM_PERMANENCIA"].includes(acesso.status) && (
            <Button size="sm">Registrar Saída</Button>
          )}
        </div>
      </div>

      {acesso.criticidade !== "BAIXA" && (
        <ContextBanner tipo={bannerTipo} titulo={`Criticidade ${acesso.criticidade}`} descricao={acesso.motivo} />
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <TraceabilityCard
            titulo="Dados do Acesso"
            dados={[
              { label: "Tipo", valor: acesso.tipo },
              { label: "Nome", valor: acesso.nome },
              { label: "Documento", valor: acesso.documento },
              { label: "Empresa", valor: acesso.empresa },
              { label: "Motivo", valor: acesso.motivo },
              { label: "Setor Destino", valor: acesso.setorDestino },
              { label: "Responsável Interno", valor: acesso.responsavelInterno },
              { label: "Placa", valor: acesso.placa },
              { label: "Tipo Veículo", valor: acesso.tipoVeiculo },
              { label: "Horário Previsto", valor: new Date(acesso.horarioPrevisto).toLocaleString("pt-BR") },
              { label: "Horário Real", valor: acesso.horarioReal ? new Date(acesso.horarioReal).toLocaleString("pt-BR") : undefined },
              { label: "Saída", valor: acesso.horarioSaida ? new Date(acesso.horarioSaida).toLocaleString("pt-BR") : undefined },
              { label: "Planta", valor: acesso.planta },
              { label: "Criado em", valor: new Date(acesso.criadoEm).toLocaleString("pt-BR") },
              { label: "Criado por", valor: acesso.criadoPor },
            ]}
          />

          <div className="glass-card rounded-lg p-5">
            <h3 className="mb-4 text-sm font-semibold text-foreground">Timeline de Eventos</h3>
            <OperationalTimeline eventos={timeline} />
          </div>
        </div>

        <div className="space-y-6">
          {acesso.selfieUrl && (
            <div className="glass-card rounded-lg p-4">
              <h3 className="mb-3 text-sm font-semibold text-foreground">Selfie / Identificação</h3>
              <div className="aspect-square rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                <img src={acesso.selfieUrl} alt="Selfie" className="h-full w-full object-cover" />
              </div>
              <p className="mt-2 text-[10px] text-muted-foreground flex items-center gap-1">
                <Shield className="h-3 w-3" /> Dado sensível — LGPD. Retenção: 90 dias.
              </p>
            </div>
          )}

          <div className="glass-card rounded-lg p-4">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Auditoria</h3>
            <dl className="space-y-2 text-xs">
              <div><dt className="text-muted-foreground">Origem</dt><dd className="text-foreground">{acesso.criadoPor}</dd></div>
              <div><dt className="text-muted-foreground">Status Atual</dt><dd><StatusSemaphore status={acesso.status} /></dd></div>
              <div><dt className="text-muted-foreground">Criticidade</dt><dd><StatusSemaphore status={acesso.criticidade} /></dd></div>
              <div><dt className="text-muted-foreground">Criado em</dt><dd>{new Date(acesso.criadoEm).toLocaleString("pt-BR")}</dd></div>
              <div><dt className="text-muted-foreground">Última Atualização</dt><dd>{new Date(acesso.ultimaAtualizacao).toLocaleString("pt-BR")}</dd></div>
            </dl>
          </div>

          <RelatedActionsPanel origemId={acesso.id} />
        </div>
      </div>
    </div>
  );
};

export default AcessoDetalhePage;
