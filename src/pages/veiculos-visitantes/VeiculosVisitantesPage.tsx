import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Car, Eye } from "lucide-react";
import KPICard from "@/components/KPICard";
import StatusSemaphore from "@/components/operacional/StatusSemaphore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getVeiculosVisitantes } from "@/services/operacional";
import type { VeiculoVisitante } from "@/types/operacional";

const VeiculosVisitantesPage = () => {
  const [busca, setBusca] = useState("");
  const [allVeiculos, setAllVeiculos] = useState<VeiculoVisitante[]>([]);
  useEffect(() => { getVeiculosVisitantes().then(setAllVeiculos); }, []);
  const veiculos = useMemo(() => {
    if (!busca) return allVeiculos;
    const q = busca.toLowerCase();
    return allVeiculos.filter((v) => v.placa.toLowerCase().includes(q) || v.visitanteNome.toLowerCase().includes(q) || v.modelo.toLowerCase().includes(q));
  }, [busca, allVeiculos]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Veículos de Visitantes</h1>
        <p className="text-sm text-muted-foreground mt-1">Controle de veículos vinculados a visitantes</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total" value={allVeiculos.length} icon={<Car className="w-5 h-5" />} />
        <KPICard title="Estacionados" value={allVeiculos.filter((v) => v.status === "ESTACIONADO").length} icon={<Car className="w-5 h-5" />} />
        <KPICard title="Aguardando" value={allVeiculos.filter((v) => v.status === "AGUARDANDO_CHEGADA").length} icon={<Car className="w-5 h-5" />} />
        <KPICard title="Saíram" value={allVeiculos.filter((v) => v.status === "SAIU").length} icon={<Car className="w-5 h-5" />} />
      </div>

      <div className="glass-card rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Veículos Cadastrados</h3>
          <Input placeholder="Buscar por placa, modelo ou visitante..." value={busca} onChange={(e) => setBusca(e.target.value)} className="max-w-xs" />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Placa</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Modelo</TableHead>
              <TableHead>Cor</TableHead>
              <TableHead>Visitante</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Vaga</TableHead>
              <TableHead>Entrada</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {veiculos.map((v) => (
              <TableRow key={v.id}>
                <TableCell className="font-mono font-medium">{v.placa}</TableCell>
                <TableCell>{v.tipo}</TableCell>
                <TableCell>{v.modelo}</TableCell>
                <TableCell>{v.cor}</TableCell>
                <TableCell>{v.visitanteNome}</TableCell>
                <TableCell>{v.empresaOrigem}</TableCell>
                <TableCell className="text-xs">{v.localVaga || "—"}</TableCell>
                <TableCell className="text-xs">{v.horarioEntrada ? new Date(v.horarioEntrada).toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "—"}</TableCell>
                <TableCell><StatusSemaphore status={v.status} /></TableCell>
                <TableCell><Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default VeiculosVisitantesPage;
