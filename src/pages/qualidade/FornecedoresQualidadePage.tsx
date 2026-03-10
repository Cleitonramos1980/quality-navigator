import { useEffect, useMemo, useState } from "react";
import { Building2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import SectionCard from "@/components/forms/SectionCard";
import FormField from "@/components/forms/FormField";
import {
  createFornecedorQualidade,
  createScarFornecedor,
  listFornecedoresQualidade,
  listScarsFornecedor,
} from "@/services/governancaQualidade";
import type { FornecedorQualidade, ScarFornecedor } from "@/types/sgq";

const fornecedorInicial = {
  codigo: "",
  nome: "",
  categoria: "",
  status: "HOMOLOGADO",
  score: "80",
  ultimaAvaliacaoAt: "",
  responsavel: "",
};

const scarInicial = {
  titulo: "",
  descricao: "",
  status: "ABERTA",
  gravidade: "MEDIA",
  responsavel: "",
  prazo: "",
  dataAbertura: "",
  dataFechamento: "",
  acaoCorretiva: "",
};

const FornecedoresQualidadePage = () => {
  const { toast } = useToast();
  const [fornecedores, setFornecedores] = useState<FornecedorQualidade[]>([]);
  const [scars, setScars] = useState<ScarFornecedor[]>([]);
  const [fornecedorIdSelecionado, setFornecedorIdSelecionado] = useState("");
  const [formFornecedor, setFormFornecedor] = useState(fornecedorInicial);
  const [formScar, setFormScar] = useState(scarInicial);

  const fornecedorAtual = useMemo(
    () => fornecedores.find((f) => f.id === fornecedorIdSelecionado),
    [fornecedores, fornecedorIdSelecionado],
  );

  const loadFornecedores = async () => {
    const data = await listFornecedoresQualidade();
    setFornecedores(data);
    if (!fornecedorIdSelecionado && data.length) {
      setFornecedorIdSelecionado(data[0].id);
    }
  };

  const loadScars = async (fornecedorId?: string) => {
    if (!fornecedorId) {
      setScars([]);
      return;
    }
    setScars(await listScarsFornecedor(fornecedorId));
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
        await loadScars(fornecedorIdSelecionado);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Falha ao carregar SCAR.";
        toast({ title: "Erro", description: message, variant: "destructive" });
      }
    })();
  }, [fornecedorIdSelecionado]);

  const updateFornecedor = (key: keyof typeof formFornecedor, value: string) => {
    setFormFornecedor((prev) => ({ ...prev, [key]: value }));
  };

  const updateScar = (key: keyof typeof formScar, value: string) => {
    setFormScar((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreateFornecedor = async () => {
    if (!formFornecedor.codigo.trim() || !formFornecedor.nome.trim() || !formFornecedor.categoria.trim()) {
      toast({ title: "Campos obrigatorios", description: "Informe codigo, nome e categoria.", variant: "destructive" });
      return;
    }
    try {
      const created = await createFornecedorQualidade({
        ...formFornecedor,
        score: Number(formFornecedor.score || "0"),
        ultimaAvaliacaoAt: formFornecedor.ultimaAvaliacaoAt || undefined,
        responsavel: formFornecedor.responsavel || undefined,
      });
      setFornecedores((prev) => [created, ...prev]);
      setFornecedorIdSelecionado(created.id);
      setFormFornecedor(fornecedorInicial);
      toast({ title: "Fornecedor criado", description: `${created.nome} cadastrado.` });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao criar fornecedor.";
      toast({ title: "Erro ao salvar", description: message, variant: "destructive" });
    }
  };

  const handleCreateScar = async () => {
    if (!fornecedorIdSelecionado) {
      toast({ title: "Selecione um fornecedor", variant: "destructive" });
      return;
    }
    if (!formScar.titulo.trim() || !formScar.descricao.trim() || !formScar.responsavel.trim() || !formScar.prazo.trim()) {
      toast({ title: "Campos obrigatorios", description: "Preencha titulo, descricao, responsavel e prazo.", variant: "destructive" });
      return;
    }
    try {
      const created = await createScarFornecedor({
        ...formScar,
        fornecedorId: fornecedorIdSelecionado,
        dataAbertura: formScar.dataAbertura || new Date().toISOString().slice(0, 10),
        dataFechamento: formScar.dataFechamento || undefined,
        acaoCorretiva: formScar.acaoCorretiva || undefined,
      });
      setScars((prev) => [created, ...prev]);
      setFormScar(scarInicial);
      toast({ title: "SCAR registrada", description: `${created.id} criada para ${fornecedorAtual?.nome || "fornecedor"}.` });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao abrir SCAR.";
      toast({ title: "Erro ao salvar", description: message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Building2 className="w-6 h-6 text-primary" />
          Qualidade de Fornecedores
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Homologacao de fornecedores, monitoramento de score e SCAR.
        </p>
      </div>

      <SectionCard title="Novo Fornecedor" description="Cadastro base para avaliacao de qualidade">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FormField label="Codigo" required>
            <Input value={formFornecedor.codigo} onChange={(e) => updateFornecedor("codigo", e.target.value)} />
          </FormField>
          <FormField label="Nome" required>
            <Input value={formFornecedor.nome} onChange={(e) => updateFornecedor("nome", e.target.value)} />
          </FormField>
          <FormField label="Categoria" required>
            <Input value={formFornecedor.categoria} onChange={(e) => updateFornecedor("categoria", e.target.value)} />
          </FormField>
          <FormField label="Status">
            <Input value={formFornecedor.status} onChange={(e) => updateFornecedor("status", e.target.value)} />
          </FormField>
          <FormField label="Score">
            <Input value={formFornecedor.score} onChange={(e) => updateFornecedor("score", e.target.value)} />
          </FormField>
          <FormField label="Ultima Avaliacao">
            <Input type="date" value={formFornecedor.ultimaAvaliacaoAt} onChange={(e) => updateFornecedor("ultimaAvaliacaoAt", e.target.value)} />
          </FormField>
          <FormField label="Responsavel">
            <Input value={formFornecedor.responsavel} onChange={(e) => updateFornecedor("responsavel", e.target.value)} />
          </FormField>
        </div>
        <div className="flex justify-end mt-3">
          <Button onClick={() => void handleCreateFornecedor()}>Cadastrar Fornecedor</Button>
        </div>
      </SectionCard>

      <SectionCard title="Fornecedores Cadastrados" description={`${fornecedores.length} registro(s)`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-3 py-2">Codigo</th>
                <th className="text-left px-3 py-2">Nome</th>
                <th className="text-left px-3 py-2">Categoria</th>
                <th className="text-left px-3 py-2">Status</th>
                <th className="text-left px-3 py-2">Score</th>
                <th className="text-left px-3 py-2">Ult. Avaliacao</th>
              </tr>
            </thead>
            <tbody>
              {fornecedores.map((f) => (
                <tr
                  key={f.id}
                  className={`border-b border-border/60 cursor-pointer ${fornecedorIdSelecionado === f.id ? "bg-primary/10" : ""}`}
                  onClick={() => setFornecedorIdSelecionado(f.id)}
                >
                  <td className="px-3 py-2">{f.codigo}</td>
                  <td className="px-3 py-2">{f.nome}</td>
                  <td className="px-3 py-2">{f.categoria}</td>
                  <td className="px-3 py-2">{f.status}</td>
                  <td className="px-3 py-2">{f.score}</td>
                  <td className="px-3 py-2">{f.ultimaAvaliacaoAt || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard
        title="SCAR (Supplier Corrective Action Request)"
        description={fornecedorAtual ? `Fornecedor selecionado: ${fornecedorAtual.nome}` : "Selecione um fornecedor"}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FormField label="Titulo" required>
            <Input value={formScar.titulo} onChange={(e) => updateScar("titulo", e.target.value)} />
          </FormField>
          <FormField label="Status">
            <Input value={formScar.status} onChange={(e) => updateScar("status", e.target.value)} />
          </FormField>
          <FormField label="Gravidade">
            <Input value={formScar.gravidade} onChange={(e) => updateScar("gravidade", e.target.value)} />
          </FormField>
          <FormField label="Responsavel" required>
            <Input value={formScar.responsavel} onChange={(e) => updateScar("responsavel", e.target.value)} />
          </FormField>
          <FormField label="Prazo" required>
            <Input type="date" value={formScar.prazo} onChange={(e) => updateScar("prazo", e.target.value)} />
          </FormField>
          <FormField label="Data Abertura">
            <Input type="date" value={formScar.dataAbertura} onChange={(e) => updateScar("dataAbertura", e.target.value)} />
          </FormField>
          <FormField label="Data Fechamento">
            <Input type="date" value={formScar.dataFechamento} onChange={(e) => updateScar("dataFechamento", e.target.value)} />
          </FormField>
        </div>
        <FormField label="Descricao" required>
          <Textarea value={formScar.descricao} onChange={(e) => updateScar("descricao", e.target.value)} rows={3} />
        </FormField>
        <FormField label="Acao Corretiva">
          <Textarea value={formScar.acaoCorretiva} onChange={(e) => updateScar("acaoCorretiva", e.target.value)} rows={2} />
        </FormField>
        <div className="flex justify-end mt-3">
          <Button className="gap-2" onClick={() => void handleCreateScar()}>
            <ShieldAlert className="w-4 h-4" />
            Abrir SCAR
          </Button>
        </div>
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-3 py-2">ID</th>
                <th className="text-left px-3 py-2">Titulo</th>
                <th className="text-left px-3 py-2">Status</th>
                <th className="text-left px-3 py-2">Gravidade</th>
                <th className="text-left px-3 py-2">Responsavel</th>
                <th className="text-left px-3 py-2">Prazo</th>
              </tr>
            </thead>
            <tbody>
              {scars.map((s) => (
                <tr key={s.id} className="border-b border-border/60">
                  <td className="px-3 py-2">{s.id}</td>
                  <td className="px-3 py-2">{s.titulo}</td>
                  <td className="px-3 py-2">{s.status}</td>
                  <td className="px-3 py-2">{s.gravidade}</td>
                  <td className="px-3 py-2">{s.responsavel}</td>
                  <td className="px-3 py-2">{s.prazo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
};

export default FornecedoresQualidadePage;
