import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ClipboardCheck, Save, CheckCircle2, XCircle, MinusCircle, X, FileText, User, Clock3, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import SectionCard from "@/components/forms/SectionCard";
import FormField from "@/components/forms/FormField";
import { useToast } from "@/components/ui/use-toast";
import { listModelosInspecao, listTiposNCInspecao, createExecucaoInspecao } from "@/services/inspecoes";
import type { ModeloInspecao, TipoNCInspecao, InspecaoItemStatus, ExecucaoInspecaoItem, InspecaoStatus } from "@/types/inspecoes";
import { getCurrentUserId, getCurrentUserName } from "@/lib/rbac";
import { useSetoresPermitidos } from "@/hooks/useSetoresPermitidos";
import { cn } from "@/lib/utils";
import { CHECKLIST_TIPOS_OFICIAIS, getChecklistTipoBySetor, hasSetorPermitido, isSameSetor } from "@/lib/inspecoesChecklist";
import SetorEscopoAlert from "@/components/inspecoes/SetorEscopoAlert";

const statusOptions: { value: InspecaoItemStatus; label: string; icon: any; color: string }[] = [
  { value: "CONFORME", label: "Conforme", icon: CheckCircle2, color: "text-success border-success/30 bg-success/5" },
  { value: "NAO_CONFORME", label: "Nao Conforme", icon: XCircle, color: "text-destructive border-destructive/30 bg-destructive/5" },
  { value: "NAO_APLICA", label: "Nao se aplica", icon: MinusCircle, color: "text-muted-foreground border-border bg-muted/30" },
];

interface RespostaItem {
  resultado: InspecaoItemStatus;
  tipoNcId: string;
  observacao: string;
  fotoUrl: string;
  arquivos: string[];
}

const NovaExecucaoPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setoresPermitidos, loading: loadingSetores, error: setoresError } = useSetoresPermitidos();

  const [modelos, setModelos] = useState<ModeloInspecao[]>([]);
  const [tiposNc, setTiposNc] = useState<TipoNCInspecao[]>([]);
  const [selectedChecklistKey, setSelectedChecklistKey] = useState("");
  const [observacaoGeral, setObservacaoGeral] = useState("");
  const [respostas, setRespostas] = useState<Record<string, RespostaItem>>({});
  const [saving, setSaving] = useState(false);
  const [dataHoraExecucao, setDataHoraExecucao] = useState(() => new Date().toISOString());

  const auditorNome = getCurrentUserName();
  const auditorUsuario = getCurrentUserId();

  useEffect(() => {
    const timer = window.setInterval(() => setDataHoraExecucao(new Date().toISOString()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (loadingSetores || setoresError) return;
    void (async () => {
      try {
        const [m, t] = await Promise.all([listModelosInspecao(), listTiposNCInspecao()]);
        setModelos(m.filter((mod) => mod.ativo && hasSetorPermitido(setoresPermitidos, mod.setor)));
        setTiposNc(t.filter((tn) => tn.ativo));
      } catch (e) {
        toast({ title: "Erro", description: e instanceof Error ? e.message : "Falha ao carregar dados", variant: "destructive" });
      }
    })();
  }, [loadingSetores, setoresError, setoresPermitidos, toast]);

  const checklistOptions = useMemo(
    () =>
      CHECKLIST_TIPOS_OFICIAIS.map((tipo) => {
        const modelo = modelos.find((mod) => isSameSetor(mod.setor, tipo.setor));
        return modelo ? { ...tipo, modelo } : null;
      }).filter(Boolean) as Array<{ key: string; setor: string; label: string; modelo: ModeloInspecao }>,
    [modelos],
  );

  const selectedOption = checklistOptions.find((opt) => opt.key === selectedChecklistKey);
  const modelo = selectedOption?.modelo;

  useEffect(() => {
    if (!modelo) {
      setRespostas({});
      return;
    }

    const init: Record<string, RespostaItem> = {};
    const itensAtivos = modelo.itens.filter((i) => i.ativo);
    for (const item of itensAtivos) {
      init[item.id] = respostas[item.id] ?? {
        resultado: "CONFORME",
        tipoNcId: "",
        observacao: "",
        fotoUrl: "",
        arquivos: [],
      };
    }
    setRespostas(init);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelo?.id]);

  const itensAtivos = useMemo(
    () => (modelo?.itens ?? []).filter((i) => i.ativo).sort((a, b) => a.ordem - b.ordem),
    [modelo],
  );

  const tiposNcSetor = useMemo(
    () => tiposNc.filter((t) => !modelo || isSameSetor(t.setor, modelo.setor) || t.setor === "Geral"),
    [tiposNc, modelo],
  );

  const respondidos = useMemo(() => itensAtivos.filter((item) => Boolean(respostas[item.id])).length, [itensAtivos, respostas]);
  const pendentes = Math.max(itensAtivos.length - respondidos, 0);

  const updateResposta = (itemId: string, patch: Partial<RespostaItem>) => {
    setRespostas((prev) => ({ ...prev, [itemId]: { ...prev[itemId], ...patch } }));
  };

  const addArquivos = (itemId: string, files: FileList) => {
    setRespostas((prev) => {
      const curr = prev[itemId];
      const newNames = Array.from(files).map((f) => f.name);
      const merged = [...curr.arquivos, ...newNames].slice(0, 3);
      if (curr.arquivos.length + newNames.length > 3) {
        toast({ title: "Limite de evidencias", description: "Cada item permite no maximo 3 evidencias.", variant: "destructive" });
      }
      return { ...prev, [itemId]: { ...curr, arquivos: merged } };
    });
  };

  const removeArquivo = (itemId: string, idx: number) => {
    setRespostas((prev) => {
      const curr = prev[itemId];
      return { ...prev, [itemId]: { ...curr, arquivos: curr.arquivos.filter((_, i) => i !== idx) } };
    });
  };

  const addFotoCamera = (itemId: string, files: FileList) => {
    if (!files || files.length === 0) return;
    const captured = files[0];
    addArquivos(itemId, files);
    setRespostas((prev) => {
      const curr = prev[itemId];
      if (!curr) return prev;
      return {
        ...prev,
        [itemId]: {
          ...curr,
          fotoUrl: curr.fotoUrl.trim().length > 0 ? curr.fotoUrl : captured.name,
        },
      };
    });
  };

  const buildItemPayload = (
    item: ModeloInspecao["itens"][number],
    idx: number,
    timestamp: string,
  ): ExecucaoInspecaoItem => {
    const r = respostas[item.id] || { resultado: "CONFORME" as const, tipoNcId: "", observacao: "", fotoUrl: "", arquivos: [] };
    const tipoNc = tiposNc.find((t) => t.id === r.tipoNcId);
    const codigoItem = item.codigoItem || `ITEM-${String(item.ordem).padStart(4, "0")}`;
    const evidencias = [...r.arquivos, ...(r.fotoUrl ? [r.fotoUrl] : [])].filter(Boolean).slice(0, 3);
    const fotoUrl = r.fotoUrl || evidencias[0] || undefined;

    return {
      id: `EI-${Date.now()}-${idx}`,
      itemModeloId: item.id,
      codigoItem,
      item: codigoItem,
      descricao: item.descricao,
      ordem: item.ordem,
      resultado: r.resultado,
      status: r.resultado,
      timestampResposta: timestamp,
      usuario: auditorUsuario ?? undefined,
      nome: auditorNome,
      setor: modelo?.setor,
      tipoNcId: r.resultado === "NAO_CONFORME" ? r.tipoNcId || undefined : undefined,
      tipoNcNome: r.resultado === "NAO_CONFORME" && tipoNc ? tipoNc.nome : undefined,
      observacao: r.observacao || undefined,
      observacaoItem: r.observacao || undefined,
      fotoUrl,
      evidencias: evidencias.length > 0 ? evidencias : undefined,
      evidenciaNomeArquivo: evidencias.length > 0 ? evidencias[0] : undefined,
      evidenciaUrl: fotoUrl,
    };
  };

  const handleSave = async (execStatus: InspecaoStatus) => {
    if (!modelo) {
      toast({ title: "Selecione um checklist", variant: "destructive" });
      return;
    }

    if (execStatus === "CONCLUIDA") {
      for (const item of itensAtivos) {
        const r = respostas[item.id];
        if (!r) {
          toast({ title: "Item pendente", description: `O item ${item.codigoItem || item.ordem} ainda nao foi respondido.`, variant: "destructive" });
          return;
        }
        if (r.resultado === "NAO_CONFORME") {
          if (item.exigeTipoNc && !r.tipoNcId) {
            toast({ title: "Campo obrigatorio", description: `Item "${item.codigoItem || item.ordem}" exige tipo de NC.`, variant: "destructive" });
            return;
          }
          if (item.exigeEvidenciaNc && r.arquivos.length === 0 && !r.fotoUrl) {
            toast({ title: "Campo obrigatorio", description: `Item "${item.codigoItem || item.ordem}" exige evidencia/foto.`, variant: "destructive" });
            return;
          }
        }
      }
    }

    setSaving(true);
    try {
      const timestampExecucao = new Date().toISOString();
      const itensFinal: ExecucaoInspecaoItem[] = itensAtivos.map((item, idx) =>
        buildItemPayload(item, idx, timestampExecucao),
      );

      const conformes = itensFinal.filter((i) => i.resultado === "CONFORME").length;
      const naoConformes = itensFinal.filter((i) => i.resultado === "NAO_CONFORME").length;
      const naoAplica = itensFinal.filter((i) => i.resultado === "NAO_APLICA").length;
      const avaliaveis = conformes + naoConformes;
      const taxa = avaliaveis > 0 ? Math.round((conformes / avaliaveis) * 1000) / 10 : 100;

      await createExecucaoInspecao({
        modeloId: modelo.id,
        modeloNome: modelo.nome,
        setor: modelo.setor,
        executorUsuarioId: auditorUsuario ?? undefined,
        executor: auditorNome,
        dataHora: timestampExecucao,
        status: execStatus,
        totalItens: itensFinal.length,
        conformes,
        naoConformes,
        naoAplica,
        taxaConformidade: taxa,
        observacaoGeral: observacaoGeral || undefined,
        itens: itensFinal,
      });

      toast({
        title: execStatus === "CONCLUIDA" ? "Checklist concluido" : "Rascunho salvo",
        description: `${modelo.nome} - ${taxa}% de conformidade`,
      });
      navigate("/inspecoes/historico");
    } catch (e) {
      toast({ title: "Erro", description: e instanceof Error ? e.message : "Falha ao salvar", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">
          <Link to="/inspecoes" className="hover:underline">Inspecoes</Link> / Executar Checklist
        </p>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ClipboardCheck className="w-6 h-6 text-primary" />
          Nova Execucao de Inspecao
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">Selecione o tipo oficial e responda item por item.</p>
      </div>

      <SetorEscopoAlert loading={loadingSetores} error={setoresError} setoresPermitidos={setoresPermitidos} />

      <SectionCard title="Cabecalho da Execucao">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-md border border-border p-3">
            <p className="text-xs text-muted-foreground flex items-center gap-1"><User className="w-3 h-3" />Usuario</p>
            <p className="text-sm font-medium">{auditorUsuario || "-"}</p>
          </div>
          <div className="rounded-md border border-border p-3">
            <p className="text-xs text-muted-foreground">Nome</p>
            <p className="text-sm font-medium">{auditorNome}</p>
          </div>
          <div className="rounded-md border border-border p-3">
            <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock3 className="w-3 h-3" />Timestamp</p>
            <p className="text-sm font-medium">{new Date(dataHoraExecucao).toLocaleString("pt-BR")}</p>
          </div>
          <div className="rounded-md border border-border p-3">
            <p className="text-xs text-muted-foreground">Checklist</p>
            <p className="text-sm font-medium">{selectedOption?.label || "-"}</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Tipo de Checklist">
        <FormField label="Selecione o tipo oficial" required>
          <select
            value={selectedChecklistKey}
            onChange={(e) => setSelectedChecklistKey(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Selecione...</option>
            {checklistOptions.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.key} - {opt.modelo.nome}
              </option>
            ))}
          </select>
        </FormField>
        {!loadingSetores && checklistOptions.length === 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            Nenhum checklist disponivel para seu escopo de setores.
          </p>
        )}
      </SectionCard>

      {modelo && itensAtivos.length > 0 && (
        <>
          <SectionCard title="Itens do Checklist" description={`${itensAtivos.length} item(ns) oficiais carregados automaticamente`}>
            <div className="space-y-4">
              {itensAtivos.map((item, idx) => {
                const r = respostas[item.id];
                const tipoOficial = getChecklistTipoBySetor(modelo.setor);
                if (!r) return null;

                return (
                  <div key={item.id} className="rounded-lg border border-border p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-muted text-xs font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <div className="flex-1 space-y-1">
                        <div className="flex flex-wrap gap-2 items-center">
                          <span className="inline-flex rounded-md border border-border px-2 py-0.5 text-[11px] font-mono">
                            {item.codigoItem || `ITEM-${item.ordem}`}
                          </span>
                          <span className="text-[11px] text-muted-foreground">{tipoOficial?.key || modelo.setor}</span>
                        </div>
                        <p className="text-sm font-medium">{item.descricao}</p>
                        {item.obrigatorio && (
                          <span className="text-[10px] text-destructive font-medium">OBRIGATORIO</span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 ml-10 flex-wrap">
                      {statusOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => updateResposta(item.id, { resultado: opt.value })}
                          className={cn(
                            "flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-all",
                            r.resultado === opt.value ? `${opt.color} ring-1 ring-current` : "border-border text-muted-foreground hover:bg-muted/30",
                          )}
                        >
                          <opt.icon className="w-3.5 h-3.5" />
                          {opt.label}
                        </button>
                      ))}
                    </div>

                    <div className={cn("ml-10 space-y-2 rounded-md border p-3", r.resultado === "NAO_CONFORME" ? "border-destructive/20 bg-destructive/5" : "border-border/60 bg-muted/20")}>
                      {r.resultado === "NAO_CONFORME" && item.exigeTipoNc && (
                        <FormField label="Tipo de NC" required>
                          <select
                            value={r.tipoNcId}
                            onChange={(e) => updateResposta(item.id, { tipoNcId: e.target.value })}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          >
                            <option value="">Selecione...</option>
                            {tiposNcSetor.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.nome} ({t.categoria})
                              </option>
                            ))}
                          </select>
                        </FormField>
                      )}

                      <FormField label="ObservacaoItem">
                        <Textarea
                          value={r.observacao}
                          onChange={(e) => updateResposta(item.id, { observacao: e.target.value })}
                          rows={2}
                          placeholder="Ex.: OUTRO: descricao tecnica da observacao..."
                        />
                      </FormField>

                      <FormField label="FotoURL / referencia de evidencia">
                        <div className="space-y-2">
                          <Input
                            value={r.fotoUrl}
                            onChange={(e) => updateResposta(item.id, { fotoUrl: e.target.value })}
                            placeholder="URL da foto ou referencia interna do anexo"
                          />
                          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-xs font-medium hover:bg-muted/40 transition-colors">
                            <Camera className="w-3.5 h-3.5" />
                            Tirar foto com camera
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files && e.target.files.length > 0) {
                                  addFotoCamera(item.id, e.target.files);
                                  e.target.value = "";
                                }
                              }}
                            />
                          </label>
                          <p className="text-[11px] text-muted-foreground">
                            No celular, o botao acima abre a camera para registrar a evidencia.
                          </p>
                        </div>
                      </FormField>

                      <FormField label={`Evidencias de arquivo (${r.arquivos.length}/3)`}>
                        <Input
                          type="file"
                          multiple
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              addArquivos(item.id, e.target.files);
                              e.target.value = "";
                            }
                          }}
                          className="text-xs"
                        />
                        {r.arquivos.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {r.arquivos.map((nome, fIdx) => (
                              <div key={fIdx} className="flex items-center gap-2 rounded-md bg-muted/50 px-2 py-1 text-xs">
                                <FileText className="w-3 h-3 text-primary shrink-0" />
                                <span className="flex-1 truncate">{nome}</span>
                                <button type="button" onClick={() => removeArquivo(item.id, fIdx)} className="text-muted-foreground hover:text-destructive">
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </FormField>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          <SectionCard title="Observacao Geral da Execucao">
            <Textarea
              value={observacaoGeral}
              onChange={(e) => setObservacaoGeral(e.target.value)}
              rows={3}
              placeholder="Observacoes gerais da auditoria (opcional)..."
            />
          </SectionCard>

          <SectionCard title="Resumo e Acoes">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-md border border-border p-3">
                <p className="text-xs text-muted-foreground">Total de itens</p>
                <p className="text-xl font-bold">{itensAtivos.length}</p>
              </div>
              <div className="rounded-md border border-border p-3">
                <p className="text-xs text-muted-foreground">Respondidos</p>
                <p className="text-xl font-bold text-success">{respondidos}</p>
              </div>
              <div className="rounded-md border border-border p-3">
                <p className="text-xs text-muted-foreground">Pendentes</p>
                <p className="text-xl font-bold text-warning">{pendentes}</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => navigate("/inspecoes")}>Cancelar</Button>
              <Button variant="secondary" onClick={() => void handleSave("EM_ANDAMENTO")} disabled={saving} className="gap-2">
                <Save className="w-4 h-4" />
                {saving ? "Salvando..." : "Salvar Rascunho"}
              </Button>
              <Button onClick={() => void handleSave("CONCLUIDA")} disabled={saving} className="gap-2">
                <CheckCircle2 className="w-4 h-4" />
                {saving ? "Enviando..." : "Concluir Inspecao"}
              </Button>
            </div>
          </SectionCard>
        </>
      )}
    </div>
  );
};

export default NovaExecucaoPage;
