import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Shield, CheckCircle2, Clock, FileText, Camera, MapPin, Package, FileSignature, AlertTriangle, Truck, Paperclip, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import RiskScoreCard from "@/components/operacional/RiskScoreCard";
import TraceabilityCard from "@/components/operacional/TraceabilityCard";
import RelatedActionsPanel from "@/components/operacional/RelatedActionsPanel";
import CustodiaActionPanel from "@/components/custodia/CustodiaActionPanel";
import ExcecoesRelacionadasPanel from "@/components/custodia/ExcecoesRelacionadasPanel";
import { getCustodiaById } from "@/services/custodia";
import type { CustodiaNF } from "@/types/custodiaDigital";
import { CUSTODIA_STATUS_LABELS, CUSTODIA_STATUS_COLORS } from "@/types/custodiaDigital";

const EVIDENCE_ICONS: Record<string, typeof Camera> = {
  COMPROVANTE_SAIDA: FileText, COMPROVANTE_CHEGADA: MapPin,
  PROVA_ENTREGA: Package, ASSINATURA: FileSignature,
  FOTO: Camera, DOCUMENTO: FileText,
};

const EVIDENCE_TYPE_LABELS: Record<string, string> = {
  COMPROVANTE_SAIDA: "Comprovante de Saída",
  COMPROVANTE_CHEGADA: "Comprovante de Chegada",
  PROVA_ENTREGA: "Prova de Entrega",
  ASSINATURA: "Assinatura",
  FOTO: "Foto",
  DOCUMENTO: "Documento",
};

