import { useEffect, useMemo, useState } from "react";
import { Factory, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import SectionCard from "@/components/forms/SectionCard";
import FormField from "@/components/forms/FormField";
import {
  createGateFornecedor,
  listFornecedoresQualidade,
  listGatesFornecedores,
} from "@/services/governancaQualidade";
import type { FornecedorQualidade, GateFornecedor } from "@/types/sgq";

const gateInicial = {
  coreTool: "APQP",
  status: "PENDENTE",
  evidencia: "",
  validadoPor: "",
  validadoAt: "",
  observacoes: "",
};

const CoreToolsFornecedoresPage = () => {
  const { toast } = useToast();
  const [fornecedores, setFornecedores] = useState<FornecedorQualidade[]>([]);
  const [gates, setGates] = useState<GateFornecedor[]>([]);
  const [fornecedorIdSelecionado, setFornecedorIdSelecionado] = useState("");
  const [form, setForm] = useState(gateInicial);

  const fornecedorAtual = useMemo(
    () => fornecedores.find((item) => item.id === fornecedorIdSelecionado),
    [fornecedores, fornecedorIdSelecionado],
  );

  const loadFornecedores = async () => {
    const data = await listFornecedoresQualidade();
    setFornecedores(data);
    if (!fornecedorIdSelecionado && data.length) {
      setFornecedorIdSelecionado(data[0].id);
    }
  };

  const loadGates = async (fornecedorId?: string) => {
    if (!fornecedorId) {
      setGates([]);
      return;
    }
    setGates(await listGatesFornecedores(fornecedorId));
  };

  useEffect(() => {
    void (async () => {
      try {
        await loadFornecedores();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Falha ao carregar fornecedores.";
        toast({ title: "Erro", description: message, variant: "destructive" });
      }
    })();
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        await loadGates(fornecedorIdSelecionado);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Falha ao carregar gates de fornecedores.";
        toast({ title: "Erro", description: message, variant: "destructive" });
      }
    })();
  }, [fornecedorIdSelecionado]);

  const update = (key: keyof typeof gateInicial, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreate = async () => {
    if (!fornecedorIdSelecionado) {
      toast({ title: "Selecione um fornecedor", variant: "destructive" });
      return;
    }

    try {
      const created = await createGateFornecedor({
        fornecedorId: fornecedorIdSelecionado,
        coreTool: form.coreTool,
        status: form.status,
        evidencia: form.evidencia || undefined,
        validadoPor: form.validadoPor || undefined,
        validadoAt: form.validadoAt || undefined,
        observacoes: form.observacoes || undefined,
      });
      setGates((prev) => [created, ...prev]);
      setForm(gateInicial);
      toast({ title: "Gate registrado", description: `${created.coreTool} vinculado ao fornecedor.` });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao salvar gate.";
      toast({ title: "Erro ao salvar", description: message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Factory className="w-6 h-6 text-primary" />
          Gates de Fornecedores (APQP, PPAP, FMEA, MSA, SPC)
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Controle de aprovacao dos core tools por fornecedor, sem duplicar SCAR.
        </p>
      </div>

      <SectionCard title="Fornecedores" description={`${fornecedores.length} registro(s)`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-3 py-2">Codigo</th>
                <th className="text-left px-3 py-2">Nome</th>
                <th className="text-left px-3 py-2">Categoria</th>
                <th className="text-left px-3 py-2">Score</th>
              </tr>
            </thead>
            <tbody>
              {fornecedores.map((item) => (
                <tr
                  key={item.id}
                  className={`border-b border-border/60 cursor-pointer ${fornecedorIdSelecionado === item.id ? "bg-primary/10" : ""}`}
                  onClick={() => setFornecedorIdSelecionado(item.id)}
                >
                  <td className="px-3 py-2">{item.codigo}</td>
                  <td className="px-3 py-2">{item.nome}</td>
                  <td className="px-3 py-2">{item.categoria}</td>
                  <td className="px-3 py-2">{item.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard
        title="Novo Gate Core Tool"
        description={fornecedorAtual ? `Fornecedor selecionado: ${fornecedorAtual.nome}` : "Selecione um fornecedor"}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FormField label="Core Tool">
            <Input value={form.coreTool} onChange={(e) => update("coreTool", e.target.value.toUpperCase())} />
          </FormField>
          <FormField label="Status">
            <Input value={form.status} onChange={(e) => update("status", e.target.value.toUpperCase())} />
          </FormField>
          <FormField label="Validado por">
            <Input value={form.validadoPor} onChange={(e) => update("validadoPor", e.target.value)} />
          </FormField>
          <FormField label="Data Validacao">
            <Input type="date" value={form.validadoAt} onChange={(e) => update("validadoAt", e.target.value)} />
          </FormField>
        </div>
        <FormField label="Evidencia">
          <Textarea value={form.evidencia} onChange={(e) => update("evidencia", e.target.value)} rows={2} />
        </FormField>
        <FormField label="Observacoes">
          <Textarea value={form.observacoes} onChange={(e) => update("observacoes", e.target.value)} rows={2} />
        </FormField>
        <div className="flex justify-end mt-3">
          <Button className="gap-2" onClick={() => void handleCreate()}>
            <ShieldCheck className="w-4 h-4" />
            Salvar Gate
          </Button>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-3 py-2">Core Tool</th>
                <th className="text-left px-3 py-2">Status</th>
                <th className="text-left px-3 py-2">Validado por</th>
                <th className="text-left px-3 py-2">Data</th>
                <th className="text-left px-3 py-2">Evidencia</th>
              </tr>
            </thead>
            <tbody>
              {gates.map((item) => (
                <tr key={item.id} className="border-b border-border/60">
                  <td className="px-3 py-2">{item.coreTool}</td>
                  <td className="px-3 py-2">{item.status}</td>
                  <td className="px-3 py-2">{item.validadoPor || "-"}</td>
                  <td className="px-3 py-2">{item.validadoAt || "-"}</td>
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

export default CoreToolsFornecedoresPage;
