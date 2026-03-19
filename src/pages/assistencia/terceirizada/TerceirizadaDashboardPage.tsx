import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Wrench, Package, ArrowRight, AlertTriangle, TrendingUp, Building2, RotateCcw, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getDashboardTerceirizada, listarItensEmAssistencia, listarMovimentacoes } from "@/services/assistenciaTerceirizada";
import { ITEM_ASSISTENCIA_STATUS_LABELS, ITEM_ASSISTENCIA_STATUS_COLORS, TIPO_MOVIMENTACAO_LABELS, TIPO_MOVIMENTACAO_COLORS } from "@/types/assistenciaTerceirizada";
import type { ItemEmAssistencia, MovimentacaoAssistencia } from "@/types/assistenciaTerceirizada";

function diffDays(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

const TerceirizadaDashboardPage = () => {
  const navigate = useNavigate();
  const [counters, setCounters] = useState<Awaited<ReturnType<typeof getDashboardTerceirizada>> | null>(null);
  const [itens, setItens] = useState<ItemEmAssistencia[]>([]);
  const [movs, setMovs] = useState<MovimentacaoAssistencia[]>([]);

  useEffect(() => {
    getDashboardTerceirizada().then(setCounters);
    listarItensEmAssistencia().then(setItens);
    listarMovimentacoes().then(setMovs);
  }, []);

  if (!counters) return null;

  const emPoder = itens.filter((i) => !["DEVOLVIDO", "ENCERRADO"].includes(i.status));
  const atrasados = emPoder.filter((i) => diffDays(i.dataEnvio) > 15);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Estoque em Poder da Assistência</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Controle de peças e equipamentos enviados a assistências técnicas</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate("/assistencia/terceirizada/enviar")} className="gap-2">
            <Send className="w-4 h-4" /> Enviar para Assistência
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {[
          { label: "Assistências Ativas", value: counters.totalAssistencias, icon: Building2, color: "text-primary" },
          { label: "Peças em Poder", value: counters.totalPecasEmPoder, icon: Package, color: "text-info" },
          { label: "Equipamentos em Poder", value: counters.totalEquipamentosEmPoder, icon: Wrench, color: "text-warning" },
          { label: "Envios no Período", value: counters.enviosNoPeriodo, icon: Send, color: "text-info" },
          { label: "Retornos no Período", value: counters.retornosNoPeriodo, icon: RotateCcw, color: "text-success" },
          { label: "Sem Retorno >15d", value: counters.itensSemRetornoMaisDias, icon: AlertTriangle, color: "text-destructive" },
          { label: "Maior Volume", value: counters.assistenciaMaiorVolume, icon: TrendingUp, color: "text-primary", isText: true },
        ].map((kpi) => (
          <Card key={kpi.label} className="glass-card">
            <CardContent className="pt-4 pb-3 px-4">
              <kpi.icon className={`w-5 h-5 ${kpi.color} mb-1`} />
              <div className={`${(kpi as any).isText ? "text-sm" : "text-2xl"} font-bold text-foreground`}>{kpi.value}</div>
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Itens em atraso */}
        <Card className="glass-card">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" /> Itens sem retorno há mais de 15 dias
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Código</TableHead>
                  <TableHead className="text-xs">Descrição</TableHead>
                  <TableHead className="text-xs">Assistência</TableHead>
                  <TableHead className="text-xs">Dias</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {atrasados.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground text-xs py-6">Nenhum item em atraso</TableCell></TableRow>
                ) : atrasados.slice(0, 5).map((item) => (
                  <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/assistencia/terceirizada/itens/${item.id}`)}>
                    <TableCell className="font-mono text-xs">{item.codigoItem}</TableCell>
                    <TableCell className="text-xs">{item.descricao}</TableCell>
                    <TableCell className="text-xs">{item.assistenciaNome}</TableCell>
                    <TableCell className="text-xs font-bold text-destructive">{diffDays(item.dataEnvio)}d</TableCell>
                    <TableCell><Badge className={`text-[10px] ${ITEM_ASSISTENCIA_STATUS_COLORS[item.status]}`}>{ITEM_ASSISTENCIA_STATUS_LABELS[item.status]}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Últimas Movimentações */}
        <Card className="glass-card">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Últimas Movimentações</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/assistencia/terceirizada/movimentacoes")} className="text-xs gap-1">
              Ver todas <ArrowRight className="w-3 h-3" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Data</TableHead>
                  <TableHead className="text-xs">Tipo</TableHead>
                  <TableHead className="text-xs">Item</TableHead>
                  <TableHead className="text-xs">Assistência</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movs.slice(0, 6).map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="text-xs text-muted-foreground">{new Date(m.dataHora).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell><Badge className={`text-[10px] ${TIPO_MOVIMENTACAO_COLORS[m.tipoMovimentacao]}`}>{TIPO_MOVIMENTACAO_LABELS[m.tipoMovimentacao]}</Badge></TableCell>
                    <TableCell className="text-xs">{m.descricaoItem}</TableCell>
                    <TableCell className="text-xs">{m.assistenciaNome}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Assistências Técnicas", path: "/assistencia/terceirizada/cadastro", icon: Building2 },
          { label: "Estoque em Poder", path: "/assistencia/terceirizada/estoque", icon: Package },
          { label: "Movimentações", path: "/assistencia/terceirizada/movimentacoes", icon: RotateCcw },
          { label: "Retorno da Assistência", path: "/assistencia/terceirizada/retorno", icon: RotateCcw },
        ].map((link) => (
          <Card key={link.path} className="glass-card hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => navigate(link.path)}>
            <CardContent className="pt-4 pb-3 px-4 flex items-center gap-3">
              <link.icon className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-foreground">{link.label}</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TerceirizadaDashboardPage;
