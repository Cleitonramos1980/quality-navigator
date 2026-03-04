import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Save, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FormField from "@/components/forms/FormField";
import SectionCard from "@/components/forms/SectionCard";
import AttachmentUploader from "@/components/upload/AttachmentUploader";
import { DEFEITO_OPTIONS, PLANTA_LABELS, Planta } from "@/types/sgq";
import { useToast } from "@/hooks/use-toast";

const NovaGarantiaPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const sacData = location.state as Record<string, string> | null;

  const [form, setForm] = useState({
    codcli: sacData?.codcli || "",
    clienteNome: sacData?.clienteNome || "",
    numPedido: sacData?.numPedido || "",
    numNfVenda: sacData?.numNfVenda || "",
    numNfTroca: "",
    defeito: "",
    descricao: sacData?.descricao || "",
    plantaResp: (sacData?.plantaResp || "") as Planta | "",
    custoEstimado: "",
    obs: "",
  });

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleSave = (iniciarAnalise = false) => {
    if (!form.codcli || !form.clienteNome || !form.numNfVenda || !form.defeito || !form.plantaResp) {
      toast({ title: "Campos obrigatórios", description: "Preencha todos os campos obrigatórios.", variant: "destructive" });
      return;
    }
    toast({ title: iniciarAnalise ? "Garantia criada e em análise" : "Garantia salva", description: `Status: ${iniciarAnalise ? "EM_ANALISE" : "ABERTO"}` });
    navigate("/garantias");
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/garantias")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nova Garantia</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Cadastro de novo caso de garantia</p>
        </div>
      </div>

      <SectionCard title="Dados do Cliente" description="Informações do cliente e pedido">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="CODCLI" required>
            <Input placeholder="Ex: 1042" value={form.codcli} onChange={(e) => update("codcli", e.target.value)} />
          </FormField>
          <FormField label="Cliente" required>
            <Input placeholder="Nome do cliente" value={form.clienteNome} onChange={(e) => update("clienteNome", e.target.value)} />
          </FormField>
          <FormField label="Nº Pedido de Compra">
            <Input placeholder="PED-00000" value={form.numPedido} onChange={(e) => update("numPedido", e.target.value)} />
          </FormField>
          <FormField label="Nº NF Venda" required>
            <Input placeholder="NF-000000" value={form.numNfVenda} onChange={(e) => update("numNfVenda", e.target.value)} />
          </FormField>
          <FormField label="Nº NF Troca">
            <Input placeholder="NF-T-0000" value={form.numNfTroca} onChange={(e) => update("numNfTroca", e.target.value)} />
          </FormField>
        </div>
      </SectionCard>

      <SectionCard title="Informações do Defeito" description="Detalhes sobre o problema reportado">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Defeito" required>
            <Select value={form.defeito} onValueChange={(v) => update("defeito", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione o defeito" /></SelectTrigger>
              <SelectContent>
                {DEFEITO_OPTIONS.map((d) => (
                  <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Planta Responsável" required>
            <Select value={form.plantaResp} onValueChange={(v) => update("plantaResp", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione a planta" /></SelectTrigger>
              <SelectContent>
                {(Object.keys(PLANTA_LABELS) as Planta[]).map((p) => (
                  <SelectItem key={p} value={p}>{p} – {PLANTA_LABELS[p]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Custo Estimado (R$)">
            <Input type="number" placeholder="0.00" value={form.custoEstimado} onChange={(e) => update("custoEstimado", e.target.value)} />
          </FormField>
        </div>
        <FormField label="Descrição detalhada">
          <Textarea placeholder="Descreva o problema em detalhes..." value={form.descricao} onChange={(e) => update("descricao", e.target.value)} rows={3} />
        </FormField>
        <FormField label="Observações">
          <Textarea placeholder="Observações adicionais..." value={form.obs} onChange={(e) => update("obs", e.target.value)} rows={2} />
        </FormField>
      </SectionCard>

      <SectionCard title="Evidências" description="Anexe fotos, vídeos ou documentos">
        <AttachmentUploader accept="image/*,video/*,.pdf,.docx" maxFiles={10} />
      </SectionCard>

      <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2">
        <Button variant="outline" onClick={() => navigate("/garantias")}>Cancelar</Button>
        <Button variant="secondary" className="gap-2" onClick={() => handleSave(false)}>
          <Save className="w-4 h-4" /> Salvar
        </Button>
        <Button className="gap-2" onClick={() => handleSave(true)}>
          <Play className="w-4 h-4" /> Salvar e Iniciar Análise
        </Button>
      </div>
    </div>
  );
};

export default NovaGarantiaPage;
