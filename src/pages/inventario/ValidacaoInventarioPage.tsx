import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, ShieldCheck, RotateCcw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import InventoryStatusPill from "@/components/inventario/InventoryStatusPill";
import ExportActionsBar from "@/components/inventario/ExportActionsBar";
import { getContagens } from "@/services/inventario";
import type { Contagem } from "@/types/inventario";
import { FREQUENCIA_LABELS } from "@/types/inventario";
import { toast } from "@/hooks/use-toast";
import { useToast } from "@/components/ui/use-toast";

const ValidacaoInventarioPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [allContagens, setAllContagens] = useState<Contagem[]>([]);
  useEffect(() => { getContagens().then(setAllContagens).catch((error) => { const message = error instanceof Error ? error.message : "Falha ao carregar dados."; toast({ title: "Erro ao carregar dados", description: message, variant: "destructive" }); }); }, []);
  const contagem = allContagens.find((c) => c.id === id) || allContagens.find((c) => c.status === "CONCLUIDO") || allContagens[0];
  if (!contagem) return <div className="p-8 text-center text-muted-foreground">Carregando...</div>;
  const divergentes = contagem.itens.filter((i) => i.diferenca !== null && i.diferenca !== 0);

  const handleValidar = () => {
    toast({ title: "Contagem validada", description: `${contagem.numero} validada com sucesso.` });
    navigate("/qualidade/inventario/contagens");
  };

  const handleReabrir = () => {
    toast({ title: "Contagem reaberta", description: "O responsÃ¡vel serÃ¡ notificado." });
  };

  const handleRecontagem = () => {
    toast({ title: "Recontagem solicitada", description: "Uma nova contagem serÃ¡ criada a partir desta." });
    navigate("/qualidade/inventario/digitacao", {
      state: {
        recontagem: true,
        recontagemOrigem: contagem.numero,
        lojaId: contagem.lojaId,
        lojaNome: contagem.lojaNome,
        departamentoId: contagem.departamentoId,
        departamentoNome: contagem.departamentoNome,
        frequencia: contagem.frequencia,
        responsavel: contagem.responsavel,
      supervisor: contagem.supervisor,
      solicitadoPor: contagem.supervisor,
    },
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">ValidaÃ§Ã£o de Contagem</h1>
          <p className="text-sm text-muted-foreground">{contagem.numero}</p>
        </div>
        <ExportActionsBar />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">Resumo da Contagem</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><span className="text-muted-foreground text-xs block">Loja</span><span className="font-medium">{contagem.lojaNome}</span></div>
              <div><span className="text-muted-foreground text-xs block">Supervisor</span><span className="font-medium text-primary">{contagem.supervisor}</span></div>
              <div><span className="text-muted-foreground text-xs block">Departamento</span><span className="font-medium">{contagem.departamentoNome}</span></div>
              <div><span className="text-muted-foreground text-xs block">FrequÃªncia</span><span className="font-medium">{FREQUENCIA_LABELS[contagem.frequencia]}</span></div>
              <div><span className="text-muted-foreground text-xs block">ResponsÃ¡vel</span><span className="font-medium">{contagem.responsavel}</span></div>
              <div><span className="text-muted-foreground text-xs block">Status</span><InventoryStatusPill status={contagem.status} /></div>
              <div><span className="text-muted-foreground text-xs block">InÃ­cio</span><span className="font-mono text-xs">{contagem.iniciadoEm || "â€”"}</span></div>
              <div><span className="text-muted-foreground text-xs block">ConclusÃ£o</span><span className="font-mono text-xs">{contagem.concluidoEm || "â€”"}</span></div>
            </div>
            {contagem.validadoPor && (
              <div className="pt-2 border-t border-border">
                <span className="text-muted-foreground text-xs block">Validado por</span>
                <span className="font-medium">{contagem.validadoPor} em {contagem.validadoEm}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">Indicadores</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <div className="text-2xl font-bold text-foreground">{contagem.itensContados}</div>
                <div className="text-xs text-muted-foreground">Itens Contados</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <div className="text-2xl font-bold text-destructive">{contagem.itensDivergentes}</div>
                <div className="text-xs text-muted-foreground">Divergentes</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center col-span-2">
                <div className="text-3xl font-bold text-foreground">{contagem.acuracidade}%</div>
                <div className="text-xs text-muted-foreground">Acuracidade</div>
              </div>
            </div>
            {contagem.recontagem && (
              <div className="mt-3 p-2 rounded bg-warning/10 text-warning text-xs flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5" /> Esta Ã© uma recontagem (origem: {contagem.recontagemOrigem})
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {divergentes.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium text-destructive">Itens com DivergÃªncia ({divergentes.length})</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-2 text-muted-foreground text-xs">CÃ³digo</th>
                    <th className="text-left p-2 text-muted-foreground text-xs">DescriÃ§Ã£o</th>
                    <th className="text-right p-2 text-muted-foreground text-xs">Sistema</th>
                    <th className="text-right p-2 text-muted-foreground text-xs">Contado</th>
                    <th className="text-right p-2 text-muted-foreground text-xs">DiferenÃ§a</th>
                    <th className="text-left p-2 text-muted-foreground text-xs">Motivo</th>
                  </tr>
                </thead>
                <tbody>
                  {divergentes.map((item) => (
                    <tr key={item.id} className="border-b border-border/50">
                      <td className="p-2 font-mono text-xs">{item.codigoItem}</td>
                      <td className="p-2">{item.descricao}</td>
                      <td className="p-2 text-right">{item.estoqueSistema}</td>
                      <td className="p-2 text-right">{item.quantidadeContada}</td>
                      <td className="p-2 text-right font-bold text-destructive">{item.diferenca! > 0 ? `+${item.diferenca}` : item.diferenca}</td>
                      <td className="p-2 text-xs">{item.motivoDivergencia || "â€”"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate(-1)}>Voltar</Button>
        <Button variant="secondary" onClick={handleReabrir}><RotateCcw className="h-4 w-4 mr-1" /> Reabrir</Button>
        {divergentes.length > 0 && (
          <Button variant="secondary" onClick={handleRecontagem}><AlertTriangle className="h-4 w-4 mr-1" /> Solicitar Recontagem</Button>
        )}
        <Button onClick={handleValidar}><ShieldCheck className="h-4 w-4 mr-1" /> Validar Contagem</Button>
      </div>
    </div>
  );
};

export default ValidacaoInventarioPage;

