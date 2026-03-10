import { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FormField from "@/components/forms/FormField";
import SectionCard from "@/components/forms/SectionCard";
import FormStepGuide from "@/components/forms/FormStepGuide";
import AttachmentUploader from "@/components/upload/AttachmentUploader";
import { PLANTA_LABELS, Planta } from "@/types/sgq";
import { useToast } from "@/hooks/use-toast";
import { createNC } from "@/services/nc";
import { loadDraft, useDraftAutosave } from "@/hooks/useDraftAutosave";
import { useUxMetrics } from "@/hooks/useUxMetrics";

const tiposNC = ["PRODUTO", "PROCESSO", "SISTEMA", "FORNECEDOR", "CLIENTE"] as const;
const gravidades = ["BAIXA", "MEDIA", "ALTA", "CRITICA"] as const;
const DRAFT_KEY = "draft:qualidade:nova-nc";

const NovaNCPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { trackAction, trackError } = useUxMetrics("QUALIDADE_NOVA_NC");
  const sacData = location.state as Record<string, string> | null;

  const [form, setForm] = useState(() =>
    loadDraft(DRAFT_KEY, {
      codcli: sacData?.codcli || "",
      clienteNome: sacData?.clienteNome || "",
      numPedido: sacData?.numPedido || "",
      numNf: sacData?.numNfVenda || "",
      codprod: sacData?.codprod || "",
      tipoNc: sacData?.tipoContato === "RECLAMACAO" ? "CLIENTE" : "",
      gravidade: "",
      planta: sacData?.plantaResp || "",
      motivoId: "",
      descricao: sacData?.descricao || "",
      responsavel: "",
      prazo: "",
      causaRaiz: "",
      planoAcao: "",
    }),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const { lastSavedAt, clear: clearDraft } = useDraftAutosave(DRAFT_KEY, form);

  const update = (field: keyof typeof form, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const steps = useMemo(
    () => [
      { id: "class", label: "Classificação", complete: Boolean(form.tipoNc && form.gravidade && form.planta), anchorId: "nc-step-class" },
      { id: "detail", label: "Detalhes", complete: Boolean(form.descricao.trim() && form.responsavel.trim() && form.prazo), anchorId: "nc-step-detail" },
      { id: "evidence", label: "Evidências", complete: true, anchorId: "nc-step-evidence" },
    ],
    [form],
  );

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.tipoNc) nextErrors.tipoNc = "Selecione o tipo da NC.";
    if (!form.gravidade) nextErrors.gravidade = "Selecione a gravidade.";
    if (!form.planta) nextErrors.planta = "Selecione a planta.";
    if (!form.descricao.trim()) nextErrors.descricao = "Informe a descrição.";
    if (!form.responsavel.trim()) nextErrors.responsavel = "Informe o responsável.";
    if (!form.prazo) nextErrors.prazo = "Informe o prazo.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (isSaving) return;
    if (!validate()) {
      toast({ title: "Campos obrigatórios", description: "Revise os campos destacados.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    trackAction("CRIAR_NC_START");
    try {
      await createNC({
        codcli: form.codcli || undefined,
        clienteNome: form.clienteNome || undefined,
        numPedido: form.numPedido || undefined,
        numNf: form.numNf || undefined,
        codprod: form.codprod || undefined,
        motivoId: form.motivoId || "NC-GERAL",
        tipoNc: form.tipoNc as any,
        gravidade: form.gravidade as any,
        descricao: form.descricao,
        causaRaiz: form.causaRaiz || undefined,
        planoAcao: form.planoAcao || undefined,
        responsavel: form.responsavel,
        prazo: form.prazo,
        status: "ABERTA",
        planta: form.planta as Planta,
        abertoAt: new Date().toISOString().slice(0, 10),
        encerradoAt: undefined,
        origem: "SAC",
        origemId: sacData?.sacId,
      } as any);
      clearDraft();
      trackAction("CRIAR_NC_SUCCESS");
      toast({ title: "NC criada", description: "Status: ABERTA" });
      navigate("/nao-conformidades");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao criar NC.";
      trackError("CRIAR_NC_ERROR", message);
      toast({ title: "Erro ao criar NC", description: message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/nao-conformidades")} aria-label="Voltar para Não Conformidades">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nova Não Conformidade</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Registro de nova NC</p>
        </div>
      </div>

      <FormStepGuide title="Assistente de preenchimento" steps={steps} />
      <p className="text-xs text-muted-foreground">
        Rascunho salvo automaticamente{lastSavedAt ? ` às ${new Date(lastSavedAt).toLocaleTimeString("pt-BR")}` : ""}.
      </p>

      <SectionCard id="nc-step-class" title="Classificação" description="Tipo, gravidade e localização">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormField label="Tipo NC" required error={errors.tipoNc}>
            <Select value={form.tipoNc} onValueChange={(v) => update("tipoNc", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{tiposNC.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </FormField>
          <FormField label="Gravidade" required error={errors.gravidade}>
            <Select value={form.gravidade} onValueChange={(v) => update("gravidade", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{gravidades.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
            </Select>
          </FormField>
          <FormField label="Planta" required error={errors.planta}>
            <Select value={form.planta} onValueChange={(v) => update("planta", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{(Object.keys(PLANTA_LABELS) as Planta[]).map((p) => <SelectItem key={p} value={p}>{p} - {PLANTA_LABELS[p]}</SelectItem>)}</SelectContent>
            </Select>
          </FormField>
          <FormField label="Motivo Padrão">
            <Input value={form.motivoId} onChange={(e) => update("motivoId", e.target.value)} />
          </FormField>
          <FormField label="CODPROD">
            <Input value={form.codprod} onChange={(e) => update("codprod", e.target.value)} />
          </FormField>
        </div>
      </SectionCard>

      <SectionCard id="nc-step-detail" title="Detalhes" description="Descrição e análise da não conformidade">
        <FormField label="Descrição" required error={errors.descricao}>
          <Textarea value={form.descricao} onChange={(e) => update("descricao", e.target.value)} rows={3} />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Responsável" required error={errors.responsavel}>
            <Input value={form.responsavel} onChange={(e) => update("responsavel", e.target.value)} />
          </FormField>
          <FormField label="Prazo" required error={errors.prazo}>
            <Input type="date" value={form.prazo} onChange={(e) => update("prazo", e.target.value)} />
          </FormField>
        </div>
        <FormField label="Causa Raiz">
          <Textarea value={form.causaRaiz} onChange={(e) => update("causaRaiz", e.target.value)} rows={2} />
        </FormField>
        <FormField label="Plano de Ação">
          <Textarea value={form.planoAcao} onChange={(e) => update("planoAcao", e.target.value)} rows={2} />
        </FormField>
      </SectionCard>

      <SectionCard id="nc-step-evidence" title="Evidências" description="Anexe fotos ou documentos">
        <AttachmentUploader accept="image/*,.pdf,.docx" />
      </SectionCard>

      <div className="flex gap-3 justify-end pt-2">
        <Button variant="outline" onClick={() => navigate("/nao-conformidades")}>Cancelar</Button>
        <Button variant="outline" onClick={() => { clearDraft(); toast({ title: "Rascunho limpo" }); }}>Limpar Rascunho</Button>
        <Button className="gap-2" onClick={() => { void handleSave(); }} disabled={isSaving}>
          <Save className="w-4 h-4" /> {isSaving ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </div>
  );
};

export default NovaNCPage;
