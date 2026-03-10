import { useEffect, useState } from "react";
import { ShieldAlert, TimerReset } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import SectionCard from "@/components/forms/SectionCard";
import FormField from "@/components/forms/FormField";
import {
  createAvaliacaoRiscoSla,
  createRegraRiscoSla,
  listAvaliacoesRiscoSla,
  listRegrasRiscoSla,
} from "@/services/governancaQualidade";
import type { AvaliacaoRiscoSla, RegraRiscoSla } from "@/types/sgq";

const regraInicial = {
  origemTipo: "SAC",
  criticidade: "MEDIA",
  pontuacaoMin: "",
  pontuacaoMax: "",
  slaHoras: "",
  resposta: "",
};

const avaliacaoInicial = {
  origemTipo: "SAC",
  origemId: "",
  criticidade: "MEDIA",
  impacto: "",
  recorrencia: "",
  detectabilidade: "",
  justificativa: "",
};

const RiscoSlaQualidadePage = () => {
  const { toast } = useToast();
  const [origemFiltro, setOrigemFiltro] = useState("");
  const [regras, setRegras] = useState<RegraRiscoSla[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoRiscoSla[]>([]);
  const [formRegra, setFormRegra] = useState(regraInicial);
  const [formAvaliacao, setFormAvaliacao] = useState(avaliacaoInicial);

  const load = async (origemTipo?: string) => {
    const [regrasData, avaliacoesData] = await Promise.all([
      listRegrasRiscoSla(origemTipo),
      listAvaliacoesRiscoSla(origemTipo),
    ]);
    setRegras(regrasData);
    setAvaliacoes(avaliacoesData);
  };

  useEffect(() => {
    void (async () => {
      try {
        await load();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Falha ao carregar risco/SLA.";
        toast({ title: "Erro", description: message, variant: "destructive" });
      }
    })();
  }, []);

  const updateRegra = (key: keyof typeof regraInicial, value: string) => {
    setFormRegra((prev) => ({ ...prev, [key]: value }));
  };

  const updateAvaliacao = (key: keyof typeof avaliacaoInicial, value: string) => {
    setFormAvaliacao((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreateRegra = async () => {
    if (!formRegra.pontuacaoMin || !formRegra.pontuacaoMax || !formRegra.slaHoras || !formRegra.resposta.trim()) {
      toast({
        title: "Campos obrigatorios",
        description: "Preencha pontuacao minima/maxima, SLA em horas e resposta.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createRegraRiscoSla({
        origemTipo: formRegra.origemTipo,
        criticidade: formRegra.criticidade,
        pontuacaoMin: Number(formRegra.pontuacaoMin),
        pontuacaoMax: Number(formRegra.pontuacaoMax),
        slaHoras: Number(formRegra.slaHoras),
        resposta: formRegra.resposta,
      });
      setFormRegra(regraInicial);
      await load(origemFiltro || undefined);
      toast({ title: "Regra criada", description: "Regra de risco/SLA registrada." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao criar regra.";
      toast({ title: "Erro ao salvar", description: message, variant: "destructive" });
    }
  };

  const handleCreateAvaliacao = async () => {
    if (!formAvaliacao.origemId.trim() || !formAvaliacao.impacto || !formAvaliacao.recorrencia || !formAvaliacao.detectabilidade) {
      toast({
        title: "Campos obrigatorios",
        description: "Preencha origemId, impacto, recorrencia e detectabilidade.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createAvaliacaoRiscoSla({
        origemTipo: formAvaliacao.origemTipo,
        origemId: formAvaliacao.origemId,
        criticidade: formAvaliacao.criticidade,
        impacto: Number(formAvaliacao.impacto),
        recorrencia: Number(formAvaliacao.recorrencia),
        detectabilidade: Number(formAvaliacao.detectabilidade),
        justificativa: formAvaliacao.justificativa || undefined,
      });
      setFormAvaliacao(avaliacaoInicial);
      await load(origemFiltro || undefined);
      toast({ title: "Avaliacao criada", description: "Motor de risco/SLA processou a prioridade." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao criar avaliacao.";
      toast({ title: "Erro ao salvar", description: message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-primary" />
          Motor de Risco e SLA Dinamico
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Regras de priorizacao para SAC, NC e CAPA com SLA automatico por criticidade.
        </p>
      </div>

      <SectionCard title="Filtro" description="Filtrar por origem">
        <div className="flex items-end gap-3">
          <FormField label="Origem" className="w-48">
            <Input value={origemFiltro} onChange={(e) => setOrigemFiltro(e.target.value.toUpperCase())} placeholder="SAC, NC, CAPA" />
          </FormField>
          <Button onClick={() => void load(origemFiltro || undefined)}>Aplicar Filtro</Button>
        </div>
      </SectionCard>

      <SectionCard title="Nova Regra de Risco/SLA" description="Faixa de pontuacao e SLA alvo">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormField label="Origem Tipo">
            <Input value={formRegra.origemTipo} onChange={(e) => updateRegra("origemTipo", e.target.value.toUpperCase())} />
          </FormField>
          <FormField label="Criticidade">
            <Input value={formRegra.criticidade} onChange={(e) => updateRegra("criticidade", e.target.value.toUpperCase())} />
          </FormField>
          <FormField label="Pontuacao Min" required>
            <Input value={formRegra.pontuacaoMin} onChange={(e) => updateRegra("pontuacaoMin", e.target.value)} />
          </FormField>
          <FormField label="Pontuacao Max" required>
            <Input value={formRegra.pontuacaoMax} onChange={(e) => updateRegra("pontuacaoMax", e.target.value)} />
          </FormField>
          <FormField label="SLA (horas)" required>
            <Input value={formRegra.slaHoras} onChange={(e) => updateRegra("slaHoras", e.target.value)} />
          </FormField>
        </div>
        <FormField label="Resposta esperada" required>
          <Textarea value={formRegra.resposta} onChange={(e) => updateRegra("resposta", e.target.value)} rows={2} />
        </FormField>
        <div className="flex justify-end mt-3">
          <Button onClick={() => void handleCreateRegra()}>Salvar Regra</Button>
        </div>
      </SectionCard>

      <SectionCard title="Nova Avaliacao" description="Calcula score, SLA em horas e status automaticamente">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormField label="Origem Tipo">
            <Input value={formAvaliacao.origemTipo} onChange={(e) => updateAvaliacao("origemTipo", e.target.value.toUpperCase())} />
          </FormField>
          <FormField label="Origem ID" required>
            <Input value={formAvaliacao.origemId} onChange={(e) => updateAvaliacao("origemId", e.target.value)} />
          </FormField>
          <FormField label="Criticidade">
            <Input value={formAvaliacao.criticidade} onChange={(e) => updateAvaliacao("criticidade", e.target.value.toUpperCase())} />
          </FormField>
          <FormField label="Impacto (1-5)" required>
            <Input value={formAvaliacao.impacto} onChange={(e) => updateAvaliacao("impacto", e.target.value)} />
          </FormField>
          <FormField label="Recorrencia (1-5)" required>
            <Input value={formAvaliacao.recorrencia} onChange={(e) => updateAvaliacao("recorrencia", e.target.value)} />
          </FormField>
          <FormField label="Detectabilidade (1-5)" required>
            <Input value={formAvaliacao.detectabilidade} onChange={(e) => updateAvaliacao("detectabilidade", e.target.value)} />
          </FormField>
        </div>
        <FormField label="Justificativa">
          <Textarea value={formAvaliacao.justificativa} onChange={(e) => updateAvaliacao("justificativa", e.target.value)} rows={2} />
        </FormField>
        <div className="flex justify-end mt-3">
          <Button className="gap-2" onClick={() => void handleCreateAvaliacao()}>
            <TimerReset className="w-4 h-4" />
            Processar Avaliacao
          </Button>
        </div>
      </SectionCard>

      <SectionCard title="Regras Ativas" description={`${regras.length} registro(s)`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-3 py-2">Origem</th>
                <th className="text-left px-3 py-2">Criticidade</th>
                <th className="text-left px-3 py-2">Faixa Score</th>
                <th className="text-left px-3 py-2">SLA(h)</th>
                <th className="text-left px-3 py-2">Resposta</th>
              </tr>
            </thead>
            <tbody>
              {regras.map((item) => (
                <tr key={item.id} className="border-b border-border/60">
                  <td className="px-3 py-2">{item.origemTipo}</td>
                  <td className="px-3 py-2">{item.criticidade}</td>
                  <td className="px-3 py-2">{item.pontuacaoMin} - {item.pontuacaoMax}</td>
                  <td className="px-3 py-2">{item.slaHoras}</td>
                  <td className="px-3 py-2">{item.resposta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard title="Avaliacoes" description={`${avaliacoes.length} registro(s)`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-3 py-2">Origem</th>
                <th className="text-left px-3 py-2">ID</th>
                <th className="text-left px-3 py-2">Score</th>
                <th className="text-left px-3 py-2">SLA(h)</th>
                <th className="text-left px-3 py-2">Status SLA</th>
                <th className="text-left px-3 py-2">Limite</th>
              </tr>
            </thead>
            <tbody>
              {avaliacoes.map((item) => (
                <tr key={item.id} className="border-b border-border/60">
                  <td className="px-3 py-2">{item.origemTipo}</td>
                  <td className="px-3 py-2">{item.origemId}</td>
                  <td className="px-3 py-2">{item.pontuacao}</td>
                  <td className="px-3 py-2">{item.slaHoras}</td>
                  <td className="px-3 py-2">{item.statusSla}</td>
                  <td className="px-3 py-2">{new Date(item.limiteAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
};

export default RiscoSlaQualidadePage;
