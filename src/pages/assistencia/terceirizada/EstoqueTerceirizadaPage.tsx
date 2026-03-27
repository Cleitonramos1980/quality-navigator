import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Package, Wrench, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { listarItensEmAssistencia, listarAssistenciasTerceirizadas } from "@/services/assistenciaTerceirizada";
import { ITEM_ASSISTENCIA_STATUS_LABELS, ITEM_ASSISTENCIA_STATUS_COLORS, TIPO_ITEM_LABELS } from "@/types/assistenciaTerceirizada";
import type { ItemEmAssistencia, AssistenciaTerceirizada, ItemAssistenciaStatus, TipoItem } from "@/types/assistenciaTerceirizada";

function diffDays(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

const EstoqueTerceirizadaPage = () => {
  const navigate = useNavigate();
  const [itens, setItens] = useState<ItemEmAssistencia[]>([]);
  const [assistencias, setAssistencias] = useState<AssistenciaTerceirizada[]>([]);
  const [search, setSearch] = useState("");
  const [filterAssist, setFilterAssist] = useState("ALL");
  const [filterTipo, setFilterTipo] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");

  useEffect(() => {
    listarItensEmAssistencia().then(setItens);
    listarAssistenciasTerceirizadas().then(setAssistencias);
  }, []);

  const filtered = itens.filter((item) => {
    if (filterAssist !== "ALL" && item.assistenciaId !== filterAssist) return false;
    if (filterTipo !== "ALL" && item.tipoItem !== filterTipo) return false;
    if (filterStatus !== "ALL" && item.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return item.codigoItem.toLowerCase().includes(q) || item.descricao.toLowerCase().includes(q) || (item.numeroSerie || "").toLowerCase().includes(q) || item.assistenciaNome.toLowerCase().includes(q) || (item.osReferencia || "").toLowerCase().includes(q);
    }
    return true;
  });

  const emPoder = filtered.filter((i) => !["DEVOLVIDO", "ENCERRADO"].includes(i.status));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/assistencia/terceirizada")}><ArrowLeft className="w-5 h-5" /></Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Estoque em Poder da Assistência</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Peças e equipamentos enviados a assistências técnicas externas</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total de Itens", value: filtered.length, icon: Package },
          { label: "Em Poder (ativos)", value: emPoder.length, icon: Wrench },
          { label: "Peças", value: filtered.filter((i) => i.tipoItem === "PECA").length, icon: Package },
          { label: "Equipamentos", value: filtered.filter((i) => i.tipoItem === "EQUIPAMENTO").length, icon: Wrench },
        ].map((s) => (
          <Card key={s.label} className="glass-card">
            <CardContent className="pt-4 pb-3 px-4">
              <s.icon className="w-5 h-5 text-primary mb-1" />
              <div className="text-2xl font-bold text-foreground">{s.value}</div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="glass-card">
        <CardContent className="py-3 px-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar por código, descrição, série, OS, assistência..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={filterAssist} onValueChange={setFilterAssist}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Assistência" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas Assistências</SelectItem>
                {assistencias.filter((a) => a.status === "ATIVA").map((a) => <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterTipo} onValueChange={setFilterTipo}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos Tipos</SelectItem>
                <SelectItem value="PECA">Peça</SelectItem>
                <SelectItem value="EQUIPAMENTO">Equipamento</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos Status</SelectItem>
                {(Object.keys(ITEM_ASSISTENCIA_STATUS_LABELS) as ItemAssistenciaStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>{ITEM_ASSISTENCIA_STATUS_LABELS[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="glass-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Assistência</TableHead>
                <TableHead className="text-xs">Tipo</TableHead>
                <TableHead className="text-xs">Código</TableHead>
                <TableHead className="text-xs">Descrição</TableHead>
                <TableHead className="text-xs">Série / Patrimônio</TableHead>
                <TableHead className="text-xs text-center">Qtd</TableHead>
                <TableHead className="text-xs">Envio</TableHead>
                <TableHead className="text-xs text-center">Dias</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">OS Ref.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={10} className="text-center text-muted-foreground text-xs py-6">Nenhum item encontrado</TableCell></TableRow>
              ) : filtered.map((item) => (
                <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/assistencia/terceirizada/itens/${item.id}`)}>
                  <TableCell className="text-xs">{item.assistenciaNome}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px]">{TIPO_ITEM_LABELS[item.tipoItem]}</Badge></TableCell>
                  <TableCell className="font-mono text-xs">{item.codigoItem}</TableCell>
                  <TableCell className="text-sm">{item.descricao}</TableCell>
                  <TableCell className="text-xs font-mono">{item.numeroSerie || item.patrimonio || "—"}</TableCell>
                  <TableCell className="text-center text-sm font-medium">{item.quantidade - item.quantidadeRetornada}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{item.dataEnvio}</TableCell>
                  <TableCell className="text-center text-xs font-medium">{diffDays(item.dataEnvio)}d</TableCell>
                  <TableCell><Badge className={`text-[10px] ${ITEM_ASSISTENCIA_STATUS_COLORS[item.status]}`}>{ITEM_ASSISTENCIA_STATUS_LABELS[item.status]}</Badge></TableCell>
                  <TableCell className="text-xs font-mono">{item.osReferencia || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default EstoqueTerceirizadaPage;
