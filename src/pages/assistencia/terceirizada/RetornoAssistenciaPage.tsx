import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { listarItensEmAssistencia, registrarRetorno } from "@/services/assistenciaTerceirizada";
import { CONDICAO_RETORNO_LABELS, ITEM_ASSISTENCIA_STATUS_LABELS, ITEM_ASSISTENCIA_STATUS_COLORS } from "@/types/assistenciaTerceirizada";
import type { ItemEmAssistencia, CondicaoRetorno } from "@/types/assistenciaTerceirizada";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const RetornoAssistenciaPage = () => {
  const navigate = useNavigate();
  const [itens, setItens] = useState<ItemEmAssistencia[]>([]);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [form, setForm] = useState({
    quantidadeRetornada: 1,
    condicaoRetorno: "CONSERTADO" as CondicaoRetorno,
    laudoObservacao: "",
    responsavelRecebimento: "",
    dataRetorno: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    listarItensEmAssistencia().then((list) => setItens(list.filter((i) => !["DEVOLVIDO", "ENCERRADO"].includes(i.status))));
  }, []);

  const selectedItem = itens.find((i) => i.id === selectedItemId);
  const saldoPendente = selectedItem ? selectedItem.quantidade - selectedItem.quantidadeRetornada : 0;

  const handleSubmit = async () => {
    if (!selectedItemId) { toast.error("Selecione o item"); return; }
    if (!form.responsavelRecebimento.trim()) { toast.error("Responsável é obrigatório"); return; }
    if (form.quantidadeRetornada < 1) { toast.error("Quantidade mínima é 1"); return; }
    if (form.quantidadeRetornada > saldoPendente) { toast.error(`Quantidade máxima é ${saldoPendente}`); return; }

    try {
      await registrarRetorno(selectedItemId, form);
      toast.success("Retorno registrado com sucesso");
      navigate("/assistencia/terceirizada/estoque");
    } catch {
      toast.error("Erro ao registrar retorno");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/assistencia/terceirizada")}><ArrowLeft className="w-5 h-5" /></Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Retorno da Assistência</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Registrar retorno de peça ou equipamento</p>
        </div>
      </div>

      <Card className="glass-card">
        <CardHeader><CardTitle className="text-sm">Selecionar Item</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedItemId} onValueChange={setSelectedItemId}>
            <SelectTrigger><SelectValue placeholder="Selecione o item a retornar" /></SelectTrigger>
            <SelectContent>
              {itens.map((i) => (
                <SelectItem key={i.id} value={i.id}>
                  {i.codigoItem} — {i.descricao} ({i.assistenciaNome})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedItem && (
            <div className="rounded-md border border-border p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{selectedItem.descricao}</span>
                <Badge className={`text-[10px] ${ITEM_ASSISTENCIA_STATUS_COLORS[selectedItem.status]}`}>{ITEM_ASSISTENCIA_STATUS_LABELS[selectedItem.status]}</Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                <div>Assistência: <span className="text-foreground">{selectedItem.assistenciaNome}</span></div>
                <div>Qtd Enviada: <span className="text-foreground">{selectedItem.quantidade}</span></div>
                <div>Saldo Pendente: <span className="text-foreground font-bold">{saldoPendente}</span></div>
              </div>
              <p className="text-xs text-muted-foreground">Defeito: {selectedItem.defeito}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedItem && (
        <Card className="glass-card">
          <CardHeader><CardTitle className="text-sm">Dados do Retorno</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs">Quantidade Retornada *</Label>
                <Input type="number" min={1} max={saldoPendente} value={form.quantidadeRetornada} onChange={(e) => setForm({ ...form, quantidadeRetornada: Number(e.target.value) })} />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Condição do Retorno *</Label>
                <Select value={form.condicaoRetorno} onValueChange={(v) => setForm({ ...form, condicaoRetorno: v as CondicaoRetorno })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(CONDICAO_RETORNO_LABELS) as CondicaoRetorno[]).map((c) => (
                      <SelectItem key={c} value={c}>{CONDICAO_RETORNO_LABELS[c]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Responsável pelo Recebimento *</Label>
                <Input value={form.responsavelRecebimento} onChange={(e) => setForm({ ...form, responsavelRecebimento: e.target.value })} />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Data de Retorno</Label>
                <Input type="date" value={form.dataRetorno} onChange={(e) => setForm({ ...form, dataRetorno: e.target.value })} />
              </div>

              <div className="col-span-2 space-y-1">
                <Label className="text-xs">Laudo / Observação Técnica</Label>
                <Textarea value={form.laudoObservacao} onChange={(e) => setForm({ ...form, laudoObservacao: e.target.value })} rows={3} />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
              <Button onClick={handleSubmit} className="gap-2"><RotateCcw className="w-4 h-4" /> Registrar Retorno</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RetornoAssistenciaPage;
