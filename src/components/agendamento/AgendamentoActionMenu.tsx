import { useState } from "react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  MoreHorizontal, Truck, MapPin, Play, CheckCircle2, XCircle, Clock, AlertTriangle, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { atualizarStatusAgendamento, alocarDoca } from "@/services/agendamento";
import type { AgendamentoDockSlot, AgendamentoStatus } from "@/types/agendamento";

const DOCAS = [
  { id: "DCA-001", nome: "Doca 01" },
  { id: "DCA-002", nome: "Doca 02" },
  { id: "DCA-003", nome: "Doca 03" },
  { id: "DCA-004", nome: "Doca 04" },
  { id: "DCA-005", nome: "Doca 05" },
];

interface Props {
  slot: AgendamentoDockSlot;
  onUpdate: (updated: AgendamentoDockSlot) => void;
}

type ModalType = "status" | "doca" | null;

const STATUS_TRANSITIONS: { status: AgendamentoStatus; label: string; icon: typeof Truck }[] = [
  { status: "CONFIRMADO", label: "Confirmar", icon: CheckCircle2 },
  { status: "CHEGOU", label: "Registrar Chegada", icon: Truck },
  { status: "EM_FILA", label: "Colocar em Fila", icon: Clock },
  { status: "EM_DOCA", label: "Entrou na Doca", icon: MapPin },
  { status: "EM_OPERACAO", label: "Iniciar Operação", icon: Play },
  { status: "CONCLUIDO", label: "Concluir Operação", icon: CheckCircle2 },
  { status: "ATRASADO", label: "Marcar Atraso", icon: AlertTriangle },
  { status: "NAO_COMPARECEU", label: "Registrar No-Show", icon: XCircle },
  { status: "REMARCADO", label: "Remarcar", icon: RefreshCw },
  { status: "CANCELADO", label: "Cancelar", icon: XCircle },
];

export default function AgendamentoActionMenu({ slot, onUpdate }: Props) {
  const [modal, setModal] = useState<ModalType>(null);
  const [selectedStatus, setSelectedStatus] = useState<AgendamentoStatus>("CONFIRMADO");
  const [observacao, setObservacao] = useState("");
  const [docaId, setDocaId] = useState("");
  const [saving, setSaving] = useState(false);

  const handleStatusChange = async () => {
    setSaving(true);
    try {
      const updated = await atualizarStatusAgendamento(slot.id, selectedStatus, observacao || undefined);
      onUpdate(updated);
      toast.success(`Status atualizado para ${selectedStatus}`);
      setModal(null);
      setObservacao("");
    } catch { toast.error("Erro ao atualizar status"); }
    finally { setSaving(false); }
  };

  const handleDocaChange = async () => {
    if (!docaId) return;
    setSaving(true);
    try {
      const doca = DOCAS.find(d => d.id === docaId);
      const updated = await alocarDoca(slot.id, docaId, doca?.nome || docaId);
      onUpdate(updated);
      toast.success(`Alocado na ${doca?.nome}`);
      setModal(null);
    } catch { toast.error("Erro ao alocar doca"); }
    finally { setSaving(false); }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          {STATUS_TRANSITIONS.map(t => (
            <DropdownMenuItem key={t.status} onClick={() => { setSelectedStatus(t.status); setModal("status"); }}>
              <t.icon className="h-3.5 w-3.5 mr-2" />{t.label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setModal("doca")}>
            <MapPin className="h-3.5 w-3.5 mr-2" />Alocar / Trocar Doca
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Status Modal */}
      <Dialog open={modal === "status"} onOpenChange={o => !o && setModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Alterar Status — {slot.codigo}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Novo Status</Label>
              <Select value={selectedStatus} onValueChange={v => setSelectedStatus(v as AgendamentoStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_TRANSITIONS.map(t => (
                    <SelectItem key={t.status} value={t.status}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Observação</Label>
              <Textarea placeholder="Motivo ou observação..." value={observacao} onChange={e => setObservacao(e.target.value)} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModal(null)}>Cancelar</Button>
            <Button onClick={handleStatusChange} disabled={saving}>{saving ? "Salvando..." : "Confirmar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Doca Modal */}
      <Dialog open={modal === "doca"} onOpenChange={o => !o && setModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Alocar Doca — {slot.codigo}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <Label>Selecionar Doca</Label>
            <Select value={docaId} onValueChange={setDocaId}>
              <SelectTrigger><SelectValue placeholder="Selecione a doca" /></SelectTrigger>
              <SelectContent>
                {DOCAS.map(d => <SelectItem key={d.id} value={d.id}>{d.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModal(null)}>Cancelar</Button>
            <Button onClick={handleDocaChange} disabled={saving || !docaId}>{saving ? "Salvando..." : "Alocar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
