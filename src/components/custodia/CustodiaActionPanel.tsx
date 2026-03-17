import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  MapPin, CheckCircle2, Package, AlertTriangle, Camera, FileText, Truck, RotateCcw, Plus,
} from "lucide-react";
import { toast } from "sonner";
import {
  registrarEventoCustodia, registrarEvidenciaCustodia, atualizarStatusCustodia,
} from "@/services/custodia";
import type { CustodiaNF } from "@/types/custodiaDigital";

interface Props {
  custodia: CustodiaNF;
  onUpdate: (updated: CustodiaNF) => void;
}

type ModalType = "evento" | "evidencia" | "entrega" | "ressalva" | "devolucao" | null;

const EVENTO_TIPOS = [
  { value: "CHECKPOINT", label: "Checkpoint" },
  { value: "CHEGADA", label: "Registrar Chegada" },
  { value: "TENTATIVA_ENTREGA", label: "Tentativa de Entrega" },
  { value: "OCORRENCIA", label: "Ocorrência" },
  { value: "DIVERGENCIA", label: "Divergência" },
];

const EVIDENCIA_TIPOS = [
  { value: "COMPROVANTE_SAIDA", label: "Comprovante de Saída" },
  { value: "COMPROVANTE_CHEGADA", label: "Comprovante de Chegada" },
  { value: "PROVA_ENTREGA", label: "Prova de Entrega" },
  { value: "ASSINATURA", label: "Assinatura" },
  { value: "FOTO", label: "Foto" },
  { value: "DOCUMENTO", label: "Documento" },
];

