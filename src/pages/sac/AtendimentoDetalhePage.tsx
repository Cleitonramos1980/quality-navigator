import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AttachmentUploader from "@/components/upload/AttachmentUploader";
import {
  SAC_STATUS_LABELS,
  SAC_STATUS_COLORS,
  CANAL_LABELS,
  TIPO_CONTATO_LABELS,
  SACStatus,
  type SACAvaliacao,
  type SACAtendimento,
} from "@/types/sac";
import { PLANTA_LABELS } from "@/types/sgq";
import { ArrowLeft, ShieldCheck, AlertTriangle, FileSearch, Package, Send, Repeat, Copy, MessageCircleMore } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { enviarAvaliacaoWhatsapp, gerarLinkAvaliacao, getAtendimentoById, getAvaliacoes, reenviarAvaliacao, updateAtendimento } from "@/services/sac";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ToastAction } from "@/components/ui/toast";
import { useUxMetrics } from "@/hooks/useUxMetrics";

const AtendimentoDetalhePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { trackAction, trackError } = useUxMetrics("SAC_ATENDIMENTO_DETALHE");
  const [atendimento, setAtendimento] = useState<SACAtendimento | null>(null);
  const [novoStatus, setNovoStatus] = useState<string>("");
  const [confirmStatusOpen, setConfirmStatusOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [avaliacao, setAvaliacao] = useState<SACAvaliacao | null>(null);
  const [isSendingAvaliacao, setIsSendingAvaliacao] = useState(false);

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        const [atendimentoData, avaliacoes] = await Promise.all([
          getAtendimentoById(id),
          getAvaliacoes({ atendimentoId: id }),
        ]);
        setAtendimento(atendimentoData || null);
        setAvaliacao(avaliacoes[0] || null);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Falha ao carregar atendimento.";
        trackError("LOAD_ATENDIMENTO", message);
        toast({ title: "Erro ao carregar atendimento", description: message, variant: "destructive" });
      }
    };

    void loadData();
  }, [id, toast, trackError]);

  if (!atendimento) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-muted-foreground">Atendimento não encontrado</p>
        <Button variant="outline" onClick={() => navigate("/sac/atendimentos")}>Voltar</Button>
      </div>
    );
  }

  const sacPayload = {
    sacId: atendimento.id,
    codcli: atendimento.codcli,
    clienteNome: atendimento.clienteNome,
    cgcent: atendimento.cgcent,
    telefone: atendimento.telefone,
    numPedido: atendimento.numPedido || "",
    numNfVenda: atendimento.numNfVenda || "",
    codprod: atendimento.codprod || "",
    produtoRelacionado: atendimento.produtoRelacionado || "",
    descricao: atendimento.descricao,
    plantaResp: atendimento.plantaResp,
    tipoContato: atendimento.tipoContato,
    canal: atendimento.canal,
  };

  const applyStatusUpdate = async (nextStatus: SACStatus, options?: { previousStatus?: SACStatus; undo?: boolean }) => {
    if (isUpdatingStatus) return;
    setIsUpdatingStatus(true);
    try {
      const updated = await updateAtendimento(atendimento.id, { status: nextStatus });
      setAtendimento(updated);
      setNovoStatus("");
      trackAction(options?.undo ? "UNDO_STATUS" : "UPDATE_STATUS", {
        id: atendimento.id,
        nextStatus,
      });

      if (!options?.undo && options?.previousStatus) {
        toast({
          title: "Status atualizado",
          description: `Status alterado para ${SAC_STATUS_LABELS[nextStatus]}.`,
          action: (
            <ToastAction
              altText="Desfazer alteração de status"
              onClick={() => {
                void applyStatusUpdate(options.previousStatus as SACStatus, { undo: true });
              }}
            >
              Desfazer
            </ToastAction>
          ),
        });
      } else if (options?.undo) {
        toast({
          title: "Status restaurado",
          description: `Status retornou para ${SAC_STATUS_LABELS[nextStatus]}.`,
        });
      } else {
        toast({
          title: "Status atualizado",
          description: `Status alterado para ${SAC_STATUS_LABELS[nextStatus]}.`,
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao atualizar status do atendimento.";
      trackError("UPDATE_STATUS_ERROR", message, { nextStatus });
      toast({ title: "Erro ao atualizar status", description: message, variant: "destructive" });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleStatusChange = async () => {
    if (!novoStatus) return;
    await applyStatusUpdate(novoStatus as SACStatus, { previousStatus: atendimento.status });
  };

  const ensureAvaliacaoLink = async (): Promise<SACAvaliacao> => {
    if (avaliacao) return avaliacao;
    const created = await gerarLinkAvaliacao(atendimento.id);
    setAvaliacao(created);
    return created;
  };

  const handleCopiarLink = async () => {
    try {
      const item = await ensureAvaliacaoLink();
      await navigator.clipboard.writeText(item.link);
      toast({ title: "Link copiado", description: "Link da avaliação copiado para a área de transferência." });
    } catch (error) {
      toast({
        title: "Erro ao copiar link",
        description: error instanceof Error ? error.message : "Não foi possível copiar o link da avaliação.",
        variant: "destructive",
      });
    }
  };

  const handleEnviarAvaliacao = async () => {
    if (isSendingAvaliacao) return;
    setIsSendingAvaliacao(true);
    try {
      const updated = await enviarAvaliacaoWhatsapp(atendimento.id, false);
      setAvaliacao(updated);
      toast({
        title: "Avaliação enviada",
        description: updated.statusEnvio === "FALHA"
          ? "O envio foi registrado com falha. Verifique telefone/configuração WhatsApp."
          : "A pesquisa de satisfação foi enviada por WhatsApp.",
        variant: updated.statusEnvio === "FALHA" ? "destructive" : "default",
      });
    } catch (error) {
      toast({
        title: "Erro ao enviar avaliação",
        description: error instanceof Error ? error.message : "Não foi possível enviar a avaliação.",
        variant: "destructive",
      });
    } finally {
      setIsSendingAvaliacao(false);
    }
  };

  const handleReenviarAvaliacao = async () => {
    if (isSendingAvaliacao) return;
    setIsSendingAvaliacao(true);
    try {
      const current = avaliacao || await ensureAvaliacaoLink();
      const resent = await reenviarAvaliacao(current.id, true);
      setAvaliacao(resent);
      toast({
        title: "Avaliação reenviada",
        description: resent.statusEnvio === "FALHA"
          ? "O reenvio foi registrado com falha."
          : "A avaliação foi reenviada com novo link.",
        variant: resent.statusEnvio === "FALHA" ? "destructive" : "default",
      });
    } catch (error) {
      toast({
        title: "Erro ao reenviar",
        description: error instanceof Error ? error.message : "Não foi possível reenviar a avaliação.",
        variant: "destructive",
      });
    } finally {
      setIsSendingAvaliacao(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Voltar">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{atendimento.id}</h1>
            <span className={cn("status-badge", SAC_STATUS_COLORS[atendimento.status])}>{SAC_STATUS_LABELS[atendimento.status]}</span>
          </div>
          <p className="text-sm text-muted-foreground">{atendimento.clienteNome}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Dados do Cliente</CardTitle></CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div><dt className="text-muted-foreground">Cliente</dt><dd className="font-medium text-foreground">{atendimento.clienteNome}</dd></div>
                <div><dt className="text-muted-foreground">CODCLI</dt><dd className="font-mono text-foreground">{atendimento.codcli}</dd></div>
                <div><dt className="text-muted-foreground">CPF/CNPJ</dt><dd className="font-mono text-foreground">{atendimento.cgcent}</dd></div>
                <div><dt className="text-muted-foreground">Telefone</dt><dd className="text-foreground">{atendimento.telefone}</dd></div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Detalhes do Atendimento</CardTitle></CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div><dt className="text-muted-foreground">Canal</dt><dd>{CANAL_LABELS[atendimento.canal]}</dd></div>
                <div><dt className="text-muted-foreground">Tipo</dt><dd>{TIPO_CONTATO_LABELS[atendimento.tipoContato]}</dd></div>
                <div><dt className="text-muted-foreground">Planta</dt><dd>{atendimento.plantaResp} - {PLANTA_LABELS[atendimento.plantaResp]}</dd></div>
                <div><dt className="text-muted-foreground">Abertura</dt><dd>{atendimento.abertoAt}</dd></div>
                {atendimento.codprod && <div><dt className="text-muted-foreground">CODPROD</dt><dd className="font-mono">{atendimento.codprod}</dd></div>}
                {atendimento.numPedido && <div><dt className="text-muted-foreground">Pedido</dt><dd className="font-mono">{atendimento.numPedido}</dd></div>}
                {atendimento.numNfVenda && <div><dt className="text-muted-foreground">Nota Fiscal</dt><dd className="font-mono">{atendimento.numNfVenda}</dd></div>}
                {atendimento.produtoRelacionado && <div className="col-span-2"><dt className="text-muted-foreground">Produto</dt><dd>{atendimento.produtoRelacionado}</dd></div>}
              </dl>
              <div className="mt-4 pt-3 border-t border-border">
                <p className="text-sm text-muted-foreground mb-1">Descrição</p>
                <p className="text-sm text-foreground">{atendimento.descricao}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Timeline do Atendimento</CardTitle></CardHeader>
            <CardContent>
              {atendimento.timeline && atendimento.timeline.length > 0 ? (
                atendimento.timeline.map((entry) => (
                  <div key={entry.id} className="pb-2 text-sm">
                    <strong>{entry.acao}</strong> - {entry.descricao}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhum evento registrado</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Anexos / Evidências</CardTitle></CardHeader>
            <CardContent><AttachmentUploader maxFiles={10} accept="image/*,video/*,.pdf,.doc,.docx" /></CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Ações</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Alterar Status</p>
                <Select value={novoStatus} onValueChange={setNovoStatus}>
                  <SelectTrigger><SelectValue placeholder="Novo status" /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(SAC_STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button
                  className="w-full"
                  size="sm"
                  onClick={() => setConfirmStatusOpen(true)}
                  disabled={!novoStatus || isUpdatingStatus}
                >
                  {isUpdatingStatus ? "Atualizando..." : "Confirmar"}
                </Button>
              </div>
              <div className="border-t border-border pt-3 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Pesquisa de Satisfação</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => { void handleEnviarAvaliacao(); }}
                  disabled={isSendingAvaliacao}
                >
                  <Send className="w-4 h-4 mr-2" /> Enviar avaliação
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => { void handleReenviarAvaliacao(); }}
                  disabled={isSendingAvaliacao}
                >
                  <Repeat className="w-4 h-4 mr-2" /> Reenviar avaliação
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => { void handleCopiarLink(); }}
                >
                  <Copy className="w-4 h-4 mr-2" /> Copiar link da avaliação
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => navigate("/sac/avaliacoes")}
                >
                  <MessageCircleMore className="w-4 h-4 mr-2" /> Ver resposta da avaliação
                </Button>
              </div>
              <div className="border-t border-border pt-3 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Criar a partir deste chamado</p>
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => navigate("/garantias/nova", { state: sacPayload })}>
                  <ShieldCheck className="w-4 h-4 mr-2" /> Criar Garantia
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => navigate("/nao-conformidades/nova", { state: sacPayload })}>
                  <AlertTriangle className="w-4 h-4 mr-2" /> Criar NC
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => navigate("/capa/nova", { state: sacPayload })}>
                  <FileSearch className="w-4 h-4 mr-2" /> Criar CAPA
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => navigate("/sac/requisicoes/nova", { state: sacPayload })}>
                  <Package className="w-4 h-4 mr-2" /> Requisição
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={confirmStatusOpen} onOpenChange={setConfirmStatusOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar alteração de status</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja alterar o status do atendimento para{" "}
              <strong>{novoStatus ? SAC_STATUS_LABELS[novoStatus as SACStatus] : ""}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmStatusOpen(false);
                void handleStatusChange();
              }}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AtendimentoDetalhePage;
