import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import RequisicaoStatusBadge from "@/components/sac/RequisicaoStatusBadge";
import { mockRequisicoes } from "@/services/sacRequisicoes";
import { REQUISICAO_PRIORIDADE_LABELS, REQUISICAO_PRIORIDADE_COLORS } from "@/types/sacRequisicao";
import { PLANTA_LABELS } from "@/types/sgq";
import { ArrowLeft, Eye, ClipboardCheck, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const RequisicaoListPage = () => {
  const navigate = useNavigate();
  const [filtroPlanta, setFiltroPlanta] = useState("");
  const [filtroCliente, setFiltroCliente] = useState("");

  const pendentes = mockRequisicoes.filter((r) => ["PENDENTE", "RASCUNHO"].includes(r.status));
  const atendidas = mockRequisicoes.filter((r) => ["ATENDIDA", "PARCIAL", "NEGADA"].includes(r.status));

  const applyFilter = (list: typeof mockRequisicoes) =>
    list.filter((r) => {
      if (filtroPlanta && r.plantaCd !== filtroPlanta) return false;
      if (filtroCliente && !r.clienteNome.toLowerCase().includes(filtroCliente.toLowerCase())) return false;
      return true;
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/sac/dashboard")}><ArrowLeft className="w-5 h-5" /></Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Requisições de Material</h1>
          <p className="text-sm text-muted-foreground">Gestão de requisições de materiais para assistência técnica</p>
        </div>
        <Button onClick={() => navigate("/sac/requisicoes/nova")}><Plus className="w-4 h-4 mr-1" /> Nova Requisição</Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <Select value={filtroPlanta} onValueChange={setFiltroPlanta}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Planta/CD" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todas</SelectItem>
            {Object.entries(PLANTA_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input placeholder="Filtrar por cliente..." value={filtroCliente} onChange={(e) => setFiltroCliente(e.target.value)} className="w-[220px]" />
      </div>

      <Tabs defaultValue="pendentes">
        <TabsList>
          <TabsTrigger value="pendentes">Pendentes ({pendentes.length})</TabsTrigger>
          <TabsTrigger value="atendidas">Atendidas ({atendidas.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pendentes">
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>ID</TableHead>
                  <TableHead>DATA</TableHead>
                  <TableHead>CLIENTE</TableHead>
                  <TableHead>PEDIDO</TableHead>
                  <TableHead>NF</TableHead>
                  <TableHead>PLANTA/CD</TableHead>
                  <TableHead>PRIORIDADE</TableHead>
                  <TableHead>STATUS</TableHead>
                  <TableHead>AÇÃO</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applyFilter(pendentes).length === 0 ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Nenhuma requisição pendente</TableCell></TableRow>
                ) : applyFilter(pendentes).map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono font-medium">{r.id}</TableCell>
                    <TableCell>{r.criadoAt}</TableCell>
                    <TableCell>{r.clienteNome}</TableCell>
                    <TableCell>{r.numPedido || "—"}</TableCell>
                    <TableCell>{r.numNfVenda || "—"}</TableCell>
                    <TableCell>{r.plantaCd}</TableCell>
                    <TableCell>
                      <span className={cn("px-2 py-0.5 rounded text-xs font-medium", REQUISICAO_PRIORIDADE_COLORS[r.prioridade])}>
                        {REQUISICAO_PRIORIDADE_LABELS[r.prioridade]}
                      </span>
                    </TableCell>
                    <TableCell><RequisicaoStatusBadge status={r.status} /></TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => navigate(`/sac/requisicoes/${r.id}/atender`)}>
                        <ClipboardCheck className="w-3.5 h-3.5 mr-1" /> Atender
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="atendidas">
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>ID</TableHead>
                  <TableHead>DATA</TableHead>
                  <TableHead>CLIENTE</TableHead>
                  <TableHead>PLANTA/CD</TableHead>
                  <TableHead>STATUS</TableHead>
                  <TableHead>ATENDIDA POR</TableHead>
                  <TableHead>DATA ATENDIMENTO</TableHead>
                  <TableHead>AÇÃO</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applyFilter(atendidas).length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nenhuma requisição atendida</TableCell></TableRow>
                ) : applyFilter(atendidas).map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono font-medium">{r.id}</TableCell>
                    <TableCell>{r.criadoAt}</TableCell>
                    <TableCell>{r.clienteNome}</TableCell>
                    <TableCell>{r.plantaCd}</TableCell>
                    <TableCell><RequisicaoStatusBadge status={r.status} /></TableCell>
                    <TableCell>{r.atendidoPor || "—"}</TableCell>
                    <TableCell>{r.atendidoAt || "—"}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost" onClick={() => navigate(`/sac/requisicoes/${r.id}`)}>
                        <Eye className="w-3.5 h-3.5 mr-1" /> Ver
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RequisicaoListPage;
