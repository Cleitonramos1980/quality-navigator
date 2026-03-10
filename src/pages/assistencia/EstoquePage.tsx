import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listarEstoque } from "@/services/assistencia";
import type { EstoqueItem } from "@/types/assistencia";

const EstoquePage = () => {
  const navigate = useNavigate();
  const [estoque, setEstoque] = useState<EstoqueItem[]>([]);
  const [search, setSearch] = useState("");
  const [filterCategoria, setFilterCategoria] = useState("ALL");

  useEffect(() => {
    listarEstoque().then(setEstoque);
  }, []);

  const categorias = [...new Set(estoque.map((e) => e.categoria))];

  const filtered = estoque.filter((item) => {
    if (filterCategoria !== "ALL" && item.categoria !== filterCategoria) return false;
    if (search) {
      const q = search.toLowerCase();
      return item.codMaterial.toLowerCase().includes(q) || item.descricao.toLowerCase().includes(q);
    }
    return true;
  });

  const totalGeral = (item: EstoqueItem) => item.estoqueMAO + item.estoqueBEL + item.estoqueAGR;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/assistencia/dashboard")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Estoque — Assistência</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Visão de estoque por planta (dados ERP)</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Itens", value: estoque.length },
          { label: "Estoque MAO", value: estoque.reduce((a, e) => a + e.estoqueMAO, 0) },
          { label: "Estoque BEL", value: estoque.reduce((a, e) => a + e.estoqueBEL, 0) },
          { label: "Estoque AGR", value: estoque.reduce((a, e) => a + e.estoqueAGR, 0) },
        ].map((s) => (
          <Card key={s.label} className="glass-card">
            <CardContent className="pt-4 pb-3 px-4">
              <Package className="w-5 h-5 text-primary mb-1" />
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
              <Input placeholder="Buscar por código ou descrição..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={filterCategoria} onValueChange={setFilterCategoria}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Categoria" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas Categorias</SelectItem>
                {categorias.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
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
                <TableHead className="text-xs">Código</TableHead>
                <TableHead className="text-xs">Descrição</TableHead>
                <TableHead className="text-xs">UN</TableHead>
                <TableHead className="text-xs">Categoria</TableHead>
                <TableHead className="text-xs text-center">MAO</TableHead>
                <TableHead className="text-xs text-center">BEL</TableHead>
                <TableHead className="text-xs text-center">AGR</TableHead>
                <TableHead className="text-xs text-center">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.codMaterial}>
                  <TableCell className="font-mono text-xs">{item.codMaterial}</TableCell>
                  <TableCell className="text-sm">{item.descricao}</TableCell>
                  <TableCell className="text-xs">{item.un}</TableCell>
                  <TableCell><Badge variant="secondary" className="text-[10px]">{item.categoria}</Badge></TableCell>
                  <TableCell className="text-center text-sm font-medium">{item.estoqueMAO}</TableCell>
                  <TableCell className="text-center text-sm font-medium">{item.estoqueBEL}</TableCell>
                  <TableCell className="text-center text-sm font-medium">{item.estoqueAGR}</TableCell>
                  <TableCell className="text-center text-sm font-bold text-primary">{totalGeral(item)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">* Dados de estoque simulados. Integração com Oracle/WinThor será habilitada futuramente.</p>
    </div>
  );
};

export default EstoquePage;



