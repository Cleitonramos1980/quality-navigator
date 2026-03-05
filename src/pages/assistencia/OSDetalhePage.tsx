import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Wrench, Package, FileText, Clock, User, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { buscarOS, atualizarStatusOS, listarReqAssistencia, listarConsumos } from "@/services/assistencia";
import { OS_STATUS_LABELS, OS_STATUS_COLORS, OS_PRIORIDADE_LABELS, OS_PRIORIDADE_COLORS, OS_TIPO_LABELS, REQ_ASSIST_STATUS_LABELS, REQ_ASSIST_STATUS_COLORS } from "@/types/assistencia";
import type { OrdemServico, OSStatus, RequisicaoAssistencia, ConsumoMaterial } from "@/types/assistencia";
import { toast } from "@/hooks/use-toast";

const OS_STATUS_FLOW: OSStatus[] = [
  "ABERTA", "AGUARDANDO_RECEBIMENTO", "RECEBIDO", "EM_INSPECAO",
  "AGUARDANDO_PECAS", "EM_REPARO", "AGUARDANDO_VALIDACAO", "CONCLUIDA", "ENCERRADA",
];

const OSDetalhePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [os, setOs] = useState<OrdemServico | null>(null);
  const [reqs, setReqs] = useState<RequisicaoAssistencia[]>([]);
  const [consumos, setConsumos] = useState<ConsumoMaterial[]>([]);
  const [laudo, setLaudo] = useState("");
  const [decisao, setDecisao] = useState("");

  useEffect(() => {
    if (!id) return;
    buscarOS(id).then((data) => {
      if (data) {
        setOs(data);
        setLaudo(data.laudoInspecao || "");
        setDecisao(data.decisaoTecnica || "");
      }
    });
    listarReqAssistencia().then((all) => setReqs(all.filter((r) => r.osId === id)));
    listarConsumos().then((all) => setConsumos(all.filter((c) => c.osId === id)));
  }, [id]);

  if (!os) return <div className="p-8 text-muted-foreground">Carregando...</div>;

  const currentIdx = OS_STATUS_FLOW.indexOf(os.status);
  const nextStatus = currentIdx >= 0 && currentIdx < OS_STATUS_FLOW.length - 1 ? OS_STATUS_FLOW[currentIdx + 1] : null;

  const handleAdvance = async (status: OSStatus) => {
    await atualizarStatusOS(os.id, status);
    setOs({ ...os, status });
    toast({ title: "Status atualizado", description: `OS movida para ${OS_STATUS_LABELS[status]}` });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/assistencia/os")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{os.id}</h1>
            <Badge className={OS_STATUS_COLORS[os.status]}>{OS_STATUS_LABELS[os.status]}</Badge>
            <Badge className={OS_PRIORIDADE_COLORS[os.prioridade]}>{OS_PRIORIDADE_LABELS[os.prioridade]}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{OS_TIPO_LABELS[os.tipoOs]} — {os.clienteNome}</p>
        </div>
        {nextStatus && os.status !== "CANCELADA" && (
          <Button onClick={() => handleAdvance(nextStatus)} className="gap-2">
            Avançar → {OS_STATUS_LABELS[nextStatus]}
          </Button>
        )}
        {os.status !== "CANCELADA" && os.status !== "ENCERRADA" && (
          <Button variant="destructive" size="sm" onClick={() => handleAdvance("CANCELADA")}>Cancelar OS</Button>
        )}
      </div>

      {/* Timeline mini */}
      <Card className="glass-card">
        <CardContent className="py-3 px-4">
          <div className="flex items-center gap-1 overflow-x-auto">
            {OS_STATUS_FLOW.map((s, i) => {
              const isCurrent = s === os.status;
              const isPast = i < currentIdx;
              return (
                <div key={s} className="flex items-center gap-1">
                  <div className={`px-2 py-1 rounded text-[10px] font-medium whitespace-nowrap ${isCurrent ? "bg-primary text-primary-foreground" : isPast ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
                    {OS_STATUS_LABELS[s]}
                  </div>
                  {i < OS_STATUS_FLOW.length - 1 && <span className="text-muted-foreground text-xs">→</span>}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Dados */}
        <Card className="glass-card">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Dados da OS</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { icon: User, label: "Cliente", value: `${os.codcli} — ${os.clienteNome}` },
              { icon: FileText, label: "Pedido / NF", value: `${os.numPedido || "—"} / ${os.nfVenda || "—"}` },
              { icon: MapPin, label: "Planta", value: os.planta },
              { icon: Wrench, label: "Técnico", value: os.tecnicoResponsavel },
              { icon: Clock, label: "Abertura", value: os.dataAbertura },
              { icon: Clock, label: "Previsão", value: os.dataPrevista },
              { icon: FileText, label: "Origem", value: `${os.origemTipo}${os.origemId ? ` — ${os.origemId}` : ""}` },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <item.icon className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-xs text-muted-foreground w-24 shrink-0">{item.label}</span>
                <span className="text-sm text-foreground">{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Problema + Laudo */}
        <Card className="glass-card">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Descrição e Laudo</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Descrição do Problema</label>
              <p className="text-sm text-foreground mt-1 bg-muted/50 p-3 rounded-md">{os.descricaoProblema}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Laudo de Inspeção</label>
              <Textarea value={laudo} onChange={(e) => setLaudo(e.target.value)} placeholder="Registrar laudo de inspeção..." className="mt-1" rows={3} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Decisão Técnica</label>
              <Textarea value={decisao} onChange={(e) => setDecisao(e.target.value)} placeholder="Registrar decisão técnica..." className="mt-1" rows={3} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requisições */}
      <Card className="glass-card">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm text-muted-foreground">Requisições de Material</CardTitle>
          <Button variant="outline" size="sm" onClick={() => navigate("/assistencia/requisicoes")} className="text-xs gap-1">
            <Package className="w-3 h-3" /> Nova Requisição
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">ID</TableHead>
                <TableHead className="text-xs">CD → Destino</TableHead>
                <TableHead className="text-xs">Itens</TableHead>
                <TableHead className="text-xs">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reqs.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground text-xs py-4">Nenhuma requisição</TableCell></TableRow>
              ) : reqs.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">{r.id}</TableCell>
                  <TableCell className="text-xs">{r.cdResponsavel} → {r.plantaDestino}</TableCell>
                  <TableCell className="text-xs">{r.itens.length} item(ns)</TableCell>
                  <TableCell><Badge className={`text-[10px] ${REQ_ASSIST_STATUS_COLORS[r.status]}`}>{REQ_ASSIST_STATUS_LABELS[r.status]}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Consumos */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Consumo de Materiais</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">ID</TableHead>
                <TableHead className="text-xs">Material</TableHead>
                <TableHead className="text-xs">Qtd</TableHead>
                <TableHead className="text-xs">Técnico</TableHead>
                <TableHead className="text-xs">Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {consumos.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground text-xs py-4">Nenhum consumo</TableCell></TableRow>
              ) : consumos.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-xs">{c.id}</TableCell>
                  <TableCell className="text-xs">{c.descricao}</TableCell>
                  <TableCell className="text-xs">{c.qtdConsumida} {c.un}</TableCell>
                  <TableCell className="text-xs">{c.tecnico}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{c.dataConsumo}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default OSDetalhePage;
