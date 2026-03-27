import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SAC_STATUS_LABELS, SAC_STATUS_COLORS, TIPO_CONTATO_LABELS, type SACAtendimento } from "@/types/sac";
import { Plus, Search, Eye, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAtendimentos } from "@/services/sac";
import { evaluateSlaFromOpenedAt } from "@/lib/sla";
import SLABadge from "@/components/common/SLABadge";
import { useUxMetrics } from "@/hooks/useUxMetrics";
import { useToast } from "@/components/ui/use-toast";

const AtendimentosPage = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [plantaFilter, setPlantaFilter] = useState<string>("ALL");
  const [atendimentos, setAtendimentos] = useState<SACAtendimento[]>([]);
  const { trackAction } = useUxMetrics("SAC_ATENDIMENTOS_LISTA");

  useEffect(() => {
    getAtendimentos()
      .then(setAtendimentos)
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Falha ao carregar atendimentos.";
        toast({ title: "Erro ao carregar atendimentos", description: message, variant: "destructive" });
      });
  }, [toast]);

  const filtered = atendimentos.filter((a) => {
    const matchSearch = a.id.toLowerCase().includes(search.toLowerCase()) || a.clienteNome.toLowerCase().includes(search.toLowerCase()) || a.cgcent.includes(search);
    const matchStatus = statusFilter === "ALL" || a.status === statusFilter;
    const matchPlanta = plantaFilter === "ALL" || a.plantaResp === plantaFilter;
    return matchSearch && matchStatus && matchPlanta;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Atendimentos SAC</h1>
          <p className="text-sm text-muted-foreground">Lista de chamados do serviço de atendimento ao cliente</p>
        </div>
        <Link to="/sac/novo"><Button onClick={() => trackAction("OPEN_NOVO_ATENDIMENTO")}><Plus className="w-4 h-4 mr-1" /> Novo Atendimento</Button></Link>
      </div>

      <Card><CardContent className="pt-4"><div className="flex flex-wrap gap-3"><div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Buscar ID, cliente ou CPF/CNPJ..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" /></div><Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="ALL">Todos os Status</SelectItem>{Object.entries(SAC_STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select><Select value={plantaFilter} onValueChange={setPlantaFilter}><SelectTrigger className="w-[150px]"><SelectValue placeholder="Planta" /></SelectTrigger><SelectContent><SelectItem value="ALL">Todas</SelectItem><SelectItem value="MAO">MAO</SelectItem><SelectItem value="BEL">BEL</SelectItem><SelectItem value="AGR">AGR</SelectItem></SelectContent></Select></div></CardContent></Card>

      <Card><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Cliente</TableHead><TableHead className="hidden md:table-cell">CPF/CNPJ</TableHead><TableHead>Status</TableHead><TableHead className="hidden md:table-cell">Tipo</TableHead><TableHead className="hidden lg:table-cell">Planta</TableHead><TableHead className="hidden lg:table-cell">SLA</TableHead><TableHead className="hidden lg:table-cell">Abertura</TableHead><TableHead className="hidden lg:table-cell">Atualização</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader><TableBody>{filtered.map((a) => (<TableRow key={a.id}><TableCell className="font-mono font-medium text-foreground">{a.id}</TableCell><TableCell className="text-foreground">{a.clienteNome}</TableCell><TableCell className="hidden md:table-cell text-muted-foreground font-mono text-xs">{a.cgcent}</TableCell><TableCell><span className={cn("status-badge", SAC_STATUS_COLORS[a.status])}>{SAC_STATUS_LABELS[a.status]}</span></TableCell><TableCell className="hidden md:table-cell text-muted-foreground">{TIPO_CONTATO_LABELS[a.tipoContato]}</TableCell><TableCell className="hidden lg:table-cell"><span className="text-xs font-mono text-muted-foreground">{a.plantaResp}</span></TableCell><TableCell className="hidden lg:table-cell"><SLABadge evaluation={evaluateSlaFromOpenedAt(a.abertoAt, 5)} /></TableCell><TableCell className="hidden lg:table-cell text-muted-foreground text-sm">{a.abertoAt}</TableCell><TableCell className="hidden lg:table-cell text-muted-foreground text-sm">{a.atualizadoAt}</TableCell><TableCell className="text-right"><div className="flex justify-end gap-1"><Link to={`/sac/${a.id}`}><Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Ver atendimento ${a.id}`} onClick={() => trackAction("OPEN_ATENDIMENTO", { id: a.id })}><Eye className="w-4 h-4" /></Button></Link><Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Editar atendimento ${a.id}`}><Pencil className="w-4 h-4" /></Button></div></TableCell></TableRow>))}{filtered.length === 0 && <TableRow><TableCell colSpan={10} className="text-center py-8 text-muted-foreground">Nenhum atendimento encontrado</TableCell></TableRow>}</TableBody></Table></CardContent></Card>
    </div>
  );
};

export default AtendimentosPage;

