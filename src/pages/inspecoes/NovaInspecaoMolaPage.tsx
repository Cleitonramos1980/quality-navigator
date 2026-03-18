import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Ruler, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import SectionCard from "@/components/forms/SectionCard";
import FormField from "@/components/forms/FormField";
import { useToast } from "@/components/ui/use-toast";
import { listPadroesMola, createInspecaoMola } from "@/services/inspecoes";
import type { PadraoMola, MedicaoMola } from "@/types/inspecoes";
import { MAQUINAS_MOLA } from "@/types/inspecoes";
import { getCurrentUserName } from "@/lib/rbac";
import { cn } from "@/lib/utils";

const NovaInspecaoMolaPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [padroes, setPadroes] = useState<PadraoMola[]>([]);
  const [maquina, setMaquina] = useState(MAQUINAS_MOLA[0]);
  const [statusMaquina, setStatusMaquina] = useState("Operando");
  const [alturaTipo, setAlturaTipo] = useState("");
  const [linhaPocket, setLinhaPocket] = useState("");
  const [observacao, setObservacao] = useState("");
  const [medicoes, setMedicoes] = useState<(MedicaoMola & { input: string })[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      try { setPadroes((await listPadroesMola()).filter((p) => p.ativo)); }
      catch (e) { toast({ title: "Erro", description: e instanceof Error ? e.message : "Falha", variant: "destructive" }); }
    })();
  }, []);

  const alturasTipo = [...new Set(padroes.map((p) => p.alturaTipo))];

  useEffect(() => {
    if (!alturaTipo) { setMedicoes([]); return; }
    const filtered = padroes.filter((p) => p.alturaTipo === alturaTipo);
    setMedicoes(filtered.map((p) => ({
      id: `MED-${p.id}`,
      padraoId: p.id,
      item: p.item,
      descricao: p.descricao,
      padrao: p.padrao,
      minimo: p.minimo,
      maximo: p.maximo,
      unidade: p.unidade,
      valorMedido: 0,
      conforme: true,
      input: "",
    })));
  }, [alturaTipo, padroes]);

  const updateMedicao = (idx: number, value: string) => {
    setMedicoes((prev) => prev.map((m, i) => {
      if (i !== idx) return m;
      const num = parseFloat(value.replace(",", "."));
      const valido = !isNaN(num);
      return { ...m, input: value, valorMedido: valido ? num : 0, conforme: valido ? num >= m.minimo && num <= m.maximo : true };
    }));
  };

  const handleSave = async () => {
    if (!alturaTipo) { toast({ title: "Selecione altura/tipo", variant: "destructive" }); return; }
    if (medicoes.some((m) => !m.input.trim())) { toast({ title: "Preencha todas as medições", variant: "destructive" }); return; }

    setSaving(true);
    try {
      const resultado = medicoes.every((m) => m.conforme) ? "APROVADO" as const : "REPROVADO" as const;
      await createInspecaoMola({
        maquina,
        statusMaquina,
        alturaTipo,
        linhaPocket,
        operador: getCurrentUserName(),
        dataHora: new Date().toISOString(),
        observacaoGeral: observacao || undefined,
        resultado,
        medicoes: medicoes.map(({ input, ...m }) => m),
      });
      toast({ title: "Inspeção registrada", description: `Resultado: ${resultado}` });
      navigate("/qualidade/inspecoes/molas");
    } catch (e) {
      toast({ title: "Erro", description: e instanceof Error ? e.message : "Falha", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Ruler className="w-6 h-6 text-primary" />
          Nova Inspeção de Molas
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">Inspeção dimensional de molas ensacadas</p>
      </div>

      <SectionCard title="Dados da Máquina">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FormField label="Máquina" required>
            <select value={maquina} onChange={(e) => setMaquina(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              {MAQUINAS_MOLA.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </FormField>
          <FormField label="Status Máquina">
            <select value={statusMaquina} onChange={(e) => setStatusMaquina(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option>Operando</option><option>Manutenção</option><option>Setup</option><option>Parada</option>
            </select>
          </FormField>
          <FormField label="Altura / Tipo" required>
            <select value={alturaTipo} onChange={(e) => setAlturaTipo(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">Selecione...</option>
              {alturasTipo.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </FormField>
          <FormField label="Linha / Pocket">
            <Input value={linhaPocket} onChange={(e) => setLinhaPocket(e.target.value)} placeholder="Ex: Linha A / Pocket 3" />
          </FormField>
        </div>
      </SectionCard>

      {medicoes.length > 0 && (
        <SectionCard title="Medições" description={`${medicoes.length} item(ns) para medir`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-3 py-2">Item</th>
                  <th className="text-left px-3 py-2">Descrição</th>
                  <th className="text-center px-3 py-2">Padrão</th>
                  <th className="text-center px-3 py-2">Mín</th>
                  <th className="text-center px-3 py-2">Máx</th>
                  <th className="text-center px-3 py-2">Und</th>
                  <th className="text-center px-3 py-2">Medido</th>
                  <th className="text-center px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {medicoes.map((m, idx) => (
                  <tr key={m.id} className={cn("border-b border-border/60", !m.conforme && m.input ? "bg-destructive/5" : "")}>
                    <td className="px-3 py-2 font-medium">{m.item}</td>
                    <td className="px-3 py-2 text-muted-foreground">{m.descricao}</td>
                    <td className="px-3 py-2 text-center font-mono">{m.padrao}</td>
                    <td className="px-3 py-2 text-center font-mono">{m.minimo}</td>
                    <td className="px-3 py-2 text-center font-mono">{m.maximo}</td>
                    <td className="px-3 py-2 text-center">{m.unidade}</td>
                    <td className="px-3 py-2 text-center">
                      <Input
                        value={m.input}
                        onChange={(e) => updateMedicao(idx, e.target.value)}
                        className={cn("w-24 text-center mx-auto", !m.conforme && m.input ? "border-destructive text-destructive" : "")}
                        placeholder="0.00"
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      {m.input ? (
                        m.conforme ? <span className="text-success font-bold text-xs">OK</span> : <span className="text-destructive font-bold text-xs">FORA</span>
                      ) : <span className="text-muted-foreground text-xs">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}

      <SectionCard title="Observação Geral">
        <Textarea value={observacao} onChange={(e) => setObservacao(e.target.value)} rows={3} placeholder="Observações sobre a inspeção (opcional)..." />
      </SectionCard>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate("/qualidade/inspecoes/molas")}>Cancelar</Button>
        <Button onClick={handleSave} disabled={saving || medicoes.length === 0} className="gap-2">
          <Save className="w-4 h-4" />{saving ? "Salvando..." : "Registrar Inspeção"}
        </Button>
      </div>
    </div>
  );
};

export default NovaInspecaoMolaPage;
