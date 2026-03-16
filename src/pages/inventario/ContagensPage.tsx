import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import InventoryStatusPill from "@/components/inventario/InventoryStatusPill";
import ExportActionsBar from "@/components/inventario/ExportActionsBar";
import { getContagens } from "@/services/inventario";
import type { Contagem } from "@/types/inventario";
import { FREQUENCIA_LABELS } from "@/types/inventario";

const ContagensPage = () => {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [contagens, setContagens] = useState<Contagem[]>([]);

  useEffect(() => { getContagens().then(setContagens); }, []);

  const filtered = useMemo(() => {
    return contagens.filter((c) => {
      if (statusFilter !== "TODOS" && c.status !== statusFilter) return false;
      if (busca) {
        const q = busca.toLowerCase();
        return c.numero.toLowerCase().includes(q) || c.lojaNome.toLowerCase().includes(q) || c.supervisor.toLowerCase().includes(q);
      }
      return true;
    });
  }, [busca, statusFilter]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contagens</h1>
          <p className="text-sm text-muted-foreground">Lista de contagens executadas e planejadas</p>
        </div>
        <ExportActionsBar />
      </div>

      <div className="flex flex-wrap gap-3">
        <Input placeholder="Buscar número, loja, supervisor..." value={busca} onChange={(e) => setBusca(e.target.value)} className="w-64" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todos</SelectItem>
            <SelectItem value="NAO_INICIADO">Não Iniciado</SelectItem>
            <SelectItem value="EM_ANDAMENTO">Em Andamento</SelectItem>
            <SelectItem value="CONCLUIDO">Concluído</SelectItem>
            <SelectItem value="VALIDADO">Validado</SelectItem>
            <SelectItem value="NAO_FEITO">Não Feito</SelectItem>
            <SelectItem value="ATRASADO">Atrasado</SelectItem>
            <SelectItem value="RECONTAGEM">Recontagem</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="glass-card rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left p-3 font-medium text-muted-foreground">Número</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Data</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Loja</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Supervisor</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Departamento</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Frequência</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Contados</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Divergentes</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Acuracidade</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="p-3 font-mono text-xs">{c.numero}</td>
                  <td className="p-3 font-mono text-xs">{c.data}</td>
                  <td className="p-3">{c.lojaNome}</td>
                  <td className="p-3">{c.supervisor}</td>
                  <td className="p-3">{c.departamentoNome}</td>
                  <td className="p-3 text-xs">{FREQUENCIA_LABELS[c.frequencia]}</td>
                  <td className="p-3"><InventoryStatusPill status={c.status} /></td>
                  <td className="p-3 text-right">{c.itensContados}</td>
                  <td className="p-3 text-right font-medium">{c.itensDivergentes > 0 ? <span className="text-destructive">{c.itensDivergentes}</span> : "0"}</td>
                  <td className="p-3 text-right">{c.acuracidade > 0 ? `${c.acuracidade}%` : "—"}</td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => navigate(`/qualidade/inventario/digitacao/${c.id}`)}>Ver</Button>
                      {c.status === "CONCLUIDO" && <Button size="sm" variant="outline" onClick={() => navigate(`/qualidade/inventario/validacao/${c.id}`)}>Validar</Button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ContagensPage;
