import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FormField from "@/components/forms/FormField";
import SectionCard from "@/components/forms/SectionCard";
import { PLANTA_LABELS, Planta } from "@/types/sgq";
import { useToast } from "@/hooks/use-toast";

const tiposAuditoria = ["5S", "PROCESSO", "PRODUTO", "ISO 9001", "FORNECEDOR"] as const;
const templates = ["Auditoria 5S - Produção", "Auditoria de Processo - Espuma", "Auditoria ISO 9001 - Interna", "Auditoria de Produto Final"] as const;

const NovaAuditoriaPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [form, setForm] = useState({
    tipoAuditoria: "",
    template: "",
    planta: "",
    local: "",
    auditor: "",
    dataInicio: "",
    dataFim: "",
    escopo: "",
  });

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleSave = () => {
    if (!form.tipoAuditoria || !form.planta || !form.auditor || !form.dataInicio) {
      toast({ title: "Campos obrigatórios", description: "Preencha todos os campos obrigatórios.", variant: "destructive" });
      return;
    }
    toast({ title: "Auditoria criada", description: "Status: PLANEJADA" });
    navigate("/auditorias");
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/auditorias")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nova Auditoria</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Planejamento de auditoria interna</p>
        </div>
      </div>

      <SectionCard title="Configuração" description="Tipo de auditoria e checklist">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Tipo de Auditoria" required>
            <Select value={form.tipoAuditoria} onValueChange={(v) => update("tipoAuditoria", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {tiposAuditoria.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Checklist de Auditoria">
            <Select value={form.template} onValueChange={(v) => update("template", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione o tipo de auditoria" /></SelectTrigger>
              <SelectContent>
                {templates.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </FormField>
        </div>
      </SectionCard>

      <SectionCard title="Local e Responsável">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
          <FormField label="Local">
            <Input placeholder="Ex: Linha de Montagem 1" value={form.local} onChange={(e) => update("local", e.target.value)} />
          </FormField>
          <FormField label="Auditor Responsável" required>
            <Input placeholder="Nome do auditor" value={form.auditor} onChange={(e) => update("auditor", e.target.value)} />
          </FormField>
        </div>
      </SectionCard>

      <SectionCard title="Planejamento">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Data Início" required>
            <Input type="date" value={form.dataInicio} onChange={(e) => update("dataInicio", e.target.value)} />
          </FormField>
          <FormField label="Data Fim Planejada">
            <Input type="date" value={form.dataFim} onChange={(e) => update("dataFim", e.target.value)} />
          </FormField>
        </div>
        <FormField label="Escopo">
          <Textarea placeholder="Descreva o escopo da auditoria..." value={form.escopo} onChange={(e) => update("escopo", e.target.value)} rows={3} />
        </FormField>
      </SectionCard>

      <div className="flex gap-3 justify-end pt-2">
        <Button variant="outline" onClick={() => navigate("/auditorias")}>Cancelar</Button>
        <Button className="gap-2" onClick={handleSave}><Save className="w-4 h-4" /> Salvar</Button>
      </div>
    </div>
  );
};

export default NovaAuditoriaPage;
