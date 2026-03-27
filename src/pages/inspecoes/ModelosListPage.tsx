import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { List, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SectionCard from "@/components/forms/SectionCard";
import { useToast } from "@/components/ui/use-toast";
import { listModelosInspecao } from "@/services/inspecoes";
import type { ModeloInspecao } from "@/types/inspecoes";
import { Badge } from "@/components/ui/badge";
import { useSetoresPermitidos } from "@/hooks/useSetoresPermitidos";
import { hasSetorPermitido, isSameSetor } from "@/lib/inspecoesChecklist";
import SetorEscopoAlert from "@/components/inspecoes/SetorEscopoAlert";

const ModelosListPage = () => {
  const { toast } = useToast();
  const { setoresPermitidos, loading: loadingSetores, error: setoresError } = useSetoresPermitidos();
  const [modelos, setModelos] = useState<ModeloInspecao[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filtroSetor, setFiltroSetor] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<"" | "ativo" | "inativo">("");

  useEffect(() => {
    if (loadingSetores || setoresError) return;
    void (async () => {
      setLoading(true);
      try {
        const data = await listModelosInspecao();
        setModelos(data.filter((modelo) => hasSetorPermitido(setoresPermitidos, modelo.setor)));
      } catch (e) {
        toast({ title: "Erro", description: e instanceof Error ? e.message : "Falha", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    })();
  }, [loadingSetores, setoresError, setoresPermitidos, toast]);

  useEffect(() => {
    if (filtroSetor && !hasSetorPermitido(setoresPermitidos, filtroSetor)) {
      setFiltroSetor("");
    }
  }, [filtroSetor, setoresPermitidos]);

  const setoresDisponiveis = useMemo(() => [...setoresPermitidos].sort(), [setoresPermitidos]);

  const filtered = modelos.filter((m) => {
    if (search && !m.nome.toLowerCase().includes(search.toLowerCase())) return false;
    if (filtroSetor && !isSameSetor(m.setor, filtroSetor)) return false;
    if (filtroStatus === "ativo" && !m.ativo) return false;
    if (filtroStatus === "inativo" && m.ativo) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <List className="w-6 h-6 text-primary" />
            Modelos de Inspeção
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Checklists e modelos de inspeção dentro do seu escopo</p>
        </div>
        <Button asChild size="sm"><Link to="/inspecoes/modelos/novo"><Plus className="w-4 h-4 mr-1" />Novo Modelo</Link></Button>
      </div>

      <SetorEscopoAlert loading={loadingSetores} error={setoresError} setoresPermitidos={setoresPermitidos} />

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Pesquisar modelo..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <select value={filtroSetor} onChange={(e) => setFiltroSetor(e.target.value)} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">Todos os Setores</option>
          {setoresDisponiveis.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value as "" | "ativo" | "inativo")} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">Todos</option>
          <option value="ativo">Ativos</option>
          <option value="inativo">Inativos</option>
        </select>
      </div>

      <SectionCard title="Modelos Cadastrados" description={loading || loadingSetores ? "Carregando..." : `${filtered.length} modelo(s)`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-3 py-2">Nome</th>
                <th className="text-left px-3 py-2">Setor</th>
                <th className="text-left px-3 py-2">Itens</th>
                <th className="text-left px-3 py-2">Status</th>
                <th className="text-left px-3 py-2">Atualizado</th>
                <th className="text-left px-3 py-2">Ação</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">Nenhum modelo encontrado.</td></tr>
              ) : filtered.map((m) => (
                <tr key={m.id} className="border-b border-border/60 hover:bg-muted/10">
                  <td className="px-3 py-2 font-medium">{m.nome}</td>
                  <td className="px-3 py-2">{m.setor}</td>
                  <td className="px-3 py-2">{m.itens.length}</td>
                  <td className="px-3 py-2"><Badge variant={m.ativo ? "default" : "secondary"}>{m.ativo ? "Ativo" : "Inativo"}</Badge></td>
                  <td className="px-3 py-2 text-muted-foreground">{new Date(m.updatedAt).toLocaleDateString("pt-BR")}</td>
                  <td className="px-3 py-2">
                    <Button asChild size="sm" variant="ghost"><Link to={`/inspecoes/modelos/${m.id}`}>Editar</Link></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
};

export default ModelosListPage;
