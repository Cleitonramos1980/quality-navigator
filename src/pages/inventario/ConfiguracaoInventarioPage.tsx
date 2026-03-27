import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import ExportActionsBar from "@/components/inventario/ExportActionsBar";
import { getFrequenciaConfigs } from "@/services/inventario";
import type { FrequenciaConfig } from "@/types/inventario";
import { FREQUENCIA_LABELS } from "@/types/inventario";
import { toast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const ConfiguracaoInventarioPage = () => {
  const { toast } = useToast();
  const [busca, setBusca] = useState("");
  const [configs, setConfigs] = useState<FrequenciaConfig[]>([]);

  useEffect(() => { getFrequenciaConfigs().then(setConfigs).catch((error) => { const message = error instanceof Error ? error.message : "Falha ao carregar dados."; toast({ title: "Erro ao carregar dados", description: message, variant: "destructive" }); }); }, []);

  const filtered = configs.filter((c) => {
    if (!busca) return true;
    const q = busca.toLowerCase();
    return c.lojaNome.toLowerCase().includes(q) || c.departamentoNome.toLowerCase().includes(q) || c.supervisor.toLowerCase().includes(q);
  });

  const toggleAtivo = (id: string) => {
    setConfigs((prev) => prev.map((c) => c.id === id ? { ...c, ativo: !c.ativo } : c));
    toast({ title: "ConfiguraÃ§Ã£o atualizada" });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">ConfiguraÃ§Ã£o de FrequÃªncias</h1>
          <p className="text-sm text-muted-foreground">Administre as regras de agenda de inventÃ¡rio por loja e departamento</p>
        </div>
        <div className="flex gap-3">
          <ExportActionsBar />
          <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Nova Regra</Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input placeholder="Buscar loja, depto, supervisor..." value={busca} onChange={(e) => setBusca(e.target.value)} className="w-64" />
      </div>

      <div className="glass-card rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left p-3 font-medium text-muted-foreground">Loja</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Regional</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Gerente</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Supervisor</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Departamento</th>
                <th className="text-left p-3 font-medium text-muted-foreground">FrequÃªncia</th>
                <th className="text-left p-3 font-medium text-muted-foreground">PrÃ³xima ExecuÃ§Ã£o</th>
                <th className="text-left p-3 font-medium text-muted-foreground">ResponsÃ¡vel</th>
                <th className="text-center p-3 font-medium text-muted-foreground">Ativo</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="p-3">{c.lojaNome}</td>
                  <td className="p-3">{c.regional}</td>
                  <td className="p-3">{c.gerente}</td>
                  <td className="p-3">{c.supervisor}</td>
                  <td className="p-3">{c.departamentoNome}</td>
                  <td className="p-3 text-xs">{FREQUENCIA_LABELS[c.frequencia]}</td>
                  <td className="p-3 font-mono text-xs">{c.proximaExecucao}</td>
                  <td className="p-3">{c.responsavelPadrao}</td>
                  <td className="p-3 text-center">
                    <Switch checked={c.ativo} onCheckedChange={() => toggleAtivo(c.id)} />
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

export default ConfiguracaoInventarioPage;

