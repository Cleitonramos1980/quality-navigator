import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import InventoryStatusPill from "@/components/inventario/InventoryStatusPill";
import ExportActionsBar from "@/components/inventario/ExportActionsBar";
import { mockContagens } from "@/data/mockInventarioData";
import { FREQUENCIA_LABELS } from "@/types/inventario";
import type { ItemContagem } from "@/types/inventario";
import { toast } from "@/hooks/use-toast";

const DigitacaoInventarioPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const contagem = mockContagens.find((c) => c.id === id) || mockContagens[0];
  const [itens, setItens] = useState<ItemContagem[]>(contagem.itens);

  const updateItem = (idx: number, field: keyof ItemContagem, value: any) => {
    setItens((prev) => {
      const copy = [...prev];
      const item = { ...copy[idx], [field]: value };
      if (field === "quantidadeContada") {
        const qtd = Number(value);
        item.quantidadeContada = isNaN(qtd) ? null : qtd;
        item.diferenca = item.quantidadeContada !== null ? item.quantidadeContada - item.estoqueSistema : null;
      }
      copy[idx] = item;
      return copy;
    });
  };

  const handleSalvar = () => {
    toast({ title: "Salvo parcialmente", description: "A contagem foi salva. Você pode continuar depois." });
  };

  const handleConcluir = () => {
    toast({ title: "Contagem concluída", description: "Enviada para validação do supervisor." });
    navigate("/qualidade/inventario/contagens");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Digitação de Inventário</h1>
          <p className="text-sm text-muted-foreground">{contagem.numero}</p>
        </div>
        <ExportActionsBar />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm font-medium">Cabeçalho da Contagem</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 text-sm">
            <div><span className="text-muted-foreground text-xs block">Loja</span><span className="font-medium">{contagem.lojaNome}</span></div>
            <div><span className="text-muted-foreground text-xs block">Regional</span><span className="font-medium">{contagem.regional}</span></div>
            <div><span className="text-muted-foreground text-xs block">Gerente</span><span className="font-medium">{contagem.gerente}</span></div>
            <div><span className="text-muted-foreground text-xs block">Supervisor</span><span className="font-medium text-primary">{contagem.supervisor}</span></div>
            <div><span className="text-muted-foreground text-xs block">Data</span><span className="font-medium font-mono">{contagem.data}</span></div>
            <div><span className="text-muted-foreground text-xs block">Departamento</span><span className="font-medium">{contagem.departamentoNome}</span></div>
            <div><span className="text-muted-foreground text-xs block">Frequência</span><span className="font-medium">{FREQUENCIA_LABELS[contagem.frequencia]}</span></div>
            <div><span className="text-muted-foreground text-xs block">Responsável</span><span className="font-medium">{contagem.responsavel}</span></div>
            <div><span className="text-muted-foreground text-xs block">Status</span><InventoryStatusPill status={contagem.status} /></div>
          </div>
        </CardContent>
      </Card>

      <div className="glass-card rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left p-3 font-medium text-muted-foreground">Código</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Cód. Barras</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Descrição</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Est. Sistema</th>
                <th className="text-right p-3 font-medium text-muted-foreground w-28">Qtd Contada</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Diferença</th>
                <th className="text-left p-3 font-medium text-muted-foreground w-40">Motivo Divergência</th>
                <th className="text-left p-3 font-medium text-muted-foreground w-40">Observação</th>
              </tr>
            </thead>
            <tbody>
              {itens.map((item, idx) => (
                <tr key={item.id} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="p-3 font-mono text-xs">{item.codigoItem}</td>
                  <td className="p-3 font-mono text-xs">{item.codigoBarras}</td>
                  <td className="p-3">{item.descricao}</td>
                  <td className="p-3 text-right font-medium">{item.estoqueSistema}</td>
                  <td className="p-3">
                    <Input
                      type="number"
                      value={item.quantidadeContada ?? ""}
                      onChange={(e) => updateItem(idx, "quantidadeContada", e.target.value)}
                      className="h-8 text-right w-full"
                    />
                  </td>
                  <td className="p-3 text-right font-medium">
                    {item.diferenca !== null ? (
                      <span className={item.diferenca !== 0 ? "text-destructive font-bold" : "text-success"}>{item.diferenca > 0 ? `+${item.diferenca}` : item.diferenca}</span>
                    ) : "—"}
                  </td>
                  <td className="p-3">
                    <Input
                      value={item.motivoDivergencia || ""}
                      onChange={(e) => updateItem(idx, "motivoDivergencia", e.target.value)}
                      className="h-8 text-xs"
                      placeholder="—"
                    />
                  </td>
                  <td className="p-3">
                    <Input
                      value={item.observacao || ""}
                      onChange={(e) => updateItem(idx, "observacao", e.target.value)}
                      className="h-8 text-xs"
                      placeholder="—"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate(-1)}>Voltar</Button>
        <Button variant="secondary" onClick={handleSalvar}><Save className="h-4 w-4 mr-1" /> Salvar Parcial</Button>
        <Button onClick={handleConcluir}><CheckCircle className="h-4 w-4 mr-1" /> Concluir Contagem</Button>
      </div>
    </div>
  );
};

export default DigitacaoInventarioPage;
