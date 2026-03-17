import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { editarAgendamento, atualizarStatusAgendamento } from "@/services/agendamento";
import type { AgendamentoDockSlot } from "@/types/agendamento";

const MOTIVOS_REMARCACAO = [
  "Veículo não disponível",
  "Conflito operacional na doca",
  "Solicitação da transportadora",
  "Condições climáticas",
  "Falta de equipe/equipamento",
  "Problema documental",
  "Outro",
];

interface Props {
  slot: AgendamentoDockSlot;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updated: AgendamentoDockSlot) => void;
}

export default function RemarcarAgendamentoModal({ slot, open, onOpenChange, onUpdate }: Props) {
  const [saving, setSaving] = useState(false);
  const [novaData, setNovaData] = useState(new Date().toISOString().slice(0, 10));
  const [novaHoraInicio, setNovaHoraInicio] = useState("");
  const [novaHoraFim, setNovaHoraFim] = useState("");
  const [motivo, setMotivo] = useState("");
  const [impacto, setImpacto] = useState("");
  const [observacao, setObservacao] = useState("");

  const handleRemarcar = async () => {
    if (!novaData || !novaHoraInicio || !motivo) {
      toast.error("Preencha data, hora e motivo da remarcação");
      return;
    }
    setSaving(true);
    try {
      const janelaInicio = `${novaData}T${novaHoraInicio}:00`;
      const horaFim = novaHoraFim || (() => {
        const [h, m] = novaHoraInicio.split(":").map(Number);
        const total = h * 60 + m + (slot.duracaoPrevistaMin || 60);
        return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
      })();
      const janelaFim = `${novaData}T${horaFim}:00`;

      // Update fields + set status to REMARCADO
      await editarAgendamento(slot.id, {
        dataHoraPrevista: janelaInicio,
        janelaInicio,
        janelaFim,
      });
      const updated = await atualizarStatusAgendamento(
        slot.id,
        "REMARCADO",
        `Remarcação: ${motivo}${impacto ? ` | Impacto: ${impacto}` : ""}${observacao ? ` | ${observacao}` : ""}`
      );
      onUpdate(updated);
      toast.success("Agendamento remarcado com sucesso", {
        description: `Nova janela: ${novaData} às ${novaHoraInicio}`,
      });
      onOpenChange(false);
    } catch {
      toast.error("Erro ao remarcar agendamento");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Remarcar Agendamento — {slot.codigo}
          </DialogTitle>
        </DialogHeader>

        <div className="rounded-lg border border-warning/30 bg-warning/5 p-3 text-xs text-warning">
          Janela atual: {new Date(slot.janelaInicio).toLocaleString("pt-BR")} — {new Date(slot.janelaFim).toLocaleString("pt-BR")}
        </div>

        <div className="space-y-4 py-2">
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Nova Data *</Label>
              <Input type="date" value={novaData} onChange={e => setNovaData(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Nova Hora Início *</Label>
              <Input type="time" value={novaHoraInicio} onChange={e => setNovaHoraInicio(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Nova Hora Fim</Label>
              <Input type="time" value={novaHoraFim} onChange={e => setNovaHoraFim(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Motivo da Remarcação *</Label>
            <Select value={motivo} onValueChange={setMotivo}>
              <SelectTrigger><SelectValue placeholder="Selecione o motivo" /></SelectTrigger>
              <SelectContent>
                {MOTIVOS_REMARCACAO.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Impacto Operacional</Label>
            <Input placeholder="Ex: Atraso na carga do pedido #1234" value={impacto} onChange={e => setImpacto(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Observação Adicional</Label>
            <Textarea placeholder="Detalhes adicionais..." value={observacao} onChange={e => setObservacao(e.target.value)} rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleRemarcar} disabled={saving || !motivo || !novaData || !novaHoraInicio} className="bg-warning text-warning-foreground hover:bg-warning/90">
            {saving ? "Remarcando..." : "Confirmar Remarcação"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
