import { useEffect, useState } from "react";
import { BadgeCheck, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import SectionCard from "@/components/forms/SectionCard";
import FormField from "@/components/forms/FormField";
import {
  createIsoReadiness,
  getIsoReadinessResumo,
  listIsoReadiness,
} from "@/services/governancaQualidade";
import type { IsoReadinessItem, IsoReadinessResumo } from "@/types/sgq";

const formInicial = {
  clausula: "",
  titulo: "",
  status: "EM_ANDAMENTO",
  responsavel: "",
  prazo: "",
  evidencia: "",
  ultimaRevisaoAt: "",
  risco: "MEDIO",
};

const resumoVazio: IsoReadinessResumo = {
  total: 0,
  atendidos: 0,
  pendentes: 0,
  riscoAlto: 0,
  percentualAtendimento: 0,
};

const IsoReadinessPage = () => {
  const { toast } = useToast();
  const [registros, setRegistros] = useState<IsoReadinessItem[]>([]);
  const [resumo, setResumo] = useState<IsoReadinessResumo>(resumoVazio);
  const [form, setForm] = useState(formInicial);

  const load = async () => {
    const [list, sum] = await Promise.all([listIsoReadiness(), getIsoReadinessResumo()]);
    setRegistros(list);
    setResumo(sum);
  };

  useEffect(() => {
    void (async () => {
      try {
        await load();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Falha ao carregar readiness ISO.";
        toast({ title: "Erro", description: message, variant: "destructive" });
      }
    })();
  }, []);

  const update = (key: keyof typeof formInicial, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreate = async () => {
    if (!form.clausula.trim() || !form.titulo.trim() || !form.responsavel.trim() || !form.prazo.trim()) {
      toast({
        title: "Campos obrigatorios",
        description: "Informe clausula, titulo, responsavel e prazo.",
        variant: "destructive",
      });
      return;
    }

    try {
      const created = await createIsoReadiness({
        clausula: form.clausula,
        titulo: form.titulo,
        status: form.status,
        responsavel: form.responsavel,
        prazo: form.prazo,
        evidencia: form.evidencia || undefined,
        ultimaRevisaoAt: form.ultimaRevisaoAt || undefined,
        risco: form.risco,
      });
      setRegistros((prev) => [created, ...prev]);
      setForm(formInicial);
      setResumo(await getIsoReadinessResumo());
      toast({ title: "Item ISO criado", description: `${created.clausula} adicionado ao readiness.` });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao salvar item ISO.";
      toast({ title: "Erro ao salvar", description: message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BadgeCheck className="w-6 h-6 text-primary" />
          Readiness ISO 9001
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Acompanhamento de clausulas, riscos e prazos para maturidade do sistema de gestao.
        </p>
      </div>

      <SectionCard title="Resumo de Readiness" description="Situacao consolidada">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-md border border-border p-3"><p className="text-xs text-muted-foreground">Total</p><p className="text-xl font-semibold">{resumo.total}</p></div>
          <div className="rounded-md border border-border p-3"><p className="text-xs text-muted-foreground">Atendidos</p><p className="text-xl font-semibold">{resumo.atendidos}</p></div>
          <div className="rounded-md border border-border p-3"><p className="text-xs text-muted-foreground">Pendentes</p><p className="text-xl font-semibold">{resumo.pendentes}</p></div>
          <div className="rounded-md border border-border p-3"><p className="text-xs text-muted-foreground">Risco Alto/Critico</p><p className="text-xl font-semibold">{resumo.riscoAlto}</p></div>
          <div className="rounded-md border border-border p-3"><p className="text-xs text-muted-foreground">% Atendimento</p><p className="text-xl font-semibold">{resumo.percentualAtendimento}%</p></div>
        </div>
      </SectionCard>

      <SectionCard title="Novo Item ISO" description="Cadastro de clausulas e plano de atendimento">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FormField label="Clausula" required>
            <Input value={form.clausula} onChange={(e) => update("clausula", e.target.value)} placeholder="Ex.: 6.1" />
          </FormField>
          <FormField label="Titulo" required>
            <Input value={form.titulo} onChange={(e) => update("titulo", e.target.value)} />
          </FormField>
          <FormField label="Status">
            <Input value={form.status} onChange={(e) => update("status", e.target.value.toUpperCase())} />
          </FormField>
          <FormField label="Responsavel" required>
            <Input value={form.responsavel} onChange={(e) => update("responsavel", e.target.value)} />
          </FormField>
          <FormField label="Prazo" required>
            <Input type="date" value={form.prazo} onChange={(e) => update("prazo", e.target.value)} />
          </FormField>
          <FormField label="Ultima Revisao">
            <Input type="date" value={form.ultimaRevisaoAt} onChange={(e) => update("ultimaRevisaoAt", e.target.value)} />
          </FormField>
          <FormField label="Risco">
            <Input value={form.risco} onChange={(e) => update("risco", e.target.value.toUpperCase())} />
          </FormField>
        </div>
        <FormField label="Evidencia">
          <Textarea value={form.evidencia} onChange={(e) => update("evidencia", e.target.value)} rows={2} />
        </FormField>
        <div className="flex justify-end mt-3">
          <Button className="gap-2" onClick={() => void handleCreate()}>
            <PlusCircle className="w-4 h-4" />
            Salvar Item ISO
          </Button>
        </div>
      </SectionCard>

      <SectionCard title="Itens de Readiness" description={`${registros.length} registro(s)`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-3 py-2">Clausula</th>
                <th className="text-left px-3 py-2">Titulo</th>
                <th className="text-left px-3 py-2">Status</th>
                <th className="text-left px-3 py-2">Responsavel</th>
                <th className="text-left px-3 py-2">Prazo</th>
                <th className="text-left px-3 py-2">Risco</th>
                <th className="text-left px-3 py-2">Evidencia</th>
              </tr>
            </thead>
            <tbody>
              {registros.map((item) => (
                <tr key={item.id} className="border-b border-border/60">
                  <td className="px-3 py-2">{item.clausula}</td>
                  <td className="px-3 py-2">{item.titulo}</td>
                  <td className="px-3 py-2">{item.status}</td>
                  <td className="px-3 py-2">{item.responsavel}</td>
                  <td className="px-3 py-2">{item.prazo}</td>
                  <td className="px-3 py-2">{item.risco}</td>
                  <td className="px-3 py-2">{item.evidencia || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
};

export default IsoReadinessPage;
