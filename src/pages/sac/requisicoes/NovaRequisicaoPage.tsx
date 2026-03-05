import { useState } from "react";
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
import { REQUISICAO_MOTIVO_LABELS, REQUISICAO_PRIORIDADE_LABELS, ItemRequisicao, RequisicaoMotivo, RequisicaoPrioridade } from "@/types/sacRequisicao";
import { Planta, PLANTA_LABELS } from "@/types/sgq";
import { ArrowLeft, Save, X, Plus, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { criarRequisicao } from "@/services/sacRequisicoes";
import { MaterialERP } from "@/types/sacRequisicao";

const NovaRequisicaoPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const state = (location.state as any) || {};

  const [form, setForm] = useState({
    motivo: "" as RequisicaoMotivo | "",
    prioridade: "" as RequisicaoPrioridade | "",
    plantaCd: (state.plantaResp || "") as Planta | "",
    observacoes: state.descricao || "",
  });

  const [itens, setItens] = useState<ItemRequisicao[]>([]);
  const [showMaterialPicker, setShowMaterialPicker] = useState(false);

  const set = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

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
  };

  const handleSave = async (status: "RASCUNHO" | "PENDENTE") => {
    if (status === "PENDENTE" && (!form.motivo || !form.prioridade || !form.plantaCd || itens.length === 0)) {
      toast({ title: "Campos obrigatórios", description: "Preencha motivo, prioridade, planta e adicione ao menos 1 item.", variant: "destructive" });
      return;
    }
    await criarRequisicao({
      atendimentoId: state.sacId || state.atendimentoId,
      codcli: state.codcli || "",
      clienteNome: state.clienteNome || "",
      cgcent: state.cgcent || "",
      numPedido: state.numPedido,
      numNfVenda: state.numNfVenda,
      produtoRelacionado: state.produtoRelacionado,
      plantaCd: form.plantaCd as Planta,
      motivo: (form.motivo || "OUTRO") as RequisicaoMotivo,
      prioridade: (form.prioridade || "MEDIA") as RequisicaoPrioridade,
      observacoes: form.observacoes,
      itens,
      status,
    });
    toast({ title: status === "RASCUNHO" ? "Rascunho salvo" : "Requisição enviada", description: `Requisição ${status === "RASCUNHO" ? "salva como rascunho" : "enviada com sucesso"}.` });
    navigate("/sac/requisicoes");
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nova Requisição de Material</h1>
          <p className="text-sm text-muted-foreground">Solicitar materiais para assistência técnica</p>
        </div>
      </div>

      {/* Contexto do Atendimento (somente leitura) */}
      {(state.codcli || state.clienteNome) && (
        <SectionCard title="Contexto do Atendimento" description="Dados herdados do chamado SAC">
          <div className="grid md:grid-cols-4 gap-4">
            {state.sacId && (
              <FormField label="Atendimento"><Input value={state.sacId || state.atendimentoId || ""} readOnly className="bg-muted/30" /></FormField>
            )}
            <FormField label="CODCLI"><Input value={state.codcli || ""} readOnly className="bg-muted/30" /></FormField>
            <FormField label="Cliente"><Input value={state.clienteNome || ""} readOnly className="bg-muted/30" /></FormField>
            <FormField label="CPF/CNPJ"><Input value={state.cgcent || ""} readOnly className="bg-muted/30" /></FormField>
            {state.numPedido && <FormField label="Pedido"><Input value={state.numPedido} readOnly className="bg-muted/30" /></FormField>}
            {state.numNfVenda && <FormField label="NF Venda"><Input value={state.numNfVenda} readOnly className="bg-muted/30" /></FormField>}
            {state.produtoRelacionado && <FormField label="Produto"><Input value={state.produtoRelacionado} readOnly className="bg-muted/30" /></FormField>}
          </div>
        </SectionCard>
      )}

      {/* Dados da Requisição */}
      <SectionCard title="Dados da Requisição">
        <div className="grid md:grid-cols-3 gap-4">
          <FormField label="Motivo da Requisição" required>
            <Select value={form.motivo} onValueChange={(v) => set("motivo", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {Object.entries(REQUISICAO_MOTIVO_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Prioridade" required>
            <Select value={form.prioridade} onValueChange={(v) => set("prioridade", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {Object.entries(REQUISICAO_PRIORIDADE_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="CD / Planta de Atendimento" required>
            <Select value={form.plantaCd} onValueChange={(v) => set("plantaCd", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {Object.entries(PLANTA_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>
        <FormField label="Observações" className="mt-4">
          <Textarea value={form.observacoes} onChange={(e) => set("observacoes", e.target.value)} placeholder="Descreva a necessidade..." rows={3} />
        </FormField>
      </SectionCard>

      {/* Itens Requisitados */}
      <SectionCard title="Itens Requisitados" description="Adicione os materiais necessários">
        <div className="mb-3">
          <Button variant="outline" onClick={() => setShowMaterialPicker(true)}>
            <Plus className="w-4 h-4 mr-1" /> Adicionar Item
          </Button>
        </div>
        <RequisicaoItensTable
          itens={itens}
          onRemove={(idx) => setItens((prev) => prev.filter((_, i) => i !== idx))}
          onChangeQtd={(idx, qtd) => setItens((prev) => prev.map((it, i) => i === idx ? { ...it, qtdSolicitada: qtd } : it))}
          onChangeObs={(idx, obs) => setItens((prev) => prev.map((it, i) => i === idx ? { ...it, observacao: obs } : it))}
        />
      </SectionCard>

      {/* Evidências */}
      <SectionCard title="Evidências">
        <AttachmentUploader maxFiles={10} accept="image/*,video/*,.pdf,.doc,.docx" />
      </SectionCard>

      {/* Botões */}
      <div className="flex flex-wrap justify-end gap-3 pb-6">
        <Button variant="outline" onClick={() => navigate(-1)}><X className="w-4 h-4 mr-1" /> Cancelar</Button>
        <Button variant="outline" onClick={() => handleSave("RASCUNHO")}><Save className="w-4 h-4 mr-1" /> Salvar Rascunho</Button>
        <Button onClick={() => handleSave("PENDENTE")}><Package className="w-4 h-4 mr-1" /> Enviar Requisição</Button>
      </div>

      <MaterialPickerModal open={showMaterialPicker} onOpenChange={setShowMaterialPicker} onSelect={handleAddMaterial} />
    </div>
  );
};

export default NovaRequisicaoPage;