const CustodiaDetalhePage = () => {
  const { id } = useParams();
  const [data, setData] = useState<CustodiaNF | null>(null);

  const reload = useCallback(() => {
    if (id) getCustodiaById(id).then(d => setData(d || null));
  }, [id]);

  useEffect(reload, [reload]);

  if (!data) return <div className="p-8 text-center text-muted-foreground">Carregando...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild><Link to="/custodia"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{data.nfNumero}</h1>
            <Badge className={`${CUSTODIA_STATUS_COLORS[data.status]}`}>{CUSTODIA_STATUS_LABELS[data.status]}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{data.cliente} — {data.destino}</p>
        </div>
      </div>

      {/* Action Panel */}
      <CustodiaActionPanel custodia={data} onUpdate={setData} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Cabeçalho executivo */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass-card rounded-lg p-4 text-center"><p className="text-xs text-muted-foreground">Emissão</p><p className="text-sm font-bold">{data.dataEmissao}</p></div>
            <div className="glass-card rounded-lg p-4 text-center"><p className="text-xs text-muted-foreground">Saída Portaria</p><p className="text-sm font-bold">{data.dataSaidaPortaria ? new Date(data.dataSaidaPortaria).toLocaleDateString("pt-BR") : "—"}</p></div>
            <div className="glass-card rounded-lg p-4 text-center"><p className="text-xs text-muted-foreground">Entrega</p><p className="text-sm font-bold">{data.dataEntrega ? new Date(data.dataEntrega).toLocaleDateString("pt-BR") : "Pendente"}</p></div>
            <div className="glass-card rounded-lg p-4 text-center"><p className="text-xs text-muted-foreground">Dias em Trânsito</p><p className={`text-sm font-bold ${data.diasEmTransito > 5 ? "text-destructive" : ""}`}>{data.diasEmTransito}d</p></div>
          </div>

          <TraceabilityCard titulo="Vínculo Operacional" dados={[
            { label: "NF", valor: data.nfNumero },
            { label: "Valor", valor: `R$ ${data.valor.toLocaleString("pt-BR")}` },
            { label: "Veículo", valor: data.veiculoPlaca },
            { label: "Motorista", valor: data.motoristaNome },
            { label: "Transportadora", valor: data.transportadoraNome },
            { label: "Doca Saída", valor: data.docaSaida },
            { label: "Operação Pátio", valor: data.operacaoPatio },
            { label: "Recebedor", valor: data.recebedorNome },
            { label: "Aceite", valor: data.statusAceite },
            { label: "Divergência", valor: data.divergencia },
          ]} />

          {/* Timeline de custódia */}
          <div className="glass-card rounded-lg p-5">
            <h3 className="mb-4 text-sm font-semibold text-foreground">Timeline da Cadeia de Custódia</h3>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
              <div className="space-y-4">
                {data.eventos.map((ev, idx) => (
                  <div key={ev.id} className="relative flex items-start gap-4 pl-9">
                    <div className={`absolute left-2.5 top-1 h-3 w-3 rounded-full border-2 ${idx === data.eventos.length - 1 ? "border-primary bg-primary" : "border-success bg-success"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-foreground">{ev.etapa}</p>
                        <Badge variant="secondary" className="text-[9px]">{ev.tipo}</Badge>
                        <span className="text-[10px] text-muted-foreground">{new Date(ev.dataHora).toLocaleString("pt-BR")}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{ev.descricao}</p>
                      {ev.localizacao && <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" />{ev.localizacao}</p>}
                      <p className="text-[10px] text-muted-foreground">por {ev.responsavel}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Evidências (enhanced) */}
          <div className="glass-card rounded-lg p-5">
            <h3 className="mb-4 text-sm font-semibold text-foreground flex items-center gap-2">
              <Camera className="h-4 w-4 text-primary" />
              Evidências ({data.evidencias.length})
            </h3>
            {data.evidencias.length === 0 ? (
              <div className="text-center py-6">
                <Camera className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Nenhuma evidência registrada</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {data.evidencias.map(ev => {
                  const Icon = EVIDENCE_ICONS[ev.tipo] || FileText;
                  const hasFile = ev.url || (ev.observacao && ev.observacao.includes("Arquivo:"));
                  const fileName = ev.url || (ev.observacao?.match(/Arquivo:\s*([^\|]+)/)?.[1]?.trim());
                  const categoria = ev.observacao?.match(/Categoria:\s*([^\|]+)/)?.[1]?.trim();
                  const etapa = ev.observacao?.match(/Etapa:\s*([^\|]+)/)?.[1]?.trim();
                  return (
                    <div key={ev.id} className="rounded-md border border-border p-3 space-y-2">
                      <div className="flex items-start gap-3">
                        <div className="rounded-md bg-primary/10 p-2"><Icon className="h-4 w-4 text-primary" /></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-medium text-foreground">{ev.descricao}</p>
                          </div>
                          <p className="text-[10px] text-muted-foreground">{ev.responsavel} · {new Date(ev.dataHora).toLocaleString("pt-BR")}</p>
                        </div>
                        <Badge variant="secondary" className="text-[9px] shrink-0">
                          {EVIDENCE_TYPE_LABELS[ev.tipo] || ev.tipo}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {categoria && (
                          <span className="inline-block rounded bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground">
                            {categoria}
                          </span>
                        )}
                        {etapa && (
                          <span className="inline-block rounded bg-primary/10 px-1.5 py-0.5 text-[9px] text-primary">
                            Etapa: {etapa}
                          </span>
                        )}
                      </div>
                      {fileName && (
                        <div className="flex items-center gap-2 rounded-md bg-muted/50 px-2.5 py-1.5 text-xs">
                          <Paperclip className="h-3 w-3 text-primary shrink-0" />
                          <span className="truncate text-foreground">{fileName}</span>
                          <Badge variant="secondary" className="text-[9px] ml-auto shrink-0">Anexado</Badge>
                        </div>
                      )}
                      {ev.observacao && !ev.observacao.startsWith("Categoria:") && !ev.observacao.startsWith("Arquivo:") && (
                        <p className="text-[10px] text-muted-foreground">{ev.observacao.split("|")[0].trim()}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <RiskScoreCard score={data.scoreRisco} motivoRisco={data.divergencia} acaoRecomendada={data.scoreRisco > 50 ? "Acompanhar e escalar se necessário" : undefined} />

          {/* GAP 4: Exceções relacionadas */}
          <ExcecoesRelacionadasPanel origemId={data.id} origemTipo="Custódia" />

          <RelatedActionsPanel origemId={data.nfId} />
        </div>
      </div>
    </div>
  );
};

export default CustodiaDetalhePage;
