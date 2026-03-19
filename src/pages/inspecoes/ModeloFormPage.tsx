import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, Plus, Trash2, GripVertical, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import SectionCard from "@/components/forms/SectionCard";
import FormField from "@/components/forms/FormField";
import { useToast } from "@/components/ui/use-toast";
import { createModeloInspecao, getModeloInspecao, updateModeloInspecao } from "@/services/inspecoes";
import type { ModeloInspecaoItem } from "@/types/inspecoes";
import { useSetoresPermitidos } from "@/hooks/useSetoresPermitidos";

const emptyItem = (): ModeloInspecaoItem => ({
  id: `ITEM-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  descricao: "",
  ordem: 0,
  obrigatorio: true,
  exigeEvidenciaNc: false,
  exigeTipoNc: true,
  ativo: true,
});

const ModeloFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id && id !== "novo";
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setoresPermitidos, loading: loadingSetores } = useSetoresPermitidos();

  const [nome, setNome] = useState("");
  const [setor, setSetor] = useState("");
  const [descricao, setDescricao] = useState("");
  const [ativo, setAtivo] = useState(true);
  const [itens, setItens] = useState<ModeloInspecaoItem[]>([emptyItem()]);
  const [saving, setSaving] = useState(false);

  const setoresDisponiveis = useMemo(() => [...setoresPermitidos].sort(), [setoresPermitidos]);

  useEffect(() => {
    if (!loadingSetores && !isEdit && !setor && setoresDisponiveis.length > 0) {
      setSetor(setoresDisponiveis[0]);
    }
  }, [loadingSetores, isEdit, setor, setoresDisponiveis]);

  useEffect(() => {
    if (isEdit) {
      void (async () => {
        try {
          const modelo = await getModeloInspecao(id!);
          if (!loadingSetores && !setoresPermitidos.includes(modelo.setor)) {
            toast({ title: "Acesso restrito", description: "Este modelo está fora do seu escopo por setor.", variant: "destructive" });
            navigate("/inspecoes/modelos");
            return;
          }
          setNome(modelo.nome);
          setSetor(modelo.setor);
          setDescricao(modelo.descricao);
          setAtivo(modelo.ativo);
          setItens(modelo.itens.length > 0 ? modelo.itens : [emptyItem()]);
        } catch {
          toast({ title: "Erro", description: "Modelo não encontrado.", variant: "destructive" });
        }
      })();
    }
  }, [id, isEdit, loadingSetores, navigate, setoresPermitidos, toast]);

  const updateItem = (idx: number, patch: Partial<ModeloInspecaoItem>) => {
    setItens((prev) => prev.map((it, i) => i === idx ? { ...it, ...patch } : it));
  };

  const addItem = () => setItens((prev) => [...prev, emptyItem()]);

  const removeItem = (idx: number) => {
    if (itens.length <= 1) return;
    setItens((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!nome.trim()) { toast({ title: "Campos obrigatórios", description: "Informe o nome do modelo.", variant: "destructive" }); return; }
    if (!setor) { toast({ title: "Campos obrigatórios", description: "Selecione um setor permitido.", variant: "destructive" }); return; }
    const validItens = itens.filter((it) => it.descricao.trim());
    if (validItens.length === 0) { toast({ title: "Itens", description: "Adicione ao menos um item de inspeção.", variant: "destructive" }); return; }
    setSaving(true);
    try {
      const orderedItens = validItens.map((it, i) => ({ ...it, ordem: i + 1 }));
      if (isEdit) {
        await updateModeloInspecao(id!, { nome, setor, descricao, ativo, itens: orderedItens });
        toast({ title: "Modelo atualizado", description: `${nome} salvo com sucesso.` });
      } else {
        await createModeloInspecao({ nome, setor, descricao, ativo, ordem: 0, itens: orderedItens });
        toast({ title: "Modelo criado", description: `${nome} criado com sucesso.` });
      }
      navigate("/inspecoes/modelos");
    } catch (e) {
      toast({ title: "Erro", description: e instanceof Error ? e.message : "Falha ao salvar", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-primary" />
          {isEdit ? "Editar Modelo de Inspeção" : "Novo Modelo de Inspeção"}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">Configure o checklist e seus itens de verificação</p>
      </div>

      <SectionCard title="Dados do Modelo">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Nome do Modelo" required>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Checklist Produção Diário" />
          </FormField>
          <FormField label="Setor" required>
            <select value={setor} onChange={(e) => setSetor(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" disabled={loadingSetores || setoresDisponiveis.length === 0}>
              <option value="">Selecione...</option>
              {setoresDisponiveis.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </FormField>
          <div className="sm:col-span-2">
            <FormField label="Descrição">
              <Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descreva o objetivo deste checklist..." rows={2} />
            </FormField>
          </div>
          <FormField label="Status">
            <div className="flex items-center gap-2">
              <Switch checked={ativo} onCheckedChange={setAtivo} />
              <span className="text-sm">{ativo ? "Ativo" : "Inativo"}</span>
            </div>
          </FormField>
        </div>
      </SectionCard>

      <SectionCard title="Itens do Checklist" description={`${itens.length} item(ns)`}>
        <div className="space-y-3">
          {itens.map((item, idx) => (
            <div key={item.id} className="flex gap-3 items-start rounded-lg border border-border p-3 bg-card">
              <div className="flex items-center gap-1 pt-2 text-muted-foreground">
                <GripVertical className="w-4 h-4" />
                <span className="text-xs font-mono w-5 text-center">{idx + 1}</span>
              </div>
              <div className="flex-1 space-y-2">
                <Input value={item.descricao} onChange={(e) => updateItem(idx, { descricao: e.target.value })} placeholder="Descrição do item de inspeção..." />
                <div className="flex flex-wrap gap-4 text-xs">
                  <label className="flex items-center gap-1.5">
                    <Checkbox checked={item.obrigatorio} onCheckedChange={(v) => updateItem(idx, { obrigatorio: !!v })} />
                    Obrigatório
                  </label>
                  <label className="flex items-center gap-1.5">
                    <Checkbox checked={item.exigeTipoNc} onCheckedChange={(v) => updateItem(idx, { exigeTipoNc: !!v })} />
                    Exige tipo NC
                  </label>
                  <label className="flex items-center gap-1.5">
                    <Checkbox checked={item.exigeEvidenciaNc} onCheckedChange={(v) => updateItem(idx, { exigeEvidenciaNc: !!v })} />
                    Exige evidência se NC
                  </label>
                  <label className="flex items-center gap-1.5">
                    <Checkbox checked={item.ativo} onCheckedChange={(v) => updateItem(idx, { ativo: !!v })} />
                    Ativo
                  </label>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-destructive shrink-0" onClick={() => removeItem(idx)} disabled={itens.length <= 1}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" className="mt-3 gap-1" onClick={addItem}>
          <Plus className="w-4 h-4" />Adicionar Item
        </Button>
      </SectionCard>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate("/inspecoes/modelos")}>Cancelar</Button>
        <Button onClick={handleSave} disabled={saving || loadingSetores} className="gap-2">
          <Save className="w-4 h-4" />{saving ? "Salvando..." : "Salvar Modelo"}
        </Button>
      </div>
    </div>
  );
};

export default ModeloFormPage;
