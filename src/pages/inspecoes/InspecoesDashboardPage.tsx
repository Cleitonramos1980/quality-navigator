import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardCheck, Plus, History, AlertTriangle, CheckCircle2, XCircle, BarChart3, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import KPICard from "@/components/KPICard";
import SectionCard from "@/components/forms/SectionCard";
import StatusBadge from "@/components/StatusBadge";
import { useToast } from "@/components/ui/use-toast";
import { listExecucoesInspecao } from "@/services/inspecoes";
import type { ExecucaoInspecao } from "@/types/inspecoes";

const InspecoesDashboardPage = () => {
  const { toast } = useToast();
  const [execucoes, setExecucoes] = useState<ExecucaoInspecao[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        setExecucoes(await listExecucoesInspecao());
      } catch (e) {
        toast({ title: "Erro", description: e instanceof Error ? e.message : "Falha ao carregar", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const total = execucoes.length;
  const concluidas = execucoes.filter((e) => e.status === "CONCLUIDA").length;
  const comNc = execucoes.filter((e) => e.naoConformes > 0).length;
  const pendentes = execucoes.filter((e) => e.status === "PENDENTE" || e.status === "EM_ANDAMENTO").length;
  const taxaMedia = total > 0 ? Math.round(execucoes.reduce((s, e) => s + e.taxaConformidade, 0) / total * 10) / 10 : 0;

  const setoresCriticos = execucoes
    .filter((e) => e.naoConformes > 0)
    .reduce<Record<string, number>>((acc, e) => {
      acc[e.setor] = (acc[e.setor] || 0) + e.naoConformes;
      return acc;
    }, {});

  const ultimasInspecoes = [...execucoes].sort((a, b) => b.dataHora.localeCompare(a.dataHora)).slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-primary" />
            Inspeções
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gestão de checklists operacionais, execuções e inspeções dimensionais
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/qualidade/inspecoes/historico"><History className="w-4 h-4 mr-1" />Histórico</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/qualidade/inspecoes/nova"><Plus className="w-4 h-4 mr-1" />Nova Inspeção</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KPICard title="Total no Período" value={total} icon={<BarChart3 className="w-5 h-5" />} />
        <KPICard title="Concluídas" value={concluidas} icon={<CheckCircle2 className="w-5 h-5" />} />
        <KPICard title="Com NC" value={comNc} icon={<XCircle className="w-5 h-5" />} variant={comNc > 0 ? "danger" : "default"} />
        <KPICard title="Pendentes" value={pendentes} icon={<AlertTriangle className="w-5 h-5" />} variant={pendentes > 0 ? "warning" : "default"} />
        <KPICard title="Taxa Conformidade" value={`${taxaMedia}%`} icon={<CheckCircle2 className="w-5 h-5" />} variant={taxaMedia >= 90 ? "success" : taxaMedia >= 70 ? "warning" : "danger"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Setores mais Críticos" description="Setores com mais não conformidades">
          {Object.keys(setoresCriticos).length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Nenhuma NC registrada no período.</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(setoresCriticos).sort((a, b) => b[1] - a[1]).map(([setor, qtd]) => (
                <div key={setor} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                  <span className="text-sm font-medium">{setor}</span>
                  <span className="text-sm font-bold text-destructive">{qtd} NC(s)</span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Últimas Inspeções" description={loading ? "Carregando..." : `${ultimasInspecoes.length} mais recentes`}>
          {ultimasInspecoes.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Nenhuma inspeção encontrada.</p>
          ) : (
            <div className="space-y-2">
              {ultimasInspecoes.map((insp) => (
                <Link key={insp.id} to={`/qualidade/inspecoes/${insp.id}`} className="flex items-center justify-between rounded-md border border-border px-3 py-2 hover:bg-muted/30 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{insp.modeloNome}</p>
                    <p className="text-xs text-muted-foreground">{insp.setor} · {insp.executor} · {new Date(insp.dataHora).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <span className={`text-xs font-mono font-bold ${insp.taxaConformidade >= 90 ? "text-success" : insp.taxaConformidade >= 70 ? "text-warning" : "text-destructive"}`}>
                      {insp.taxaConformidade}%
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Modelos de Inspeção</CardTitle></CardHeader>
          <CardContent><Button asChild variant="outline" size="sm" className="w-full"><Link to="/qualidade/inspecoes/modelos">Gerenciar Modelos</Link></Button></CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Tipos de NC</CardTitle></CardHeader>
          <CardContent><Button asChild variant="outline" size="sm" className="w-full"><Link to="/qualidade/inspecoes/tipos-nc">Gerenciar Tipos</Link></Button></CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Inspeção de Molas</CardTitle></CardHeader>
          <CardContent><Button asChild variant="outline" size="sm" className="w-full"><Link to="/qualidade/inspecoes/molas">Dashboard de Molas</Link></Button></CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Padrões de Molas</CardTitle></CardHeader>
          <CardContent><Button asChild variant="outline" size="sm" className="w-full"><Link to="/qualidade/inspecoes/molas/padroes">Gerenciar Padrões</Link></Button></CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InspecoesDashboardPage;
