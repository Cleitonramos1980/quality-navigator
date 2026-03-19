import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { History, Search, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SectionCard from "@/components/forms/SectionCard";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { listExecucoesInspecao } from "@/services/inspecoes";
import type { ExecucaoInspecao } from "@/types/inspecoes";
import { cn } from "@/lib/utils";
import { useSetoresPermitidos } from "@/hooks/useSetoresPermitidos";

const HistoricoInspecoesPage = () => {
  const { toast } = useToast();
  const { setoresPermitidos, loading: loadingSetores } = useSetoresPermitidos();
  const [execucoes, setExecucoes] = useState<ExecucaoInspecao[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filtroSetor, setFiltroSetor] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroNc, setFiltroNc] = useState<"" | "com" | "sem">("");

  useEffect(() => {
    if (loadingSetores) return;
    void (async () => {
      setLoading(true);
      try {
        const data = await listExecucoesInspecao();
        setExecucoes(data.filter((execucao) => setoresPermitidos.includes(execucao.setor)));
      } catch (e) {
        toast({ title: "Erro", description: e instanceof Error ? e.message : "Falha", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    })();
  }, [loadingSetores, setoresPermitidos, toast]);

  useEffect(() => {
    if (filtroSetor && !setoresPermitidos.includes(filtroSetor)) {
      setFiltroSetor("");
    }
  }, [filtroSetor, setoresPermitidos]);

  const setoresDisponiveis = useMemo(() => [...setoresPermitidos].sort(), [setoresPermitidos]);

  const filtered = execucoes.filter((e) => {
    if (search && !e.modeloNome.toLowerCase().includes(search.toLowerCase()) && !e.executor.toLowerCase().includes(search.toLowerCase()) && !e.id.toLowerCase().includes(search.toLowerCase())) return false;
    if (filtroSetor && e.setor !== filtroSetor) return false;
    if (filtroStatus && e.status !== filtroStatus) return false;
    if (filtroNc === "com" && e.naoConformes === 0) return false;
    if (filtroNc === "sem" && e.naoConformes > 0) return false;
    return true;
  }).sort((a, b) => b.dataHora.localeCompare(a.dataHora));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <History className="w-6 h-6 text-primary" />
          Histórico de Inspeções
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">Todas as inspeções executadas dentro do seu escopo</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Pesquisar..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <select value={filtroSetor} onChange={(e) => setFiltroSetor(e.target.value)} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">Todos os Setores</option>
          {setoresDisponiveis.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">Todos Status</option>
          <option value="CONCLUIDA">Concluída</option>
          <option value="PENDENTE">Pendente</option>
          <option value="EM_ANDAMENTO">Em Andamento</option>
          <option value="CANCELADA">Cancelada</option>
        </select>
        <select value={filtroNc} onChange={(e) => setFiltroNc(e.target.value as "" | "com" | "sem")} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">Com/Sem NC</option>
          <option value="com">Com NC</option>
          <option value="sem">Sem NC</option>
        </select>
      </div>

      <SectionCard title="Inspeções Realizadas" description={loading || loadingSetores ? "Carregando..." : `${filtered.length} registro(s)`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-3 py-2">Código</th>
                <th className="text-left px-3 py-2">Data/Hora</th>
                <th className="text-left px-3 py-2">Setor</th>
                <th className="text-left px-3 py-2">Modelo</th>
                <th className="text-left px-3 py-2">Executor</th>
                <th className="text-left px-3 py-2">Conformidade</th>
                <th className="text-left px-3 py-2">NCs</th>
                <th className="text-left px-3 py-2">Status</th>
                <th className="text-left px-3 py-2">Ação</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="px-3 py-8 text-center text-muted-foreground">Nenhuma inspeção encontrada.</td></tr>
              ) : filtered.map((e) => (
                <tr key={e.id} className="border-b border-border/60 hover:bg-muted/10">
                  <td className="px-3 py-2 font-mono text-xs">{e.id}</td>
                  <td className="px-3 py-2">{new Date(e.dataHora).toLocaleString("pt-BR")}</td>
                  <td className="px-3 py-2">{e.setor}</td>
                  <td className="px-3 py-2 max-w-[200px] truncate">{e.modeloNome}</td>
                  <td className="px-3 py-2">{e.executor}</td>
                  <td className="px-3 py-2">
                    <span className={cn("font-bold", e.taxaConformidade >= 90 ? "text-success" : e.taxaConformidade >= 70 ? "text-warning" : "text-destructive")}>
                      {e.taxaConformidade}%
                    </span>
                  </td>
                  <td className="px-3 py-2">{e.naoConformes > 0 ? <Badge variant="destructive">{e.naoConformes}</Badge> : <span className="text-muted-foreground">0</span>}</td>
                  <td className="px-3 py-2"><Badge variant={e.status === "CONCLUIDA" ? "default" : "secondary"}>{e.status}</Badge></td>
                  <td className="px-3 py-2"><Button asChild size="sm" variant="ghost"><Link to={`/inspecoes/execucoes/${e.id}`}><Eye className="w-4 h-4" /></Link></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
};

export default HistoricoInspecoesPage;
