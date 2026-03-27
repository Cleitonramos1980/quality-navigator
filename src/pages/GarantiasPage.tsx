import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StatusBadge from "@/components/StatusBadge";
import { getGarantias } from "@/services/garantias";
import type { GarantiaCaso } from "@/types/sgq";
import { useToast } from "@/components/ui/use-toast";

const GarantiasPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [garantias, setGarantias] = useState<GarantiaCaso[]>([]);

  useEffect(() => {
    getGarantias().then(setGarantias).catch((error) => { const message = error instanceof Error ? error.message : "Falha ao carregar dados."; toast({ title: "Erro ao carregar dados", description: message, variant: "destructive" }); });
  }, []);

  const filtered = garantias.filter(
    (g) =>
      g.clienteNome.toLowerCase().includes(search.toLowerCase()) ||
      g.id.toLowerCase().includes(search.toLowerCase()) ||
      g.defeito.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Garantias</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestão de casos de garantia de produtos</p>
        </div>
        <Button className="gap-2" onClick={() => navigate("/garantias/nova")}>
          <Plus className="w-4 h-4" />
          Nova Garantia
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente, ID ou defeito..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      <div className="glass-card rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">ID</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Cliente</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Defeito</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Planta</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Custo Est.</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Data</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((g) => (
                <tr key={g.id} className="border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-medium text-primary">{g.id}</td>
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-foreground">{g.clienteNome}</div>
                      <div className="text-xs text-muted-foreground">COD: {g.codcli}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize">{g.defeito}</td>
                  <td className="px-4 py-3"><span className="font-mono text-xs">{g.plantaResp}</span></td>
                  <td className="px-4 py-3"><StatusBadge status={g.status} /></td>
                  <td className="px-4 py-3 font-mono text-xs">{g.custoEstimado ? `R$ ${g.custoEstimado.toFixed(2)}` : "-"}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{g.abertoAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GarantiasPage;



