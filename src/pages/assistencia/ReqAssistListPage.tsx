import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Filter, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { listarReqAssistencia, listarOS } from "@/services/assistencia";
import { REQ_ASSIST_STATUS_LABELS, REQ_ASSIST_STATUS_COLORS } from "@/types/assistencia";
import type { RequisicaoAssistencia, OrdemServico } from "@/types/assistencia";

const ReqAssistListPage = () => {
  const navigate = useNavigate();
  const [reqs, setReqs] = useState<RequisicaoAssistencia[]>([]);
  const [osMap, setOsMap] = useState<Record<string, OrdemServico>>({});
  const [search, setSearch] = useState("");
  const [filterPlanta, setFilterPlanta] = useState("ALL");

  useEffect(() => {
    listarReqAssistencia().then(setReqs);
    listarOS().then((list) => {
      const map: Record<string, OrdemServico> = {};
      list.forEach((os) => { map[os.id] = os; });
      setOsMap(map);
    });
  }, []);

  const pendentes = reqs.filter((r) => !["ATENDIDA", "NEGADA"].includes(r.status));
  const concluidas = reqs.filter((r) => ["ATENDIDA", "NEGADA"].includes(r.status));

  const filterFn = (list: RequisicaoAssistencia[]) =>
    list.filter((r) => {
      if (filterPlanta !== "ALL" && r.cdResponsavel !== filterPlanta && r.plantaDestino !== filterPlanta) return false;
      if (search) {
        const q = search.toLowerCase();
        const os = osMap[r.osId];
        return r.id.toLowerCase().includes(q) || r.osId.toLowerCase().includes(q) || (os?.clienteNome || "").toLowerCase().includes(q);
      }
      return true;
    });

  const renderTable = (list: RequisicaoAssistencia[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-xs">ID</TableHead>
          <TableHead className="text-xs">OS</TableHead>
          <TableHead className="text-xs">Cliente</TableHead>
          <TableHead className="text-xs">CD → Destino</TableHead>
          <TableHead className="text-xs">Itens</TableHead>
          <TableHead className="text-xs">Status</TableHead>
          <TableHead className="text-xs">Data</TableHead>
          <TableHead className="text-xs w-24"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {list.length === 0 ? (
          <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">Nenhuma requisição encontrada</TableCell></TableRow>
        ) : list.map((r) => {
          const os = osMap[r.osId];
          return (
            <TableRow key={r.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/assistencia/os/${r.osId}`)}>
              <TableCell className="font-mono text-xs">{r.id}</TableCell>
              <TableCell className="font-mono text-xs">{r.osId}</TableCell>
              <TableCell className="text-xs">{os?.clienteNome || "—"}</TableCell>
              <TableCell className="text-xs">{r.cdResponsavel} → {r.plantaDestino}</TableCell>
              <TableCell className="text-xs">{r.itens.length}</TableCell>
              <TableCell><Badge className={`text-[10px] ${REQ_ASSIST_STATUS_COLORS[r.status]}`}>{REQ_ASSIST_STATUS_LABELS[r.status]}</Badge></TableCell>
              <TableCell className="text-xs text-muted-foreground">{r.criadoAt}</TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                {r.status === "EM_TRANSFERENCIA" && (
                  <Button size="sm" variant="outline" className="text-xs h-7 gap-1" onClick={() => navigate(`/assistencia/requisicoes/${r.id}/receber`)}>
                    <PackageCheck className="w-3 h-3" /> Receber
                  </Button>
                )}
                {r.status === "RECEBIDA_ASSISTENCIA" && (
                  <Badge variant="outline" className="text-[10px] bg-success/10 text-success border-success/30">Recebida</Badge>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/assistencia/dashboard")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Requisições de Material</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Assistência Técnica — Gestão de requisições</p>
        </div>
      </div>

      <Card className="glass-card">
        <CardContent className="py-3 px-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar por ID, OS ou cliente..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={filterPlanta} onValueChange={setFilterPlanta}>
              <SelectTrigger className="w-[140px]"><Filter className="w-3 h-3 mr-1" /><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas Plantas</SelectItem>
                <SelectItem value="MAO">MAO</SelectItem>
                <SelectItem value="BEL">BEL</SelectItem>
                <SelectItem value="AGR">AGR</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="pendentes">
        <TabsList>
          <TabsTrigger value="pendentes">Pendentes ({filterFn(pendentes).length})</TabsTrigger>
          <TabsTrigger value="concluidas">Concluídas ({filterFn(concluidas).length})</TabsTrigger>
        </TabsList>
        <TabsContent value="pendentes">
          <Card className="glass-card"><CardContent className="p-0">{renderTable(filterFn(pendentes))}</CardContent></Card>
        </TabsContent>
        <TabsContent value="concluidas">
          <Card className="glass-card"><CardContent className="p-0">{renderTable(filterFn(concluidas))}</CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReqAssistListPage;
