import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Package, Clock, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { buscarItemEmAssistencia, listarMovimentacoesPorItem } from "@/services/assistenciaTerceirizada";
import { ITEM_ASSISTENCIA_STATUS_LABELS, ITEM_ASSISTENCIA_STATUS_COLORS, TIPO_ITEM_LABELS, TIPO_MOVIMENTACAO_LABELS, TIPO_MOVIMENTACAO_COLORS, CONDICAO_RETORNO_LABELS } from "@/types/assistenciaTerceirizada";
import type { ItemEmAssistencia, MovimentacaoAssistencia } from "@/types/assistenciaTerceirizada";

function diffDays(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

const ItemDetalhePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<ItemEmAssistencia | null>(null);
  const [movs, setMovs] = useState<MovimentacaoAssistencia[]>([]);

  useEffect(() => {
    if (!id) return;
    buscarItemEmAssistencia(id).then((i) => setItem(i || null));
    listarMovimentacoesPorItem(id).then(setMovs);
  }, [id]);

  if (!item) return null;

  const saldoPendente = item.quantidade - item.quantidadeRetornada;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/assistencia/terceirizada/estoque")}><ArrowLeft className="w-5 h-5" /></Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{item.descricao}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Rastreabilidade do item em assistência técnica</p>
        </div>
        <Badge className={`${ITEM_ASSISTENCIA_STATUS_COLORS[item.status]}`}>{ITEM_ASSISTENCIA_STATUS_LABELS[item.status]}</Badge>
      </div>

      {/* Dados do item */}
      <Card className="glass-card">
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Package className="w-4 h-4" /> Dados do Item</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span className="text-xs text-muted-foreground block">Tipo</span><Badge variant="outline" className="text-[10px]">{TIPO_ITEM_LABELS[item.tipoItem]}</Badge></div>
            <div><span className="text-xs text-muted-foreground block">Código</span><span className="font-mono">{item.codigoItem}</span></div>
            <div><span className="text-xs text-muted-foreground block">Nº Série</span>{item.numeroSerie || "—"}</div>
            <div><span className="text-xs text-muted-foreground block">Patrimônio</span>{item.patrimonio || "—"}</div>
            <div><span className="text-xs text-muted-foreground block">Assistência</span>{item.assistenciaNome}</div>
            <div><span className="text-xs text-muted-foreground block">OS Referência</span>{item.osReferencia || "—"}</div>
            <div><span className="text-xs text-muted-foreground block">Responsável Envio</span>{item.responsavelEnvio}</div>
            <div><span className="text-xs text-muted-foreground block">Data Envio</span>{item.dataEnvio}</div>
          </div>
          <div className="mt-4 p-3 rounded-md bg-muted/50">
            <span className="text-xs text-muted-foreground block mb-1">Defeito Relatado</span>
            <p className="text-sm">{item.defeito}</p>
          </div>
          {item.observacao && (
            <div className="mt-3 p-3 rounded-md bg-muted/50">
              <span className="text-xs text-muted-foreground block mb-1">Observação</span>
              <p className="text-sm">{item.observacao}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo quantitativo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card"><CardContent className="pt-4 pb-3 px-4"><div className="text-2xl font-bold">{item.quantidade}</div><p className="text-xs text-muted-foreground">Qtd Enviada</p></CardContent></Card>
        <Card className="glass-card"><CardContent className="pt-4 pb-3 px-4"><div className="text-2xl font-bold">{item.quantidadeRetornada}</div><p className="text-xs text-muted-foreground">Qtd Retornada</p></CardContent></Card>
        <Card className="glass-card"><CardContent className="pt-4 pb-3 px-4"><div className="text-2xl font-bold text-primary">{saldoPendente}</div><p className="text-xs text-muted-foreground">Saldo Pendente</p></CardContent></Card>
        <Card className="glass-card"><CardContent className="pt-4 pb-3 px-4"><Clock className="w-5 h-5 text-warning mb-1" /><div className="text-2xl font-bold">{diffDays(item.dataEnvio)}d</div><p className="text-xs text-muted-foreground">Dias em Assistência</p></CardContent></Card>
      </div>

      {saldoPendente > 0 && (
        <div className="flex justify-end">
          <Button onClick={() => navigate("/assistencia/terceirizada/retorno")} className="gap-2"><RotateCcw className="w-4 h-4" /> Registrar Retorno</Button>
        </div>
      )}

      {/* Histórico de movimentações */}
      <Card className="glass-card">
        <CardHeader><CardTitle className="text-sm">Histórico de Movimentações</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Data/Hora</TableHead>
                <TableHead className="text-xs">Tipo</TableHead>
                <TableHead className="text-xs text-center">Qtd</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Condição</TableHead>
                <TableHead className="text-xs">Usuário</TableHead>
                <TableHead className="text-xs">Observação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movs.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground text-xs py-6">Nenhuma movimentação registrada</TableCell></TableRow>
              ) : movs.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{new Date(m.dataHora).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</TableCell>
                  <TableCell><Badge className={`text-[10px] ${TIPO_MOVIMENTACAO_COLORS[m.tipoMovimentacao]}`}>{TIPO_MOVIMENTACAO_LABELS[m.tipoMovimentacao]}</Badge></TableCell>
                  <TableCell className="text-center text-sm font-medium">{m.quantidade}</TableCell>
                  <TableCell className="text-xs">{m.status}</TableCell>
                  <TableCell className="text-xs">{m.condicaoRetorno ? CONDICAO_RETORNO_LABELS[m.condicaoRetorno] : "—"}</TableCell>
                  <TableCell className="text-xs">{m.usuario}</TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[250px] truncate">{m.laudoObservacao || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ItemDetalhePage;
