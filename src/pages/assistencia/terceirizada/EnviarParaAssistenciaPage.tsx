import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { listarAssistenciasTerceirizadas, enviarParaAssistencia } from "@/services/assistenciaTerceirizada";
import type { AssistenciaTerceirizada, TipoItem } from "@/types/assistenciaTerceirizada";
import { toast } from "sonner";

const EnviarParaAssistenciaPage = () => {
  const navigate = useNavigate();
  const [assistencias, setAssistencias] = useState<AssistenciaTerceirizada[]>([]);
  const [form, setForm] = useState({
    assistenciaId: "",
    tipoItem: "PECA" as TipoItem,
    codigoItem: "",
    descricao: "",
    numeroSerie: "",
    patrimonio: "",
    quantidade: 1,
    defeito: "",
    osReferencia: "",
    responsavelEnvio: "",
    dataEnvio: new Date().toISOString().slice(0, 10),
    observacao: "",
  });

  useEffect(() => {
    listarAssistenciasTerceirizadas().then((list) => setAssistencias(list.filter((a) => a.status === "ATIVA")));
  }, []);

  const handleSubmit = async () => {
    if (!form.assistenciaId) { toast.error("Selecione a assistência técnica"); return; }
    if (!form.codigoItem.trim()) { toast.error("Código do item é obrigatório"); return; }
    if (!form.descricao.trim()) { toast.error("Descrição é obrigatória"); return; }
    if (!form.defeito.trim()) { toast.error("Defeito relatado é obrigatório"); return; }
    if (!form.responsavelEnvio.trim()) { toast.error("Responsável é obrigatório"); return; }
    if (form.quantidade < 1) { toast.error("Quantidade mínima é 1"); return; }

    try {
      const assistencia = assistencias.find((a) => a.id === form.assistenciaId);
      await enviarParaAssistencia({
        ...form,
        assistenciaNome: assistencia?.nome || "",
        numeroSerie: form.numeroSerie || undefined,
        patrimonio: form.patrimonio || undefined,
        osReferencia: form.osReferencia || undefined,
        observacao: form.observacao || undefined,
      });
      toast.success("Item enviado para assistência técnica");
      navigate("/assistencia/terceirizada/estoque");
    } catch {
      toast.error("Erro ao registrar envio");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/assistencia/terceirizada")}><ArrowLeft className="w-5 h-5" /></Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Enviar para Assistência</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Registrar envio de peça ou equipamento à assistência técnica</p>
        </div>
      </div>

      <Card className="glass-card">
        <CardHeader><CardTitle className="text-sm">Dados do Envio</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1">
              <Label className="text-xs">Assistência Técnica *</Label>
              <Select value={form.assistenciaId} onValueChange={(v) => setForm({ ...form, assistenciaId: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione a assistência" /></SelectTrigger>
                <SelectContent>
                  {assistencias.map((a) => <SelectItem key={a.id} value={a.id}>{a.nome} — {a.cidade}/{a.uf}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Tipo do Item *</Label>
              <Select value={form.tipoItem} onValueChange={(v) => setForm({ ...form, tipoItem: v as TipoItem })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PECA">Peça</SelectItem>
                  <SelectItem value="EQUIPAMENTO">Equipamento / Máquina</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Quantidade *</Label>
              <Input type="number" min={1} value={form.quantidade} onChange={(e) => setForm({ ...form, quantidade: Number(e.target.value) })} />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Código do Item *</Label>
              <Input value={form.codigoItem} onChange={(e) => setForm({ ...form, codigoItem: e.target.value })} />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">OS / Chamado</Label>
              <Input value={form.osReferencia} onChange={(e) => setForm({ ...form, osReferencia: e.target.value })} placeholder="Ex: OS-001" />
            </div>

            <div className="col-span-2 space-y-1">
              <Label className="text-xs">Descrição *</Label>
              <Input value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Nº de Série</Label>
              <Input value={form.numeroSerie} onChange={(e) => setForm({ ...form, numeroSerie: e.target.value })} />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Patrimônio</Label>
              <Input value={form.patrimonio} onChange={(e) => setForm({ ...form, patrimonio: e.target.value })} />
            </div>

            <div className="col-span-2 space-y-1">
              <Label className="text-xs">Defeito Relatado *</Label>
              <Textarea value={form.defeito} onChange={(e) => setForm({ ...form, defeito: e.target.value })} rows={3} />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Responsável pelo Envio *</Label>
              <Input value={form.responsavelEnvio} onChange={(e) => setForm({ ...form, responsavelEnvio: e.target.value })} />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Data de Envio</Label>
              <Input type="date" value={form.dataEnvio} onChange={(e) => setForm({ ...form, dataEnvio: e.target.value })} />
            </div>

            <div className="col-span-2 space-y-1">
              <Label className="text-xs">Observação</Label>
              <Textarea value={form.observacao} onChange={(e) => setForm({ ...form, observacao: e.target.value })} rows={2} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
            <Button onClick={handleSubmit} className="gap-2"><Send className="w-4 h-4" /> Registrar Envio</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnviarParaAssistenciaPage;
