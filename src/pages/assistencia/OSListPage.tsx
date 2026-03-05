import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { listarOS } from "@/services/assistencia";
import { OS_STATUS_LABELS, OS_STATUS_COLORS, OS_PRIORIDADE_LABELS, OS_PRIORIDADE_COLORS, OS_TIPO_LABELS } from "@/types/assistencia";
import type { OrdemServico, OSStatus, OSPrioridade } from "@/types/assistencia";
import { PLANTA_LABELS, Planta } from "@/types/sgq";

const OSListPage = () => {
  const navigate = useNavigate();
  const [osList, setOsList] = useState<OrdemServico[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterPlanta, setFilterPlanta] = useState<string>("ALL");
  const [filterPrioridade, setFilterPrioridade] = useState<string>("ALL");

  useEffect(() => {
    listarOS().then(setOsList);
  }, []);

  const filtered = osList.filter((os) => {
    if (filterStatus !== "ALL" && os.status !== filterStatus) return false;
    if (filterPlanta !== "ALL" && os.planta !== filterPlanta) return false;
    if (filterPrioridade !== "ALL" && os.prioridade !== filterPrioridade) return false;
    if (search) {
      const q = search.toLowerCase();
      return os.id.toLowerCase().includes(q) || os.clienteNome.toLowerCase().includes(q) || os.tecnicoResponsavel.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/assistencia/dashboard")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Ordens de Serviço</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Gestão completa de OS</p>
        </div>
        <Button onClick={() => navigate("/assistencia/os/nova")} className="gap-2">
          <Plus className="w-4 h-4" /> Nova OS
        </Button>
      </div>

      {/* Filters */}
      <Card className="glass-card">
        <CardContent className="py-3 px-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar por ID, cliente ou técnico..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]"><Filter className="w-3 h-3 mr-1" /><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos os Status</SelectItem>
                {Object.entries(OS_STATUS_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterPlanta} onValueChange={setFilterPlanta}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Planta" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas</SelectItem>
                {Object.entries(PLANTA_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{k} – {v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterPrioridade} onValueChange={setFilterPrioridade}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Prioridade" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas</SelectItem>
                {Object.entries(OS_PRIORIDADE_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
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
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Planta</TableHead>
                <TableHead>Técnico</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Abertura</TableHead>
                <TableHead>Previsão</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((os) => (
                <TableRow key={os.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/assistencia/os/${os.id}`)}>
                  <TableCell className="font-mono text-xs">{os.id}</TableCell>
                  <TableCell className="text-sm">{os.clienteNome}</TableCell>
                  <TableCell className="text-xs">{OS_TIPO_LABELS[os.tipoOs]}</TableCell>
                  <TableCell className="text-xs font-mono">{os.planta}</TableCell>
                  <TableCell className="text-xs">{os.tecnicoResponsavel}</TableCell>
                  <TableCell><Badge className={`text-[10px] ${OS_PRIORIDADE_COLORS[os.prioridade]}`}>{OS_PRIORIDADE_LABELS[os.prioridade]}</Badge></TableCell>
                  <TableCell><Badge className={`text-[10px] ${OS_STATUS_COLORS[os.status]}`}>{OS_STATUS_LABELS[os.status]}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{os.dataAbertura}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{os.dataPrevista}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">Nenhuma OS encontrada</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default OSListPage;
