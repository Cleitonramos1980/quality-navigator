import { useEffect, useMemo, useState } from "react";
import { GraduationCap, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import SectionCard from "@/components/forms/SectionCard";
import FormField from "@/components/forms/FormField";
import {
  addTreinamentoParticipante,
  createTreinamentoQualidade,
  listTreinamentoParticipantes,
  listTreinamentosQualidade,
} from "@/services/governancaQualidade";
import type { TreinamentoParticipante, TreinamentoQualidade } from "@/types/sgq";

const treinamentoInicial = {
  titulo: "",
  tipo: "QUALIDADE",
  cargoAlvo: "",
  instrutor: "",
  cargaHoraria: "8",
  status: "PLANEJADO",
  dataPlanejada: "",
  dataRealizacao: "",
  validadeMeses: "12",
  observacoes: "",
};

const participanteInicial = {
  colaborador: "",
  cargo: "",
  resultado: "APTO",
  status: "PENDENTE",
  concluidoAt: "",
};

const TreinamentosQualidadePage = () => {
  const { toast } = useToast();
  const [treinamentos, setTreinamentos] = useState<TreinamentoQualidade[]>([]);
  const [participantes, setParticipantes] = useState<TreinamentoParticipante[]>([]);
  const [treinamentoIdSelecionado, setTreinamentoIdSelecionado] = useState("");
  const [formTreinamento, setFormTreinamento] = useState(treinamentoInicial);
  const [formParticipante, setFormParticipante] = useState(participanteInicial);

  const treinamentoAtual = useMemo(
    () => treinamentos.find((t) => t.id === treinamentoIdSelecionado),
    [treinamentos, treinamentoIdSelecionado],
  );

  const loadTreinamentos = async () => {
    const data = await listTreinamentosQualidade();
    setTreinamentos(data);
    if (!treinamentoIdSelecionado && data.length) {
      setTreinamentoIdSelecionado(data[0].id);
    }
  };

  const loadParticipantes = async (treinamentoId?: string) => {
    if (!treinamentoId) {
      setParticipantes([]);
      return;
    }
    setParticipantes(await listTreinamentoParticipantes(treinamentoId));
  };

  useEffect(() => {
    void (async () => {
      try {
        await loadTreinamentos();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Falha ao carregar treinamentos.";
        toast({ title: "Erro", description: message, variant: "destructive" });
      }
    })();
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        await loadParticipantes(treinamentoIdSelecionado);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Falha ao carregar participantes.";
        toast({ title: "Erro", description: message, variant: "destructive" });
      }
    })();
  }, [treinamentoIdSelecionado]);

  const updateTreinamento = (key: keyof typeof formTreinamento, value: string) => {
    setFormTreinamento((prev) => ({ ...prev, [key]: value }));
  };

  const updateParticipante = (key: keyof typeof formParticipante, value: string) => {
    setFormParticipante((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreateTreinamento = async () => {
    if (!formTreinamento.titulo.trim() || !formTreinamento.cargoAlvo.trim() || !formTreinamento.instrutor.trim()) {
      toast({ title: "Campos obrigatorios", description: "Informe titulo, cargo alvo e instrutor.", variant: "destructive" });
      return;
    }
    try {
      const created = await createTreinamentoQualidade({
        ...formTreinamento,
        cargaHoraria: Number(formTreinamento.cargaHoraria || "0"),
        validadeMeses: Number(formTreinamento.validadeMeses || "0") || undefined,
        dataRealizacao: formTreinamento.dataRealizacao || undefined,
        observacoes: formTreinamento.observacoes || undefined,
      });
      setTreinamentos((prev) => [created, ...prev]);
      setTreinamentoIdSelecionado(created.id);
      setFormTreinamento(treinamentoInicial);
      toast({ title: "Treinamento criado", description: `${created.titulo} registrado.` });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao criar treinamento.";
      toast({ title: "Erro ao salvar", description: message, variant: "destructive" });
    }
  };

  const handleAddParticipante = async () => {
    if (!treinamentoIdSelecionado) {
      toast({ title: "Selecione um treinamento", variant: "destructive" });
      return;
    }
    if (!formParticipante.colaborador.trim() || !formParticipante.cargo.trim()) {
      toast({ title: "Campos obrigatorios", description: "Informe colaborador e cargo.", variant: "destructive" });
      return;
    }
    try {
      const created = await addTreinamentoParticipante({
        treinamentoId: treinamentoIdSelecionado,
        ...formParticipante,
        concluidoAt: formParticipante.concluidoAt || undefined,
      });
      setParticipantes((prev) => [created, ...prev]);
      setFormParticipante(participanteInicial);
      toast({ title: "Participante adicionado", description: `${created.colaborador} vinculado.` });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao adicionar participante.";
      toast({ title: "Erro ao salvar", description: message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-primary" />
          Treinamentos e Competencias
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Planejamento de treinamentos, matriz de participacao e status de conclusao.
        </p>
      </div>

      <SectionCard title="Novo Treinamento" description="Registro do plano de treinamento">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormField label="Titulo" required>
            <Input value={formTreinamento.titulo} onChange={(e) => updateTreinamento("titulo", e.target.value)} />
          </FormField>
          <FormField label="Tipo">
            <Input value={formTreinamento.tipo} onChange={(e) => updateTreinamento("tipo", e.target.value)} />
          </FormField>
          <FormField label="Cargo Alvo" required>
            <Input value={formTreinamento.cargoAlvo} onChange={(e) => updateTreinamento("cargoAlvo", e.target.value)} />
          </FormField>
          <FormField label="Instrutor" required>
            <Input value={formTreinamento.instrutor} onChange={(e) => updateTreinamento("instrutor", e.target.value)} />
          </FormField>
          <FormField label="Carga Horaria (h)">
            <Input value={formTreinamento.cargaHoraria} onChange={(e) => updateTreinamento("cargaHoraria", e.target.value)} />
          </FormField>
          <FormField label="Status">
            <Input value={formTreinamento.status} onChange={(e) => updateTreinamento("status", e.target.value)} />
          </FormField>
          <FormField label="Data Planejada">
            <Input type="date" value={formTreinamento.dataPlanejada} onChange={(e) => updateTreinamento("dataPlanejada", e.target.value)} />
          </FormField>
          <FormField label="Data Realizacao">
            <Input type="date" value={formTreinamento.dataRealizacao} onChange={(e) => updateTreinamento("dataRealizacao", e.target.value)} />
          </FormField>
          <FormField label="Validade (meses)">
            <Input value={formTreinamento.validadeMeses} onChange={(e) => updateTreinamento("validadeMeses", e.target.value)} />
          </FormField>
        </div>
        <div className="flex justify-end mt-3">
          <Button className="gap-2" onClick={() => void handleCreateTreinamento()}>
            <PlusCircle className="w-4 h-4" />
            Criar Treinamento
          </Button>
        </div>
      </SectionCard>

      <SectionCard title="Treinamentos Cadastrados" description={`${treinamentos.length} registro(s)`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-3 py-2">ID</th>
                <th className="text-left px-3 py-2">Titulo</th>
                <th className="text-left px-3 py-2">Cargo Alvo</th>
                <th className="text-left px-3 py-2">Status</th>
                <th className="text-left px-3 py-2">Data Planejada</th>
                <th className="text-left px-3 py-2">Instrutor</th>
              </tr>
            </thead>
            <tbody>
              {treinamentos.map((item) => (
                <tr
                  key={item.id}
                  className={`border-b border-border/60 cursor-pointer ${treinamentoIdSelecionado === item.id ? "bg-primary/10" : ""}`}
                  onClick={() => setTreinamentoIdSelecionado(item.id)}
                >
                  <td className="px-3 py-2">{item.id}</td>
                  <td className="px-3 py-2">{item.titulo}</td>
                  <td className="px-3 py-2">{item.cargoAlvo}</td>
                  <td className="px-3 py-2">{item.status}</td>
                  <td className="px-3 py-2">{item.dataPlanejada}</td>
                  <td className="px-3 py-2">{item.instrutor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard
        title="Participantes do Treinamento"
        description={treinamentoAtual ? `Treinamento selecionado: ${treinamentoAtual.titulo}` : "Selecione um treinamento"}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <FormField label="Colaborador" required>
            <Input value={formParticipante.colaborador} onChange={(e) => updateParticipante("colaborador", e.target.value)} />
          </FormField>
          <FormField label="Cargo" required>
            <Input value={formParticipante.cargo} onChange={(e) => updateParticipante("cargo", e.target.value)} />
          </FormField>
          <FormField label="Resultado">
            <Input value={formParticipante.resultado} onChange={(e) => updateParticipante("resultado", e.target.value)} />
          </FormField>
          <FormField label="Status">
            <Input value={formParticipante.status} onChange={(e) => updateParticipante("status", e.target.value)} />
          </FormField>
          <FormField label="Conclusao">
            <Input type="date" value={formParticipante.concluidoAt} onChange={(e) => updateParticipante("concluidoAt", e.target.value)} />
          </FormField>
        </div>
        <div className="flex justify-end mt-3">
          <Button className="gap-2" onClick={() => void handleAddParticipante()}>
            <PlusCircle className="w-4 h-4" />
            Adicionar Participante
          </Button>
        </div>
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-3 py-2">Colaborador</th>
                <th className="text-left px-3 py-2">Cargo</th>
                <th className="text-left px-3 py-2">Resultado</th>
                <th className="text-left px-3 py-2">Status</th>
                <th className="text-left px-3 py-2">Concluido em</th>
              </tr>
            </thead>
            <tbody>
              {participantes.map((p) => (
                <tr key={p.id} className="border-b border-border/60">
                  <td className="px-3 py-2">{p.colaborador}</td>
                  <td className="px-3 py-2">{p.cargo}</td>
                  <td className="px-3 py-2">{p.resultado}</td>
                  <td className="px-3 py-2">{p.status}</td>
                  <td className="px-3 py-2">{p.concluidoAt || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
};

export default TreinamentosQualidadePage;
