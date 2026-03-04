import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FormField from "@/components/forms/FormField";
import SectionCard from "@/components/forms/SectionCard";
import AttachmentUploader from "@/components/upload/AttachmentUploader";
import { CANAL_LABELS, TIPO_CONTATO_LABELS, CanalContato, TipoContato } from "@/types/sac";
import { Planta, PLANTA_LABELS } from "@/types/sgq";
import { ArrowLeft, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const NovoAtendimentoPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [form, setForm] = useState({
    codcli: "", clienteNome: "", cgcent: "", telefone: "",
    canal: "" as CanalContato | "", tipoContato: "" as TipoContato | "",
    descricao: "", plantaResp: "" as Planta | "",
    numPedido: "", numNfVenda: "",
  });

  const set = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleSave = () => {
    if (!form.clienteNome || !form.descricao || !form.canal || !form.tipoContato || !form.plantaResp) {
      toast({ title: "Campos obrigatórios", description: "Preencha todos os campos obrigatórios.", variant: "destructive" });
      return;
    }
    toast({ title: "Atendimento criado", description: "Chamado SAC registrado com sucesso." });
    navigate("/sac/atendimentos");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Novo Atendimento SAC</h1>
          <p className="text-sm text-muted-foreground">Registrar novo chamado de atendimento ao cliente</p>
        </div>
      </div>

      <SectionCard title="Dados do Cliente">
        <div className="grid md:grid-cols-2 gap-4">
          <FormField label="CODCLI" hint="Código do cliente no ERP">
            <Input value={form.codcli} onChange={(e) => set("codcli", e.target.value)} placeholder="Ex: 1042" />
          </FormField>
          <FormField label="Cliente" required>
            <Input value={form.clienteNome} onChange={(e) => set("clienteNome", e.target.value)} placeholder="Nome do cliente" />
          </FormField>
          <FormField label="CPF/CNPJ">
            <Input value={form.cgcent} onChange={(e) => set("cgcent", e.target.value)} placeholder="00.000.000/0000-00" />
          </FormField>
          <FormField label="Telefone">
            <Input value={form.telefone} onChange={(e) => set("telefone", e.target.value)} placeholder="(00) 0000-0000" />
          </FormField>
        </div>
      </SectionCard>

      <SectionCard title="Dados do Atendimento">
        <div className="grid md:grid-cols-2 gap-4">
          <FormField label="Canal de Contato" required>
            <Select value={form.canal} onValueChange={(v) => set("canal", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {Object.entries(CANAL_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Tipo de Contato" required>
            <Select value={form.tipoContato} onValueChange={(v) => set("tipoContato", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {Object.entries(TIPO_CONTATO_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Planta Responsável" required>
            <Select value={form.plantaResp} onValueChange={(v) => set("plantaResp", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {Object.entries(PLANTA_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>
        <FormField label="Descrição do Problema" required className="mt-4">
          <Textarea value={form.descricao} onChange={(e) => set("descricao", e.target.value)} placeholder="Descreva detalhadamente o problema relatado pelo cliente..." rows={4} />
        </FormField>
      </SectionCard>

      <SectionCard title="Referências ERP">
        <div className="grid md:grid-cols-2 gap-4">
          <FormField label="Pedido Relacionado" hint="Número do pedido no WinThor">
            <Input value={form.numPedido} onChange={(e) => set("numPedido", e.target.value)} placeholder="PED-00000" />
          </FormField>
          <FormField label="Nota Fiscal Relacionada">
            <Input value={form.numNfVenda} onChange={(e) => set("numNfVenda", e.target.value)} placeholder="NF-000000" />
          </FormField>
        </div>
      </SectionCard>

      <SectionCard title="Evidências">
        <AttachmentUploader maxFiles={10} accept="image/*,video/*,.pdf,.doc,.docx" />
      </SectionCard>

      <div className="flex justify-end gap-3 pb-6">
        <Button variant="outline" onClick={() => navigate(-1)}><X className="w-4 h-4 mr-1" /> Cancelar</Button>
        <Button onClick={handleSave}><Save className="w-4 h-4 mr-1" /> Salvar</Button>
      </div>
    </div>
  );
};

export default NovoAtendimentoPage;
