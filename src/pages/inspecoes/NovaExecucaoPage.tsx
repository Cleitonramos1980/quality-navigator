import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardCheck, Save, CheckCircle2, XCircle, MinusCircle, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import SectionCard from "@/components/forms/SectionCard";
import FormField from "@/components/forms/FormField";
import { useToast } from "@/components/ui/use-toast";
import { listModelosInspecao, listTiposNCInspecao, createExecucaoInspecao } from "@/services/inspecoes";
import type { ModeloInspecao, TipoNCInspecao, InspecaoItemStatus, ExecucaoInspecaoItem } from "@/types/inspecoes";
import { getCurrentUserName } from "@/lib/rbac";
import { cn } from "@/lib/utils";

const statusOptions: { value: InspecaoItemStatus; label: string; icon: any; color: string }[] = [
  { value: "CONFORME", label: "Conforme", icon: CheckCircle2, color: "text-success border-success/30 bg-success/5" },
  { value: "NAO_CONFORME", label: "Não Conforme", icon: XCircle, color: "text-destructive border-destructive/30 bg-destructive/5" },
  { value: "NAO_APLICA", label: "N/A", icon: MinusCircle, color: "text-muted-foreground border-border bg-muted/30" },
];

const NovaExecucaoPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [modelos, setModelos] = useState<ModeloInspecao[]>([]);
  const [tiposNc, setTiposNc] = useState<TipoNCInspecao[]>([]);
  const [selectedModeloId, setSelectedModeloId] = useState("");
  const [observacaoGeral, setObservacaoGeral] = useState("");
  const [respostas, setRespostas] = useState<Record<string, { resultado: InspecaoItemStatus; tipoNcId: string; observacao: string; arquivo: string }>>({});
  const [saving, setSaving] = useState(false);

  const modelo = modelos.find((m) => m.id === selectedModeloId);

  useEffect(() => {
    void (async () => {
      try {
        const [m, t] = await Promise.all([listModelosInspecao(), listTiposNCInspecao()]);
        setModelos(m.filter((mod) => mod.ativo));
        setTiposNc(t.filter((tn) => tn.ativo));
      } catch (e) {
        toast({ title: "Erro", description: e instanceof Error ? e.message : "Falha ao carregar dados", variant: "destructive" });
      }
    })();
  }, []);

  useEffect(() => {
    if (modelo) {
      const init: typeof respostas = {};
      modelo.itens.filter((i) => i.ativo).forEach((item) => {
        if (!respostas[item.id]) init[item.id] = { resultado: "CONFORME", tipoNcId: "", observacao: "", arquivo: "" };
        else init[item.id] = respostas[item.id];
      });
      setRespostas(init);
    }
  }, [selectedModeloId]);

  const updateResposta = (itemId: string, patch: Partial<typeof respostas[string]>) => {
    setRespostas((prev) => ({ ...prev, [itemId]: { ...prev[itemId], ...patch } }));
  };

  const itensAtivos = modelo?.itens.filter((i) => i.ativo) || [];
  const tiposNcSetor = tiposNc.filter((t) => !modelo || t.setor === modelo.setor || t.setor === "Geral");

  const handleSave = async () => {
    if (!modelo) { toast({ title: "Selecione um modelo", variant: "destructive" }); return; }

    for (const item of itensAtivos) {
      const r = respostas[item.id];
      if (!r) continue;
      if (r.resultado === "NAO_CONFORME") {
        if (item.exigeTipoNc && !r.tipoNcId) {
          toast({ title: "Campo obrigatório", description: `Item "${item.descricao}" exige tipo de NC.`, variant: "destructive" }); return;
        }
        if (item.exigeEvidenciaNc && !r.arquivo) {
          toast({ title: "Campo obrigatório", description: `Item "${item.descricao}" exige evidência.`, variant: "destructive" }); return;
        }
      }
    }

    setSaving(true);
    try {
      const itensFinal: ExecucaoInspecaoItem[] = itensAtivos.map((item, idx) => {
        const r = respostas[item.id] || { resultado: "CONFORME" as const, tipoNcId: "", observacao: "", arquivo: "" };
        const tipoNc = tiposNc.find((t) => t.id === r.tipoNcId);
        return {
          id: `EI-${Date.now()}-${idx}`,
          itemModeloId: item.id,
          descricao: item.descricao,
          ordem: item.ordem,
          resultado: r.resultado,
          tipoNcId: r.resultado === "NAO_CONFORME" ? r.tipoNcId || undefined : undefined,
          tipoNcNome: r.resultado === "NAO_CONFORME" && tipoNc ? tipoNc.nome : undefined,
          observacao: r.observacao || undefined,
          evidenciaNomeArquivo: r.resultado === "NAO_CONFORME" && r.arquivo ? r.arquivo : undefined,
        };
      });

      const conformes = itensFinal.filter((i) => i.resultado === "CONFORME").length;
      const naoConformes = itensFinal.filter((i) => i.resultado === "NAO_CONFORME").length;
      const naoAplica = itensFinal.filter((i) => i.resultado === "NAO_APLICA").length;
      const avaliaveis = conformes + naoConformes;
      const taxa = avaliaveis > 0 ? Math.round((conformes / avaliaveis) * 1000) / 10 : 100;

      await createExecucaoInspecao({
        modeloId: modelo.id,
        modeloNome: modelo.nome,
        setor: modelo.setor,
        executor: getCurrentUserName(),
        dataHora: new Date().toISOString(),
        status: "CONCLUIDA",
        totalItens: itensFinal.length,
        conformes,
        naoConformes,
        naoAplica,
        taxaConformidade: taxa,
        observacaoGeral: observacaoGeral || undefined,
        itens: itensFinal,
      });
      toast({ title: "Inspeção registrada", description: `${modelo.nome} — ${taxa}% de conformidade` });
      navigate("/qualidade/inspecoes/historico");
    } catch (e) {
      toast({ title: "Erro", description: e instanceof Error ? e.message : "Falha ao salvar", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ClipboardCheck className="w-6 h-6 text-primary" />
          Nova Execução de Inspeção
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">Selecione um modelo e preencha os itens do checklist</p>
      </div>

      <SectionCard title="Selecionar Modelo">
        <FormField label="Modelo / Checklist" required>
          <select value={selectedModeloId} onChange={(e) => setSelectedModeloId(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="">Selecione...</option>
            {modelos.map((m) => <option key={m.id} value={m.id}>{m.nome} ({m.setor})</option>)}
          </select>
        </FormField>
      </SectionCard>

      {modelo && itensAtivos.length > 0 && (
        <>
          <SectionCard title="Itens de Inspeção" description={`${itensAtivos.length} item(ns) para verificar`}>
            <div className="space-y-4">
              {itensAtivos.map((item, idx) => {
                const r = respostas[item.id];
                if (!r) return null;
                return (
                  <div key={item.id} className="rounded-lg border border-border p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-muted text-xs font-bold shrink-0">{idx + 1}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.descricao}</p>
                        {item.obrigatorio && <span className="text-[10px] text-destructive font-medium">OBRIGATÓRIO</span>}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-10">
                      {statusOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => updateResposta(item.id, { resultado: opt.value })}
                          className={cn(
                            "flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-all",
                            r.resultado === opt.value ? opt.color + " ring-1 ring-current" : "border-border text-muted-foreground hover:bg-muted/30"
                          )}
                        >
                          <opt.icon className="w-3.5 h-3.5" />{opt.label}
                        </button>
                      ))}
                    </div>
                    {r.resultado === "NAO_CONFORME" && (
                      <div className="ml-10 space-y-2 rounded-md border border-destructive/20 bg-destructive/5 p-3">
                        {item.exigeTipoNc && (
                          <FormField label="Tipo de NC" required>
                            <select value={r.tipoNcId} onChange={(e) => updateResposta(item.id, { tipoNcId: e.target.value })} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                              <option value="">Selecione...</option>
                              {tiposNcSetor.map((t) => <option key={t.id} value={t.id}>{t.nome} ({t.categoria})</option>)}
                            </select>
                          </FormField>
                        )}
                        <FormField label="Observação">
                          <Textarea value={r.observacao} onChange={(e) => updateResposta(item.id, { observacao: e.target.value })} rows={2} placeholder="Descreva a não conformidade..." />
                        </FormField>
                        {item.exigeEvidenciaNc && (
                          <FormField label="Evidência / Arquivo" required>
                            <div className="flex items-center gap-2">
                              <Input
                                type="file"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) updateResposta(item.id, { arquivo: file.name });
                                }}
                                className="text-xs"
                              />
                              {r.arquivo && <span className="text-xs text-muted-foreground truncate max-w-[200px]">{r.arquivo}</span>}
                            </div>
                          </FormField>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </SectionCard>

          <SectionCard title="Observação Geral">
            <Textarea value={observacaoGeral} onChange={(e) => setObservacaoGeral(e.target.value)} rows={3} placeholder="Observações gerais da inspeção (opcional)..." />
          </SectionCard>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => navigate("/qualidade/inspecoes")}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              <Save className="w-4 h-4" />{saving ? "Salvando..." : "Concluir Inspeção"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default NovaExecucaoPage;
