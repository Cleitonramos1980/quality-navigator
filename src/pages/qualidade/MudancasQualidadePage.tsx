import { useEffect, useState } from "react";
import { ArrowRightLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import SectionCard from "@/components/forms/SectionCard";
import FormField from "@/components/forms/FormField";
import { createMudancaQualidade, listMudancasQualidade } from "@/services/governancaQualidade";
import type { MudancaQualidade } from "@/types/sgq";

const formInicial = {
  titulo: "",
  descricao: "",
  tipo: "PROCESSO",
  area: "",
  solicitante: "",
  risco: "MEDIO",
  status: "EM_ANALISE",
  dataSolicitacao: "",
  dataImplementacao: "",
  aprovador: "",
  planoValidacao: "",
};

const MudancasQualidadePage = () => {
  const { toast } = useToast();
  const [mudancas, setMudancas] = useState<MudancaQualidade[]>([]);
  const [form, setForm] = useState(formInicial);

  useEffect(() => {
    void (async () => {
      try {
        setMudancas(await listMudancasQualidade());
      } catch (error) {
        const message = error instanceof Error ? error.message : "Falha ao carregar mudancas.";
        toast({ title: "Erro", description: message, variant: "destructive" });
      }
    })();
  }, []);

  const update = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreate = async () => {
    if (!form.titulo.trim() || !form.descricao.trim() || !form.area.trim() || !form.solicitante.trim()) {
      toast({
        title: "Campos obrigatorios",
        description: "Informe titulo, descricao, area e solicitante.",
        variant: "destructive",
      });
      return;
    }
    try {
      const created = await createMudancaQualidade({
        ...form,
        dataSolicitacao: form.dataSolicitacao || new Date().toISOString().slice(0, 10),
        dataImplementacao: form.dataImplementacao || undefined,
        aprovador: form.aprovador || undefined,
        planoValidacao: form.planoValidacao || undefined,
      });
      setMudancas((prev) => [created, ...prev]);
      setForm(formInicial);
      toast({ title: "Mudanca registrada", description: `${created.id} criada com sucesso.` });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao registrar mudanca.";
      toast({ title: "Erro ao salvar", description: message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ArrowRightLeft className="w-6 h-6 text-primary" />
          Gestao de Mudancas
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Controle de mudancas de processo/produto com classificacao de risco.
        </p>
      </div>

      <SectionCard title="Nova Solicitacao de Mudanca" description="Registro de MOC com plano de validacao">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormField label="Titulo" required>
            <Input value={form.titulo} onChange={(e) => update("titulo", e.target.value)} />
          </FormField>
          <FormField label="Tipo">
            <Input value={form.tipo} onChange={(e) => update("tipo", e.target.value)} />
          </FormField>
          <FormField label="Area" required>
            <Input value={form.area} onChange={(e) => update("area", e.target.value)} />
          </FormField>
          <FormField label="Solicitante" required>
            <Input value={form.solicitante} onChange={(e) => update("solicitante", e.target.value)} />
          </FormField>
          <FormField label="Risco">
            <Input value={form.risco} onChange={(e) => update("risco", e.target.value)} />
          </FormField>
          <FormField label="Status">
            <Input value={form.status} onChange={(e) => update("status", e.target.value)} />
          </FormField>
          <FormField label="Data Solicitacao">
            <Input type="date" value={form.dataSolicitacao} onChange={(e) => update("dataSolicitacao", e.target.value)} />
          </FormField>
          <FormField label="Data Implementacao">
            <Input type="date" value={form.dataImplementacao} onChange={(e) => update("dataImplementacao", e.target.value)} />
          </FormField>
          <FormField label="Aprovador">
            <Input value={form.aprovador} onChange={(e) => update("aprovador", e.target.value)} />
          </FormField>
        </div>
        <FormField label="Descricao" required>
          <Textarea value={form.descricao} onChange={(e) => update("descricao", e.target.value)} rows={3} />
        </FormField>
        <FormField label="Plano de Validacao">
          <Textarea value={form.planoValidacao} onChange={(e) => update("planoValidacao", e.target.value)} rows={2} />
        </FormField>
        <div className="flex justify-end mt-3">
          <Button className="gap-2" onClick={() => void handleCreate()}>
            <Save className="w-4 h-4" />
            Salvar Mudanca
          </Button>
        </div>
      </SectionCard>

      <SectionCard title="Mudancas Registradas" description={`${mudancas.length} registro(s)`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-3 py-2">ID</th>
                <th className="text-left px-3 py-2">Titulo</th>
                <th className="text-left px-3 py-2">Tipo</th>
                <th className="text-left px-3 py-2">Area</th>
                <th className="text-left px-3 py-2">Risco</th>
                <th className="text-left px-3 py-2">Status</th>
                <th className="text-left px-3 py-2">Solicitante</th>
                <th className="text-left px-3 py-2">Data</th>
              </tr>
            </thead>
            <tbody>
              {mudancas.map((item) => (
                <tr key={item.id} className="border-b border-border/60">
                  <td className="px-3 py-2">{item.id}</td>
                  <td className="px-3 py-2">{item.titulo}</td>
                  <td className="px-3 py-2">{item.tipo}</td>
                  <td className="px-3 py-2">{item.area}</td>
                  <td className="px-3 py-2">{item.risco}</td>
                  <td className="px-3 py-2">{item.status}</td>
                  <td className="px-3 py-2">{item.solicitante}</td>
                  <td className="px-3 py-2">{item.dataSolicitacao}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
};

export default MudancasQualidadePage;
