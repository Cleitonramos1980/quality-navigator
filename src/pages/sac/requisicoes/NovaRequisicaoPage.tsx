import { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FormField from "@/components/forms/FormField";
import SectionCard from "@/components/forms/SectionCard";
import AttachmentUploader from "@/components/upload/AttachmentUploader";
import RequisicaoItensTable from "@/components/sac/RequisicaoItensTable";
import MaterialPickerModal from "@/components/sac/MaterialPickerModal";
import FormStepGuide from "@/components/forms/FormStepGuide";
import {
  REQUISICAO_MOTIVO_LABELS,
  REQUISICAO_PRIORIDADE_LABELS,
  ItemRequisicao,
  RequisicaoMotivo,
  RequisicaoPrioridade,
} from "@/types/sacRequisicao";
import { Planta, PLANTA_LABELS } from "@/types/sgq";
import { ArrowLeft, Save, X, Plus, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { criarRequisicao } from "@/services/sacRequisicoes";
import { MaterialERP } from "@/types/sacRequisicao";
import { loadDraft, useDraftAutosave } from "@/hooks/useDraftAutosave";
import { useUxMetrics } from "@/hooks/useUxMetrics";

const DRAFT_KEY = "draft:sac:nova-requisicao";

const NovaRequisicaoPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { trackAction, trackError } = useUxMetrics("SAC_NOVA_REQUISICAO");
  const state = (location.state as Record<string, any>) || {};

  const [form, setForm] = useState(() =>
    loadDraft(DRAFT_KEY, {
      motivo: "" as RequisicaoMotivo | "",
      prioridade: "" as RequisicaoPrioridade | "",
      plantaCd: (state.plantaResp || "") as Planta | "",
      observacoes: state.descricao || "",
    }),
  );
  const [itens, setItens] = useState<ItemRequisicao[]>(() => loadDraft(`${DRAFT_KEY}:itens`, []));
  const [showMaterialPicker, setShowMaterialPicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savingStatus, setSavingStatus] = useState<"RASCUNHO" | "PENDENTE" | null>(null);

  const { lastSavedAt, clear: clearDraft } = useDraftAutosave(DRAFT_KEY, form);
  useDraftAutosave(`${DRAFT_KEY}:itens`, itens);

  const set = (field: keyof typeof form, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const steps = useMemo(
    () => [
      { id: "context", label: "Contexto", complete: Boolean(state.codcli || state.clienteNome), anchorId: "req-step-contexto" },
      { id: "dados", label: "Dados da Requisição", complete: Boolean(form.motivo && form.prioridade && form.plantaCd), anchorId: "req-step-dados" },
      { id: "itens", label: "Itens", complete: itens.length > 0, anchorId: "req-step-itens" },
      { id: "evidencias", label: "Evidências", complete: true, anchorId: "req-step-evidencias" },
    ],
    [form, itens.length, state.codcli, state.clienteNome],
  );

  const handleAddMaterial = (mat: MaterialERP) => {
    if (itens.find((i) => i.codmat === mat.codmat)) {
      toast({ title: "Material já adicionado", variant: "destructive" });
      return;
    }
    setItens((prev) => [...prev, {
      codmat: mat.codmat,
      descricaoMaterial: mat.descricao,
      un: mat.un,
      qtdSolicitada: 1,
    }]);
    trackAction("ADD_MATERIAL", { codmat: mat.codmat });
  };

  const validate = (status: "RASCUNHO" | "PENDENTE") => {
    if (status === "RASCUNHO") return true;
    const nextErrors: Record<string, string> = {};
    if (!form.motivo) nextErrors.motivo = "Selecione o motivo.";
    if (!form.prioridade) nextErrors.prioridade = "Selecione a prioridade.";
    if (!form.plantaCd) nextErrors.plantaCd = "Selecione a planta/CD.";
    if (itens.length === 0) nextErrors.itens = "Adicione ao menos 1 item.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async (status: "RASCUNHO" | "PENDENTE") => {
    if (savingStatus) return;
    if (!validate(status)) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha motivo, prioridade, planta e adicione ao menos 1 item.",
        variant: "destructive",
      });
      return;
    }
    setSavingStatus(status);
    trackAction("SAVE_REQUISICAO_START", { status });
    try {
      await criarRequisicao({
        atendimentoId: state.sacId || state.atendimentoId,
        codcli: state.codcli || "",
        clienteNome: state.clienteNome || "",
        cgcent: state.cgcent || "",
        numPedido: state.numPedido,
        numNfVenda: state.numNfVenda,
        codprod: state.codprod,
        produtoRelacionado: state.produtoRelacionado,
        plantaCd: form.plantaCd as Planta,
        motivo: (form.motivo || "OUTRO") as RequisicaoMotivo,
        prioridade: (form.prioridade || "MEDIA") as RequisicaoPrioridade,
        observacoes: form.observacoes,
        itens,
        status,
      });
      clearDraft();
      localStorage.removeItem(`${DRAFT_KEY}:itens`);
      trackAction("SAVE_REQUISICAO_SUCCESS", { status });
      toast({
        title: status === "RASCUNHO" ? "Rascunho salvo" : "Requisição enviada",
        description: `Requisição ${status === "RASCUNHO" ? "salva como rascunho" : "enviada com sucesso"}.`,
      });
      navigate("/sac/requisicoes");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao salvar requisição.";
      trackError("SAVE_REQUISICAO_ERROR", message, { status });
      toast({ title: "Erro ao salvar requisição", description: message, variant: "destructive" });
    } finally {
      setSavingStatus(null);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Voltar">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nova Requisição de Material</h1>
          <p className="text-sm text-muted-foreground">Solicitar materiais para assistência técnica</p>
        </div>
      </div>

      <FormStepGuide title="Assistente de preenchimento" steps={steps} />
      <p className="text-xs text-muted-foreground">
        Rascunho salvo automaticamente{lastSavedAt ? ` às ${new Date(lastSavedAt).toLocaleTimeString("pt-BR")}` : ""}.
      </p>

      {(state.codcli || state.clienteNome) && (
        <SectionCard id="req-step-contexto" title="Contexto do Atendimento" description="Dados herdados do chamado SAC">
          <div className="grid md:grid-cols-4 gap-4">
            {state.sacId && <FormField label="Atendimento"><Input value={state.sacId || state.atendimentoId || ""} readOnly className="bg-muted/30" /></FormField>}
            <FormField label="CODCLI"><Input value={state.codcli || ""} readOnly className="bg-muted/30" /></FormField>
            <FormField label="Cliente"><Input value={state.clienteNome || ""} readOnly className="bg-muted/30" /></FormField>
            <FormField label="CPF/CNPJ"><Input value={state.cgcent || ""} readOnly className="bg-muted/30" /></FormField>
            {state.numPedido && <FormField label="Pedido"><Input value={state.numPedido} readOnly className="bg-muted/30" /></FormField>}
            {state.numNfVenda && <FormField label="NF Venda"><Input value={state.numNfVenda} readOnly className="bg-muted/30" /></FormField>}
            {state.codprod && <FormField label="CODPROD"><Input value={state.codprod} readOnly className="bg-muted/30" /></FormField>}
            {state.produtoRelacionado && <FormField label="Produto"><Input value={state.produtoRelacionado} readOnly className="bg-muted/30" /></FormField>}
          </div>
        </SectionCard>
      )}

      <SectionCard id="req-step-dados" title="Dados da Requisição">
        <div className="grid md:grid-cols-3 gap-4">
          <FormField label="Motivo da Requisição" required error={errors.motivo}>
            <Select value={form.motivo} onValueChange={(v) => set("motivo", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {Object.entries(REQUISICAO_MOTIVO_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Prioridade" required error={errors.prioridade}>
            <Select value={form.prioridade} onValueChange={(v) => set("prioridade", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {Object.entries(REQUISICAO_PRIORIDADE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="CD / Planta de Atendimento" required error={errors.plantaCd}>
            <Select value={form.plantaCd} onValueChange={(v) => set("plantaCd", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {Object.entries(PLANTA_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </FormField>
        </div>
        <FormField label="Observações" className="mt-4">
          <Textarea value={form.observacoes} onChange={(e) => set("observacoes", e.target.value)} placeholder="Descreva a necessidade..." rows={3} />
        </FormField>
      </SectionCard>

      <SectionCard id="req-step-itens" title="Itens Requisitados" description="Adicione os materiais necessários">
        <div className="mb-3">
          <Button variant="outline" onClick={() => setShowMaterialPicker(true)}>
            <Plus className="w-4 h-4 mr-1" /> Adicionar Item
          </Button>
        </div>
        {errors.itens && <p className="text-xs text-destructive mb-2">{errors.itens}</p>}
        <RequisicaoItensTable
          itens={itens}
          onRemove={(idx) => setItens((prev) => prev.filter((_, i) => i !== idx))}
          onChangeQtd={(idx, qtd) => setItens((prev) => prev.map((it, i) => i === idx ? { ...it, qtdSolicitada: qtd } : it))}
          onChangeObs={(idx, obs) => setItens((prev) => prev.map((it, i) => i === idx ? { ...it, observacao: obs } : it))}
        />
      </SectionCard>

      <SectionCard id="req-step-evidencias" title="Evidências">
        <AttachmentUploader maxFiles={10} accept="image/*,video/*,.pdf,.doc,.docx" />
      </SectionCard>

      <div className="flex flex-wrap justify-end gap-3 pb-6">
        <Button variant="outline" onClick={() => navigate(-1)}><X className="w-4 h-4 mr-1" /> Cancelar</Button>
        <Button variant="outline" onClick={() => { clearDraft(); localStorage.removeItem(`${DRAFT_KEY}:itens`); toast({ title: "Rascunho limpo" }); }}>
          Limpar Rascunho
        </Button>
        <Button variant="outline" disabled={Boolean(savingStatus)} onClick={() => { void handleSave("RASCUNHO"); }}>
          <Save className="w-4 h-4 mr-1" /> {savingStatus === "RASCUNHO" ? "Salvando..." : "Salvar Rascunho"}
        </Button>
        <Button disabled={Boolean(savingStatus)} onClick={() => { void handleSave("PENDENTE"); }}>
          <Package className="w-4 h-4 mr-1" /> {savingStatus === "PENDENTE" ? "Enviando..." : "Enviar Requisição"}
        </Button>
      </div>

      <MaterialPickerModal open={showMaterialPicker} onOpenChange={setShowMaterialPicker} onSelect={handleAddMaterial} />
    </div>
  );
};

export default NovaRequisicaoPage;
