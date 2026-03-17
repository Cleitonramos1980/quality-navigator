import { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { editarAgendamento } from "@/services/agendamento";
import type { AgendamentoDockSlot, AgendamentoPrioridade } from "@/types/agendamento";
import type { TipoOperacao } from "@/types/operacional";

const DOCAS = [
  { id: "DCA-001", nome: "Doca 01" },
  { id: "DCA-002", nome: "Doca 02" },
  { id: "DCA-003", nome: "Doca 03" },
  { id: "DCA-004", nome: "Doca 04" },
  { id: "DCA-005", nome: "Doca 05" },
];

const TIPO_OPERACAO_OPTIONS: { value: TipoOperacao; label: string }[] = [
  { value: "CARGA", label: "Carga" },
  { value: "DESCARGA", label: "Descarga" },
  { value: "COLETA", label: "Coleta" },
  { value: "DEVOLUCAO", label: "Devolução" },
  { value: "TRANSFERENCIA", label: "Transferência" },
  { value: "MANUTENCAO_SERVICO", label: "Manutenção / Serviço" },
];

interface Props {
  slot: AgendamentoDockSlot;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updated: AgendamentoDockSlot) => void;
}

export default function EditarAgendamentoModal({ slot, open, onOpenChange, onUpdate }: Props) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    transportadoraNome: "",
    motoristaNome: "",
    placa: "",
    tipoOperacao: "",
    docaPrevistaId: "",
    prioridade: "NORMAL" as AgendamentoPrioridade,
    data: "",
    horaInicio: "",
    horaFim: "",
    duracaoPrevistaMin: "60",
    observacoes: "",
    nfVinculada: "",
  });

  useEffect(() => {
    if (open && slot) {
      const dtPrev = slot.dataHoraPrevista ? new Date(slot.dataHoraPrevista) : new Date();
      setForm({
        transportadoraNome: slot.transportadoraNome || "",
        motoristaNome: slot.motoristaNome || "",
        placa: slot.placa || "",
        tipoOperacao: slot.tipoOperacao || "",
        docaPrevistaId: slot.docaPrevistaId || "",
        prioridade: slot.prioridade || "NORMAL",
        data: dtPrev.toISOString().slice(0, 10),
        horaInicio: dtPrev.toTimeString().slice(0, 5),
        horaFim: slot.janelaFim ? new Date(slot.janelaFim).toTimeString().slice(0, 5) : "",
        duracaoPrevistaMin: String(slot.duracaoPrevistaMin || 60),
        observacoes: slot.observacoes || "",
        nfVinculada: slot.nfVinculada || "",
      });
    }
  }, [open, slot]);

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  const handleSave = async () => {
    if (!form.transportadoraNome || !form.data || !form.horaInicio) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }
    setSaving(true);
    try {
      const janelaInicio = `${form.data}T${form.horaInicio}:00`;
      const horaFim = form.horaFim || (() => {
        const [h, m] = form.horaInicio.split(":").map(Number);
        const total = h * 60 + m + Number(form.duracaoPrevistaMin);
        return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
      })();
      const janelaFim = `${form.data}T${horaFim}:00`;
      const doca = DOCAS.find(d => d.id === form.docaPrevistaId);

      const updated = await editarAgendamento(slot.id, {
        dataHoraPrevista: janelaInicio,
        janelaInicio,
        janelaFim,
        transportadoraNome: form.transportadoraNome,
        motoristaNome: form.motoristaNome || undefined,
        placa: form.placa || undefined,
        tipoOperacao: form.tipoOperacao as TipoOperacao,
        docaPrevistaId: form.docaPrevistaId,
        docaPrevistaNome: doca?.nome,
        prioridade: form.prioridade,
        duracaoPrevistaMin: Number(form.duracaoPrevistaMin),
        observacoes: form.observacoes || undefined,
        nfVinculada: form.nfVinculada || undefined,
      });
      onUpdate(updated);
      toast.success("Agendamento atualizado com sucesso");
      onOpenChange(false);
    } catch {
      toast.error("Erro ao atualizar agendamento");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Agendamento — {slot.codigo}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Transportadora *</Label>
              <Input value={form.transportadoraNome} onChange={e => update("transportadoraNome", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Motorista</Label>
              <Input value={form.motoristaNome} onChange={e => update("motoristaNome", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Placa</Label>
              <Input value={form.placa} onChange={e => update("placa", e.target.value.toUpperCase())} maxLength={8} />
            </div>
            <div className="space-y-1.5">
              <Label>Tipo Operação</Label>
              <Select value={form.tipoOperacao} onValueChange={v => update("tipoOperacao", v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {TIPO_OPERACAO_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Data *</Label>
              <Input type="date" value={form.data} onChange={e => update("data", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Hora Início *</Label>
              <Input type="time" value={form.horaInicio} onChange={e => update("horaInicio", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Hora Fim</Label>
              <Input type="time" value={form.horaFim} onChange={e => update("horaFim", e.target.value)} />
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Doca</Label>
              <Select value={form.docaPrevistaId} onValueChange={v => update("docaPrevistaId", v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {DOCAS.map(d => <SelectItem key={d.id} value={d.id}>{d.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Prioridade</Label>
              <Select value={form.prioridade} onValueChange={v => update("prioridade", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="NORMAL">Normal</SelectItem>
                  <SelectItem value="ALTA">Alta</SelectItem>
                  <SelectItem value="URGENTE">Urgente</SelectItem>
                  <SelectItem value="CRITICA">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Duração (min)</Label>
              <Input type="number" min={15} max={480} value={form.duracaoPrevistaMin} onChange={e => update("duracaoPrevistaMin", e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>NF Vinculada</Label>
            <Input value={form.nfVinculada} onChange={e => update("nfVinculada", e.target.value)} placeholder="Ex: NF-114000" />
          </div>
          <div className="space-y-1.5">
            <Label>Observações</Label>
            <Textarea value={form.observacoes} onChange={e => update("observacoes", e.target.value)} rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? "Salvando..." : "Salvar Alterações"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
