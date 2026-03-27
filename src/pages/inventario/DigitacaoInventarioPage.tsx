import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Save, CheckCircle, AlertTriangle, GitCompare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InventoryStatusPill from "@/components/inventario/InventoryStatusPill";
import ExportActionsBar from "@/components/inventario/ExportActionsBar";
import { getContagens } from "@/services/inventario";
import { FREQUENCIA_LABELS } from "@/types/inventario";
import type { ItemContagem, Contagem } from "@/types/inventario";
import { toast } from "@/hooks/use-toast";
import { useToast } from "@/components/ui/use-toast";

interface RecontagemState {
  recontagem: boolean;
  recontagemOrigem: string;
  lojaId: string;
  lojaNome: string;
  departamentoId: string;
  departamentoNome: string;
  frequencia: "DIARIA" | "SEMANAL" | "QUINZENAL" | "MENSAL";
  responsavel: string;
  supervisor: string;
  solicitadoPor?: string;
}

const DigitacaoInventarioPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();
  const recontagemState = location.state as RecontagemState | null;
  const isRecontagem = recontagemState?.recontagem === true;

  const [allContagens, setAllContagens] = useState<Contagem[]>([]);
  useEffect(() => { getContagens().then(setAllContagens).catch((error) => { const message = error instanceof Error ? error.message : "Falha ao carregar dados."; toast({ title: "Erro ao carregar dados", description: message, variant: "destructive" }); }); }, []);

  // Find original contagem (for recontagem, find by numero)
  const contagemOriginal = isRecontagem
    ? allContagens.find((c) => c.numero === recontagemState.recontagemOrigem) || null
    : null;

  // Current contagem: either from route param or the first
  const contagem = allContagens.find((c) => c.id === id) || allContagens[0];

  // For recontagem, use items from original but reset quantidadeContada
  const initialItens: ItemContagem[] = isRecontagem && contagemOriginal
    ? contagemOriginal.itens.map((item) => ({
        ...item,
        quantidadeContada: null,
        diferenca: null,
        motivoDivergencia: undefined,
        observacao: undefined,
      }))
    : contagem?.itens ?? [];

  const [itens, setItens] = useState<ItemContagem[]>(initialItens);

  // Sync itens when contagem loads asynchronously
  useEffect(() => {
    if (!isRecontagem && contagem?.itens && itens.length === 0) {
      setItens(contagem.itens);
    }
  }, [contagem]);

  const headerData = isRecontagem && recontagemState
    ? {
        numero: `REC-${recontagemState.recontagemOrigem}`,
        lojaNome: recontagemState.lojaNome,
        regional: contagemOriginal?.regional || "â€”",
        gerente: contagemOriginal?.gerente || "â€”",
        supervisor: recontagemState.supervisor,
        data: new Date().toISOString().split("T")[0],
        departamentoNome: recontagemState.departamentoNome,
        frequencia: recontagemState.frequencia,
        responsavel: recontagemState.responsavel,
      }
    : contagem;

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
    toast({ title: "Salvo parcialmente", description: "A contagem foi salva. VocÃª pode continuar depois." });
  };

  const handleConcluir = () => {
    toast({ title: isRecontagem ? "Recontagem concluÃ­da" : "Contagem concluÃ­da", description: "Enviada para validaÃ§Ã£o do supervisor." });
    navigate("/qualidade/inventario/contagens");
  };

  const renderItemsTable = (items: ItemContagem[], editable: boolean) => (
    <div className="glass-card rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left p-3 font-medium text-muted-foreground">CÃ³digo</th>
              <th className="text-left p-3 font-medium text-muted-foreground">CÃ³d. Barras</th>
              <th className="text-left p-3 font-medium text-muted-foreground">DescriÃ§Ã£o</th>
              <th className="text-right p-3 font-medium text-muted-foreground">Est. Sistema</th>
              <th className="text-right p-3 font-medium text-muted-foreground w-28">Qtd Contada</th>
              <th className="text-right p-3 font-medium text-muted-foreground">DiferenÃ§a</th>
              <th className="text-left p-3 font-medium text-muted-foreground w-40">Motivo DivergÃªncia</th>
              <th className="text-left p-3 font-medium text-muted-foreground w-40">ObservaÃ§Ã£o</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item.id} className="border-b border-border/50 hover:bg-muted/20">
                <td className="p-3 font-mono text-xs">{item.codigoItem}</td>
                <td className="p-3 font-mono text-xs">{item.codigoBarras}</td>
                <td className="p-3">{item.descricao}</td>
                <td className="p-3 text-right font-medium">{item.estoqueSistema}</td>
                <td className="p-3">
                  {editable ? (
                    <Input
                      type="number"
                      value={item.quantidadeContada ?? ""}
                      onChange={(e) => updateItem(idx, "quantidadeContada", e.target.value)}
                      className="h-8 text-right w-full"
                    />
                  ) : (
                    <span className="block text-right font-medium">{item.quantidadeContada ?? "â€”"}</span>
                  )}
                </td>
                <td className="p-3 text-right font-medium">
                  {item.diferenca !== null ? (
                    <span className={item.diferenca !== 0 ? "text-destructive font-bold" : "text-success"}>
                      {item.diferenca > 0 ? `+${item.diferenca}` : item.diferenca}
                    </span>
                  ) : "â€”"}
                </td>
                <td className="p-3">
                  {editable ? (
                    <Input
                      value={item.motivoDivergencia || ""}
                      onChange={(e) => updateItem(idx, "motivoDivergencia", e.target.value)}
                      className="h-8 text-xs"
                      placeholder="â€”"
                    />
                  ) : (
                    <span className="text-xs">{item.motivoDivergencia || "â€”"}</span>
                  )}
                </td>
                <td className="p-3">
                  {editable ? (
                    <Input
                      value={item.observacao || ""}
                      onChange={(e) => updateItem(idx, "observacao", e.target.value)}
                      className="h-8 text-xs"
                      placeholder="â€”"
                    />
                  ) : (
                    <span className="text-xs">{item.observacao || "â€”"}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const comparisonData = useMemo(() => {
    if (!isRecontagem || !contagemOriginal) return [];
    return contagemOriginal.itens.map((origItem, idx) => {
      const recItem = itens[idx];
      const qtdContagem = origItem.quantidadeContada;
      const qtdRecontagem = recItem?.quantidadeContada ?? null;
      const diffContagem = qtdContagem !== null ? qtdContagem - origItem.estoqueSistema : null;
      const diffRecontagem = qtdRecontagem !== null ? qtdRecontagem - origItem.estoqueSistema : null;
      const variacao = qtdContagem !== null && qtdRecontagem !== null ? qtdRecontagem - qtdContagem : null;
      return {
        ...origItem,
        qtdContagem,
        qtdRecontagem,
        diffContagem,
        diffRecontagem,
        variacao,
      };
    });
  }, [isRecontagem, contagemOriginal, itens]);

  if (!contagem) {
    return <div className="p-8 text-center text-muted-foreground">Carregando contagemâ€¦</div>;
  }

  const renderComparisonTable = () => (
    <div className="glass-card rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left p-3 font-medium text-muted-foreground">CÃ³digo</th>
              <th className="text-left p-3 font-medium text-muted-foreground">DescriÃ§Ã£o</th>
              <th className="text-right p-3 font-medium text-muted-foreground">Est. Sistema</th>
              <th className="text-right p-3 font-medium text-muted-foreground bg-muted/40">Qtd Contada</th>
              <th className="text-right p-3 font-medium text-muted-foreground bg-warning/10">Qtd Recontagem</th>
              <th className="text-right p-3 font-medium text-muted-foreground">Dif. Contagem</th>
              <th className="text-right p-3 font-medium text-muted-foreground">Dif. Recontagem</th>
              <th className="text-right p-3 font-medium text-muted-foreground bg-primary/10">VariaÃ§Ã£o</th>
            </tr>
          </thead>
          <tbody>
            {comparisonData.map((row) => (
              <tr key={row.id} className="border-b border-border/50 hover:bg-muted/20">
                <td className="p-3 font-mono text-xs">{row.codigoItem}</td>
                <td className="p-3">{row.descricao}</td>
                <td className="p-3 text-right font-medium">{row.estoqueSistema}</td>
                <td className="p-3 text-right font-medium bg-muted/20">{row.qtdContagem ?? "â€”"}</td>
                <td className="p-3 text-right font-medium bg-warning/5">{row.qtdRecontagem ?? "â€”"}</td>
                <td className="p-3 text-right font-medium">
                  {row.diffContagem !== null ? (
                    <span className={row.diffContagem !== 0 ? "text-destructive font-bold" : "text-success"}>
                      {row.diffContagem > 0 ? `+${row.diffContagem}` : row.diffContagem}
                    </span>
                  ) : "â€”"}
                </td>
                <td className="p-3 text-right font-medium">
                  {row.diffRecontagem !== null ? (
                    <span className={row.diffRecontagem !== 0 ? "text-destructive font-bold" : "text-success"}>
                      {row.diffRecontagem > 0 ? `+${row.diffRecontagem}` : row.diffRecontagem}
                    </span>
                  ) : "â€”"}
                </td>
                <td className="p-3 text-right font-medium bg-primary/5">
                  {row.variacao !== null ? (
                    <span className={row.variacao !== 0 ? "text-primary font-bold" : "text-success"}>
                      {row.variacao > 0 ? `+${row.variacao}` : row.variacao}
                    </span>
                  ) : "â€”"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">
            {isRecontagem ? "Recontagem de InventÃ¡rio" : "DigitaÃ§Ã£o de InventÃ¡rio"}
          </h1>
          <p className="text-sm text-muted-foreground">{headerData.numero}</p>
        </div>
        <ExportActionsBar />
      </div>

      {/* Header Card */}
      <Card>
        <CardHeader><CardTitle className="text-sm font-medium">CabeÃ§alho da Contagem</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 text-sm">
            <div><span className="text-muted-foreground text-xs block">Loja</span><span className="font-medium">{headerData.lojaNome}</span></div>
            <div><span className="text-muted-foreground text-xs block">Regional</span><span className="font-medium">{headerData.regional}</span></div>
            <div><span className="text-muted-foreground text-xs block">Gerente</span><span className="font-medium">{headerData.gerente}</span></div>
            <div><span className="text-muted-foreground text-xs block">Supervisor</span><span className="font-medium text-primary">{headerData.supervisor}</span></div>
            <div><span className="text-muted-foreground text-xs block">Data</span><span className="font-medium font-mono">{headerData.data}</span></div>
            <div><span className="text-muted-foreground text-xs block">Departamento</span><span className="font-medium">{headerData.departamentoNome}</span></div>
            <div><span className="text-muted-foreground text-xs block">FrequÃªncia</span><span className="font-medium">{FREQUENCIA_LABELS[headerData.frequencia]}</span></div>
            <div><span className="text-muted-foreground text-xs block">ResponsÃ¡vel</span><span className="font-medium">{headerData.responsavel}</span></div>
            <div>
              <span className="text-muted-foreground text-xs block">Status</span>
              <InventoryStatusPill status={isRecontagem ? "RECONTAGEM" : contagem.status} />
            </div>
            {isRecontagem && (
              <div>
                <span className="text-muted-foreground text-xs block">Origem</span>
                <span className="font-medium font-mono text-warning">{recontagemState.recontagemOrigem}</span>
              </div>
            )}
            {isRecontagem && recontagemState.solicitadoPor && (
              <div>
                <span className="text-muted-foreground text-xs block">Solicitado por</span>
                <span className="font-medium text-primary">{recontagemState.solicitadoPor}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Recontagem vs Contagem Original */}
      {isRecontagem && contagemOriginal ? (
        <Tabs defaultValue="recontagem" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-xl">
            <TabsTrigger value="recontagem" className="flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" />
              Recontagem
            </TabsTrigger>
            <TabsTrigger value="contagem-original">
              Contagem Original
            </TabsTrigger>
            <TabsTrigger value="analise" className="flex items-center gap-1.5">
              <GitCompare className="h-3.5 w-3.5" />
              AnÃ¡lise Comparativa
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recontagem" className="mt-4">
            <div className="mb-3 p-3 rounded-lg bg-warning/10 border border-warning/20 text-sm flex items-center gap-2 text-warning">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>
                Recontagem solicitada a partir de <strong>{recontagemState.recontagemOrigem}</strong>. 
                Preencha as quantidades contadas abaixo.
              </span>
            </div>
            {renderItemsTable(itens, true)}
          </TabsContent>

          <TabsContent value="contagem-original" className="mt-4">
            <div className="mb-3 p-3 rounded-lg bg-muted/50 border border-border text-sm text-muted-foreground">
              Dados da contagem original <strong>{contagemOriginal.numero}</strong> â€” somente leitura.
            </div>
            {renderItemsTable(contagemOriginal.itens, false)}
          </TabsContent>

          <TabsContent value="analise" className="mt-4">
            <div className="mb-3 p-3 rounded-lg bg-primary/10 border border-primary/20 text-sm flex items-center gap-2 text-primary">
              <GitCompare className="h-4 w-4 shrink-0" />
              <span>ComparaÃ§Ã£o entre <strong>{contagemOriginal.numero}</strong> (contagem) e <strong>Recontagem</strong>.</span>
            </div>
            {renderComparisonTable()}
          </TabsContent>
        </Tabs>
      ) : (
        renderItemsTable(itens, true)
      )}

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate(-1)}>Voltar</Button>
        <Button variant="secondary" onClick={handleSalvar}><Save className="h-4 w-4 mr-1" /> Salvar Parcial</Button>
        <Button onClick={handleConcluir}><CheckCircle className="h-4 w-4 mr-1" /> Concluir {isRecontagem ? "Recontagem" : "Contagem"}</Button>
      </div>
    </div>
  );
};

export default DigitacaoInventarioPage;

