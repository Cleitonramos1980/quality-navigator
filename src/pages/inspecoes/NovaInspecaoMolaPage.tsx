import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Ruler, Save, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import SectionCard from "@/components/forms/SectionCard";
import FormField from "@/components/forms/FormField";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { listPadroesMola, createInspecaoMola } from "@/services/inspecoes";
import type { PadraoMola, MedicaoMola, InspecaoMola } from "@/types/inspecoes";
import { MAQUINAS_MOLA } from "@/types/inspecoes";
import { getCurrentUserName } from "@/lib/rbac";
import { cn } from "@/lib/utils";

type StatusMaquina = InspecaoMola["statusMaquina"];

const STATUS_MAQUINA_OPTIONS: { value: StatusMaquina; label: string }[] = [
  { value: "Operando", label: "Em Processo" },
  { value: "Manutenção", label: "Manutenção" },
  { value: "Setup", label: "Setup" },
  { value: "Parada", label: "Parada" },
];

const NovaInspecaoMolaPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [padroes, setPadroes] = useState<PadraoMola[]>([]);
  const [maquina, setMaquina] = useState<string>(MAQUINAS_MOLA[0]);
  const [statusMaquina, setStatusMaquina] = useState<StatusMaquina>("Operando");
  const [alturaTipo, setAlturaTipo] = useState("");
  const [linhaPocket, setLinhaPocket] = useState("");
  const [observacao, setObservacao] = useState("");
  const [motivoParada, setMotivoParada] = useState("");
  const [medicoes, setMedicoes] = useState<(MedicaoMola & { input: string })[]>([]);
  const [saving, setSaving] = useState(false);

  const isParada = statusMaquina === "Parada";

  useEffect(() => {
    void (async () => {
      try { setPadroes((await listPadroesMola()).filter((p) => p.ativo)); }
      catch (e) { toast({ title: "Erro", description: e instanceof Error ? e.message : "Falha", variant: "destructive" }); }
    })();
  }, []);

  const alturasTipo = [...new Set(padroes.map((p) => p.alturaTipo))];

  useEffect(() => {
    if (!alturaTipo || isParada) { setMedicoes([]); return; }
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
  }, [alturaTipo, padroes, isParada]);

  const updateMedicao = (idx: number, value: string) => {
    setMedicoes((prev) => prev.map((m, i) => {
      if (i !== idx) return m;
      const num = parseFloat(value.replace(",", "."));
      const valido = !isNaN(num);
      return { ...m, input: value, valorMedido: valido ? num : 0, conforme: valido ? num >= m.minimo && num <= m.maximo : true };
    }));
  };

  const handleSave = async () => {
    if (!isParada) {
      if (!alturaTipo) { toast({ title: "Selecione altura/tipo", variant: "destructive" }); return; }
      if (medicoes.some((m) => !m.input.trim())) { toast({ title: "Preencha todas as medições", variant: "destructive" }); return; }
    } else {
      if (!motivoParada.trim()) { toast({ title: "Informe o motivo da parada", variant: "destructive" }); return; }
    }

    setSaving(true);
    try {
      let resultado: InspecaoMola["resultado"];
      if (isParada) {
        resultado = "PARADA_REGISTRADA";
      } else {
        resultado = medicoes.every((m) => m.conforme) ? "APROVADO" : "REPROVADO";
      }

      await createInspecaoMola({
        maquina,
        statusMaquina,
        alturaTipo: isParada ? "N/A" : alturaTipo,
        linhaPocket,
        operador: getCurrentUserName(),
        dataHora: new Date().toISOString(),
        observacaoGeral: observacao || undefined,
        motivoParada: isParada ? motivoParada : undefined,
        resultado,
        medicoes: isParada ? [] : medicoes.map(({ input, ...m }) => m),
      });
      toast({ title: "Inspeção registrada", description: isParada ? `Máquina ${maquina} — Parada registrada` : `Resultado: ${resultado}` });
      navigate("/inspecoes/molas");
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
          <FormField label="Status Máquina" required>
            <select value={statusMaquina} onChange={(e) => setStatusMaquina(e.target.value as StatusMaquina)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              {STATUS_MAQUINA_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </FormField>
          {!isParada && (
            <>
              <FormField label="Altura / Tipo" required>
                <select value={alturaTipo} onChange={(e) => setAlturaTipo(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">Selecione...</option>
                  {alturasTipo.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </FormField>
              <FormField label="Linha / Pocket">
                <Input value={linhaPocket} onChange={(e) => setLinhaPocket(e.target.value)} placeholder="Ex: Linha A / Pocket 3" />
              </FormField>
            </>
          )}
        </div>
      </SectionCard>

      {isParada && (
        <SectionCard title="Registro de Parada">
          <div className="flex items-start gap-3 rounded-md border border-warning/30 bg-warning/5 p-4 mb-4">
            <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Máquina Parada</p>
              <p className="text-xs text-muted-foreground">A inspeção dimensional não é necessária quando a máquina está parada. Registre o motivo da parada e observações relevantes.</p>
            </div>
            <Badge variant="secondary" className="shrink-0">Parada</Badge>
          </div>
          <FormField label="Motivo da Parada" required>
            <Textarea value={motivoParada} onChange={(e) => setMotivoParada(e.target.value)} rows={2} placeholder="Ex: Manutenção preventiva, quebra de componente, falta de matéria-prima..." />
          </FormField>
        </SectionCard>
      )}

      {!isParada && medicoes.length > 0 && (
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
        <Button variant="outline" onClick={() => navigate("/inspecoes/molas")}>Cancelar</Button>
        <Button onClick={handleSave} disabled={saving || (!isParada && medicoes.length === 0)} className="gap-2">
          <Save className="w-4 h-4" />{saving ? "Salvando..." : isParada ? "Registrar Parada" : "Registrar Inspeção"}
        </Button>
      </div>
    </div>
  );
};

export default NovaInspecaoMolaPage;
