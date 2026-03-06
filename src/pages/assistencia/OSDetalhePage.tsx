import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Wrench, Package, FileText, Clock, User, MapPin, Plus, Trash2, Search, Warehouse, AlertTriangle, ShieldAlert, CheckCircle2, History, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { buscarOS, atualizarStatusOS, listarReqAssistencia, listarConsumosPorOS, criarReqAssistencia, listarEstoque } from "@/services/assistencia";
import { registrarAuditoria } from "@/services/auditoria";
import { hasPermission, getCurrentPerfil, getCurrentUserName } from "@/lib/rbac";
import { getCurrentPapel, PAPEL_LABELS, STATUS_RESPONSAVEL } from "@/lib/workflowOs";
import { OS_STATUS_LABELS, OS_STATUS_COLORS, OS_PRIORIDADE_LABELS, OS_PRIORIDADE_COLORS, OS_TIPO_LABELS, REQ_ASSIST_STATUS_LABELS, REQ_ASSIST_STATUS_COLORS } from "@/types/assistencia";
import type { OrdemServico, OSStatus, RequisicaoAssistencia, ConsumoMaterial, ItemReqAssist, OSTransitionLog } from "@/types/assistencia";
import { PLANTA_LABELS, Planta } from "@/types/sgq";
import { EstoqueItem } from "@/data/mockAssistenciaData";
import { toast } from "@/hooks/use-toast";
import * as osTransitionLog from "@/services/osTransitionLog";
import { getAvailableEvents, dispatchOSEvent, canDispatchEvent, OS_EVENT_LABELS } from "@/lib/osStateMachine";
import type { OSEvent, OSEventType, AvailableEvent } from "@/lib/osStateMachine";

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

  // Gate fields
  const [recebimentoConfirmado, setRecebimentoConfirmado] = useState(false);
  const [relatorioReparo, setRelatorioReparo] = useState("");
  const [validacaoAprovada, setValidacaoAprovada] = useState(false);
  const [mensagemEncerramento, setMensagemEncerramento] = useState("");

  // Nova Requisição modal state
  const [showNovaReq, setShowNovaReq] = useState(false);
  const [reqCdResponsavel, setReqCdResponsavel] = useState<Planta>("MAO");
  const [reqPlantaDestino, setReqPlantaDestino] = useState<Planta>("MAO");
  const [reqItens, setReqItens] = useState<ItemReqAssist[]>([]);

  // Estoque browser
  const [estoque, setEstoque] = useState<EstoqueItem[]>([]);
  const [estoqueFilter, setEstoqueFilter] = useState("");
  const [showEstoque, setShowEstoque] = useState(false);

  // Transition log state
  const [transitionLogs, setTransitionLogs] = useState<OSTransitionLog[]>([]);

  // Event modals
  const [showMotivoModal, setShowMotivoModal] = useState(false);
  const [motivoText, setMotivoText] = useState("");
  const [pendingEvent, setPendingEvent] = useState<OSEvent | null>(null);

  // Decisão inspeção modal
  const [showDecisaoModal, setShowDecisaoModal] = useState(false);
  const [decisaoInspecao, setDecisaoInspecao] = useState<"REPARAR" | "TROCAR" | "REJEITAR" | "REENTRADA">("REPARAR");

  // Return target selector
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnTargets, setReturnTargets] = useState<OSStatus[]>([]);
  const [selectedReturnTarget, setSelectedReturnTarget] = useState<OSStatus | "">("");

  // Log details modal
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  const [selectedLogDetalhes, setSelectedLogDetalhes] = useState<string>("");

  const papel = getCurrentPapel();
  const isDiretoria = papel === "DIRETORIA";

  useEffect(() => {
    if (!id) return;
    buscarOS(id).then((data) => {
      if (data) {
        setOs(data);
        setLaudo(data.laudoInspecao || "");
        setDecisao(data.decisaoTecnica || "");
        setReqPlantaDestino(data.planta);
        setRecebimentoConfirmado(data.recebimentoConfirmado || false);
        setRelatorioReparo(data.relatorioReparo || "");
        setValidacaoAprovada(data.validacaoAprovada || false);
        setMensagemEncerramento(data.mensagemEncerramento || "");
      }
    });
    listarReqAssistencia().then((all) => setReqs(all.filter((r) => r.osId === id)));
    listarConsumosPorOS(id!).then(setConsumos);
    osTransitionLog.listByOS(id!).then(setTransitionLogs);
  }, [id]);

  const reloadLogs = () => { if (id) osTransitionLog.listByOS(id).then(setTransitionLogs); };

  if (!os) return <div className="p-8 text-muted-foreground">Carregando...</div>;

  // Build current OS with live gate fields
  const osWithGates: OrdemServico = {
    ...os,
    laudoInspecao: laudo || undefined,
    decisaoTecnica: decisao || undefined,
    recebimentoConfirmado,
    relatorioReparo: relatorioReparo || undefined,
    validacaoAprovada,
    mensagemEncerramento: mensagemEncerramento || undefined,
  };

  const currentIdx = OS_STATUS_FLOW.indexOf(os.status);
  const responsavelAtual = STATUS_RESPONSAVEL[os.status];

  // Get available events from state machine
  const availableEvents = getAvailableEvents(osWithGates, reqs);

  const reqsEmTransferencia = reqs.filter((r) => r.status === "EM_TRANSFERENCIA");
  const reqsRecebidas = reqs.filter((r) => r.status === "RECEBIDA_ASSISTENCIA");
  const consumoLiberado = reqsRecebidas.length > 0;

  // ── Event dispatch handler ──
  const handleDispatchEvent = async (event: OSEvent) => {
    // Persist gate fields on the OS mock before dispatching
    const osRef = os as any;
    if (laudo) osRef.laudoInspecao = laudo;
    if (decisao) osRef.decisaoTecnica = decisao;
    if (recebimentoConfirmado) osRef.recebimentoConfirmado = true;
    if (relatorioReparo) osRef.relatorioReparo = relatorioReparo;
    if (validacaoAprovada) osRef.validacaoAprovada = true;
    if (mensagemEncerramento) osRef.mensagemEncerramento = mensagemEncerramento;

    const result = await dispatchOSEvent(osWithGates, event, reqs);

    if (!result.ok) {
      toast({ title: "Transição negada", description: (result as { ok: false; reason: string }).reason, variant: "destructive" });
      reloadLogs();
      return;
    }

    await atualizarStatusOS(os.id, result.newState);
    setOs({ ...os, status: result.newState });
    reloadLogs();
    toast({ title: "Status atualizado", description: `OS movida para ${OS_STATUS_LABELS[result.newState]}` });
  };

  // ── Event button click handlers ──
  const handleEventClick = (evt: AvailableEvent) => {
    if (evt.type === "FINALIZAR_INSPECAO" && evt.needsDecisao) {
      setDecisaoInspecao("REPARAR");
      setShowDecisaoModal(true);
      return;
    }

    if (evt.type === "RETORNAR_ETAPA") {
      setReturnTargets(evt.returnTargets || []);
      setSelectedReturnTarget(evt.returnTargets?.[0] || "");
      setMotivoText("");
      setShowReturnModal(true);
      return;
    }

    if (evt.type === "CANCELAR_OS") {
      setMotivoText("");
      setPendingEvent({ type: "CANCELAR_OS" });
      setShowMotivoModal(true);
      return;
    }

    // Direct dispatch
    handleDispatchEvent({ type: evt.type });
  };

  const handleConfirmDecisao = () => {
    setShowDecisaoModal(false);
    handleDispatchEvent({
      type: "FINALIZAR_INSPECAO",
      payload: { decisaoInspecao },
    });
  };

  const handleConfirmReturn = () => {
    if (!selectedReturnTarget || !motivoText) {
      toast({ title: "Preencha o motivo", variant: "destructive" });
      return;
    }
    setShowReturnModal(false);
    handleDispatchEvent({
      type: "RETORNAR_ETAPA",
      payload: { returnToState: selectedReturnTarget as OSStatus, motivo: motivoText },
    });
  };

  const handleConfirmMotivo = () => {
    if (pendingEvent) {
      handleDispatchEvent({ ...pendingEvent, payload: { ...pendingEvent.payload, motivo: motivoText } });
    }
    setShowMotivoModal(false);
    setPendingEvent(null);
  };

  // === Nova Requisição (unchanged) ===
  const openNovaReq = async () => {
    const est = await listarEstoque();
    setEstoque(est);
    setReqCdResponsavel("MAO");
    setReqPlantaDestino(os.planta);
    setReqItens([]);
    setShowNovaReq(true);
  };

  const addMaterialToReq = (item: EstoqueItem) => {
    if (reqItens.some((i) => i.codMaterial === item.codMaterial)) {
      toast({ title: "Material já adicionado", variant: "destructive" });
      return;
    }
    setReqItens((prev) => [...prev, {
      codMaterial: item.codMaterial,
      descricao: item.descricao,
      un: item.un,
      qtdSolicitada: 1,
    }]);
    setShowEstoque(false);
  };

  const updateQtdItem = (codMaterial: string, qtd: number) => {
    setReqItens((prev) => prev.map((i) => i.codMaterial === codMaterial ? { ...i, qtdSolicitada: qtd } : i));
  };

  const removeItemFromReq = (codMaterial: string) => {
    setReqItens((prev) => prev.filter((i) => i.codMaterial !== codMaterial));
  };

  const handleSalvarReq = async () => {
    if (reqItens.length === 0) {
      toast({ title: "Adicione ao menos um material", variant: "destructive" });
      return;
    }
    const novaReq = await criarReqAssistencia({
      osId: os.id,
      cdResponsavel: reqCdResponsavel,
      plantaDestino: reqPlantaDestino,
      status: "PENDENTE",
      itens: reqItens,
      criadoAt: new Date().toISOString().slice(0, 10),
      atualizadoAt: new Date().toISOString().slice(0, 10),
    });
    setReqs((prev) => [...prev, novaReq]);
    setShowNovaReq(false);
    registrarAuditoria("CRIAR", "REQUISICAO", novaReq.id, `Requisição criada vinculada à ${os.id}. ${reqItens.length} item(ns).`);
    toast({ title: "Requisição criada", description: `${novaReq.id} vinculada à ${os.id}` });
  };

  const getEstoquePlanta = (item: EstoqueItem, planta: Planta) => {
    if (planta === "MAO") return item.estoqueMAO;
    if (planta === "BEL") return item.estoqueBEL;
    return item.estoqueAGR;
  };

  const filteredEstoque = estoque.filter((e) =>
    !estoqueFilter || e.descricao.toLowerCase().includes(estoqueFilter.toLowerCase()) || e.codMaterial.toLowerCase().includes(estoqueFilter.toLowerCase())
  );

  // Determine which sections to highlight based on papel
  const showInspecaoSection = ["INSPECAO", "ADMIN"].includes(papel) || os.status === "EM_INSPECAO";
  const showReparoSection = ["REPARO", "ADMIN"].includes(papel) || os.status === "EM_REPARO";
  const showRecebimentoSection = ["ASSISTENCIA", "ADMIN"].includes(papel) || os.status === "RECEBIDO" || os.status === "AGUARDANDO_RECEBIMENTO";
  const showValidacaoSection = ["VALIDACAO", "ADMIN"].includes(papel) || os.status === "AGUARDANDO_VALIDACAO";
  const showEncerramentoSection = ["SAC", "ADMIN"].includes(papel) || os.status === "CONCLUIDA";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4 flex-wrap">
        <Button variant="ghost" size="icon" onClick={() => navigate("/assistencia/os")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground">{os.id}</h1>
            <Badge className={OS_STATUS_COLORS[os.status]}>{OS_STATUS_LABELS[os.status]}</Badge>
            <Badge className={OS_PRIORIDADE_COLORS[os.prioridade]}>{OS_PRIORIDADE_LABELS[os.prioridade]}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{OS_TIPO_LABELS[os.tipoOs]} — {os.clienteNome}</p>
        </div>

        {/* Event-based buttons from state machine */}
        {availableEvents.map((evt) => {
          // Check if the event can be dispatched (for disabling with tooltip)
          const checkEvent: OSEvent = { type: evt.type };
          const check = canDispatchEvent(osWithGates, checkEvent, reqs);

          if (evt.type === "RETORNAR_ETAPA" || evt.type === "CANCELAR_OS" || evt.needsDecisao) {
            // These always show enabled (validation happens in modal)
            return (
              <Button
                key={evt.type}
                variant={evt.variant}
                size={evt.type === "CANCELAR_OS" ? "sm" : "default"}
                onClick={() => handleEventClick(evt)}
                className="gap-2"
              >
                {evt.label}
              </Button>
            );
          }

          if (!check.allowed) {
            return (
              <Tooltip key={evt.type}>
                <TooltipTrigger asChild>
                  <span>
                    <Button variant={evt.variant} disabled className="gap-2">
                      {evt.label}
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-xs">{check.reason}</TooltipContent>
              </Tooltip>
            );
          }

          return (
            <Button
              key={evt.type}
              variant={evt.variant}
              onClick={() => handleEventClick(evt)}
              className="gap-2"
            >
              {evt.label}
            </Button>
          );
        })}
      </div>

      {/* Responsável atual */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <ShieldAlert className="w-3.5 h-3.5" />
        <span>Responsável pela etapa atual: <strong className="text-foreground">{PAPEL_LABELS[responsavelAtual]}</strong></span>
        {isDiretoria && <Badge variant="outline" className="text-[10px] ml-2">Somente leitura</Badge>}
      </div>

      {/* Timeline mini */}
      <Card className="glass-card">
        <CardContent className="py-3 px-4">
          <div className="flex items-center gap-1 overflow-x-auto">
            {OS_STATUS_FLOW.map((s, i) => {
              const isCurrent = s === os.status;
              const isPast = i < currentIdx;
              return (
                <Tooltip key={s}>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1">
                      <div className={`px-2 py-1 rounded text-[10px] font-medium whitespace-nowrap cursor-default ${isCurrent ? "bg-primary text-primary-foreground" : isPast ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
                        {OS_STATUS_LABELS[s]}
                      </div>
                      {i < OS_STATUS_FLOW.length - 1 && <span className="text-muted-foreground text-xs">→</span>}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">Mudança somente via eventos autorizados</TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Aguardando Recebimento alert */}
      {reqsEmTransferencia.length > 0 && (
        <Alert>
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription className="flex items-center justify-between">
            <span><strong>Aguardando Recebimento:</strong> {reqsEmTransferencia.length} requisição(ões) em transferência para esta planta.</span>
            <Button size="sm" variant="outline" onClick={() => navigate(`/assistencia/requisicoes/${reqsEmTransferencia[0].id}/receber`)} className="ml-2 text-xs">
              Receber
            </Button>
          </AlertDescription>
        </Alert>
      )}

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
            {showInspecaoSection && (
              <>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Laudo de Inspeção {os.status === "EM_INSPECAO" && <span className="text-destructive">*</span>}</label>
                  <Textarea value={laudo} onChange={(e) => setLaudo(e.target.value)} placeholder="Registrar laudo de inspeção..." className="mt-1" rows={3} disabled={isDiretoria} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Decisão Técnica {os.status === "EM_INSPECAO" && <span className="text-destructive">*</span>}</label>
                  <Textarea value={decisao} onChange={(e) => setDecisao(e.target.value)} placeholder="Registrar decisão técnica..." className="mt-1" rows={3} disabled={isDiretoria} />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gate: Recebimento do produto */}
      {showRecebimentoSection && (
        <Card className="glass-card">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Confirmação de Recebimento do Produto</CardTitle></CardHeader>
          <CardContent>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox checked={recebimentoConfirmado} onCheckedChange={(v) => setRecebimentoConfirmado(!!v)} disabled={isDiretoria} />
              <span className={recebimentoConfirmado ? "text-foreground" : "text-muted-foreground"}>
                Produto recebido na base de assistência {os.status === "RECEBIDO" && <span className="text-destructive">*</span>}
              </span>
              {recebimentoConfirmado && <CheckCircle2 className="w-4 h-4 text-success" />}
            </label>
          </CardContent>
        </Card>
      )}

      {/* Gate: Relatório de Reparo */}
      {showReparoSection && (
        <Card className="glass-card">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Execução do Reparo</CardTitle></CardHeader>
          <CardContent>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Relatório de Reparo {os.status === "EM_REPARO" && <span className="text-destructive">*</span>}</label>
              <Textarea value={relatorioReparo} onChange={(e) => setRelatorioReparo(e.target.value)} placeholder="Descrever a execução do reparo, procedimentos realizados..." className="mt-1" rows={3} disabled={isDiretoria} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gate: Validação */}
      {showValidacaoSection && (
        <Card className="glass-card">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Validação Final</CardTitle></CardHeader>
          <CardContent>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox checked={validacaoAprovada} onCheckedChange={(v) => setValidacaoAprovada(!!v)} disabled={isDiretoria} />
              <span className={validacaoAprovada ? "text-foreground" : "text-muted-foreground"}>
                Validação aprovada {os.status === "AGUARDANDO_VALIDACAO" && <span className="text-destructive">*</span>}
              </span>
              {validacaoAprovada && <CheckCircle2 className="w-4 h-4 text-success" />}
            </label>
          </CardContent>
        </Card>
      )}

      {/* Gate: Encerramento */}
      {showEncerramentoSection && (
        <Card className="glass-card">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Encerramento</CardTitle></CardHeader>
          <CardContent>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Mensagem de encerramento / comunicação ao cliente {os.status === "CONCLUIDA" && <span className="text-destructive">*</span>}</label>
              <Textarea value={mensagemEncerramento} onChange={(e) => setMensagemEncerramento(e.target.value)} placeholder="Registrar comunicação ao cliente, canal utilizado..." className="mt-1" rows={3} disabled={isDiretoria} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Requisições */}
      <Card className="glass-card">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm text-muted-foreground">Requisições de Material</CardTitle>
          {!isDiretoria && hasPermission("ASSIST_REQ_CREATE") ? (
            <Button variant="outline" size="sm" onClick={openNovaReq} className="text-xs gap-1">
              <Package className="w-3 h-3" /> Nova Requisição
            </Button>
          ) : !isDiretoria ? (
            <Tooltip>
              <TooltipTrigger asChild><span><Button variant="outline" size="sm" disabled className="text-xs gap-1"><Package className="w-3 h-3" /> Nova Requisição</Button></span></TooltipTrigger>
              <TooltipContent>Sem permissão</TooltipContent>
            </Tooltip>
          ) : null}
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">ID</TableHead>
                <TableHead className="text-xs">CD → Destino</TableHead>
                <TableHead className="text-xs">Itens</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reqs.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground text-xs py-4">Nenhuma requisição</TableCell></TableRow>
              ) : reqs.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">{r.id}</TableCell>
                  <TableCell className="text-xs">{r.cdResponsavel} → {r.plantaDestino}</TableCell>
                  <TableCell className="text-xs">{r.itens.length} item(ns)</TableCell>
                  <TableCell><Badge className={`text-[10px] ${REQ_ASSIST_STATUS_COLORS[r.status]}`}>{REQ_ASSIST_STATUS_LABELS[r.status]}</Badge></TableCell>
                  <TableCell>
                    {r.status === "EM_TRANSFERENCIA" && !isDiretoria && (
                      <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => navigate(`/assistencia/requisicoes/${r.id}/receber`)}>
                        Receber
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Consumos */}
      <Card className="glass-card">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm text-muted-foreground">Consumo de Materiais</CardTitle>
          {!isDiretoria && consumoLiberado && hasPermission("ASSIST_CONSUMO_CREATE") ? (
            <Button variant="outline" size="sm" onClick={() => navigate(`/assistencia/os/${os.id}/consumo`)} className="text-xs gap-1">
              <Plus className="w-3 h-3" /> Registrar Consumo
            </Button>
          ) : !isDiretoria ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button variant="outline" size="sm" disabled className="text-xs gap-1">
                    <Plus className="w-3 h-3" /> Registrar Consumo
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                {!consumoLiberado
                  ? "Consumo liberado somente após recebimento da requisição na assistência."
                  : "Sem permissão para registrar consumo."}
              </TooltipContent>
            </Tooltip>
          ) : null}
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

      {/* ============ HISTÓRICO DE TRANSIÇÕES ============ */}
      <Card className="glass-card">
        <CardHeader className="pb-2 flex flex-row items-center gap-2">
          <History className="w-4 h-4 text-muted-foreground" />
          <CardTitle className="text-sm text-muted-foreground">Histórico de Transições</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Data/Hora</TableHead>
                <TableHead className="text-xs">Usuário</TableHead>
                <TableHead className="text-xs">Perfil/Papel</TableHead>
                <TableHead className="text-xs">Planta</TableHead>
                <TableHead className="text-xs">De → Para</TableHead>
                <TableHead className="text-xs">Motivo</TableHead>
                <TableHead className="text-xs w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transitionLogs.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground text-xs py-4">Nenhuma transição registrada</TableCell></TableRow>
              ) : transitionLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">{log.timestamp.replace("T", " ").slice(0, 16)}</TableCell>
                  <TableCell className="text-xs font-medium">{log.usuario}</TableCell>
                  <TableCell className="text-xs">{log.perfil} / {log.papel}</TableCell>
                  <TableCell className="text-xs">{log.planta}</TableCell>
                  <TableCell className="text-xs">
                    <Badge variant="outline" className="text-[10px] mr-1">{OS_STATUS_LABELS[log.oldStatus]}</Badge>
                    <span className="text-muted-foreground">→</span>
                    <Badge variant="outline" className="text-[10px] ml-1">{OS_STATUS_LABELS[log.newStatus]}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{log.motivo || "—"}</TableCell>
                  <TableCell>
                    {log.detalhes && (
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setSelectedLogDetalhes(log.detalhes!); setShowDetalhesModal(true); }}>
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ============ MODAL NOVA REQUISIÇÃO ============ */}
      <Dialog open={showNovaReq} onOpenChange={setShowNovaReq}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Requisição de Material — {os.id}</DialogTitle>
            <DialogDescription>Selecione o CD de origem, a planta destino e os materiais necessários.</DialogDescription>
          </DialogHeader>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">CD Responsável (origem)</label>
              <Select value={reqCdResponsavel} onValueChange={(v) => setReqCdResponsavel(v as Planta)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(PLANTA_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{k} – {v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Planta Destino</label>
              <Select value={reqPlantaDestino} onValueChange={(v) => setReqPlantaDestino(v as Planta)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(PLANTA_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{k} – {v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Itens da Requisição</label>
              <Button variant="outline" size="sm" onClick={() => setShowEstoque(true)} className="gap-1 text-xs">
                <Warehouse className="w-3.5 h-3.5" /> Consultar Estoque / Adicionar Material
              </Button>
            </div>

            {reqItens.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-xs">Código</TableHead>
                      <TableHead className="text-xs">Descrição</TableHead>
                      <TableHead className="text-xs">UN</TableHead>
                      <TableHead className="text-xs w-28">Qtd Solicitada</TableHead>
                      <TableHead className="text-xs w-16"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reqItens.map((item) => (
                      <TableRow key={item.codMaterial}>
                        <TableCell className="font-mono text-xs">{item.codMaterial}</TableCell>
                        <TableCell className="text-xs">{item.descricao}</TableCell>
                        <TableCell className="text-xs">{item.un}</TableCell>
                        <TableCell>
                          <Input type="number" min={1} value={item.qtdSolicitada} onChange={(e) => updateQtdItem(item.codMaterial, Number(e.target.value))} className="h-8 w-24 text-xs" />
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeItemFromReq(item.codMaterial)}>
                            <Trash2 className="w-3.5 h-3.5 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex items-center justify-center py-6 text-muted-foreground text-sm border rounded-lg border-dashed">
                Nenhum material adicionado. Clique em "Consultar Estoque" para buscar.
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowNovaReq(false)}>Cancelar</Button>
            <Button onClick={handleSalvarReq} className="gap-2">
              <Package className="w-4 h-4" /> Criar Requisição
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ============ MODAL CONSULTAR ESTOQUE ============ */}
      <Dialog open={showEstoque} onOpenChange={setShowEstoque}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Warehouse className="w-5 h-5" /> Estoque por Planta</DialogTitle>
            <DialogDescription>Consulte a disponibilidade de materiais nas três plantas e adicione à requisição.</DialogDescription>
          </DialogHeader>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar por código ou descrição..." value={estoqueFilter} onChange={(e) => setEstoqueFilter(e.target.value)} className="pl-9" />
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs">Código</TableHead>
                  <TableHead className="text-xs">Descrição</TableHead>
                  <TableHead className="text-xs">UN</TableHead>
                  <TableHead className="text-xs">Categoria</TableHead>
                  <TableHead className="text-xs text-center">
                    <span className={reqCdResponsavel === "MAO" ? "text-primary font-bold" : ""}>MAO</span>
                  </TableHead>
                  <TableHead className="text-xs text-center">
                    <span className={reqCdResponsavel === "BEL" ? "text-primary font-bold" : ""}>BEL</span>
                  </TableHead>
                  <TableHead className="text-xs text-center">
                    <span className={reqCdResponsavel === "AGR" ? "text-primary font-bold" : ""}>AGR</span>
                  </TableHead>
                  <TableHead className="text-xs w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEstoque.map((item) => {
                  const jaAdicionado = reqItens.some((i) => i.codMaterial === item.codMaterial);
                  const estoqueCD = getEstoquePlanta(item, reqCdResponsavel);
                  return (
                    <TableRow key={item.codMaterial} className={jaAdicionado ? "bg-primary/5" : "hover:bg-muted/30"}>
                      <TableCell className="font-mono text-xs">{item.codMaterial}</TableCell>
                      <TableCell className="text-xs">{item.descricao}</TableCell>
                      <TableCell className="text-xs">{item.un}</TableCell>
                      <TableCell className="text-xs">{item.categoria}</TableCell>
                      <TableCell className={`text-xs text-center font-medium ${item.estoqueMAO === 0 ? "text-destructive" : item.estoqueMAO <= 10 ? "text-warning" : "text-success"}`}>
                        {item.estoqueMAO}
                      </TableCell>
                      <TableCell className={`text-xs text-center font-medium ${item.estoqueBEL === 0 ? "text-destructive" : item.estoqueBEL <= 10 ? "text-warning" : "text-success"}`}>
                        {item.estoqueBEL}
                      </TableCell>
                      <TableCell className={`text-xs text-center font-medium ${item.estoqueAGR === 0 ? "text-destructive" : item.estoqueAGR <= 10 ? "text-warning" : "text-success"}`}>
                        {item.estoqueAGR}
                      </TableCell>
                      <TableCell>
                        {jaAdicionado ? (
                          <Badge variant="outline" className="text-[10px]">Adicionado</Badge>
                        ) : (
                          <Button size="sm" variant={estoqueCD > 0 ? "default" : "outline"} className="h-7 text-xs gap-1" onClick={() => addMaterialToReq(item)}>
                            <Plus className="w-3 h-3" /> Add
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredEstoque.length === 0 && (
                  <TableRow><TableCell colSpan={8} className="text-center py-6 text-muted-foreground text-sm">Nenhum material encontrado.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      {/* ============ MODAL DECISÃO INSPEÇÃO ============ */}
      <Dialog open={showDecisaoModal} onOpenChange={setShowDecisaoModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Decisão da Inspeção</DialogTitle>
            <DialogDescription>Selecione a decisão técnica para esta OS.</DialogDescription>
          </DialogHeader>
          <Select value={decisaoInspecao} onValueChange={(v) => setDecisaoInspecao(v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="REPARAR">Reparar (→ Aguardando Peças)</SelectItem>
              <SelectItem value="TROCAR">Trocar (→ Validação)</SelectItem>
              <SelectItem value="REJEITAR">Rejeitar (→ Validação)</SelectItem>
              <SelectItem value="REENTRADA">Reentrada (→ Validação)</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowDecisaoModal(false)}>Cancelar</Button>
            <Button onClick={handleConfirmDecisao}>Confirmar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ============ MODAL RETORNAR ETAPA ============ */}
      <Dialog open={showReturnModal} onOpenChange={setShowReturnModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Retornar Etapa</DialogTitle>
            <DialogDescription>Selecione o estado de destino e informe o motivo.</DialogDescription>
          </DialogHeader>
          {returnTargets.length > 1 ? (
            <Select value={selectedReturnTarget} onValueChange={(v) => setSelectedReturnTarget(v as OSStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {returnTargets.map((t) => (
                  <SelectItem key={t} value={t}>{OS_STATUS_LABELS[t]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="text-sm text-foreground">Retornar para: <strong>{OS_STATUS_LABELS[returnTargets[0]]}</strong></p>
          )}
          <Textarea value={motivoText} onChange={(e) => setMotivoText(e.target.value)} placeholder="Ex.: Falta de informação, dados incorretos..." rows={3} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowReturnModal(false)}>Cancelar</Button>
            <Button onClick={handleConfirmReturn}>Confirmar Retrocesso</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ============ MODAL MOTIVO (CANCELAMENTO) ============ */}
      <Dialog open={showMotivoModal} onOpenChange={setShowMotivoModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Motivo do Cancelamento</DialogTitle>
            <DialogDescription>Informe o motivo para cancelar a OS.</DialogDescription>
          </DialogHeader>
          <Textarea value={motivoText} onChange={(e) => setMotivoText(e.target.value)} placeholder="Ex.: Solicitação do cliente, duplicidade..." rows={3} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowMotivoModal(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleConfirmMotivo}>Confirmar Cancelamento</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ============ MODAL DETALHES DO LOG ============ */}
      <Dialog open={showDetalhesModal} onOpenChange={setShowDetalhesModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes da Transição</DialogTitle>
          </DialogHeader>
          <pre className="bg-muted p-4 rounded-md text-xs overflow-auto max-h-64 whitespace-pre-wrap">{selectedLogDetalhes}</pre>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OSDetalhePage;
