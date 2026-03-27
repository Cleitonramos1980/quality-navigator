import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, Shield, AlertTriangle, Clock, Eye } from "lucide-react";
import { getAcessos } from "@/services/operacional";
import type { Acesso } from "@/types/operacional";
import { Button } from "@/components/ui/button";
import KPICard from "@/components/KPICard";
import StatusSemaphore from "@/components/operacional/StatusSemaphore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";

const PresencaPainelPage = () => {
  const { toast } = useToast();
  const [allAcessos, setAllAcessos] = useState<Acesso[]>([]);
  useEffect(() => { getAcessos().then(setAllAcessos).catch((error) => { const message = error instanceof Error ? error.message : "Falha ao carregar dados."; toast({ title: "Erro ao carregar dados", description: message, variant: "destructive" }); }); }, []);

  const presentes = allAcessos.filter((a) => ["ENTRADA_REGISTRADA", "EM_PERMANENCIA"].includes(a.status));
  const visitantes = presentes.filter((a) => a.tipo === "VISITANTE");
  const motoristas = presentes.filter((a) => a.tipo === "MOTORISTA");
  const prestadores = presentes.filter((a) => a.tipo === "PRESTADOR");

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Painel de PresenÃ§a / EvacuaÃ§Ã£o</h1>
          <p className="text-sm text-muted-foreground mt-1">Quem estÃ¡ dentro da unidade agora â€” visÃ£o operacional para emergÃªncias</p>
        </div>
        <Button variant="destructive" size="sm"><AlertTriangle className="mr-1.5 h-4 w-4" />Modo EvacuaÃ§Ã£o</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Presentes" value={presentes.length} icon={<Users className="w-5 h-5" />} />
        <KPICard title="Visitantes" value={visitantes.length} icon={<Users className="w-5 h-5" />} />
        <KPICard title="Motoristas" value={motoristas.length} icon={<Users className="w-5 h-5" />} />
        <KPICard title="Prestadores" value={prestadores.length} icon={<Shield className="w-5 h-5" />} />
      </div>

      <div className="glass-card rounded-lg p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Lista Operacional â€” Presentes na Unidade</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Setor</TableHead>
              <TableHead>Entrada</TableHead>
              <TableHead>VeÃ­culo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>AÃ§Ãµes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {presentes.length === 0 && (
              <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">Nenhuma pessoa presente na unidade.</TableCell></TableRow>
            )}
            {presentes.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium">{a.nome}</TableCell>
                <TableCell><StatusSemaphore status={a.tipo} /></TableCell>
                <TableCell>{a.empresa}</TableCell>
                <TableCell>{a.setorDestino}</TableCell>
                <TableCell className="text-xs">{a.horarioReal ? new Date(a.horarioReal).toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "â€”"}</TableCell>
                <TableCell className="font-mono text-xs">{a.placa || "â€”"}</TableCell>
                <TableCell><StatusSemaphore status={a.status} /></TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" asChild><Link to={`/portaria/${a.id}`}><Eye className="h-4 w-4" /></Link></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PresencaPainelPage;

