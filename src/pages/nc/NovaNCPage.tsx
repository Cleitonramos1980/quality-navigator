import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FormField from "@/components/forms/FormField";
import SectionCard from "@/components/forms/SectionCard";
import AttachmentUploader from "@/components/upload/AttachmentUploader";
import { PLANTA_LABELS, Planta } from "@/types/sgq";
import { useToast } from "@/hooks/use-toast";

const tiposNC = ["PRODUTO", "PROCESSO", "SISTEMA", "FORNECEDOR", "CLIENTE"] as const;
const gravidades = ["BAIXA", "MEDIA", "ALTA", "CRITICA"] as const;

const NovaNCPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [form, setForm] = useState({
    tipoNc: "",
    gravidade: "",
    planta: "",
    motivoId: "",
    descricao: "",
    responsavel: "",
    prazo: "",
    causaRaiz: "",
    planoAcao: "",
  });

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleSave = () => {
    if (!form.tipoNc || !form.gravidade || !form.planta || !form.descricao || !form.responsavel || !form.prazo) {
      toast({ title: "Campos obrigatórios", description: "Preencha todos os campos obrigatórios.", variant: "destructive" });
      return;
    }
    toast({ title: "NC criada", description: "Status: ABERTA" });
    navigate("/nao-conformidades");
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/nao-conformidades")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nova Não Conformidade</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Registro de nova NC</p>
        </div>
      </div>

      <SectionCard title="Classificação" description="Tipo, gravidade e localização">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormField label="Tipo NC" required>
            <Select value={form.tipoNc} onValueChange={(v) => update("tipoNc", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {tiposNC.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Gravidade" required>
            <Select value={form.gravidade} onValueChange={(v) => update("gravidade", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {gravidades.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Planta" required>
            <Select value={form.planta} onValueChange={(v) => update("planta", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {(Object.keys(PLANTA_LABELS) as Planta[]).map((p) => (
                  <SelectItem key={p} value={p}>{p} – {PLANTA_LABELS[p]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Motivo Padrão">
            <Input placeholder="Código do motivo" value={form.motivoId} onChange={(e) => update("motivoId", e.target.value)} />
          </FormField>
        </div>
      </SectionCard>

      <SectionCard title="Detalhes" description="Descrição e análise da não conformidade">
        <FormField label="Descrição" required>
          <Textarea placeholder="Descreva a não conformidade..." value={form.descricao} onChange={(e) => update("descricao", e.target.value)} rows={3} />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Responsável" required>
            <Input placeholder="Nome do responsável" value={form.responsavel} onChange={(e) => update("responsavel", e.target.value)} />
          </FormField>
          <FormField label="Prazo" required>
            <Input type="date" value={form.prazo} onChange={(e) => update("prazo", e.target.value)} />
          </FormField>
        </div>
        <FormField label="Causa Raiz">
          <Textarea placeholder="Análise da causa raiz..." value={form.causaRaiz} onChange={(e) => update("causaRaiz", e.target.value)} rows={2} />
        </FormField>
        <FormField label="Plano de Ação">
          <Textarea placeholder="Descreva o plano de ação..." value={form.planoAcao} onChange={(e) => update("planoAcao", e.target.value)} rows={2} />
        </FormField>
      </SectionCard>

      <SectionCard title="Evidências" description="Anexe fotos ou documentos">
        <AttachmentUploader accept="image/*,.pdf,.docx" />
      </SectionCard>

      <div className="flex gap-3 justify-end pt-2">
        <Button variant="outline" onClick={() => navigate("/nao-conformidades")}>Cancelar</Button>
        <Button className="gap-2" onClick={handleSave}><Save className="w-4 h-4" /> Salvar</Button>
      </div>
    </div>
  );
};

export default NovaNCPage;
