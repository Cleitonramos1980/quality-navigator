import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { listarMovimentacoes, listarAssistenciasTerceirizadas } from "@/services/assistenciaTerceirizada";
import { TIPO_MOVIMENTACAO_LABELS, TIPO_MOVIMENTACAO_COLORS } from "@/types/assistenciaTerceirizada";
import type { MovimentacaoAssistencia, AssistenciaTerceirizada, TipoMovimentacao } from "@/types/assistenciaTerceirizada";

const MovimentacoesPage = () => {
  const navigate = useNavigate();
  const [movs, setMovs] = useState<MovimentacaoAssistencia[]>([]);
  const [assistencias, setAssistencias] = useState<AssistenciaTerceirizada[]>([]);
  const [search, setSearch] = useState("");
  const [filterAssist, setFilterAssist] = useState("ALL");
  const [filterTipo, setFilterTipo] = useState("ALL");

  useEffect(() => {
    listarMovimentacoes().then(setMovs);
    listarAssistenciasTerceirizadas().then(setAssistencias);
  }, []);

  const filtered = movs.filter((m) => {
    if (filterAssist !== "ALL" && m.assistenciaId !== filterAssist) return false;
    if (filterTipo !== "ALL" && m.tipoMovimentacao !== filterTipo) return false;
    if (search) {
      const q = search.toLowerCase();
      return m.codigoItem.toLowerCase().includes(q) || m.descricaoItem.toLowerCase().includes(q) || m.assistenciaNome.toLowerCase().includes(q) || m.usuario.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/assistencia/terceirizada")}><ArrowLeft className="w-5 h-5" /></Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Movimentações</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Histórico de envios, retornos e ajustes</p>
        </div>
      </div>

      <Card className="glass-card">
        <CardContent className="py-3 px-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar por item, assistência, usuário..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={filterAssist} onValueChange={setFilterAssist}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Assistência" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas Assistências</SelectItem>
                {assistencias.map((a) => <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterTipo} onValueChange={setFilterTipo}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos os Tipos</SelectItem>
                {(Object.keys(TIPO_MOVIMENTACAO_LABELS) as TipoMovimentacao[]).map((t) => (
                  <SelectItem key={t} value={t}>{TIPO_MOVIMENTACAO_LABELS[t]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Data/Hora</TableHead>
                <TableHead className="text-xs">Tipo</TableHead>
                <TableHead className="text-xs">Assistência</TableHead>
                <TableHead className="text-xs">Item</TableHead>
                <TableHead className="text-xs text-center">Qtd</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Usuário</TableHead>
                <TableHead className="text-xs">Observação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground text-xs py-6">Nenhuma movimentação encontrada</TableCell></TableRow>
              ) : filtered.map((m) => (
                <TableRow key={m.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/assistencia/terceirizada/itens/${m.itemId}`)}>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{new Date(m.dataHora).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</TableCell>
                  <TableCell><Badge className={`text-[10px] ${TIPO_MOVIMENTACAO_COLORS[m.tipoMovimentacao]}`}>{TIPO_MOVIMENTACAO_LABELS[m.tipoMovimentacao]}</Badge></TableCell>
                  <TableCell className="text-xs">{m.assistenciaNome}</TableCell>
                  <TableCell className="text-xs">{m.descricaoItem}</TableCell>
                  <TableCell className="text-center text-sm font-medium">{m.quantidade}</TableCell>
                  <TableCell className="text-xs">{m.status}</TableCell>
                  <TableCell className="text-xs">{m.usuario}</TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{m.laudoObservacao || m.observacao || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default MovimentacoesPage;
