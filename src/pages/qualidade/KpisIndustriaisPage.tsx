import { useEffect, useState } from "react";
import { BarChart3, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import SectionCard from "@/components/forms/SectionCard";
import FormField from "@/components/forms/FormField";
import {
  createIndicadorIndustrial,
  getResumoIndicadoresIndustriais,
  listIndicadoresIndustriais,
} from "@/services/governancaQualidade";
import type { IndicadorIndustrial, IndicadorIndustrialResumo } from "@/types/sgq";

const formInicial = {
  data: "",
  planta: "MAO",
  linha: "",
  oee: "",
  fpy: "",
  scrapRate: "",
  reworkRate: "",
  mtbfHoras: "",
  mttrHoras: "",
  paradasNaoPlanejadas: "",
  fonte: "",
};

const resumoVazio: IndicadorIndustrialResumo = {
  count: 0,
  oeeMedio: 0,
  fpyMedio: 0,
  scrapMedio: 0,
  reworkMedio: 0,
  mtbfMedio: 0,
  mttrMedio: 0,
};

const KpisIndustriaisPage = () => {
  const { toast } = useToast();
  const [indicadores, setIndicadores] = useState<IndicadorIndustrial[]>([]);
  const [resumo, setResumo] = useState<IndicadorIndustrialResumo>(resumoVazio);
  const [filtroPlanta, setFiltroPlanta] = useState("");
  const [form, setForm] = useState(formInicial);

  const load = async (planta?: string) => {
    const [list, sum] = await Promise.all([
      listIndicadoresIndustriais({ planta }),
      getResumoIndicadoresIndustriais({ planta }),
    ]);
    setIndicadores(list);
    setResumo(sum);
  };

  useEffect(() => {
    void (async () => {
      try {
        await load();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Falha ao carregar indicadores.";
        toast({ title: "Erro", description: message, variant: "destructive" });
      }
    })();
  }, []);

  const update = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleFiltrar = async () => {
    try {
      await load(filtroPlanta || undefined);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao filtrar indicadores.";
      toast({ title: "Erro", description: message, variant: "destructive" });
    }
  };

  const handleCreate = async () => {
    if (!form.data.trim() || !form.linha.trim() || !form.oee || !form.fpy || !form.scrapRate || !form.reworkRate || !form.mtbfHoras || !form.mttrHoras) {
      toast({
        title: "Campos obrigatorios",
        description: "Informe data, linha e os indicadores principais (OEE/FPY/Scrap/Rework/MTBF/MTTR).",
        variant: "destructive",
      });
      return;
    }

    try {
      await createIndicadorIndustrial({
        data: form.data,
        planta: form.planta as "MAO" | "BEL" | "AGR",
        linha: form.linha,
        oee: Number(form.oee),
        fpy: Number(form.fpy),
        scrapRate: Number(form.scrapRate),
        reworkRate: Number(form.reworkRate),
        mtbfHoras: Number(form.mtbfHoras),
        mttrHoras: Number(form.mttrHoras),
        paradasNaoPlanejadas: form.paradasNaoPlanejadas ? Number(form.paradasNaoPlanejadas) : undefined,
        fonte: form.fonte || undefined,
      });
      setForm(formInicial);
      await load(filtroPlanta || undefined);
      toast({ title: "Indicador registrado", description: "Registro salvo com sucesso." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao salvar indicador.";
      toast({ title: "Erro ao salvar", description: message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" />
          KPIs Industriais (OEE, FPY, Scrap, Rework, MTBF, MTTR)
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Consolidacao por planta e linha para acompanhamento operacional da qualidade.
        </p>
      </div>

      <SectionCard title="Resumo" description="Medias com base no filtro atual">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <div className="rounded-md border border-border p-3"><p className="text-xs text-muted-foreground">OEE Medio</p><p className="text-xl font-semibold">{resumo.oeeMedio}%</p></div>
          <div className="rounded-md border border-border p-3"><p className="text-xs text-muted-foreground">FPY Medio</p><p className="text-xl font-semibold">{resumo.fpyMedio}%</p></div>
          <div className="rounded-md border border-border p-3"><p className="text-xs text-muted-foreground">Scrap Medio</p><p className="text-xl font-semibold">{resumo.scrapMedio}%</p></div>
          <div className="rounded-md border border-border p-3"><p className="text-xs text-muted-foreground">Rework Medio</p><p className="text-xl font-semibold">{resumo.reworkMedio}%</p></div>
          <div className="rounded-md border border-border p-3"><p className="text-xs text-muted-foreground">MTBF Medio</p><p className="text-xl font-semibold">{resumo.mtbfMedio}h</p></div>
          <div className="rounded-md border border-border p-3"><p className="text-xs text-muted-foreground">MTTR Medio</p><p className="text-xl font-semibold">{resumo.mttrMedio}h</p></div>
        </div>
      </SectionCard>

      <SectionCard title="Filtros" description="Filtrar leitura por planta">
        <div className="flex flex-wrap items-end gap-3">
          <FormField label="Planta" className="w-48">
            <Input value={filtroPlanta} onChange={(e) => setFiltroPlanta(e.target.value.toUpperCase())} placeholder="MAO, BEL ou AGR" />
          </FormField>
          <Button onClick={() => void handleFiltrar()}>Aplicar Filtro</Button>
        </div>
      </SectionCard>

      <SectionCard title="Novo Registro KPI" description="Lancamento diario por linha">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FormField label="Data" required>
            <Input type="date" value={form.data} onChange={(e) => update("data", e.target.value)} />
          </FormField>
          <FormField label="Planta">
            <Input value={form.planta} onChange={(e) => update("planta", e.target.value.toUpperCase())} />
          </FormField>
          <FormField label="Linha" required>
            <Input value={form.linha} onChange={(e) => update("linha", e.target.value)} />
          </FormField>
          <FormField label="Fonte">
            <Input value={form.fonte} onChange={(e) => update("fonte", e.target.value)} />
          </FormField>
          <FormField label="OEE (%)" required>
            <Input value={form.oee} onChange={(e) => update("oee", e.target.value)} />
          </FormField>
          <FormField label="FPY (%)" required>
            <Input value={form.fpy} onChange={(e) => update("fpy", e.target.value)} />
          </FormField>
          <FormField label="Scrap (%)" required>
            <Input value={form.scrapRate} onChange={(e) => update("scrapRate", e.target.value)} />
          </FormField>
          <FormField label="Rework (%)" required>
            <Input value={form.reworkRate} onChange={(e) => update("reworkRate", e.target.value)} />
          </FormField>
          <FormField label="MTBF (h)" required>
            <Input value={form.mtbfHoras} onChange={(e) => update("mtbfHoras", e.target.value)} />
          </FormField>
          <FormField label="MTTR (h)" required>
            <Input value={form.mttrHoras} onChange={(e) => update("mttrHoras", e.target.value)} />
          </FormField>
          <FormField label="Paradas nao planejadas">
            <Input value={form.paradasNaoPlanejadas} onChange={(e) => update("paradasNaoPlanejadas", e.target.value)} />
          </FormField>
        </div>
        <div className="flex justify-end mt-3">
          <Button className="gap-2" onClick={() => void handleCreate()}>
            <PlusCircle className="w-4 h-4" />
            Salvar KPI
          </Button>
        </div>
      </SectionCard>

      <SectionCard title="Registros" description={`${indicadores.length} registro(s)`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-3 py-2">Data</th>
                <th className="text-left px-3 py-2">Planta</th>
                <th className="text-left px-3 py-2">Linha</th>
                <th className="text-left px-3 py-2">OEE</th>
                <th className="text-left px-3 py-2">FPY</th>
                <th className="text-left px-3 py-2">Scrap</th>
                <th className="text-left px-3 py-2">Rework</th>
                <th className="text-left px-3 py-2">MTBF</th>
                <th className="text-left px-3 py-2">MTTR</th>
              </tr>
            </thead>
            <tbody>
              {indicadores.map((item) => (
                <tr key={item.id} className="border-b border-border/60">
                  <td className="px-3 py-2">{item.data}</td>
                  <td className="px-3 py-2">{item.planta}</td>
                  <td className="px-3 py-2">{item.linha}</td>
                  <td className="px-3 py-2">{item.oee}%</td>
                  <td className="px-3 py-2">{item.fpy}%</td>
                  <td className="px-3 py-2">{item.scrapRate}%</td>
                  <td className="px-3 py-2">{item.reworkRate}%</td>
                  <td className="px-3 py-2">{item.mtbfHoras}h</td>
                  <td className="px-3 py-2">{item.mttrHoras}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
};

export default KpisIndustriaisPage;
