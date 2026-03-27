import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ClipboardCheck, CheckCircle2, XCircle, MinusCircle, FileText, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionCard from "@/components/forms/SectionCard";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { getExecucaoInspecao } from "@/services/inspecoes";
import type { ExecucaoInspecao, ExecucaoInspecaoItem } from "@/types/inspecoes";
import { cn } from "@/lib/utils";
import { useSetoresPermitidos } from "@/hooks/useSetoresPermitidos";
import { hasSetorPermitido } from "@/lib/inspecoesChecklist";
import SetorEscopoAlert from "@/components/inspecoes/SetorEscopoAlert";

const resultIcon = (r: string) => {
  if (r === "CONFORME") return <CheckCircle2 className="w-4 h-4 text-success" />;
  if (r === "NAO_CONFORME") return <XCircle className="w-4 h-4 text-destructive" />;
  return <MinusCircle className="w-4 h-4 text-muted-foreground" />;
};

function resolveItemFormView(exec: ExecucaoInspecao, item: ExecucaoInspecaoItem) {
  return {
    timestamp: item.timestampResposta || exec.dataHora,
    usuario: item.usuario || exec.executorUsuarioId || "-",
    nome: item.nome || exec.executor || "-",
    setor: item.setor || exec.setor,
    codigoItem: item.item || item.codigoItem || `ITEM-${item.ordem}`,
    descricao: item.descricao,
    status: item.status || item.resultado,
    observacaoItem: item.observacaoItem || item.observacao || "-",
    fotoUrl: item.fotoUrl || item.evidenciaUrl || item.evidencias?.[0] || item.evidenciaNomeArquivo || "-",
  };
}

const ExecucaoDetalhePage = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { setoresPermitidos, loading: loadingSetores, error: setoresError } = useSetoresPermitidos();
  const [exec, setExec] = useState<ExecucaoInspecao | null>(null);
  const [foraDoEscopo, setForaDoEscopo] = useState(false);

  useEffect(() => {
    if (!id || loadingSetores || setoresError || setoresPermitidos.length === 0) return;
    void (async () => {
      try {
        const data = await getExecucaoInspecao(id);
        if (!hasSetorPermitido(setoresPermitidos, data.setor)) {
          setForaDoEscopo(true);
          setExec(null);
          toast({ title: "Acesso restrito", description: "Esta inspecao esta fora do seu escopo por setor.", variant: "destructive" });
          return;
        }
        setForaDoEscopo(false);
        setExec(data);
      } catch {
        toast({ title: "Erro", description: "Inspecao nao encontrada.", variant: "destructive" });
      }
    })();
  }, [id, loadingSetores, setoresError, setoresPermitidos, toast]);

  const itensOrdenados = useMemo(
    () => (exec?.itens ?? []).slice().sort((a, b) => a.ordem - b.ordem),
    [exec],
  );

  if (loadingSetores) {
    return <div className="p-8 text-center text-muted-foreground">Carregando inspecao...</div>;
  }

  if (setoresError || setoresPermitidos.length === 0) {
    return (
      <div className="max-w-3xl space-y-4 animate-fade-in">
        <SetorEscopoAlert loading={loadingSetores} error={setoresError} setoresPermitidos={setoresPermitidos} />
      </div>
    );
  }

  if (!exec && !foraDoEscopo) {
    return <div className="p-8 text-center text-muted-foreground">Carregando inspecao...</div>;
  }

  if (foraDoEscopo) {
    return <div className="p-8 text-center text-muted-foreground">Esta inspecao esta fora do seu escopo.</div>;
  }

  if (!exec) {
    return <div className="p-8 text-center text-muted-foreground">Inspecao nao encontrada.</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link to="/inspecoes/historico"><ArrowLeft className="w-4 h-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-primary" />
            {exec.id}
          </h1>
          <p className="text-sm text-muted-foreground">{exec.modeloNome}</p>
        </div>
      </div>

      <SectionCard title="Resumo da Execucao">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div><p className="text-xs text-muted-foreground">Setor</p><p className="font-medium">{exec.setor}</p></div>
          <div><p className="text-xs text-muted-foreground">Usuario</p><p className="font-medium">{exec.executorUsuarioId || "-"}</p></div>
          <div><p className="text-xs text-muted-foreground">Nome</p><p className="font-medium">{exec.executor}</p></div>
          <div><p className="text-xs text-muted-foreground">Data/Hora</p><p className="font-medium">{new Date(exec.dataHora).toLocaleString("pt-BR")}</p></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-4 mt-4 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-2xl font-bold">{exec.totalItens}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-success">{exec.conformes}</p>
            <p className="text-xs text-muted-foreground">Conformes</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-destructive">{exec.naoConformes}</p>
            <p className="text-xs text-muted-foreground">Nao conformes</p>
          </div>
          <div className="text-center">
            <p className={cn("text-2xl font-bold", exec.taxaConformidade >= 90 ? "text-success" : exec.taxaConformidade >= 70 ? "text-warning" : "text-destructive")}>
              {exec.taxaConformidade}%
            </p>
            <p className="text-xs text-muted-foreground">Conformidade</p>
          </div>
        </div>
        {exec.observacaoGeral && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1">Observacao geral</p>
            <p className="text-sm">{exec.observacaoGeral}</p>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Formulario Respondido por Item" description={`${itensOrdenados.length} item(ns)`}>
        <div className="space-y-4">
          {itensOrdenados.map((item) => {
            const view = resolveItemFormView(exec, item);
            return (
              <div
                key={item.id}
                className={cn("rounded-lg border p-4", view.status === "NAO_CONFORME" ? "border-destructive/30 bg-destructive/5" : "border-border")}
              >
                <div className="flex items-center gap-3">
                  {resultIcon(view.status)}
                  <span className="font-mono text-xs rounded-md border border-border px-2 py-0.5">{view.codigoItem}</span>
                  <Badge variant={view.status === "CONFORME" ? "default" : view.status === "NAO_CONFORME" ? "destructive" : "secondary"}>
                    {view.status}
                  </Badge>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mt-3 text-sm">
                  <div><p className="text-xs text-muted-foreground">Timestamp</p><p>{new Date(view.timestamp).toLocaleString("pt-BR")}</p></div>
                  <div><p className="text-xs text-muted-foreground">Usuario</p><p>{view.usuario}</p></div>
                  <div><p className="text-xs text-muted-foreground">Nome</p><p>{view.nome}</p></div>
                  <div><p className="text-xs text-muted-foreground">Setor</p><p>{view.setor}</p></div>
                  <div className="sm:col-span-2"><p className="text-xs text-muted-foreground">Descricao</p><p>{view.descricao}</p></div>
                  <div><p className="text-xs text-muted-foreground">Status</p><p>{view.status}</p></div>
                  <div className="sm:col-span-2"><p className="text-xs text-muted-foreground">ObservacaoItem</p><p>{view.observacaoItem}</p></div>
                  <div className="sm:col-span-2"><p className="text-xs text-muted-foreground">FotoURL</p><p className="break-all">{view.fotoUrl}</p></div>
                </div>

                {(item.evidencias?.length || item.evidenciaNomeArquivo) && (
                  <div className="mt-3 pt-3 border-t border-border/70 text-xs">
                    <p className="text-muted-foreground mb-1">Evidencias</p>
                    {item.evidencias && item.evidencias.length > 0 ? (
                      <ul className="space-y-1">
                        {item.evidencias.map((ev, idx) => (
                          <li key={idx} className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            <span className="break-all">{ev}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {item.evidenciaNomeArquivo}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
};

export default ExecucaoDetalhePage;
