import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Building2, Package, Wrench, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { buscarAssistenciaTerceirizada, listarItensEmAssistencia, listarMovimentacoesPorAssistencia } from "@/services/assistenciaTerceirizada";
import { ITEM_ASSISTENCIA_STATUS_LABELS, ITEM_ASSISTENCIA_STATUS_COLORS, TIPO_MOVIMENTACAO_LABELS, TIPO_MOVIMENTACAO_COLORS, TIPO_ITEM_LABELS } from "@/types/assistenciaTerceirizada";
import type { AssistenciaTerceirizada, ItemEmAssistencia, MovimentacaoAssistencia } from "@/types/assistenciaTerceirizada";

function diffDays(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

const AssistenciaDetalhePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [assistencia, setAssistencia] = useState<AssistenciaTerceirizada | null>(null);
  const [itens, setItens] = useState<ItemEmAssistencia[]>([]);
  const [movs, setMovs] = useState<MovimentacaoAssistencia[]>([]);

  useEffect(() => {
    if (!id) return;
    buscarAssistenciaTerceirizada(id).then((a) => setAssistencia(a || null));
    listarItensEmAssistencia().then((list) => setItens(list.filter((i) => i.assistenciaId === id)));
    listarMovimentacoesPorAssistencia(id).then(setMovs);
  }, [id]);

  if (!assistencia) return null;

  const emPoder = itens.filter((i) => !["DEVOLVIDO", "ENCERRADO"].includes(i.status));
  const pecas = emPoder.filter((i) => i.tipoItem === "PECA");
  const equips = emPoder.filter((i) => i.tipoItem === "EQUIPAMENTO");

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/assistencia/terceirizada/cadastro")}><ArrowLeft className="w-5 h-5" /></Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{assistencia.nome}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{assistencia.razaoSocial} — {assistencia.cidade}/{assistencia.uf}</p>
        </div>
        <Badge variant={assistencia.status === "ATIVA" ? "default" : "secondary"}>{assistencia.status === "ATIVA" ? "Ativa" : "Inativa"}</Badge>
      </div>

      {/* Dados cadastrais */}
      <Card className="glass-card">
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Building2 className="w-4 h-4" /> Dados Cadastrais</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span className="text-xs text-muted-foreground block">CNPJ/CPF</span>{assistencia.cnpjCpf || "—"}</div>
            <div><span className="text-xs text-muted-foreground block">Contato</span>{assistencia.contatoPrincipal || "—"}</div>
            <div><span className="text-xs text-muted-foreground block">Telefone</span>{assistencia.telefone || "—"}</div>
            <div><span className="text-xs text-muted-foreground block">E-mail</span>{assistencia.email || "—"}</div>
            <div className="col-span-2"><span className="text-xs text-muted-foreground block">Endereço</span>{assistencia.endereco || "—"}</div>
            {assistencia.observacoes && <div className="col-span-2"><span className="text-xs text-muted-foreground block">Observações</span>{assistencia.observacoes}</div>}
          </div>
        </CardContent>
      </Card>

      {/* Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card"><CardContent className="pt-4 pb-3 px-4"><Package className="w-5 h-5 text-info mb-1" /><div className="text-2xl font-bold">{pecas.length}</div><p className="text-xs text-muted-foreground">Peças em Poder</p></CardContent></Card>
        <Card className="glass-card"><CardContent className="pt-4 pb-3 px-4"><Wrench className="w-5 h-5 text-warning mb-1" /><div className="text-2xl font-bold">{equips.length}</div><p className="text-xs text-muted-foreground">Equipamentos em Poder</p></CardContent></Card>
        <Card className="glass-card"><CardContent className="pt-4 pb-3 px-4"><Clock className="w-5 h-5 text-primary mb-1" /><div className="text-2xl font-bold">{itens.length}</div><p className="text-xs text-muted-foreground">Total de Itens (histórico)</p></CardContent></Card>
        <Card className="glass-card"><CardContent className="pt-4 pb-3 px-4"><Clock className="w-5 h-5 text-destructive mb-1" /><div className="text-2xl font-bold">{movs.length}</div><p className="text-xs text-muted-foreground">Movimentações</p></CardContent></Card>
      </div>

      {/* Itens em poder */}
      <Card className="glass-card">
        <CardHeader><CardTitle className="text-sm">Itens em Poder desta Assistência</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Tipo</TableHead>
                <TableHead className="text-xs">Código</TableHead>
                <TableHead className="text-xs">Descrição</TableHead>
                <TableHead className="text-xs text-center">Qtd</TableHead>
                <TableHead className="text-xs">Envio</TableHead>
                <TableHead className="text-xs text-center">Dias</TableHead>
                <TableHead className="text-xs">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {emPoder.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground text-xs py-6">Nenhum item em poder desta assistência</TableCell></TableRow>
              ) : emPoder.map((item) => (
                <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/assistencia/terceirizada/itens/${item.id}`)}>
                  <TableCell><Badge variant="outline" className="text-[10px]">{TIPO_ITEM_LABELS[item.tipoItem]}</Badge></TableCell>
                  <TableCell className="font-mono text-xs">{item.codigoItem}</TableCell>
                  <TableCell className="text-sm">{item.descricao}</TableCell>
                  <TableCell className="text-center text-sm font-medium">{item.quantidade - item.quantidadeRetornada}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{item.dataEnvio}</TableCell>
                  <TableCell className="text-center text-xs">{diffDays(item.dataEnvio)}d</TableCell>
                  <TableCell><Badge className={`text-[10px] ${ITEM_ASSISTENCIA_STATUS_COLORS[item.status]}`}>{ITEM_ASSISTENCIA_STATUS_LABELS[item.status]}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Histórico de movimentações */}
      <Card className="glass-card">
        <CardHeader><CardTitle className="text-sm">Histórico de Movimentações</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Data</TableHead>
                <TableHead className="text-xs">Tipo</TableHead>
                <TableHead className="text-xs">Item</TableHead>
                <TableHead className="text-xs text-center">Qtd</TableHead>
                <TableHead className="text-xs">Usuário</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movs.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="text-xs text-muted-foreground">{new Date(m.dataHora).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell><Badge className={`text-[10px] ${TIPO_MOVIMENTACAO_COLORS[m.tipoMovimentacao]}`}>{TIPO_MOVIMENTACAO_LABELS[m.tipoMovimentacao]}</Badge></TableCell>
                  <TableCell className="text-xs">{m.descricaoItem}</TableCell>
                  <TableCell className="text-center text-sm">{m.quantidade}</TableCell>
                  <TableCell className="text-xs">{m.usuario}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssistenciaDetalhePage;
