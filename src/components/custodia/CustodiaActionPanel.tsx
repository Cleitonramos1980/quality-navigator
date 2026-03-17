import { useState, useRef } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  MapPin, CheckCircle2, Package, AlertTriangle, Camera, FileText, RotateCcw, Plus,
  XCircle, Lock, Upload, Paperclip,
} from "lucide-react";
import { toast } from "sonner";
import {
  registrarEventoCustodia, registrarEvidenciaCustodia, atualizarStatusCustodia,
} from "@/services/custodia";
import type { CustodiaNF, CustodiaStatus } from "@/types/custodiaDigital";
import { CUSTODIA_STATUS_LABELS } from "@/types/custodiaDigital";

interface Props {
  custodia: CustodiaNF;
  onUpdate: (updated: CustodiaNF) => void;
}

type ModalType = "evento" | "evidencia" | "entrega" | "ressalva" | "devolucao" | "nao_entregue" | "encerrar" | "mudar_status" | null;

const EVENTO_TIPOS = [
  { value: "CHECKPOINT", label: "Checkpoint" },
  { value: "CHEGADA", label: "Registrar Chegada" },
  { value: "TENTATIVA_ENTREGA", label: "Tentativa de Entrega" },
  { value: "OCORRENCIA", label: "Ocorrência" },
  { value: "DIVERGENCIA", label: "Divergência" },
  { value: "SAIDA", label: "Saída da Portaria" },
  { value: "LIBERACAO", label: "Liberação" },
  { value: "VINCULACAO", label: "Vinculação" },
];

const EVIDENCIA_TIPOS = [
  { value: "COMPROVANTE_SAIDA", label: "Comprovante de Saída" },
  { value: "COMPROVANTE_CHEGADA", label: "Comprovante de Chegada" },
  { value: "PROVA_ENTREGA", label: "Prova de Entrega" },
  { value: "ASSINATURA", label: "Assinatura" },
  { value: "FOTO", label: "Foto" },
  { value: "DOCUMENTO", label: "Documento" },
];

const EVIDENCIA_CATEGORIAS = [
  "Documentação", "Foto de Carga", "Comprovante", "Assinatura Digital",
  "Registro de Ocorrência", "Relatório de Inspeção", "Outro",
];

