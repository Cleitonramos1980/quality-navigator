import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SectionCard from "@/components/forms/SectionCard";
import FormField from "@/components/forms/FormField";
import { mockParametros, Parametro } from "@/services/admin";
import { useToast } from "@/hooks/use-toast";

const ParametrosPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [params, setParams] = useState<Parametro[]>(mockParametros);

  const updateParam = (chave: string, valor: string) => {
    setParams((prev) => prev.map((p) => (p.chave === chave ? { ...p, valor } : p)));
  };

  const handleSave = () => {
    toast({ title: "Parâmetros salvos", description: "Configurações atualizadas com sucesso." });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}><ArrowLeft className="w-5 h-5" /></Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Parâmetros do Sistema</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Configurações gerais do SGQ</p>
        </div>
      </div>

      <SectionCard title="SLA e Limites" description="Prazos e limites operacionais">
        <div className="space-y-4">
          {params.map((p) => (
            <FormField key={p.chave} label={p.descricao} hint={`Chave: ${p.chave}`}>
              <Input value={p.valor} onChange={(e) => updateParam(p.chave, e.target.value)} className="max-w-xs" />
            </FormField>
          ))}
        </div>
      </SectionCard>

      <div className="flex justify-end pt-2">
        <Button className="gap-2" onClick={handleSave}><Save className="w-4 h-4" /> Salvar Parâmetros</Button>
      </div>
    </div>
  );
};

export default ParametrosPage;
