import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StatusBadge from "@/components/StatusBadge";
import { mockNCs } from "@/data/mockData";

const NCPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = mockNCs.filter(
    (nc) =>
      nc.descricao.toLowerCase().includes(search.toLowerCase()) ||
      nc.id.toLowerCase().includes(search.toLowerCase()) ||
      nc.responsavel.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Não Conformidades</h1>
          <p className="text-sm text-muted-foreground mt-1">Registro e acompanhamento de não conformidades</p>
        </div>
        <Button className="gap-2" onClick={() => navigate("/nao-conformidades/nova")}>
          <Plus className="w-4 h-4" />
          Nova NC
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button variant="outline" size="icon"><Filter className="w-4 h-4" /></Button>
      </div>

      <div className="glass-card rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">ID</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Descrição</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tipo</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Gravidade</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Planta</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Responsável</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Prazo</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((nc) => (
                <tr key={nc.id} className="border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-medium text-primary">{nc.id}</td>
                  <td className="px-4 py-3 max-w-xs truncate">{nc.descricao}</td>
                  <td className="px-4 py-3 text-xs">{nc.tipoNc}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={nc.gravidade} />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{nc.planta}</td>
                  <td className="px-4 py-3">{nc.responsavel}</td>
                  <td className="px-4 py-3"><StatusBadge status={nc.status} /></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{nc.prazo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NCPage;
