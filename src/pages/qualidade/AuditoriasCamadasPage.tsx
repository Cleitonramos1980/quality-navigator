import { useEffect, useState } from "react";
import { ClipboardList, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import SectionCard from "@/components/forms/SectionCard";
import FormField from "@/components/forms/FormField";
import { createAuditoriaCamada, listAuditoriasCamadas } from "@/services/governancaQualidade";
import type { AuditoriaCamada } from "@/types/sgq";

const formInicial = {
  camada: "L1",
  planta: "MAO",
  area: "",
  processo: "",
  auditor: "",
  frequencia: "DIARIA",
  status: "PLANEJADA",
  proximaExecucaoAt: "",
  ultimaExecucaoAt: "",
  score: "",
  achados: "",
};

const AuditoriasCamadasPage = () => {
  const { toast } = useToast();
  const [registros, setRegistros] = useState<AuditoriaCamada[]>([]);
  const [form, setForm] = useState(formInicial);

  const load = async () => {
    setRegistros(await listAuditoriasCamadas());
  };

  useEffect(() => {
    void (async () => {
      try {
        await load();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Falha ao carregar auditorias em camadas.";
        toast({ title: "Erro", description: message, variant: "destructive" });
      }
    })();
  }, []);

  const update = (key: keyof typeof formInicial, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreate = async () => {
    if (!form.area.trim() || !form.processo.trim() || !form.auditor.trim() || !form.proximaExecucaoAt.trim()) {
      toast({
        title: "Campos obrigatorios",
        description: "Informe area, processo, auditor e proxima execucao.",
        variant: "destructive",
      });
      return;
    }

    try {
      const created = await createAuditoriaCamada({
        camada: form.camada,
        planta: form.planta as "MAO" | "BEL" | "AGR",
        area: form.area,
        processo: form.processo,
        auditor: form.auditor,
        frequencia: form.frequencia,
        status: form.status,
        proximaExecucaoAt: form.proximaExecucaoAt,
        ultimaExecucaoAt: form.ultimaExecucaoAt || undefined,
        score: form.score ? Number(form.score) : undefined,
        achados: form.achados || undefined,
      });
      setRegistros((prev) => [created, ...prev]);
      setForm(formInicial);
      toast({ title: "Auditoria criada", description: `${created.id} registrada.` });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao registrar auditoria em camadas.";
      toast({ title: "Erro ao salvar", description: message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-primary" />
          Auditorias em Camadas (LPA)
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Programacao por camada e risco para disciplina operacional no chao de fabrica.
        </p>
      </div>

      <SectionCard title="Nova Auditoria em Camada" description="Cadastro de rotina L1/L2/L3/LPA">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FormField label="Camada">
            <Input value={form.camada} onChange={(e) => update("camada", e.target.value.toUpperCase())} />
          </FormField>
          <FormField label="Planta">
            <Input value={form.planta} onChange={(e) => update("planta", e.target.value.toUpperCase())} />
          </FormField>
          <FormField label="Area" required>
            <Input value={form.area} onChange={(e) => update("area", e.target.value)} />
          </FormField>
          <FormField label="Processo" required>
            <Input value={form.processo} onChange={(e) => update("processo", e.target.value)} />
          </FormField>
          <FormField label="Auditor" required>
            <Input value={form.auditor} onChange={(e) => update("auditor", e.target.value)} />
          </FormField>
          <FormField label="Frequencia">
            <Input value={form.frequencia} onChange={(e) => update("frequencia", e.target.value.toUpperCase())} />
          </FormField>
          <FormField label="Status">
            <Input value={form.status} onChange={(e) => update("status", e.target.value.toUpperCase())} />
          </FormField>
          <FormField label="Proxima Execucao" required>
            <Input type="date" value={form.proximaExecucaoAt} onChange={(e) => update("proximaExecucaoAt", e.target.value)} />
          </FormField>
          <FormField label="Ultima Execucao">
            <Input type="date" value={form.ultimaExecucaoAt} onChange={(e) => update("ultimaExecucaoAt", e.target.value)} />
          </FormField>
          <FormField label="Score">
            <Input value={form.score} onChange={(e) => update("score", e.target.value)} />
          </FormField>
        </div>
        <FormField label="Achados">
          <Textarea value={form.achados} onChange={(e) => update("achados", e.target.value)} rows={2} />
        </FormField>
        <div className="flex justify-end mt-3">
          <Button className="gap-2" onClick={() => void handleCreate()}>
            <PlusCircle className="w-4 h-4" />
            Salvar Auditoria em Camada
          </Button>
        </div>
      </SectionCard>

      <SectionCard title="Plano LPA" description={`${registros.length} registro(s)`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-3 py-2">Camada</th>
                <th className="text-left px-3 py-2">Planta</th>
                <th className="text-left px-3 py-2">Area</th>
                <th className="text-left px-3 py-2">Processo</th>
                <th className="text-left px-3 py-2">Auditor</th>
                <th className="text-left px-3 py-2">Frequencia</th>
                <th className="text-left px-3 py-2">Status</th>
                <th className="text-left px-3 py-2">Proxima</th>
                <th className="text-left px-3 py-2">Score</th>
              </tr>
            </thead>
            <tbody>
              {registros.map((item) => (
                <tr key={item.id} className="border-b border-border/60">
                  <td className="px-3 py-2">{item.camada}</td>
                  <td className="px-3 py-2">{item.planta}</td>
                  <td className="px-3 py-2">{item.area}</td>
                  <td className="px-3 py-2">{item.processo}</td>
                  <td className="px-3 py-2">{item.auditor}</td>
                  <td className="px-3 py-2">{item.frequencia}</td>
                  <td className="px-3 py-2">{item.status}</td>
                  <td className="px-3 py-2">{item.proximaExecucaoAt}</td>
                  <td className="px-3 py-2">{item.score ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
};

export default AuditoriasCamadasPage;
