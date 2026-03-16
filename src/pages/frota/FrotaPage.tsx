import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Truck, CheckCircle, AlertTriangle, Wrench, Ban, MapPin, Eye, PlusCircle, Send } from "lucide-react";
import KPICard from "@/components/KPICard";
import StatusSemaphore from "@/components/operacional/StatusSemaphore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getVeiculosFrota, getDeslocamentos, getDocas } from "@/services/operacional";
import type { VeiculoFrota, DeslocamentoFrota, Doca } from "@/types/operacional";
import RegistrarMovimentacaoModal from "@/components/frota/RegistrarMovimentacaoModal";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(152, 60%, 40%)", "hsl(220, 70%, 45%)", "hsl(200, 80%, 50%)", "hsl(38, 92%, 50%)", "hsl(0, 72%, 51%)", "hsl(280, 60%, 50%)"];

const FrotaPage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("visao");
  const [busca, setBusca] = useState("");
  const [movVeiculo, setMovVeiculo] = useState<VeiculoFrota | null>(null);
  const [allFrota, setAllFrota] = useState<VeiculoFrota[]>([]);
  const [allDeslocamentos, setAllDeslocamentos] = useState<DeslocamentoFrota[]>([]);
  const [allDocas, setAllDocas] = useState<Doca[]>([]);

  useEffect(() => {
    getVeiculosFrota().then(setAllFrota);
    getDeslocamentos().then(setAllDeslocamentos);
    getDocas().then(setAllDocas);
  }, []);

  const getLocalizacao = (v: VeiculoFrota) => {
    const doca = allDocas.find((d) => d.placaAtual === v.placa);
    if (doca) return { local: doca.nome, doca: doca.nome };
    if (v.status === "EM_DESLOCAMENTO") return { local: "Em rota", doca: null };
    if (v.status === "EM_MANUTENCAO") return { local: "Oficina", doca: null };
    return { local: "Garagem", doca: null };
  };

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    allFrota.forEach((v) => { counts[v.status] = (counts[v.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name: name.replace(/_/g, " "), value }));
  }, [allFrota]);

  const tipoData = useMemo(() => {
    const counts: Record<string, number> = {};
    allFrota.forEach((v) => { counts[v.tipo] = (counts[v.tipo] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [allFrota]);

  const veiculos = useMemo(() => {
    if (!busca) return allFrota;
    const q = busca.toLowerCase();
    return allFrota.filter((v) => v.placa.toLowerCase().includes(q) || v.modelo.toLowerCase().includes(q) || v.motoristaResponsavel.toLowerCase().includes(q));
  }, [busca, allFrota]);

  const kpis = {
    total: allFrota.length,
    disponiveis: allFrota.filter((v) => v.status === "DISPONIVEL").length,
    emDeslocamento: allFrota.filter((v) => v.status === "EM_DESLOCAMENTO").length,
    emManutencao: allFrota.filter((v) => v.status === "EM_MANUTENCAO").length,
    bloqueados: allFrota.filter((v) => v.status === "BLOQUEADO").length,
    paradosNP: allFrota.filter((v) => v.status === "PARADA_NAO_PROGRAMADA" || v.status === "PARADA_PROGRAMADA").length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Frota</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestão da frota própria — veículos, deslocamentos e manutenções</p>
        </div>
        <Button onClick={() => navigate("/frota/despacho")} className="gap-2">
          <Send className="h-4 w-4" /> Novo Despacho
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard title="Total" value={kpis.total} icon={<Truck className="w-5 h-5" />} onClick={() => setTab("veiculos")} />
        <KPICard title="Disponíveis" value={kpis.disponiveis} icon={<CheckCircle className="w-5 h-5" />} onClick={() => { setTab("veiculos"); setBusca(""); }} />
        <KPICard title="Deslocamento" value={kpis.emDeslocamento} icon={<MapPin className="w-5 h-5" />} onClick={() => setTab("deslocamentos")} />
        <KPICard title="Parados" value={kpis.paradosNP} icon={<AlertTriangle className="w-5 h-5" />} onClick={() => setTab("veiculos")} />
        <KPICard title="Manutenção" value={kpis.emManutencao} icon={<Wrench className="w-5 h-5" />} onClick={() => setTab("veiculos")} />
        <KPICard title="Bloqueados" value={kpis.bloqueados} icon={<Ban className="w-5 h-5" />} onClick={() => setTab("veiculos")} />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="visao">Visão Geral</TabsTrigger>
          <TabsTrigger value="veiculos">Veículos</TabsTrigger>
          <TabsTrigger value="deslocamentos">Deslocamentos</TabsTrigger>
          <TabsTrigger value="localizacao">Localização</TabsTrigger>
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
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setMovVeiculo(v)} title="Registrar Movimentação">
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/frota/${v.id}`)} title="Ver Detalhe">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
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
                <TableHead>NFs</TableHead>
                <TableHead>Saída</TableHead>
                <TableHead>Previsão</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allDeslocamentos.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-mono">{d.placa}</TableCell>
                  <TableCell>{d.motorista}</TableCell>
                  <TableCell>{d.origem}</TableCell>
                  <TableCell>{d.destino}</TableCell>
                  <TableCell className="text-xs">
                    {d.notasFiscais && d.notasFiscais.length > 0
                      ? d.notasFiscais.map((nf) => nf.numero).join(", ")
                      : "—"}
                  </TableCell>
                  <TableCell className="text-xs">{new Date(d.horarioSaida).toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</TableCell>
                  <TableCell className="text-xs">{new Date(d.horarioPrevistoChegada).toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</TableCell>
                  <TableCell><StatusSemaphore status={d.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {tab === "localizacao" && (
        <div className="glass-card rounded-lg p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" /> Painel de Localização da Frota
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {mockFrota.map((v) => {
              const loc = getLocalizacao(v);
              return (
                <div
                  key={v.id}
                  className="rounded-lg border bg-card p-4 cursor-pointer hover:shadow-md transition-all"
                  onClick={() => navigate(`/frota/${v.id}`)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-sm text-foreground">{v.placa}</span>
                    <StatusSemaphore status={v.status} />
                  </div>
                  <p className="text-xs text-muted-foreground">{v.modelo} • {v.tipo}</p>
                  <p className="text-xs text-muted-foreground mt-1">{v.motoristaResponsavel}</p>
                  <div className="mt-3 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    <span className="text-sm font-medium text-primary">{loc.local}</span>
                  </div>
                  {loc.doca && (
                    <p className="text-xs text-foreground/70 mt-1">Doca: {loc.doca}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {movVeiculo && (
        <RegistrarMovimentacaoModal
          veiculo={movVeiculo}
          open={!!movVeiculo}
          onClose={() => setMovVeiculo(null)}
        />
      )}
    </div>
  );
};

export default FrotaPage;
