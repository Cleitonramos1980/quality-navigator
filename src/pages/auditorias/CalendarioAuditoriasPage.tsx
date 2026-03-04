import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import FormField from "@/components/forms/FormField";
import { mockAuditorias } from "@/data/mockData";
import { AudExec, AuditStatus, PLANTA_LABELS, Planta, STATUS_COLORS } from "@/types/sgq";
import { ArrowLeft, ChevronLeft, ChevronRight, Plus, CalendarDays, ListFilter } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const TIPOS_AUDITORIA = [
  "Auditoria 5S",
  "Auditoria de Processo",
  "Auditoria ISO 9001",
  "Auditoria de Produto Final",
  "Auditoria de Fornecedor",
  "Auditoria Ambiental",
] as const;

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const statusLabel: Record<AuditStatus, string> = {
  PLANEJADA: "Planejada",
  EM_EXECUCAO: "Em Execução",
  CONCLUIDA: "Concluída",
  CANCELADA: "Cancelada",
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const CalendarioAuditoriasPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [filterPlanta, setFilterPlanta] = useState<string>("TODAS");
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Nova auditoria form
  const [novaForm, setNovaForm] = useState({
    tplNome: "",
    planta: "" as string,
    local: "",
    auditor: "",
    data: "",
  });

  const allAuditorias = useMemo(() => [...mockAuditorias], []);

  const filteredAuditorias = useMemo(() => {
    return allAuditorias.filter((a) => {
      if (filterPlanta !== "TODAS" && a.planta !== filterPlanta) return false;
      return true;
    });
  }, [allAuditorias, filterPlanta]);

  // Map auditorias to calendar days
  const auditoriasByDay = useMemo(() => {
    const map: Record<number, AudExec[]> = {};
    filteredAuditorias.forEach((a) => {
      const date = new Date(a.startedAt);
      if (date.getFullYear() === currentYear && date.getMonth() === currentMonth) {
        const day = date.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(a);
      }
    });
    return map;
  }, [filteredAuditorias, currentYear, currentMonth]);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1); }
    else setCurrentMonth((m) => m - 1);
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1); }
    else setCurrentMonth((m) => m + 1);
    setSelectedDay(null);
  };

  const handleAddAuditoria = () => {
    if (!novaForm.tplNome || !novaForm.planta || !novaForm.auditor || !novaForm.data) {
      toast({ title: "Campos obrigatórios", description: "Preencha tipo, planta, auditor e data.", variant: "destructive" });
      return;
    }
    const nova: AudExec = {
      id: `AUD-${String(allAuditorias.length + 1).padStart(3, "0")}`,
      tplNome: novaForm.tplNome,
      planta: novaForm.planta as Planta,
      local: novaForm.local || "A definir",
      auditor: novaForm.auditor,
      status: "PLANEJADA",
      startedAt: novaForm.data,
    };
    mockAuditorias.push(nova);
    toast({ title: "Auditoria programada", description: `${nova.tplNome} em ${nova.startedAt}` });
    setNovaForm({ tplNome: "", planta: "", local: "", auditor: "", data: "" });
    setDialogOpen(false);
  };

  const selectedDayAuditorias = selectedDay ? (auditoriasByDay[selectedDay] || []) : [];

  const todayDay = today.getFullYear() === currentYear && today.getMonth() === currentMonth ? today.getDate() : null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/auditorias")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <CalendarDays className="w-6 h-6 text-primary" />
              Calendário de Auditorias
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">Programação mensal de auditorias</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filterPlanta} onValueChange={setFilterPlanta}>
            <SelectTrigger className="w-[160px]">
              <ListFilter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODAS">Todas as Plantas</SelectItem>
              {(Object.keys(PLANTA_LABELS) as Planta[]).map((p) => (
                <SelectItem key={p} value={p}>{p} – {PLANTA_LABELS[p]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="w-4 h-4" /> Programar</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Programar Nova Auditoria</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <FormField label="Tipo de Auditoria" required>
                  <Select value={novaForm.tplNome} onValueChange={(v) => setNovaForm((f) => ({ ...f, tplNome: v }))}>
                    <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                    <SelectContent>
                      {TIPOS_AUDITORIA.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormField>
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Planta" required>
                    <Select value={novaForm.planta} onValueChange={(v) => setNovaForm((f) => ({ ...f, planta: v }))}>
                      <SelectTrigger><SelectValue placeholder="Planta" /></SelectTrigger>
                      <SelectContent>
                        {(Object.keys(PLANTA_LABELS) as Planta[]).map((p) => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                  <FormField label="Data" required>
                    <Input type="date" value={novaForm.data} onChange={(e) => setNovaForm((f) => ({ ...f, data: e.target.value }))} />
                  </FormField>
                </div>
                <FormField label="Local">
                  <Input placeholder="Ex: Linha de Montagem 2" value={novaForm.local} onChange={(e) => setNovaForm((f) => ({ ...f, local: e.target.value }))} />
                </FormField>
                <FormField label="Auditor" required>
                  <Input placeholder="Nome do auditor" value={novaForm.auditor} onChange={(e) => setNovaForm((f) => ({ ...f, auditor: e.target.value }))} />
                </FormField>
                <div className="flex gap-2 justify-end pt-2">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={handleAddAuditoria}>Programar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Calendar */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={prevMonth}><ChevronLeft className="w-5 h-5" /></Button>
            <CardTitle className="text-lg">{MONTHS[currentMonth]} {currentYear}</CardTitle>
            <Button variant="ghost" size="icon" onClick={nextMonth}><ChevronRight className="w-5 h-5" /></Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-1">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
            ))}
          </div>
          {/* Days grid */}
          <div className="grid grid-cols-7">
            {/* Empty cells before first day */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-24 border border-border/30" />
            ))}
            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayAuds = auditoriasByDay[day] || [];
              const isToday = day === todayDay;
              const isSelected = day === selectedDay;

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                  className={cn(
                    "h-24 border border-border/30 p-1 cursor-pointer transition-colors hover:bg-accent/30 overflow-hidden",
                    isToday && "bg-primary/5",
                    isSelected && "ring-2 ring-primary bg-primary/10"
                  )}
                >
                  <span className={cn(
                    "text-xs font-medium inline-flex items-center justify-center w-6 h-6 rounded-full",
                    isToday && "bg-primary text-primary-foreground"
                  )}>
                    {day}
                  </span>
                  <div className="space-y-0.5 mt-0.5">
                    {dayAuds.slice(0, 2).map((a) => (
                      <div
                        key={a.id}
                        className={cn("text-[10px] leading-tight px-1 py-0.5 rounded truncate", STATUS_COLORS[a.status])}
                        title={a.tplNome}
                      >
                        {a.tplNome.length > 18 ? a.tplNome.slice(0, 16) + "…" : a.tplNome}
                      </div>
                    ))}
                    {dayAuds.length > 2 && (
                      <div className="text-[10px] text-muted-foreground px-1">+{dayAuds.length - 2} mais</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected day detail */}
      {selectedDay !== null && (
        <Card className="animate-fade-in">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              {selectedDay} de {MONTHS[currentMonth]} de {currentYear}
              {selectedDayAuditorias.length > 0 && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({selectedDayAuditorias.length} auditoria{selectedDayAuditorias.length > 1 ? "s" : ""})
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDayAuditorias.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Nenhuma auditoria programada para este dia</p>
            ) : (
              <div className="space-y-3">
                {selectedDayAuditorias.map((a) => (
                  <div key={a.id} className="flex items-start gap-4 p-3 rounded-lg border border-border bg-card">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-primary font-medium">{a.id}</span>
                        <span className={cn("text-xs px-2 py-0.5 rounded-full", STATUS_COLORS[a.status])}>{statusLabel[a.status]}</span>
                      </div>
                      <h4 className="font-medium text-foreground text-sm">{a.tplNome}</h4>
                      <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                        <div>Planta: <span className="font-mono">{a.planta}</span> – {PLANTA_LABELS[a.planta as Planta]}</div>
                        <div>Local: {a.local}</div>
                        <div>Auditor: <span className="font-medium text-foreground">{a.auditor}</span></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Monthly summary */}
      <div className="grid gap-4 sm:grid-cols-4">
        {(["PLANEJADA", "EM_EXECUCAO", "CONCLUIDA", "CANCELADA"] as AuditStatus[]).map((status) => {
          const count = filteredAuditorias.filter((a) => {
            const d = new Date(a.startedAt);
            return d.getFullYear() === currentYear && d.getMonth() === currentMonth && a.status === status;
          }).length;
          return (
            <Card key={status}>
              <CardContent className="pt-4 pb-3 text-center">
                <span className={cn("text-xs px-2 py-1 rounded-full", STATUS_COLORS[status])}>{statusLabel[status]}</span>
                <p className="text-2xl font-bold text-foreground mt-2">{count}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarioAuditoriasPage;
