import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { History, Search, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SectionCard from "@/components/forms/SectionCard";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { listInspecoesMola } from "@/services/inspecoes";
import type { InspecaoMola } from "@/types/inspecoes";
import { MAQUINAS_MOLA } from "@/types/inspecoes";

const MolasHistoricoPage = () => {
  const { toast } = useToast();
  const [inspecoes, setInspecoes] = useState<InspecaoMola[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtroMaquina, setFiltroMaquina] = useState("");
  const [filtroResultado, setFiltroResultado] = useState("");

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try { setInspecoes(await listInspecoesMola()); }
      catch (e) { toast({ title: "Erro", description: e instanceof Error ? e.message : "Falha", variant: "destructive" }); }
      finally { setLoading(false); }
    })();
  }, []);

  const filtered = inspecoes.filter((i) => {
    if (filtroMaquina && i.maquina !== filtroMaquina) return false;
    if (filtroResultado && i.resultado !== filtroResultado) return false;
    return true;
  }).sort((a, b) => b.dataHora.localeCompare(a.dataHora));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <History className="w-6 h-6 text-primary" />
          Histórico — Inspeções de Molas
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">Todas as inspeções dimensionais de molas</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <select value={filtroMaquina} onChange={(e) => setFiltroMaquina(e.target.value)} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">Todas as Máquinas</option>
          {MAQUINAS_MOLA.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={filtroResultado} onChange={(e) => setFiltroResultado(e.target.value)} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">Todos Resultados</option>
          <option value="APROVADO">Aprovado</option>
          <option value="REPROVADO">Reprovado</option>
        </select>
      </div>

      <SectionCard title="Inspeções" description={loading ? "Carregando..." : `${filtered.length} registro(s)`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-3 py-2">Código</th>
                <th className="text-left px-3 py-2">Máquina</th>
                <th className="text-left px-3 py-2">Data/Hora</th>
                <th className="text-left px-3 py-2">Altura/Tipo</th>
                <th className="text-left px-3 py-2">Operador</th>
                <th className="text-left px-3 py-2">Resultado</th>
                <th className="text-left px-3 py-2">Ação</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-3 py-8 text-center text-muted-foreground">Nenhuma inspeção encontrada.</td></tr>
              ) : filtered.map((i) => (
                <tr key={i.id} className="border-b border-border/60 hover:bg-muted/10">
                  <td className="px-3 py-2 font-mono text-xs">{i.id}</td>
                  <td className="px-3 py-2 font-medium">{i.maquina}</td>
                  <td className="px-3 py-2">{new Date(i.dataHora).toLocaleString("pt-BR")}</td>
                  <td className="px-3 py-2">{i.alturaTipo}</td>
                  <td className="px-3 py-2">{i.operador}</td>
                  <td className="px-3 py-2"><Badge variant={i.resultado === "APROVADO" ? "default" : "destructive"}>{i.resultado}</Badge></td>
                  <td className="px-3 py-2"><Button asChild size="sm" variant="ghost"><Link to={`/inspecoes/molas/${i.id}`}><Eye className="w-4 h-4" /></Link></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
};

export default MolasHistoricoPage;
