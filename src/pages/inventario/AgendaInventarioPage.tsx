import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import InventoryStatusPill from "@/components/inventario/InventoryStatusPill";
import ExportActionsBar from "@/components/inventario/ExportActionsBar";
import { mockTarefas, mockLojas } from "@/data/mockInventarioData";
import { FREQUENCIA_LABELS, type InventarioStatus } from "@/types/inventario";

const AgendaInventarioPage = () => {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("TODOS");
  const [lojaFilter, setLojaFilter] = useState<string>("TODAS");

  const filtered = useMemo(() => {
    return mockTarefas.filter((t) => {
      if (statusFilter !== "TODOS" && t.status !== statusFilter) return false;
      if (lojaFilter !== "TODAS" && t.lojaId !== lojaFilter) return false;
      if (busca) {
        const q = busca.toLowerCase();
        return t.lojaNome.toLowerCase().includes(q) || t.supervisor.toLowerCase().includes(q) || t.departamentoNome.toLowerCase().includes(q);
      }
      return true;
    });
  }, [busca, statusFilter, lojaFilter]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Agenda de Inventário</h1>
          <p className="text-sm text-muted-foreground">Tarefas programadas por loja, departamento e frequência</p>
        </div>
        <ExportActionsBar />
      </div>

      <div className="flex flex-wrap gap-3">
        <Input placeholder="Buscar loja, supervisor, depto..." value={busca} onChange={(e) => setBusca(e.target.value)} className="w-64" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todos os Status</SelectItem>
            <SelectItem value="NAO_INICIADO">Não Iniciado</SelectItem>
            <SelectItem value="EM_ANDAMENTO">Em Andamento</SelectItem>
            <SelectItem value="CONCLUIDO">Concluído</SelectItem>
            <SelectItem value="VALIDADO">Validado</SelectItem>
            <SelectItem value="NAO_FEITO">Não Feito</SelectItem>
            <SelectItem value="ATRASADO">Atrasado</SelectItem>
            <SelectItem value="RECONTAGEM">Recontagem</SelectItem>
          </SelectContent>
        </Select>
        <Select value={lojaFilter} onValueChange={setLojaFilter}>
          <SelectTrigger className="w-52"><SelectValue placeholder="Loja" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="TODAS">Todas as Lojas</SelectItem>
            {mockLojas.map((l) => <SelectItem key={l.id} value={l.id}>{l.nome}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="glass-card rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left p-3 font-medium text-muted-foreground">Data</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Loja</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Regional</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Gerente</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Supervisor</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Departamento</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Frequência</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Responsável</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="p-3 font-mono text-xs">{t.data}</td>
                  <td className="p-3">{t.lojaNome}</td>
                  <td className="p-3">{t.regional}</td>
                  <td className="p-3">{t.gerente}</td>
                  <td className="p-3">{t.supervisor}</td>
                  <td className="p-3">{t.departamentoNome}</td>
                  <td className="p-3 text-xs">{FREQUENCIA_LABELS[t.frequencia]}</td>
                  <td className="p-3">{t.responsavel}</td>
                  <td className="p-3"><InventoryStatusPill status={t.status} /></td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      {(t.status === "NAO_INICIADO" || t.status === "EM_ANDAMENTO") && (
                        <Button size="sm" variant="outline" onClick={() => navigate(`/qualidade/inventario/digitacao/${t.contagemId}`)}>Abrir</Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => navigate("/qualidade/inventario/contagens")}>Ver</Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={10} className="p-8 text-center text-muted-foreground">Nenhuma tarefa encontrada</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AgendaInventarioPage;
