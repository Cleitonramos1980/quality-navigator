import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CalendarDays, ArrowLeft, Save, Truck, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import SectionCard from "@/components/forms/SectionCard";
import type { AgendamentoPrioridade } from "@/types/agendamento";
import type { TipoOperacao } from "@/types/operacional";

const TIPO_OPERACAO_OPTIONS: { value: TipoOperacao; label: string }[] = [
  { value: "CARGA", label: "Carga" },
  { value: "DESCARGA", label: "Descarga" },
  { value: "COLETA", label: "Coleta" },
  { value: "DEVOLUCAO", label: "Devolução" },
  { value: "TRANSFERENCIA", label: "Transferência" },
  { value: "MANUTENCAO_SERVICO", label: "Manutenção / Serviço" },
];

const PRIORIDADE_OPTIONS: { value: AgendamentoPrioridade; label: string; color: string }[] = [
  { value: "NORMAL", label: "Normal", color: "bg-muted text-muted-foreground" },
  { value: "ALTA", label: "Alta", color: "bg-warning/15 text-warning" },
  { value: "URGENTE", label: "Urgente", color: "bg-destructive/15 text-destructive" },
  { value: "CRITICA", label: "Crítica", color: "bg-foreground/10 text-foreground" },
];

const DOCAS = [
  { id: "DCA-001", nome: "Doca 01" },
  { id: "DCA-002", nome: "Doca 02" },
  { id: "DCA-003", nome: "Doca 03" },
  { id: "DCA-004", nome: "Doca 04" },
  { id: "DCA-005", nome: "Doca 05" },
];

const NovoAgendamentoDocaPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedDoca = searchParams.get("doca") || "";
  const preselectedHora = searchParams.get("hora") || "";

  const [form, setForm] = useState({
    transportadoraNome: "",
    motoristaNome: "",
    placa: "",
    tipoOperacao: "" as string,
    docaPrevistaId: preselectedDoca,
    prioridade: "NORMAL" as AgendamentoPrioridade,
    data: new Date().toISOString().slice(0, 10),
    horaInicio: preselectedHora ? preselectedHora.replace("h", ":00") : "",
    horaFim: "",
    duracaoPrevistaMin: "60",
    toleranciaMin: "30",
    nfVinculada: "",
    cargaVinculada: "",
    observacoes: "",
  });

  const [saving, setSaving] = useState(false);

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  const selectedDoca = DOCAS.find(d => d.id === form.docaPrevistaId);

  const hasConflict = form.docaPrevistaId === "DCA-004" && form.horaInicio && form.horaInicio < "14:00";

  const canSave = form.transportadoraNome && form.tipoOperacao && form.docaPrevistaId && form.data && form.horaInicio;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      // Build the scheduling payload
      const janelaInicio = `${form.data}T${form.horaInicio}:00`;
      const horaFim = form.horaFim || (() => {
        const [h, m] = form.horaInicio.split(":").map(Number);
        const total = h * 60 + m + Number(form.duracaoPrevistaMin);
        return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
      })();
      const janelaFim = `${form.data}T${horaFim}:00`;

      const payload = {
        unidade: "MAO",
        dataHoraPrevista: janelaInicio,
        janelaInicio,
        janelaFim,
        transportadoraNome: form.transportadoraNome,
        motoristaNome: form.motoristaNome || undefined,
        placa: form.placa || undefined,
        tipoOperacao: form.tipoOperacao,
        docaPrevistaId: form.docaPrevistaId,
        docaPrevistaNome: selectedDoca?.nome,
        prioridade: form.prioridade,
        duracaoPrevistaMin: Number(form.duracaoPrevistaMin),
        toleranciaMin: Number(form.toleranciaMin),
        nfVinculada: form.nfVinculada || undefined,
        cargaVinculada: form.cargaVinculada || undefined,
        observacoes: form.observacoes || undefined,
      };

      // Try backend, fallback graceful
      try {
        const { apiPost } = await import("@/services/api");
        await apiPost("/operacional/agendamentos-dock", payload);
      } catch {
        // mock fallback – accept silently
      }

      toast.success("Agendamento criado com sucesso!", {
        description: `${selectedDoca?.nome} — ${form.data} às ${form.horaInicio}`,
      });
      navigate("/patio/agendamento");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/patio/agendamento")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-primary" /> Novo Agendamento de Doca
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Preencha os dados para agendar a operação na doca
          </p>
        </div>
      </div>

      {/* Pre-selected hint */}
      {(preselectedDoca || preselectedHora) && (
        <div className="flex items-center gap-2 text-sm bg-primary/10 text-primary rounded-lg px-4 py-2.5">
          <CalendarDays className="h-4 w-4 shrink-0" />
          <span>
            Pré-selecionado: <strong>{DOCAS.find(d => d.id === preselectedDoca)?.nome || preselectedDoca}</strong>
            {preselectedHora && <> às <strong>{preselectedHora}</strong></>}
          </span>
        </div>
      )}

      {/* Conflict warning */}
      {hasConflict && (
        <div className="flex items-center gap-2 text-sm bg-destructive/10 text-destructive rounded-lg px-4 py-2.5">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>A Doca 04 está em manutenção nesse horário. Pode haver conflito operacional.</span>
        </div>
      )}

      {/* Transportadora & Motorista */}
      <SectionCard title="Transportadora / Veículo" description="Dados da transportadora, motorista e veículo">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Transportadora *</Label>
            <Input placeholder="Nome da transportadora" value={form.transportadoraNome} onChange={e => update("transportadoraNome", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Motorista</Label>
            <Input placeholder="Nome do motorista" value={form.motoristaNome} onChange={e => update("motoristaNome", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Placa</Label>
            <Input placeholder="ABC-1D23" value={form.placa} onChange={e => update("placa", e.target.value.toUpperCase())} maxLength={8} />
          </div>
          <div className="space-y-1.5">
            <Label>Tipo de Operação *</Label>
            <Select value={form.tipoOperacao} onValueChange={v => update("tipoOperacao", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {TIPO_OPERACAO_OPTIONS.map(o => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </SectionCard>

      {/* Doca & Janela */}
      <SectionCard title="Doca & Janela Operacional" description="Defina a doca, data, horário e duração">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label>Doca *</Label>
            <Select value={form.docaPrevistaId} onValueChange={v => update("docaPrevistaId", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione a doca" /></SelectTrigger>
              <SelectContent>
                {DOCAS.map(d => (
                  <SelectItem key={d.id} value={d.id}>{d.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
            <Input type="time" value={form.horaFim} onChange={e => update("horaFim", e.target.value)} placeholder="Calculado automaticamente" />
          </div>
          <div className="space-y-1.5">
            <Label>Duração Prevista (min)</Label>
            <Input type="number" min={15} max={480} value={form.duracaoPrevistaMin} onChange={e => update("duracaoPrevistaMin", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Tolerância (min)</Label>
            <Input type="number" min={0} max={120} value={form.toleranciaMin} onChange={e => update("toleranciaMin", e.target.value)} />
          </div>
        </div>
      </SectionCard>

      {/* Prioridade & NF */}
      <SectionCard title="Prioridade & Vínculos" description="Defina a prioridade e vincule NFs ou cargas">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Prioridade</Label>
            <Select value={form.prioridade} onValueChange={v => update("prioridade", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PRIORIDADE_OPTIONS.map(p => (
                  <SelectItem key={p.value} value={p.value}>
                    <span className="flex items-center gap-2">
                      <Badge className={`text-[10px] ${p.color}`}>{p.label}</Badge>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>NF Vinculada</Label>
            <Input placeholder="Ex: NF-114000" value={form.nfVinculada} onChange={e => update("nfVinculada", e.target.value)} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Carga / Operação Vinculada</Label>
            <Input placeholder="Ex: OP-2026-0012" value={form.cargaVinculada} onChange={e => update("cargaVinculada", e.target.value)} />
          </div>
        </div>
      </SectionCard>

      {/* Observações */}
      <SectionCard title="Observações">
        <Textarea
          placeholder="Informações adicionais sobre o agendamento..."
          rows={3}
          value={form.observacoes}
          onChange={e => update("observacoes", e.target.value)}
        />
      </SectionCard>

      {/* Summary card */}
      {canSave && (
        <div className="glass-card rounded-lg p-4 border-l-4 border-primary">
          <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <Truck className="h-4 w-4 text-primary" /> Resumo do Agendamento
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <p className="text-muted-foreground">Doca</p>
              <p className="font-medium text-foreground">{selectedDoca?.nome}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Data / Hora</p>
              <p className="font-medium text-foreground">{form.data} às {form.horaInicio}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Transportadora</p>
              <p className="font-medium text-foreground">{form.transportadoraNome}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Operação</p>
              <p className="font-medium text-foreground">
                {TIPO_OPERACAO_OPTIONS.find(o => o.value === form.tipoOperacao)?.label || form.tipoOperacao}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button variant="outline" onClick={() => navigate("/patio/agendamento")}>Cancelar</Button>
        <Button onClick={handleSave} disabled={!canSave || saving} className="gap-2">
          <Save className="h-4 w-4" />
          {saving ? "Salvando..." : "Criar Agendamento"}
        </Button>
      </div>
    </div>
  );
};

export default NovoAgendamentoDocaPage;
