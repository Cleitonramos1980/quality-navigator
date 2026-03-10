import { useEffect, useState } from "react";
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
import { createAuditoria, getAuditoriaTemplates } from "@/services/auditorias";

const NovaAuditoriaPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Array<{ id: string; nome: string; tipoAuditoria: string }>>([]);

  const [form, setForm] = useState({
    tipoAuditoria: "",
    tplId: "",
    tplNome: "",
    planta: "",
    local: "",
    auditor: "",
    dataInicio: "",
    dataFim: "",
    escopo: "",
  });

  useEffect(() => {
    getAuditoriaTemplates()
      .then(setTemplates)
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Falha ao carregar templates.";
        toast({ title: "Erro ao carregar templates", description: message, variant: "destructive" });
      });
  }, [toast]);

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleTemplate = (tplId: string) => {
    const tpl = templates.find((item) => item.id === tplId);
    setForm((prev) => ({
      ...prev,
      tplId,
      tplNome: tpl?.nome || "",
      tipoAuditoria: tpl?.tipoAuditoria || prev.tipoAuditoria,
    }));
  };

  const handleSave = async () => {
    if (!form.tipoAuditoria || !form.planta || !form.auditor || !form.dataInicio) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createAuditoria({
        tipoAuditoria: form.tipoAuditoria,
        tplId: form.tplId || undefined,
        tplNome: form.tplNome || form.tipoAuditoria,
        planta: form.planta as Planta,
        local: form.local || "A definir",
        auditor: form.auditor,
        escopo: form.escopo || undefined,
        startedAt: form.dataInicio,
        finishedAt: form.dataFim || undefined,
        status: "PLANEJADA",
      } as any);

      toast({ title: "Auditoria criada", description: "Status: PLANEJADA" });
      navigate("/auditorias");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao criar auditoria.";
      toast({ title: "Erro ao criar auditoria", description: message, variant: "destructive" });
    }
  };

  return (
    <div className="max-w-4xl space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/auditorias")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nova Auditoria</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Planejamento de auditoria interna</p>
        </div>
      </div>

      <SectionCard title="Configuração" description="Tipo e template da auditoria">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Tipo de Auditoria" required>
            <Input
              value={form.tipoAuditoria}
              onChange={(e) => update("tipoAuditoria", e.target.value)}
              placeholder="Ex: PROCESSO"
            />
          </FormField>
          <FormField label="Template Checklist">
            <Select value={form.tplId} onValueChange={handleTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>
      </SectionCard>

      <SectionCard title="Local e Responsável">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormField label="Planta" required>
            <Select value={form.planta} onValueChange={(value) => update("planta", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(PLANTA_LABELS) as Planta[]).map((planta) => (
                  <SelectItem key={planta} value={planta}>
                    {planta} - {PLANTA_LABELS[planta]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Local">
            <Input value={form.local} onChange={(e) => update("local", e.target.value)} />
          </FormField>
          <FormField label="Auditor Responsável" required>
            <Input value={form.auditor} onChange={(e) => update("auditor", e.target.value)} />
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
          <Textarea value={form.escopo} onChange={(e) => update("escopo", e.target.value)} rows={3} />
        </FormField>
      </SectionCard>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" onClick={() => navigate("/auditorias")}>Cancelar</Button>
        <Button className="gap-2" onClick={() => void handleSave()}>
          <Save className="w-4 h-4" />
          Salvar
        </Button>
      </div>
    </div>
  );
};

export default NovaAuditoriaPage;
