import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck, RotateCcw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import InventoryStatusPill from "@/components/inventario/InventoryStatusPill";
import ExportActionsBar from "@/components/inventario/ExportActionsBar";
import { mockContagens } from "@/data/mockInventarioData";
import { FREQUENCIA_LABELS } from "@/types/inventario";
import { toast } from "@/hooks/use-toast";

const ValidacaoInventarioPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const contagem = mockContagens.find((c) => c.id === id) || mockContagens.find((c) => c.status === "CONCLUIDO") || mockContagens[0];
  const divergentes = contagem.itens.filter((i) => i.diferenca !== null && i.diferenca !== 0);

  const handleValidar = () => {
    toast({ title: "Contagem validada", description: `${contagem.numero} validada com sucesso.` });
    navigate("/qualidade/inventario/contagens");
  };

  const handleReabrir = () => {
    toast({ title: "Contagem reaberta", description: "O responsável será notificado." });
  };

  const handleRecontagem = () => {
    toast({ title: "Recontagem solicitada", description: "Uma nova contagem será criada a partir desta." });
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
      },
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Validação de Contagem</h1>
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
              <div><span className="text-muted-foreground text-xs block">Frequência</span><span className="font-medium">{FREQUENCIA_LABELS[contagem.frequencia]}</span></div>
              <div><span className="text-muted-foreground text-xs block">Responsável</span><span className="font-medium">{contagem.responsavel}</span></div>
              <div><span className="text-muted-foreground text-xs block">Status</span><InventoryStatusPill status={contagem.status} /></div>
              <div><span className="text-muted-foreground text-xs block">Início</span><span className="font-mono text-xs">{contagem.iniciadoEm || "—"}</span></div>
              <div><span className="text-muted-foreground text-xs block">Conclusão</span><span className="font-mono text-xs">{contagem.concluidoEm || "—"}</span></div>
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
                <AlertTriangle className="h-3.5 w-3.5" /> Esta é uma recontagem (origem: {contagem.recontagemOrigem})
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {divergentes.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium text-destructive">Itens com Divergência ({divergentes.length})</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-2 text-muted-foreground text-xs">Código</th>
                    <th className="text-left p-2 text-muted-foreground text-xs">Descrição</th>
                    <th className="text-right p-2 text-muted-foreground text-xs">Sistema</th>
                    <th className="text-right p-2 text-muted-foreground text-xs">Contado</th>
                    <th className="text-right p-2 text-muted-foreground text-xs">Diferença</th>
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
                      <td className="p-2 text-xs">{item.motivoDivergencia || "—"}</td>
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
