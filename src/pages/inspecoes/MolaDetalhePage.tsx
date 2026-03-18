import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Ruler, ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionCard from "@/components/forms/SectionCard";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { getInspecaoMola } from "@/services/inspecoes";
import type { InspecaoMola } from "@/types/inspecoes";
import { cn } from "@/lib/utils";

const MolaDetalhePage = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [insp, setInsp] = useState<InspecaoMola | null>(null);

  useEffect(() => {
    if (!id) return;
    void (async () => {
      try { setInsp(await getInspecaoMola(id)); }
      catch { toast({ title: "Erro", description: "Inspeção não encontrada.", variant: "destructive" }); }
    })();
  }, [id]);

  if (!insp) return <div className="p-8 text-center text-muted-foreground">Carregando...</div>;

  const foraQtd = insp.medicoes.filter((m) => !m.conforme).length;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon"><Link to="/inspecoes/molas/historico"><ArrowLeft className="w-4 h-4" /></Link></Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Ruler className="w-6 h-6 text-primary" />
            {insp.id}
          </h1>
          <p className="text-sm text-muted-foreground">Inspeção de Molas — {insp.maquina}</p>
        </div>
      </div>

      <SectionCard title="Dados da Inspeção">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div><p className="text-xs text-muted-foreground">Máquina</p><p className="font-medium">{insp.maquina}</p></div>
          <div><p className="text-xs text-muted-foreground">Status Máquina</p><p className="font-medium">{insp.statusMaquina}</p></div>
          <div><p className="text-xs text-muted-foreground">Altura / Tipo</p><p className="font-medium">{insp.alturaTipo || "—"}</p></div>
          <div><p className="text-xs text-muted-foreground">Linha / Pocket</p><p className="font-medium">{insp.linhaPocket || "—"}</p></div>
          <div><p className="text-xs text-muted-foreground">Operador</p><p className="font-medium">{insp.operador}</p></div>
          <div><p className="text-xs text-muted-foreground">Data / Hora</p><p className="font-medium">{new Date(insp.dataHora).toLocaleString("pt-BR")}</p></div>
          <div><p className="text-xs text-muted-foreground">Resultado</p><Badge variant={insp.resultado === "APROVADO" ? "default" : insp.resultado === "PARADA_REGISTRADA" ? "secondary" : "destructive"}>{insp.resultado === "PARADA_REGISTRADA" ? "Parada Registrada" : insp.resultado}</Badge></div>
          {insp.resultado !== "PARADA_REGISTRADA" && <div><p className="text-xs text-muted-foreground">Itens Fora Padrão</p><p className="font-bold text-destructive">{foraQtd}</p></div>}
        </div>
        {insp.motivoParada && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1">Motivo da Parada</p>
            <p className="text-sm">{insp.motivoParada}</p>
          </div>
        )}
        {insp.observacaoGeral && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1">Observação</p>
            <p className="text-sm">{insp.observacaoGeral}</p>
          </div>
        )}
      </SectionCard>

      {insp.medicoes.length > 0 && (
        <SectionCard title="Medições Registradas" description={`${insp.medicoes.length} item(ns)`}>
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
                {insp.medicoes.map((m) => (
                  <tr key={m.id} className={cn("border-b border-border/60", !m.conforme ? "bg-destructive/5" : "")}>
                    <td className="px-3 py-2 font-medium">{m.item}</td>
                    <td className="px-3 py-2 text-muted-foreground">{m.descricao}</td>
                    <td className="px-3 py-2 text-center font-mono">{m.padrao}</td>
                    <td className="px-3 py-2 text-center font-mono">{m.minimo}</td>
                    <td className="px-3 py-2 text-center font-mono">{m.maximo}</td>
                    <td className="px-3 py-2 text-center">{m.unidade}</td>
                    <td className={cn("px-3 py-2 text-center font-mono font-bold", !m.conforme ? "text-destructive" : "text-success")}>{m.valorMedido}</td>
                    <td className="px-3 py-2 text-center">
                      {m.conforme ? <CheckCircle2 className="w-4 h-4 text-success inline" /> : <XCircle className="w-4 h-4 text-destructive inline" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}
    </div>
  );
};

export default MolaDetalhePage;
