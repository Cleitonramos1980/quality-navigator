import { useParams, Link } from "react-router-dom";
import { ArrowLeft, FileText, Truck, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import ContextBanner from "@/components/operacional/ContextBanner";
import TraceabilityCard from "@/components/operacional/TraceabilityCard";
import OperationalTimeline from "@/components/operacional/OperationalTimeline";
import RelatedActionsPanel from "@/components/operacional/RelatedActionsPanel";
import RiskScoreCard from "@/components/operacional/RiskScoreCard";
import StatusSemaphore from "@/components/operacional/StatusSemaphore";
import { mockNFsTransito } from "@/data/mockOperacionalData";
import type { EventoTimeline } from "@/types/operacional";

const NFTransitoDetalhePage = () => {
  const { id } = useParams();
  const nf = mockNFsTransito.find((n) => n.id === id) ?? mockNFsTransito[0];

  const timeline: EventoTimeline[] = nf.checkpoints.map((ck) => ({
    id: ck.id, tipo: ck.tipo, descricao: ck.descricao, dataHora: ck.dataHora, usuario: ck.responsavel || "Sistema", detalhes: ck.localizacao,
  }));

  const bannerTipo = nf.scoreRisco > 75 ? "danger" : nf.scoreRisco > 50 ? "warning" : "info";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild><Link to="/nf-transito"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{nf.numero}</h1>
            <StatusSemaphore status={nf.status} />
            <StatusSemaphore status={nf.criticidade} />
          </div>
          <p className="text-sm text-muted-foreground">{nf.cliente} — {nf.destino}</p>
        </div>
      </div>

      {nf.scoreRisco > 25 && (
        <ContextBanner tipo={bannerTipo} titulo={nf.motivoRisco || "Atenção"} descricao={nf.acaoRecomendada} />
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass-card rounded-lg p-4 text-center"><p className="text-xs text-muted-foreground">Emissão</p><p className="text-sm font-bold">{nf.dataEmissao}</p></div>
            <div className="glass-card rounded-lg p-4 text-center"><p className="text-xs text-muted-foreground">Saída Real</p><p className="text-sm font-bold">{nf.dataSaidaReal ? new Date(nf.dataSaidaReal).toLocaleDateString("pt-BR") : "—"}</p></div>
            <div className="glass-card rounded-lg p-4 text-center"><p className="text-xs text-muted-foreground">Previsão Entrega</p><p className="text-sm font-bold">{nf.dataEntregaPrevista}</p></div>
            <div className="glass-card rounded-lg p-4 text-center"><p className="text-xs text-muted-foreground">Dias em Trânsito</p><p className={`text-sm font-bold ${nf.diasEmTransito > 5 ? "text-destructive" : ""}`}>{nf.diasEmTransito}d</p></div>
          </div>

          <TraceabilityCard titulo="Vínculo Fiscal-Logístico" dados={[
            { label: "NF-e", valor: nf.numero },
            { label: "Chave NF-e", valor: nf.chaveNfe.slice(0, 20) + "…" },
            { label: "Pedido", valor: nf.pedido },
            { label: "Carga", valor: nf.carga },
            { label: "MDF-e", valor: nf.mdfeNumero },
            { label: "Status MDF-e", valor: nf.mdfeStatus },
            { label: "CT-e", valor: nf.cteNumero },
            { label: "Status CT-e", valor: nf.cteStatus },
            { label: "Placa", valor: nf.placa },
            { label: "Motorista", valor: nf.motoristaNome },
            { label: "Transportadora", valor: nf.transportadoraNome },
            { label: "Valor", valor: `R$ ${nf.valor.toLocaleString("pt-BR")}` },
            { label: "Peso", valor: nf.peso ? `${nf.peso} kg` : undefined },
            { label: "Volumes", valor: nf.volumes?.toString() },
            { label: "Destino", valor: nf.destino },
            { label: "UF", valor: nf.uf },
          ]} />

          <div className="glass-card rounded-lg p-5">
            <h3 className="mb-4 text-sm font-semibold text-foreground">Timeline</h3>
            <OperationalTimeline eventos={timeline} />
          </div>
        </div>

        <div className="space-y-6">
          <RiskScoreCard score={nf.scoreRisco} motivoRisco={nf.motivoRisco} acaoRecomendada={nf.acaoRecomendada} />

          {nf.alertas.length > 0 && (
            <div className="glass-card rounded-lg p-4">
              <h3 className="mb-3 text-sm font-semibold text-foreground">Alertas</h3>
              <div className="space-y-2">
                {nf.alertas.map((a, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-md border border-destructive/20 bg-destructive/5 p-2 text-xs text-destructive">{a}</div>
                ))}
              </div>
            </div>
          )}

          <RelatedActionsPanel origemId={nf.id} />
        </div>
      </div>
    </div>
  );
};

export default NFTransitoDetalhePage;
