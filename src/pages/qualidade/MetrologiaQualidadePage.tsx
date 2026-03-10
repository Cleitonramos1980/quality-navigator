import { useEffect, useMemo, useState } from "react";
import { FlaskConical, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import SectionCard from "@/components/forms/SectionCard";
import FormField from "@/components/forms/FormField";
import {
  createEstudoMsa,
  createInstrumentoMetrologia,
  listEstudosMsa,
  listInstrumentosMetrologia,
} from "@/services/governancaQualidade";
import type { EstudoMsa, InstrumentoMetrologia } from "@/types/sgq";

const instrumentoInicial = {
  codigo: "",
  descricao: "",
  tipo: "",
  fabricante: "",
  numeroSerie: "",
  planta: "MAO",
  local: "",
  statusCalibracao: "CALIBRADO",
  ultimaCalibracaoAt: "",
  proximaCalibracaoAt: "",
  incerteza: "",
  responsavel: "",
};

const msaInicial = {
  caracteristica: "",
  metodo: "R&R cruzado",
  rrPercent: "",
  ndc: "",
  resultado: "APROVADO",
  estudadoAt: "",
  responsavel: "",
  observacoes: "",
};

const MetrologiaQualidadePage = () => {
  const { toast } = useToast();
  const [instrumentos, setInstrumentos] = useState<InstrumentoMetrologia[]>([]);
  const [estudosMsa, setEstudosMsa] = useState<EstudoMsa[]>([]);
  const [instrumentoIdSelecionado, setInstrumentoIdSelecionado] = useState("");
  const [formInstrumento, setFormInstrumento] = useState(instrumentoInicial);
  const [formMsa, setFormMsa] = useState(msaInicial);

  const instrumentoAtual = useMemo(
    () => instrumentos.find((item) => item.id === instrumentoIdSelecionado),
    [instrumentos, instrumentoIdSelecionado],
  );

  const loadInstrumentos = async () => {
    const data = await listInstrumentosMetrologia();
    setInstrumentos(data);
    if (!instrumentoIdSelecionado && data.length) {
      setInstrumentoIdSelecionado(data[0].id);
    }
  };

  const loadMsa = async (instrumentoId?: string) => {
    if (!instrumentoId) {
      setEstudosMsa([]);
      return;
    }
    setEstudosMsa(await listEstudosMsa(instrumentoId));
  };

  useEffect(() => {
    void (async () => {
      try {
        await loadInstrumentos();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Falha ao carregar instrumentos.";
        toast({ title: "Erro", description: message, variant: "destructive" });
      }
    })();
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        await loadMsa(instrumentoIdSelecionado);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Falha ao carregar MSA.";
        toast({ title: "Erro", description: message, variant: "destructive" });
      }
    })();
  }, [instrumentoIdSelecionado]);

  const updateInstrumento = (key: keyof typeof instrumentoInicial, value: string) => {
    setFormInstrumento((prev) => ({ ...prev, [key]: value }));
  };

  const updateMsa = (key: keyof typeof msaInicial, value: string) => {
    setFormMsa((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreateInstrumento = async () => {
    if (!formInstrumento.codigo.trim() || !formInstrumento.descricao.trim() || !formInstrumento.local.trim() || !formInstrumento.proximaCalibracaoAt.trim() || !formInstrumento.responsavel.trim()) {
      toast({
        title: "Campos obrigatorios",
        description: "Informe codigo, descricao, local, proxima calibracao e responsavel.",
        variant: "destructive",
      });
      return;
    }

    try {
      const created = await createInstrumentoMetrologia({
        ...formInstrumento,
        planta: formInstrumento.planta as "MAO" | "BEL" | "AGR",
        fabricante: formInstrumento.fabricante || undefined,
        numeroSerie: formInstrumento.numeroSerie || undefined,
        ultimaCalibracaoAt: formInstrumento.ultimaCalibracaoAt || undefined,
        incerteza: formInstrumento.incerteza ? Number(formInstrumento.incerteza) : undefined,
      });
      setInstrumentos((prev) => [created, ...prev]);
      setInstrumentoIdSelecionado(created.id);
      setFormInstrumento(instrumentoInicial);
      toast({ title: "Instrumento cadastrado", description: `${created.codigo} registrado com sucesso.` });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao salvar instrumento.";
      toast({ title: "Erro ao salvar", description: message, variant: "destructive" });
    }
  };

  const handleCreateMsa = async () => {
    if (!instrumentoIdSelecionado) {
      toast({ title: "Selecione um instrumento", variant: "destructive" });
      return;
    }
    if (!formMsa.caracteristica.trim() || !formMsa.rrPercent.trim() || !formMsa.ndc.trim() || !formMsa.estudadoAt.trim() || !formMsa.responsavel.trim()) {
      toast({
        title: "Campos obrigatorios",
        description: "Informe caracteristica, rrPercent, ndc, data do estudo e responsavel.",
        variant: "destructive",
      });
      return;
    }

    try {
      const created = await createEstudoMsa({
        instrumentoId: instrumentoIdSelecionado,
        caracteristica: formMsa.caracteristica,
        metodo: formMsa.metodo,
        rrPercent: Number(formMsa.rrPercent),
        ndc: Number(formMsa.ndc),
        resultado: formMsa.resultado,
        estudadoAt: formMsa.estudadoAt,
        responsavel: formMsa.responsavel,
        observacoes: formMsa.observacoes || undefined,
      });
      setEstudosMsa((prev) => [created, ...prev]);
      setFormMsa(msaInicial);
      toast({ title: "MSA registrada", description: `${created.id} vinculada ao instrumento.` });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao salvar estudo MSA.";
      toast({ title: "Erro ao salvar", description: message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Ruler className="w-6 h-6 text-primary" />
          Metrologia e MSA
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Controle de calibracao, incerteza de medicao e estudos MSA por instrumento.
        </p>
      </div>

      <SectionCard title="Novo Instrumento" description="Cadastro de ativos de medicao">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FormField label="Codigo" required>
            <Input value={formInstrumento.codigo} onChange={(e) => updateInstrumento("codigo", e.target.value)} />
          </FormField>
          <FormField label="Descricao" required>
            <Input value={formInstrumento.descricao} onChange={(e) => updateInstrumento("descricao", e.target.value)} />
          </FormField>
          <FormField label="Tipo">
            <Input value={formInstrumento.tipo} onChange={(e) => updateInstrumento("tipo", e.target.value)} />
          </FormField>
          <FormField label="Planta">
            <Input value={formInstrumento.planta} onChange={(e) => updateInstrumento("planta", e.target.value)} />
          </FormField>
          <FormField label="Fabricante">
            <Input value={formInstrumento.fabricante} onChange={(e) => updateInstrumento("fabricante", e.target.value)} />
          </FormField>
          <FormField label="Numero de Serie">
            <Input value={formInstrumento.numeroSerie} onChange={(e) => updateInstrumento("numeroSerie", e.target.value)} />
          </FormField>
          <FormField label="Local" required>
            <Input value={formInstrumento.local} onChange={(e) => updateInstrumento("local", e.target.value)} />
          </FormField>
          <FormField label="Status Calibracao">
            <Input value={formInstrumento.statusCalibracao} onChange={(e) => updateInstrumento("statusCalibracao", e.target.value)} />
          </FormField>
          <FormField label="Ultima Calibracao">
            <Input type="date" value={formInstrumento.ultimaCalibracaoAt} onChange={(e) => updateInstrumento("ultimaCalibracaoAt", e.target.value)} />
          </FormField>
          <FormField label="Proxima Calibracao" required>
            <Input type="date" value={formInstrumento.proximaCalibracaoAt} onChange={(e) => updateInstrumento("proximaCalibracaoAt", e.target.value)} />
          </FormField>
          <FormField label="Incerteza">
            <Input value={formInstrumento.incerteza} onChange={(e) => updateInstrumento("incerteza", e.target.value)} />
          </FormField>
          <FormField label="Responsavel" required>
            <Input value={formInstrumento.responsavel} onChange={(e) => updateInstrumento("responsavel", e.target.value)} />
          </FormField>
        </div>
        <div className="flex justify-end mt-3">
          <Button onClick={() => void handleCreateInstrumento()}>Salvar Instrumento</Button>
        </div>
      </SectionCard>

      <SectionCard title="Instrumentos Cadastrados" description={`${instrumentos.length} registro(s)`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-3 py-2">Codigo</th>
                <th className="text-left px-3 py-2">Descricao</th>
                <th className="text-left px-3 py-2">Planta</th>
                <th className="text-left px-3 py-2">Status</th>
                <th className="text-left px-3 py-2">Proxima Calibracao</th>
              </tr>
            </thead>
            <tbody>
              {instrumentos.map((item) => (
                <tr
                  key={item.id}
                  className={`border-b border-border/60 cursor-pointer ${instrumentoIdSelecionado === item.id ? "bg-primary/10" : ""}`}
                  onClick={() => setInstrumentoIdSelecionado(item.id)}
                >
                  <td className="px-3 py-2">{item.codigo}</td>
                  <td className="px-3 py-2">{item.descricao}</td>
                  <td className="px-3 py-2">{item.planta}</td>
                  <td className="px-3 py-2">{item.statusCalibracao}</td>
                  <td className="px-3 py-2">{item.proximaCalibracaoAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard
        title="Estudos MSA"
        description={instrumentoAtual ? `Instrumento selecionado: ${instrumentoAtual.codigo}` : "Selecione um instrumento"}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FormField label="Caracteristica" required>
            <Input value={formMsa.caracteristica} onChange={(e) => updateMsa("caracteristica", e.target.value)} />
          </FormField>
          <FormField label="Metodo">
            <Input value={formMsa.metodo} onChange={(e) => updateMsa("metodo", e.target.value)} />
          </FormField>
          <FormField label="R&R (%)" required>
            <Input value={formMsa.rrPercent} onChange={(e) => updateMsa("rrPercent", e.target.value)} />
          </FormField>
          <FormField label="NDC" required>
            <Input value={formMsa.ndc} onChange={(e) => updateMsa("ndc", e.target.value)} />
          </FormField>
          <FormField label="Resultado">
            <Input value={formMsa.resultado} onChange={(e) => updateMsa("resultado", e.target.value)} />
          </FormField>
          <FormField label="Data do Estudo" required>
            <Input type="date" value={formMsa.estudadoAt} onChange={(e) => updateMsa("estudadoAt", e.target.value)} />
          </FormField>
          <FormField label="Responsavel" required>
            <Input value={formMsa.responsavel} onChange={(e) => updateMsa("responsavel", e.target.value)} />
          </FormField>
        </div>
        <FormField label="Observacoes">
          <Textarea value={formMsa.observacoes} onChange={(e) => updateMsa("observacoes", e.target.value)} rows={2} />
        </FormField>
        <div className="flex justify-end mt-3">
          <Button className="gap-2" onClick={() => void handleCreateMsa()}>
            <FlaskConical className="w-4 h-4" />
            Salvar MSA
          </Button>
        </div>
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-3 py-2">ID</th>
                <th className="text-left px-3 py-2">Caracteristica</th>
                <th className="text-left px-3 py-2">R&R</th>
                <th className="text-left px-3 py-2">NDC</th>
                <th className="text-left px-3 py-2">Resultado</th>
                <th className="text-left px-3 py-2">Data</th>
              </tr>
            </thead>
            <tbody>
              {estudosMsa.map((item) => (
                <tr key={item.id} className="border-b border-border/60">
                  <td className="px-3 py-2">{item.id}</td>
                  <td className="px-3 py-2">{item.caracteristica}</td>
                  <td className="px-3 py-2">{item.rrPercent}%</td>
                  <td className="px-3 py-2">{item.ndc}</td>
                  <td className="px-3 py-2">{item.resultado}</td>
                  <td className="px-3 py-2">{item.estudadoAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
};

export default MetrologiaQualidadePage;
