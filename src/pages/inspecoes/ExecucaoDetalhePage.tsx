import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ClipboardCheck, CheckCircle2, XCircle, MinusCircle, FileText, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionCard from "@/components/forms/SectionCard";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { getExecucaoInspecao } from "@/services/inspecoes";
import type { ExecucaoInspecao } from "@/types/inspecoes";
import { cn } from "@/lib/utils";

const resultIcon = (r: string) => {
  if (r === "CONFORME") return <CheckCircle2 className="w-4 h-4 text-success" />;
  if (r === "NAO_CONFORME") return <XCircle className="w-4 h-4 text-destructive" />;
  return <MinusCircle className="w-4 h-4 text-muted-foreground" />;
};

const ExecucaoDetalhePage = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [exec, setExec] = useState<ExecucaoInspecao | null>(null);

  useEffect(() => {
    if (!id) return;
    void (async () => {
      try { setExec(await getExecucaoInspecao(id)); }
      catch { toast({ title: "Erro", description: "Inspeção não encontrada.", variant: "destructive" }); }
    })();
  }, [id]);

  if (!exec) return <div className="p-8 text-center text-muted-foreground">Carregando inspeção...</div>;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon"><Link to="/inspecoes/historico"><ArrowLeft className="w-4 h-4" /></Link></Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-primary" />
            {exec.id}
          </h1>
          <p className="text-sm text-muted-foreground">{exec.modeloNome}</p>
        </div>
      </div>

      <SectionCard title="Resumo da Inspeção">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div><p className="text-xs text-muted-foreground">Setor</p><p className="font-medium">{exec.setor}</p></div>
          <div><p className="text-xs text-muted-foreground">Executor</p><p className="font-medium">{exec.executor}</p></div>
          <div><p className="text-xs text-muted-foreground">Data / Hora</p><p className="font-medium">{new Date(exec.dataHora).toLocaleString("pt-BR")}</p></div>
          <div><p className="text-xs text-muted-foreground">Status</p><Badge variant={exec.status === "CONCLUIDA" ? "default" : "secondary"}>{exec.status}</Badge></div>
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
            <p className="text-xs text-muted-foreground">Não Conformes</p>
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
            <p className="text-xs text-muted-foreground mb-1">Observação Geral</p>
            <p className="text-sm">{exec.observacaoGeral}</p>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Itens Inspecionados" description={`${exec.itens.length} item(ns)`}>
        <div className="space-y-3">
          {exec.itens.sort((a, b) => a.ordem - b.ordem).map((item) => (
            <div key={item.id} className={cn("rounded-lg border p-3", item.resultado === "NAO_CONFORME" ? "border-destructive/30 bg-destructive/5" : "border-border")}>
              <div className="flex items-center gap-3">
                {resultIcon(item.resultado)}
                <span className="flex-1 text-sm">{item.descricao}</span>
                <Badge variant={item.resultado === "CONFORME" ? "default" : item.resultado === "NAO_CONFORME" ? "destructive" : "secondary"}>
                  {item.resultado === "CONFORME" ? "Conforme" : item.resultado === "NAO_CONFORME" ? "Não Conforme" : "N/A"}
                </Badge>
              </div>
              {item.resultado === "NAO_CONFORME" && (
                <div className="ml-7 mt-2 space-y-1 text-xs">
                  {item.tipoNcNome && <p><span className="text-muted-foreground">Tipo NC:</span> {item.tipoNcNome}</p>}
                  {item.observacao && <p><span className="text-muted-foreground">Obs:</span> {item.observacao}</p>}
                  {item.evidencias && item.evidencias.length > 0 ? (
                    <div>
                      <span className="text-muted-foreground">Evidências ({item.evidencias.length}):</span>
                      <ul className="mt-0.5 space-y-0.5 ml-2">
                        {item.evidencias.map((ev, idx) => (
                          <li key={idx} className="flex items-center gap-1"><FileText className="w-3 h-3" />{ev}</li>
                        ))}
                      </ul>
                    </div>
                  ) : item.evidenciaNomeArquivo && (
                    <p className="flex items-center gap-1"><FileText className="w-3 h-3" /><span className="text-muted-foreground">Evidência:</span> {item.evidenciaNomeArquivo}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
};

export default ExecucaoDetalhePage;