export default function CustodiaActionPanel({ custodia, onUpdate }: Props) {
  const [modal, setModal] = useState<ModalType>(null);
  const [saving, setSaving] = useState(false);

  // Evento form
  const [eventoTipo, setEventoTipo] = useState("CHECKPOINT");
  const [eventoDesc, setEventoDesc] = useState("");
  const [eventoLocal, setEventoLocal] = useState("");

  // Evidencia form
  const [evTipo, setEvTipo] = useState("FOTO");
  const [evDesc, setEvDesc] = useState("");
  const [evObs, setEvObs] = useState("");

  // Entrega form
  const [recebedor, setRecebedor] = useState("");
  const [divergencia, setDivergencia] = useState("");

  const resetForms = () => {
    setEventoDesc(""); setEventoLocal(""); setEvDesc(""); setEvObs(""); setRecebedor(""); setDivergencia("");
  };

  const handleEvento = async () => {
    if (!eventoDesc) return;
    setSaving(true);
    try {
      const updated = await registrarEventoCustodia(custodia.id, {
        tipo: eventoTipo as any, etapa: eventoTipo, descricao: eventoDesc, localizacao: eventoLocal || undefined,
      });
      onUpdate(updated);
      toast.success("Evento registrado");
      setModal(null); resetForms();
    } catch { toast.error("Erro ao registrar evento"); }
    finally { setSaving(false); }
  };

  const handleEvidencia = async () => {
    if (!evDesc) return;
    setSaving(true);
    try {
      const updated = await registrarEvidenciaCustodia(custodia.id, {
        tipo: evTipo as any, descricao: evDesc, observacao: evObs || undefined,
      });
      onUpdate(updated);
      toast.success("Evidência registrada");
      setModal(null); resetForms();
    } catch { toast.error("Erro ao registrar evidência"); }
    finally { setSaving(false); }
  };

  const handleEntrega = async () => {
    setSaving(true);
    try {
      const updated = await atualizarStatusCustodia(custodia.id, "ENTREGUE", {
        recebedorNome: recebedor, statusAceite: "ACEITO",
      });
      onUpdate(updated);
      toast.success("Entrega confirmada");
      setModal(null); resetForms();
    } catch { toast.error("Erro ao confirmar entrega"); }
    finally { setSaving(false); }
  };

  const handleRessalva = async () => {
    setSaving(true);
    try {
      const updated = await atualizarStatusCustodia(custodia.id, "ENTREGUE_COM_RESSALVA", {
        recebedorNome: recebedor, statusAceite: "ACEITO_COM_RESSALVA", divergencia,
      });
      onUpdate(updated);
      toast.success("Entrega com ressalva registrada");
      setModal(null); resetForms();
    } catch { toast.error("Erro"); }
    finally { setSaving(false); }
  };

  const handleDevolucao = async () => {
    setSaving(true);
    try {
      // Register event + update status
      await registrarEventoCustodia(custodia.id, {
        tipo: "DEVOLUCAO" as any, etapa: "DEVOLUCAO", descricao: divergencia || "Devolução registrada",
      });
      const updated = await atualizarStatusCustodia(custodia.id, "DEVOLVIDA", { divergencia });
      onUpdate(updated);
      toast.success("Devolução registrada");
      setModal(null); resetForms();
    } catch { toast.error("Erro"); }
    finally { setSaving(false); }
  };

  const isTerminal = ["ENTREGUE", "ENCERRADA", "DEVOLVIDA"].includes(custodia.status);

  return (
    <div className="glass-card rounded-lg p-4">
      <h3 className="text-sm font-semibold text-foreground mb-3">Ações Operacionais</h3>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setModal("evento")} disabled={isTerminal}>
          <Plus className="h-3.5 w-3.5" />Registrar Evento
        </Button>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setModal("evidencia")}>
          <Camera className="h-3.5 w-3.5" />Anexar Evidência
        </Button>
        <Button size="sm" className="gap-1.5" onClick={() => setModal("entrega")} disabled={isTerminal}>
          <CheckCircle2 className="h-3.5 w-3.5" />Confirmar Entrega
        </Button>
        <Button size="sm" variant="outline" className="gap-1.5 text-warning" onClick={() => setModal("ressalva")} disabled={isTerminal}>
          <AlertTriangle className="h-3.5 w-3.5" />Entrega c/ Ressalva
        </Button>
        <Button size="sm" variant="outline" className="gap-1.5 text-destructive" onClick={() => setModal("devolucao")} disabled={isTerminal}>
          <RotateCcw className="h-3.5 w-3.5" />Devolução
        </Button>
      </div>

      {/* Evento Modal */}
      <Dialog open={modal === "evento"} onOpenChange={o => !o && setModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Registrar Evento — {custodia.nfNumero}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Tipo de Evento</Label>
              <Select value={eventoTipo} onValueChange={setEventoTipo}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EVENTO_TIPOS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Descrição *</Label>
              <Textarea placeholder="Descreva o evento..." value={eventoDesc} onChange={e => setEventoDesc(e.target.value)} rows={3} />
            </div>
            <div className="space-y-1.5">
              <Label>Localização</Label>
              <Input placeholder="Local do evento" value={eventoLocal} onChange={e => setEventoLocal(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModal(null)}>Cancelar</Button>
            <Button onClick={handleEvento} disabled={saving || !eventoDesc}>{saving ? "Salvando..." : "Registrar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Evidencia Modal */}
      <Dialog open={modal === "evidencia"} onOpenChange={o => !o && setModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Anexar Evidência — {custodia.nfNumero}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={evTipo} onValueChange={setEvTipo}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EVIDENCIA_TIPOS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Descrição *</Label>
              <Input placeholder="Descrição da evidência" value={evDesc} onChange={e => setEvDesc(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Observação</Label>
              <Textarea placeholder="Observação adicional..." value={evObs} onChange={e => setEvObs(e.target.value)} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModal(null)}>Cancelar</Button>
            <Button onClick={handleEvidencia} disabled={saving || !evDesc}>{saving ? "Salvando..." : "Anexar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Entrega Modal */}
      <Dialog open={modal === "entrega"} onOpenChange={o => !o && setModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Confirmar Entrega — {custodia.nfNumero}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Recebedor</Label>
              <Input placeholder="Nome do recebedor" value={recebedor} onChange={e => setRecebedor(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModal(null)}>Cancelar</Button>
            <Button onClick={handleEntrega} disabled={saving}>{saving ? "Salvando..." : "Confirmar Entrega"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ressalva Modal */}
      <Dialog open={modal === "ressalva"} onOpenChange={o => !o && setModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Entrega com Ressalva — {custodia.nfNumero}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Recebedor</Label>
              <Input placeholder="Nome do recebedor" value={recebedor} onChange={e => setRecebedor(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Divergência / Ressalva *</Label>
              <Textarea placeholder="Descreva a ressalva..." value={divergencia} onChange={e => setDivergencia(e.target.value)} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModal(null)}>Cancelar</Button>
            <Button onClick={handleRessalva} disabled={saving || !divergencia}>{saving ? "Salvando..." : "Registrar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Devolução Modal */}
      <Dialog open={modal === "devolucao"} onOpenChange={o => !o && setModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Registrar Devolução — {custodia.nfNumero}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Motivo da Devolução *</Label>
              <Textarea placeholder="Descreva o motivo..." value={divergencia} onChange={e => setDivergencia(e.target.value)} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModal(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDevolucao} disabled={saving || !divergencia}>{saving ? "Salvando..." : "Registrar Devolução"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
