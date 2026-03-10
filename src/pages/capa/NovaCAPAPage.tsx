import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FormField from "@/components/forms/FormField";
import SectionCard from "@/components/forms/SectionCard";
import { useToast } from "@/hooks/use-toast";
import { createCAPA } from "@/services/capa";

const origemTipos = ["NC", "GARANTIA", "AUDITORIA"] as const;

const NovaCAPAPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const sacData = location.state as Record<string, string> | null;

  const [form, setForm] = useState({
    origemTipo: sacData ? "NC" : "",
    origemId: sacData?.sacId || "",
    codprod: sacData?.codprod || "",
    descricaoProblema: sacData?.descricao || "",
    causaRaiz: "",
    planoAcao: "",
    responsavel: "",
    dataInicio: new Date().toISOString().slice(0, 10),
    dataPrazo: "",
    criterioEficacia: "",
  });

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleSave = async () => {
    if (!form.origemTipo || !form.descricaoProblema || !form.responsavel || !form.dataInicio || !form.dataPrazo) {
      toast({ title: "Campos obrigatórios", description: "Preencha todos os campos obrigatórios.", variant: "destructive" });
      return;
    }
    try {
      await createCAPA({
        origemTipo: form.origemTipo as any,
        origemId: form.origemId || "SAC",
        descricaoProblema: form.descricaoProblema,
        causaRaiz: form.causaRaiz || undefined,
        planoAcao: form.planoAcao || undefined,
        criterioEficacia: form.criterioEficacia || undefined,
        responsavel: form.responsavel,
        dataInicio: form.dataInicio,
        dataPrazo: form.dataPrazo,
        dataConclusao: undefined,
        status: "ABERTA",
      } as any);
      toast({ title: "CAPA criada", description: "Status: ABERTA" });
      navigate("/capa");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao criar CAPA.";
      toast({ title: "Erro ao criar CAPA", description: message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl"><div className="flex items-center gap-4"><Button variant="ghost" size="icon" onClick={() => navigate("/capa")}><ArrowLeft className="w-5 h-5" /></Button><div><h1 className="text-2xl font-bold text-foreground">Nova CAPA</h1><p className="text-sm text-muted-foreground mt-0.5">Ação Corretiva / Preventiva</p></div></div><SectionCard title="Origem" description="Origem da ação corretiva/preventiva"><div className="grid gap-4 sm:grid-cols-2"><FormField label="Tipo de Origem" required><Select value={form.origemTipo} onValueChange={(v) => update("origemTipo", v)}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{origemTipos.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></FormField><FormField label="ID da Origem"><Input value={form.origemId} onChange={(e) => update("origemId", e.target.value)} /></FormField><FormField label="CODPROD"><Input value={form.codprod} onChange={(e) => update("codprod", e.target.value)} /></FormField></div></SectionCard><SectionCard title="Detalhes" description="Informações da CAPA"><FormField label="Descrição do Problema" required><Textarea value={form.descricaoProblema} onChange={(e) => update("descricaoProblema", e.target.value)} rows={3} /></FormField><FormField label="Causa Raiz"><Textarea value={form.causaRaiz} onChange={(e) => update("causaRaiz", e.target.value)} rows={2} /></FormField><FormField label="Plano de Ação"><Textarea value={form.planoAcao} onChange={(e) => update("planoAcao", e.target.value)} rows={2} /></FormField><FormField label="Critério de Eficácia"><Textarea value={form.criterioEficacia} onChange={(e) => update("criterioEficacia", e.target.value)} rows={2} /></FormField></SectionCard><SectionCard title="Responsabilidade e Prazos"><div className="grid gap-4 sm:grid-cols-3"><FormField label="Responsável" required><Input value={form.responsavel} onChange={(e) => update("responsavel", e.target.value)} /></FormField><FormField label="Data Início" required><Input type="date" value={form.dataInicio} onChange={(e) => update("dataInicio", e.target.value)} /></FormField><FormField label="Prazo" required><Input type="date" value={form.dataPrazo} onChange={(e) => update("dataPrazo", e.target.value)} /></FormField></div></SectionCard><div className="flex gap-3 justify-end pt-2"><Button variant="outline" onClick={() => navigate("/capa")}>Cancelar</Button><Button className="gap-2" onClick={() => { void handleSave(); }}><Save className="w-4 h-4" /> Salvar</Button></div></div>
  );
};

export default NovaCAPAPage;


