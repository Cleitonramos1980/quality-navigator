import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, UserCheck, Clock, XCircle, Plus, Eye, Send, QrCode } from "lucide-react";
import KPICard from "@/components/KPICard";
import StatusSemaphore from "@/components/operacional/StatusSemaphore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getVisitantes } from "@/services/operacional";
import type { Visitante } from "@/types/operacional";

const TABS = [
  { value: "todos", label: "Todos" },
  { value: "pendentes", label: "Pendentes", filter: (s: string) => ["CONVITE_CRIADO", "LINK_ENVIADO", "CADASTRO_PREENCHIDO", "AGUARDANDO_VALIDACAO"].includes(s) },
  { value: "aprovados", label: "Aprovados", filter: (s: string) => ["APROVADO", "QR_GERADO"].includes(s) },
  { value: "presentes", label: "Em Visita", filter: (s: string) => ["ENTRADA_REALIZADA", "VISITA_EM_ANDAMENTO"].includes(s) },
  { value: "historico", label: "Histórico", filter: (s: string) => ["ENCERRADO", "SAIDA_REALIZADA", "REJEITADO", "EXPIRADO"].includes(s) },
];

const VisitantesListPage = () => {
  const [tab, setTab] = useState("todos");
  const [busca, setBusca] = useState("");

  const visitantes = useMemo(() => {
    const activeTab = TABS.find((t) => t.value === tab);
    let filtered = mockVisitantes;
    if (activeTab?.filter) filtered = filtered.filter((v) => activeTab.filter!(v.status));
    if (busca) {
      const q = busca.toLowerCase();
      filtered = filtered.filter((v) => v.nome.toLowerCase().includes(q) || v.empresa.toLowerCase().includes(q) || v.id.toLowerCase().includes(q));
    }
    return filtered;
  }, [tab, busca]);

  const kpis = useMemo(() => ({
    total: mockVisitantes.length,
    pendentes: mockVisitantes.filter((v) => ["CONVITE_CRIADO", "LINK_ENVIADO", "CADASTRO_PREENCHIDO", "AGUARDANDO_VALIDACAO"].includes(v.status)).length,
    presentes: mockVisitantes.filter((v) => ["ENTRADA_REALIZADA", "VISITA_EM_ANDAMENTO"].includes(v.status)).length,
    expirados: mockVisitantes.filter((v) => v.status === "EXPIRADO").length,
  }), []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Visitantes</h1>
          <p className="text-sm text-muted-foreground mt-1">Pré-autorizações, aprovações e histórico de visitas</p>
        </div>
        <Button size="sm" asChild><Link to="/visitantes/pre-autorizacao"><Plus className="mr-1.5 h-4 w-4" />Nova Pré-autorização</Link></Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Visitantes" value={kpis.total} icon={<Users className="w-5 h-5" />} />
        <KPICard title="Pendentes" value={kpis.pendentes} icon={<Clock className="w-5 h-5" />} />
        <KPICard title="Em Visita" value={kpis.presentes} icon={<UserCheck className="w-5 h-5" />} />
        <KPICard title="Expirados" value={kpis.expirados} icon={<XCircle className="w-5 h-5" />} />
      </div>

      <div className="glass-card rounded-lg p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              {TABS.map((t) => <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>)}
            </TabsList>
          </Tabs>
          <Input placeholder="Buscar visitante..." value={busca} onChange={(e) => setBusca(e.target.value)} className="max-w-xs" />
        </div>

        <div className="mt-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Última Visita</TableHead>
                <TableHead>Veículo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visitantes.length === 0 && (
                <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">Nenhum visitante encontrado.</TableCell></TableRow>
              )}
              {visitantes.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-mono text-xs">{v.id}</TableCell>
                  <TableCell className="font-medium">{v.nome}</TableCell>
                  <TableCell className="text-xs">{v.documento}</TableCell>
                  <TableCell>{v.empresa}</TableCell>
                  <TableCell className="text-xs">{v.telefone}</TableCell>
                  <TableCell className="text-xs">{v.ultimaVisita || "—"}</TableCell>
                  <TableCell>{v.possuiVeiculo ? "Sim" : "Não"}</TableCell>
                  <TableCell><StatusSemaphore status={v.status} /></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" asChild><Link to={`/visitantes/${v.id}`}><Eye className="h-4 w-4" /></Link></Button>
                      {v.status === "APROVADO" && <Button variant="ghost" size="sm" title="QR Code"><QrCode className="h-4 w-4 text-success" /></Button>}
                    </div>
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

export default VisitantesListPage;
