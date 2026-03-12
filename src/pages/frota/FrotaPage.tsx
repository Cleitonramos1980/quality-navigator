import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Truck, CheckCircle, AlertTriangle, Wrench, Ban, MapPin, Eye } from "lucide-react";
import KPICard from "@/components/KPICard";
import StatusSemaphore from "@/components/operacional/StatusSemaphore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockFrota, mockDeslocamentos } from "@/data/mockOperacionalData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(152, 60%, 40%)", "hsl(220, 70%, 45%)", "hsl(200, 80%, 50%)", "hsl(38, 92%, 50%)", "hsl(0, 72%, 51%)", "hsl(280, 60%, 50%)"];

const FrotaPage = () => {
  const [tab, setTab] = useState("visao");
  const [busca, setBusca] = useState("");

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    mockFrota.forEach((v) => { counts[v.status] = (counts[v.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name: name.replace(/_/g, " "), value }));
  }, []);

  const tipoData = useMemo(() => {
    const counts: Record<string, number> = {};
    mockFrota.forEach((v) => { counts[v.tipo] = (counts[v.tipo] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, []);

  const veiculos = useMemo(() => {
    if (!busca) return mockFrota;
    const q = busca.toLowerCase();
    return mockFrota.filter((v) => v.placa.toLowerCase().includes(q) || v.modelo.toLowerCase().includes(q) || v.motoristaResponsavel.toLowerCase().includes(q));
  }, [busca]);

  const kpis = {
    total: mockFrota.length,
    disponiveis: mockFrota.filter((v) => v.status === "DISPONIVEL").length,
    emDeslocamento: mockFrota.filter((v) => v.status === "EM_DESLOCAMENTO").length,
    emManutencao: mockFrota.filter((v) => v.status === "EM_MANUTENCAO").length,
    bloqueados: mockFrota.filter((v) => v.status === "BLOQUEADO").length,
    paradosNP: mockFrota.filter((v) => v.status === "PARADA_NAO_PROGRAMADA").length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Frota</h1>
        <p className="text-sm text-muted-foreground mt-1">Gestão da frota própria — veículos, deslocamentos e manutenções</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard title="Total" value={kpis.total} icon={<Truck className="w-5 h-5" />} onClick={() => setTab("veiculos")} />
        <KPICard title="Disponíveis" value={kpis.disponiveis} icon={<CheckCircle className="w-5 h-5" />} onClick={() => { setTab("veiculos"); setBusca(""); }} />
        <KPICard title="Deslocamento" value={kpis.emDeslocamento} icon={<MapPin className="w-5 h-5" />} onClick={() => setTab("deslocamentos")} />
        <KPICard title="Parada N/P" value={kpis.paradosNP} icon={<AlertTriangle className="w-5 h-5" />} onClick={() => setTab("veiculos")} />
        <KPICard title="Manutenção" value={kpis.emManutencao} icon={<Wrench className="w-5 h-5" />} onClick={() => setTab("veiculos")} />
        <KPICard title="Bloqueados" value={kpis.bloqueados} icon={<Ban className="w-5 h-5" />} onClick={() => setTab("veiculos")} />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="visao">Visão Geral</TabsTrigger>
          <TabsTrigger value="veiculos">Veículos</TabsTrigger>
          <TabsTrigger value="deslocamentos">Deslocamentos</TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "visao" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="glass-card rounded-lg p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Status da Frota</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value">
                    {statusData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="glass-card rounded-lg p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Veículos por Tipo</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tipoData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {tab === "veiculos" && (
        <div className="glass-card rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Veículos da Frota</h3>
            <Input placeholder="Buscar por placa, modelo ou motorista..." value={busca} onChange={(e) => setBusca(e.target.value)} className="max-w-xs" />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Placa</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Ano</TableHead>
                <TableHead>Setor</TableHead>
                <TableHead>Motorista</TableHead>
                <TableHead>Km</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Alertas</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {veiculos.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-mono font-medium">{v.placa}</TableCell>
                  <TableCell>{v.tipo}</TableCell>
                  <TableCell>{v.modelo}</TableCell>
                  <TableCell>{v.ano}</TableCell>
                  <TableCell>{v.setor}</TableCell>
                  <TableCell>{v.motoristaResponsavel}</TableCell>
                  <TableCell className="text-xs">{v.quilometragem.toLocaleString("pt-BR")} km</TableCell>
                  <TableCell><StatusSemaphore status={v.status} /></TableCell>
                  <TableCell>
                    {v.alertas.length > 0 ? (
                      <span className="flex items-center gap-1 text-xs text-warning"><AlertTriangle className="h-3 w-3" />{v.alertas.length}</span>
                    ) : <span className="text-xs text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell><Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {tab === "deslocamentos" && (
        <div className="glass-card rounded-lg p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Deslocamentos Ativos</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Placa</TableHead>
                <TableHead>Motorista</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Destino</TableHead>
                <TableHead>Saída</TableHead>
                <TableHead>Previsão</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockDeslocamentos.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-mono">{d.placa}</TableCell>
                  <TableCell>{d.motorista}</TableCell>
                  <TableCell>{d.origem}</TableCell>
                  <TableCell>{d.destino}</TableCell>
                  <TableCell className="text-xs">{new Date(d.horarioSaida).toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</TableCell>
                  <TableCell className="text-xs">{new Date(d.horarioPrevistoChegada).toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</TableCell>
                  <TableCell><StatusSemaphore status={d.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default FrotaPage;
