import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Activity, Plus, History, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import KPICard from "@/components/KPICard";
import SectionCard from "@/components/forms/SectionCard";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { listInspecoesMola } from "@/services/inspecoes";
import type { InspecaoMola } from "@/types/inspecoes";
import { MAQUINAS_MOLA } from "@/types/inspecoes";
import { cn } from "@/lib/utils";

const MolasDashboardPage = () => {
  const { toast } = useToast();
  const [inspecoes, setInspecoes] = useState<InspecaoMola[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try { setInspecoes(await listInspecoesMola()); }
      catch (e) { toast({ title: "Erro", description: e instanceof Error ? e.message : "Falha", variant: "destructive" }); }
      finally { setLoading(false); }
    })();
  }, []);

  const total = inspecoes.length;
  const aprovadas = inspecoes.filter((i) => i.resultado === "APROVADO").length;
  const reprovadas = inspecoes.filter((i) => i.resultado === "REPROVADO").length;
  const forapadrao = inspecoes.reduce((s, i) => s + i.medicoes.filter((m) => !m.conforme).length, 0);

  const maquinaStatus = MAQUINAS_MOLA.map((maq) => {
    const last = inspecoes.filter((i) => i.maquina === maq).sort((a, b) => b.dataHora.localeCompare(a.dataHora))[0];
    return { maquina: maq, ultimaInspecao: last, status: last ? last.resultado : "SEM_DADOS" };
  });

  const ultimas = [...inspecoes].sort((a, b) => b.dataHora.localeCompare(a.dataHora)).slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            Inspeção de Molas
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Dashboard dimensional — controle de molas ensacadas</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm"><Link to="/inspecoes/molas/historico"><History className="w-4 h-4 mr-1" />Histórico</Link></Button>
          <Button asChild size="sm"><Link to="/inspecoes/molas/nova"><Plus className="w-4 h-4 mr-1" />Nova Inspeção</Link></Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Total Inspeções" value={total} icon={<Activity className="w-5 h-5" />} />
        <KPICard title="Aprovadas" value={aprovadas} icon={<CheckCircle2 className="w-5 h-5" />} />
        <KPICard title="Reprovadas" value={reprovadas} icon={<XCircle className="w-5 h-5" />} />
        <KPICard title="Itens Fora Padrão" value={forapadrao} icon={<AlertTriangle className="w-5 h-5" />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Status das Máquinas" description="Última inspeção por máquina">
          <div className="grid gap-2 sm:grid-cols-2">
            {maquinaStatus.map(({ maquina, ultimaInspecao, status }) => (
              <div key={maquina} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                <div>
                  <p className="font-medium text-sm">{maquina}</p>
                  {ultimaInspecao && <p className="text-xs text-muted-foreground">{new Date(ultimaInspecao.dataHora).toLocaleDateString("pt-BR")}</p>}
                </div>
                <Badge variant={status === "APROVADO" ? "default" : status === "REPROVADO" ? "destructive" : status === "PARADA_REGISTRADA" ? "secondary" : "secondary"}>
                  {status === "SEM_DADOS" ? "Sem dados" : status === "PARADA_REGISTRADA" ? "Parada" : status}
                </Badge>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Últimas Inspeções" description={loading ? "Carregando..." : `${ultimas.length} mais recentes`}>
          {ultimas.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Nenhuma inspeção de molas encontrada.</p>
          ) : (
            <div className="space-y-2">
              {ultimas.map((insp) => (
                <Link key={insp.id} to={`/inspecoes/molas/${insp.id}`} className="flex items-center justify-between rounded-md border border-border px-3 py-2 hover:bg-muted/30 transition-colors">
                  <div>
                    <p className="text-sm font-medium">{insp.maquina} — {insp.alturaTipo}</p>
                    <p className="text-xs text-muted-foreground">{insp.operador} · {new Date(insp.dataHora).toLocaleString("pt-BR")}</p>
                  </div>
                  <Badge variant={insp.resultado === "APROVADO" ? "default" : "destructive"}>{insp.resultado}</Badge>
                </Link>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <div className="flex gap-3">
        <Button asChild variant="outline" size="sm"><Link to="/inspecoes/molas/padroes">Gerenciar Padrões de Molas</Link></Button>
      </div>
    </div>
  );
};

export default MolasDashboardPage;
