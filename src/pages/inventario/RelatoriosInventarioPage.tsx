import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import ExportActionsBar from "@/components/inventario/ExportActionsBar";
import { FileBarChart, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const relatorios = [
  { id: "aderencia-loja", label: "Aderência por Loja", desc: "Percentual de contagens realizadas por loja no período" },
  { id: "aderencia-supervisor", label: "Aderência por Supervisor", desc: "Percentual de contagens realizadas por supervisor" },
  { id: "aderencia-periodo", label: "Aderência por Período", desc: "Evolução da aderência ao longo do tempo" },
  { id: "divergencia-loja", label: "Divergência por Loja", desc: "Total e percentual de divergência por loja" },
  { id: "divergencia-depto", label: "Divergência por Departamento", desc: "Departamentos com maior incidência de divergência" },
  { id: "nao-realizadas", label: "Contagens Não Realizadas", desc: "Tarefas que não foram executadas no prazo" },
  { id: "atrasadas", label: "Contagens em Atraso", desc: "Contagens iniciadas que ultrapassaram o prazo" },
  { id: "recontagem", label: "Contagens com Recontagem", desc: "Contagens que necessitaram de recontagem" },
];

const RelatoriosInventarioPage = () => {
  const [periodo, setPeriodo] = useState("mes");

  const handleGerar = (id: string) => {
    toast({ title: "Relatório gerado", description: `O relatório "${relatorios.find((r) => r.id === id)?.label}" será exportado em instantes.` });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Relatórios de Inventário</h1>
          <p className="text-sm text-muted-foreground">Gere relatórios com exportação Excel</p>
        </div>
        <Select value={periodo} onValueChange={setPeriodo}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="semana">Semana</SelectItem>
            <SelectItem value="quinzena">Quinzena</SelectItem>
            <SelectItem value="mes">Mês</SelectItem>
            <SelectItem value="trimestre">Trimestre</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {relatorios.map((r) => (
          <Card key={r.id} className="hover:ring-2 hover:ring-primary/20 transition-all">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <FileBarChart className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-foreground">{r.label}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{r.desc}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => handleGerar(r.id)}>
                  <Download className="h-3.5 w-3.5 mr-1" /> Gerar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RelatoriosInventarioPage;