const STATUS_MANUAL: { value: CustodiaStatus; label: string }[] = [
  { value: "VINCULADA", label: "Vinculada" },
  { value: "LIBERADA", label: "Liberada" },
  { value: "SAIU_PORTARIA", label: "Saiu da Portaria" },
  { value: "EM_TRANSITO", label: "Em Trânsito" },
  { value: "EM_RISCO", label: "Em Risco" },
  { value: "CHEGADA_REGISTRADA", label: "Chegada Registrada" },
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
  const [evCategoria, setEvCategoria] = useState("");
  const [evEtapaVinculada, setEvEtapaVinculada] = useState("");
  const [evArquivoNome, setEvArquivoNome] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Entrega form
  const [recebedor, setRecebedor] = useState("");
  const [divergencia, setDivergencia] = useState("");

  // Não entregue form
  const [motivoNaoEntregue, setMotivoNaoEntregue] = useState("");

  // Encerrar form
  const [motivoEncerramento, setMotivoEncerramento] = useState("");

  // Mudar status
  const [novoStatus, setNovoStatus] = useState<CustodiaStatus>("EM_TRANSITO");

  const resetForms = () => {
    setEventoDesc(""); setEventoLocal(""); setEvDesc(""); setEvObs(""); setRecebedor("");
    setDivergencia(""); setMotivoNaoEntregue(""); setMotivoEncerramento("");
    setEvCategoria(""); setEvEtapaVinculada(""); setEvArquivoNome("");
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
        tipo: evTipo as any,
        descricao: evDesc,
        observacao: [
          evObs,
          evCategoria ? `Categoria: ${evCategoria}` : "",
          evEtapaVinculada ? `Etapa: ${evEtapaVinculada}` : "",
          evArquivoNome ? `Arquivo: ${evArquivoNome}` : "",
        ].filter(Boolean).join(" | ") || undefined,
        url: evArquivoNome || undefined,
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

  const handleNaoEntregue = async () => {
    if (!motivoNaoEntregue) return;
    setSaving(true);
    try {
      await registrarEventoCustodia(custodia.id, {
        tipo: "TENTATIVA_ENTREGA" as any, etapa: "TENTATIVA_ENTREGA",
        descricao: `Não entregue: ${motivoNaoEntregue}`,
      });
      const updated = await atualizarStatusCustodia(custodia.id, "NAO_ENTREGUE", {
        divergencia: motivoNaoEntregue, statusAceite: "RECUSADO",
      });
      onUpdate(updated);
      toast.success("Registrado como não entregue");
      setModal(null); resetForms();
    } catch { toast.error("Erro"); }
    finally { setSaving(false); }
  };

  const handleEncerrar = async () => {
    if (!motivoEncerramento) return;
    setSaving(true);
    try {
      await registrarEventoCustodia(custodia.id, {
        tipo: "ENCERRAMENTO" as any, etapa: "ENCERRAMENTO",
        descricao: `Encerramento: ${motivoEncerramento}`,
      });
      const updated = await atualizarStatusCustodia(custodia.id, "ENCERRADA", {
        divergencia: motivoEncerramento,
      });
      onUpdate(updated);
      toast.success("Custódia encerrada");
      setModal(null); resetForms();
    } catch { toast.error("Erro"); }
    finally { setSaving(false); }
  };

  const handleMudarStatus = async () => {
    setSaving(true);
    try {
      const updated = await atualizarStatusCustodia(custodia.id, novoStatus);
      onUpdate(updated);
      toast.success(`Status atualizado para ${CUSTODIA_STATUS_LABELS[novoStatus]}`);
      setModal(null);
    } catch { toast.error("Erro"); }
    finally { setSaving(false); }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEvArquivoNome(file.name);
      toast.info(`Arquivo selecionado: ${file.name}`);
    }
  };

  const isTerminal = ["ENTREGUE", "ENCERRADA", "DEVOLVIDA", "NAO_ENTREGUE"].includes(custodia.status);
  const canDeliver = !isTerminal && !["EMITIDA", "VINCULADA"].includes(custodia.status);

  return (
    <div className="glass-card rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">Ações Operacionais</h3>
        <Badge variant="secondary" className="text-[10px]">
          {CUSTODIA_STATUS_LABELS[custodia.status]}
        </Badge>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setModal("evento")} disabled={isTerminal}>
          <Plus className="h-3.5 w-3.5" />Registrar Evento
        </Button>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setModal("evidencia")}>
          <Camera className="h-3.5 w-3.5" />Anexar Evidência
        </Button>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setModal("mudar_status")} disabled={isTerminal}>
          <MapPin className="h-3.5 w-3.5" />Mudar Status
        </Button>
        <Button size="sm" className="gap-1.5" onClick={() => setModal("entrega")} disabled={!canDeliver}>
          <CheckCircle2 className="h-3.5 w-3.5" />Confirmar Entrega
        </Button>
        <Button size="sm" variant="outline" className="gap-1.5 text-warning" onClick={() => setModal("ressalva")} disabled={!canDeliver}>
          <AlertTriangle className="h-3.5 w-3.5" />Entrega c/ Ressalva
        </Button>
        <Button size="sm" variant="outline" className="gap-1.5 text-destructive" onClick={() => setModal("nao_entregue")} disabled={!canDeliver}>
          <XCircle className="h-3.5 w-3.5" />Não Entregue
        </Button>
        <Button size="sm" variant="outline" className="gap-1.5 text-destructive" onClick={() => setModal("devolucao")} disabled={isTerminal}>
          <RotateCcw className="h-3.5 w-3.5" />Devolução
        </Button>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setModal("encerrar")} disabled={custodia.status === "ENCERRADA"}>
          <Lock className="h-3.5 w-3.5" />Encerrar Custódia
        </Button>
      </div>

      {/* Hidden file input */}
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect}
        accept="image/*,.pdf,.doc,.docx" />

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

      {/* Evidencia Modal (enhanced) */}
      <Dialog open={modal === "evidencia"} onOpenChange={o => !o && setModal(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Anexar Evidência — {custodia.nfNumero}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Tipo de Evidência</Label>
                <Select value={evTipo} onValueChange={setEvTipo}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {EVIDENCIA_TIPOS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Categoria</Label>
                <Select value={evCategoria} onValueChange={setEvCategoria}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {EVIDENCIA_CATEGORIAS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Descrição *</Label>
              <Input placeholder="Descrição da evidência" value={evDesc} onChange={e => setEvDesc(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Etapa Vinculada</Label>
              <Select value={evEtapaVinculada} onValueChange={setEvEtapaVinculada}>
                <SelectTrigger><SelectValue placeholder="Vincular a uma etapa" /></SelectTrigger>
                <SelectContent>
                  {custodia.eventos.map(ev => (
                    <SelectItem key={ev.id} value={ev.etapa}>{ev.etapa} — {ev.descricao.slice(0, 40)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Arquivo / Anexo</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Nome do arquivo ou referência"
                  value={evArquivoNome}
                  onChange={e => setEvArquivoNome(e.target.value)}
                  className="flex-1"
                />
                <Button type="button" variant="outline" size="sm" className="gap-1.5 shrink-0"
                  onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-3.5 w-3.5" />Upload
                </Button>
              </div>
              {evArquivoNome && (
                <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-1.5 text-xs">
                  <Paperclip className="h-3 w-3 text-primary" />
                  <span className="truncate text-foreground">{evArquivoNome}</span>
                  <Badge variant="secondary" className="text-[9px] ml-auto">
                    {evArquivoNome.includes(".") ? "Anexado" : "Referência"}
                  </Badge>
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Observação</Label>
              <Textarea placeholder="Observação adicional..." value={evObs} onChange={e => setEvObs(e.target.value)} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModal(null)}>Cancelar</Button>
            <Button onClick={handleEvidencia} disabled={saving || !evDesc}>{saving ? "Salvando..." : "Anexar Evidência"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mudar Status Modal */}
      <Dialog open={modal === "mudar_status"} onOpenChange={o => !o && setModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Mudar Status — {custodia.nfNumero}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Novo Status</Label>
              <Select value={novoStatus} onValueChange={v => setNovoStatus(v as CustodiaStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_MANUAL.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">Status atual: <strong>{CUSTODIA_STATUS_LABELS[custodia.status]}</strong></p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModal(null)}>Cancelar</Button>
            <Button onClick={handleMudarStatus} disabled={saving}>{saving ? "Salvando..." : "Atualizar Status"}</Button>
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

      {/* Não Entregue Modal */}
      <Dialog open={modal === "nao_entregue"} onOpenChange={o => !o && setModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-destructive">
            <XCircle className="h-5 w-5" />Registrar Não Entregue — {custodia.nfNumero}
          </DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Motivo da Não Entrega *</Label>
              <Textarea placeholder="Endereço não localizado, recusa do cliente, ausente..." value={motivoNaoEntregue} onChange={e => setMotivoNaoEntregue(e.target.value)} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModal(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleNaoEntregue} disabled={saving || !motivoNaoEntregue}>
              {saving ? "Salvando..." : "Registrar Não Entregue"}
            </Button>
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

      {/* Encerrar Custódia Modal */}
      <Dialog open={modal === "encerrar"} onOpenChange={o => !o && setModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />Encerrar Custódia — {custodia.nfNumero}
          </DialogTitle></DialogHeader>
          <div className="rounded-lg border border-muted bg-muted/30 p-3 text-xs text-muted-foreground">
            O encerramento finaliza a cadeia de custódia. Nenhuma nova ação poderá ser registrada após o encerramento.
          </div>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Motivo / Observação do Encerramento *</Label>
              <Textarea placeholder="Entrega confirmada, ciclo concluído, decisão gerencial..." value={motivoEncerramento} onChange={e => setMotivoEncerramento(e.target.value)} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModal(null)}>Cancelar</Button>
            <Button onClick={handleEncerrar} disabled={saving || !motivoEncerramento}>
              {saving ? "Encerrando..." : "Encerrar Custódia"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
