import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { XCircle } from "lucide-react";
import { toast } from "sonner";
import { atualizarStatusAgendamento } from "@/services/agendamento";
import type { AgendamentoDockSlot } from "@/types/agendamento";

const MOTIVOS_CANCELAMENTO = [
  "Solicitação da transportadora",
  "Cancelamento do pedido/carga",
  "Erro de planejamento",
  "Duplicidade de agendamento",
  "Doca indisponível",
  "Problema documental",
  "Outro",
];

interface Props {
  slot: AgendamentoDockSlot;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updated: AgendamentoDockSlot) => void;
}

export default function CancelarAgendamentoModal({ slot, open, onOpenChange, onUpdate }: Props) {
  const [saving, setSaving] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [detalhe, setDetalhe] = useState("");

  const handleCancelar = async () => {
    if (!motivo) {
      toast.error("Selecione o motivo do cancelamento");
      return;
    }
    setSaving(true);
    try {
      const updated = await atualizarStatusAgendamento(
        slot.id,
        "CANCELADO",
        `Cancelamento: ${motivo}${detalhe ? ` — ${detalhe}` : ""}`
      );
      onUpdate(updated);
      toast.success("Agendamento cancelado", {
        description: `${slot.codigo} — ${motivo}`,
      });
      onOpenChange(false);
    } catch {
      toast.error("Erro ao cancelar agendamento");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <XCircle className="h-5 w-5" />
            Cancelar Agendamento — {slot.codigo}
          </DialogTitle>
        </DialogHeader>

        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs">
          <p className="font-medium text-destructive">Esta ação não pode ser desfeita.</p>
          <p className="text-muted-foreground mt-1">
            {slot.transportadoraNome} · {slot.tipoOperacao} · {slot.docaPrevistaNome || "Sem doca"} ·{" "}
            {new Date(slot.janelaInicio).toLocaleString("pt-BR")}
          </p>
        </div>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Motivo do Cancelamento *</Label>
            <Select value={motivo} onValueChange={setMotivo}>
              <SelectTrigger><SelectValue placeholder="Selecione o motivo" /></SelectTrigger>
              <SelectContent>
                {MOTIVOS_CANCELAMENTO.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Detalhes</Label>
            <Textarea placeholder="Informações adicionais..." value={detalhe} onChange={e => setDetalhe(e.target.value)} rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Voltar</Button>
          <Button variant="destructive" onClick={handleCancelar} disabled={saving || !motivo}>
            {saving ? "Cancelando..." : "Confirmar Cancelamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
