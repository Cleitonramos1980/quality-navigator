import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { DoorOpen, UserCheck, Clock, XCircle, Shield, Users, Plus, QrCode, Camera, Eye } from "lucide-react";
import KPICard from "@/components/KPICard";
import StatusSemaphore from "@/components/operacional/StatusSemaphore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAcessos } from "@/services/operacional";
import type { Acesso } from "@/types/operacional";
import type { AcessoStatus } from "@/types/operacional";
import { useToast } from "@/components/ui/use-toast";

const TABS: { value: string; label: string; filter?: (s: AcessoStatus) => boolean }[] = [
  { value: "todos", label: "Todos" },
  { value: "portaria", label: "Na Portaria", filter: (s) => ["AGUARDANDO_VALIDACAO", "ENTRADA_LIBERADA"].includes(s) },
  { value: "pendentes", label: "Pendentes", filter: (s) => ["PRE_AUTORIZADO", "AGUARDANDO_PREENCHIMENTO", "AGUARDANDO_VALIDACAO"].includes(s) },
  { value: "liberados", label: "Liberados", filter: (s) => ["ENTRADA_REGISTRADA", "EM_PERMANENCIA"].includes(s) },
  { value: "encerrados", label: "Encerrados", filter: (s) => s === "ENCERRADO" },
  { value: "recusados", label: "Recusados", filter: (s) => ["RECUSADO", "EXPIRADO"].includes(s) },
];

const AcessosListPage = () => {
  const { toast } = useToast();
  const [tab, setTab] = useState("todos");
  const [busca, setBusca] = useState("");
  const [allAcessos, setAllAcessos] = useState<Acesso[]>([]);

  useEffect(() => { getAcessos().then(setAllAcessos).catch((error) => { const message = error instanceof Error ? error.message : "Falha ao carregar dados."; toast({ title: "Erro ao carregar dados", description: message, variant: "destructive" }); }); }, []);

  const acessos = useMemo(() => {
    const activeTab = TABS.find((t) => t.value === tab);
    let filtered = allAcessos;
    if (activeTab?.filter) filtered = filtered.filter((a) => activeTab.filter!(a.status));
    if (busca) {
      const q = busca.toLowerCase();
      filtered = filtered.filter((a) => a.nome.toLowerCase().includes(q) || a.empresa.toLowerCase().includes(q) || a.id.toLowerCase().includes(q) || (a.placa?.toLowerCase().includes(q)));
    }
    return filtered;
  }, [tab, busca, allAcessos]);

  const kpis = useMemo(() => ({
    presentes: allAcessos.filter((a) => ["ENTRADA_REGISTRADA", "EM_PERMANENCIA"].includes(a.status)).length,
    pendentes: allAcessos.filter((a) => ["PRE_AUTORIZADO", "AGUARDANDO_PREENCHIMENTO", "AGUARDANDO_VALIDACAO"].includes(a.status)).length,
    encerradosHoje: allAcessos.filter((a) => a.status === "ENCERRADO").length,
    recusados: allAcessos.filter((a) => ["RECUSADO", "EXPIRADO"].includes(a.status)).length,
  }), [allAcessos]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Acessos / Portaria</h1>
          <p className="text-sm text-muted-foreground mt-1">Controle de entrada e saÃ­da de pessoas e veÃ­culos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild><Link to="/portaria/qr"><QrCode className="mr-1.5 h-4 w-4" />Leitura QR</Link></Button>
          <Button variant="outline" size="sm" asChild><Link to="/portaria/placa"><Camera className="mr-1.5 h-4 w-4" />Leitura Placa</Link></Button>
          <Button size="sm" asChild><Link to="/portaria/novo"><Plus className="mr-1.5 h-4 w-4" />Novo Acesso</Link></Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Presentes" value={kpis.presentes} icon={<Users className="w-5 h-5" />} subtitle="na unidade agora" />
        <KPICard title="Pendentes" value={kpis.pendentes} icon={<Clock className="w-5 h-5" />} subtitle="aguardando validaÃ§Ã£o" />
        <KPICard title="Encerrados Hoje" value={kpis.encerradosHoje} icon={<UserCheck className="w-5 h-5" />} />
        <KPICard title="Recusados / Expirados" value={kpis.recusados} icon={<XCircle className="w-5 h-5" />} />
      </div>

      <div className="glass-card rounded-lg p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              {TABS.map((t) => <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>)}
            </TabsList>
          </Tabs>
          <Input placeholder="Buscar por nome, empresa, cÃ³digo ou placa..." value={busca} onChange={(e) => setBusca(e.target.value)} className="max-w-xs" />
        </div>

        <div className="mt-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>CÃ³digo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Placa</TableHead>
                <TableHead>ResponsÃ¡vel</TableHead>
                <TableHead>Previsto</TableHead>
                <TableHead>Real</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>AÃ§Ãµes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {acessos.length === 0 && (
                <TableRow><TableCell colSpan={11} className="text-center text-muted-foreground py-8">Nenhum acesso encontrado.</TableCell></TableRow>
              )}
              {acessos.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-mono text-xs">{a.id}</TableCell>
                  <TableCell><span className="status-badge bg-secondary text-secondary-foreground">{a.tipo}</span></TableCell>
                  <TableCell className="font-medium">{a.nome}</TableCell>
                  <TableCell className="text-xs">{a.documento}</TableCell>
                  <TableCell>{a.empresa}</TableCell>
                  <TableCell className="font-mono text-xs">{a.placa || "â€”"}</TableCell>
                  <TableCell className="text-xs">{a.responsavelInterno}</TableCell>
                  <TableCell className="text-xs">{new Date(a.horarioPrevisto).toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</TableCell>
                  <TableCell className="text-xs">{a.horarioReal ? new Date(a.horarioReal).toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "â€”"}</TableCell>
                  <TableCell><StatusSemaphore status={a.status} /></TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={a.solicitacaoId ? `/portaria/solicitacoes/${a.solicitacaoId}` : `/portaria/${a.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default AcessosListPage;

