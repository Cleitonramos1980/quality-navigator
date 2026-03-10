import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, ListFilter, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import FormField from "@/components/forms/FormField";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { createAuditoria, getAuditoriaTemplates, getAuditorias } from "@/services/auditorias";
import type { AudExec, AuditStatus, Planta } from "@/types/sgq";
import { PLANTA_LABELS, STATUS_COLORS } from "@/types/sgq";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const statusLabel: Record<AuditStatus, string> = {
  PLANEJADA: "Planejada",
  EM_EXECUCAO: "Em Execução",
  CONCLUIDA: "Concluída",
  CANCELADA: "Cancelada",
};

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function extractDateParts(value: string): { year: number; month: number; day: number } | null {
  const datePart = value.split("T")[0] ?? "";
  const match = datePart.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  return {
    year: Number(match[1]),
    month: Number(match[2]) - 1,
    day: Number(match[3]),
  };
}

function extractHoraInicio(startedAt: string): string {
  const isoMatch = startedAt.match(/T(\d{2}:\d{2})/);
  if (isoMatch?.[1]) return isoMatch[1];
  const spacedMatch = startedAt.match(/\s(\d{2}:\d{2})/);
  if (spacedMatch?.[1]) return spacedMatch[1];
  return "--:--";
}

function compareByHoraInicio(a: AudExec, b: AudExec): number {
  return extractHoraInicio(a.startedAt).localeCompare(extractHoraInicio(b.startedAt));
}

function toInputDate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
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
  const [auditorias, setAuditorias] = useState<AudExec[]>([]);
  const [templates, setTemplates] = useState<Array<{ id: string; nome: string }>>([]);

  const [novaForm, setNovaForm] = useState({
    tplId: "",
    tplNome: "",
    planta: "",
    local: "",
    auditor: "",
    data: "",
    horaInicio: "08:00",
  });

  useEffect(() => {
    Promise.all([getAuditorias(), getAuditoriaTemplates()])
      .then(([auds, templatesRaw]) => {
        setAuditorias(auds);
        setTemplates(templatesRaw.map((item) => ({ id: item.id, nome: item.nome })));
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Falha ao carregar calendário de auditorias.";
        toast({ title: "Erro ao carregar auditorias", description: message, variant: "destructive" });
      });
  }, [toast]);

  const filteredAuditorias = useMemo(
    () => auditorias.filter((a) => filterPlanta === "TODAS" || a.planta === filterPlanta),
    [auditorias, filterPlanta],
  );

  const auditoriasByDay = useMemo(() => {
    const map: Record<number, AudExec[]> = {};
    filteredAuditorias.forEach((auditoria) => {
      const parts = extractDateParts(auditoria.startedAt);
      if (!parts) return;
      if (parts.year !== currentYear || parts.month !== currentMonth) return;
      if (!map[parts.day]) map[parts.day] = [];
      map[parts.day].push(auditoria);
    });
    Object.values(map).forEach((list) => list.sort(compareByHoraInicio));
    return map;
  }, [filteredAuditorias, currentYear, currentMonth]);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((year) => year - 1);
    } else {
      setCurrentMonth((month) => month - 1);
    }
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((year) => year + 1);
    } else {
      setCurrentMonth((month) => month + 1);
    }
    setSelectedDay(null);
  };

  const openProgramarAuditoriaDialog = (day: number) => {
    setSelectedDay(day);
    setNovaForm((prev) => ({
      ...prev,
      data: toInputDate(currentYear, currentMonth, day),
    }));
    setDialogOpen(true);
  };

  const handleAddAuditoria = async () => {
    if (!novaForm.tplNome || !novaForm.planta || !novaForm.auditor || !novaForm.data || !novaForm.horaInicio) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha tipo, planta, auditor, data e hora de início.",
        variant: "destructive",
      });
      return;
    }

    try {
      const nova = await createAuditoria({
        tplId: novaForm.tplId || undefined,
        tplNome: novaForm.tplNome,
        tipoAuditoria: novaForm.tplNome,
        planta: novaForm.planta as Planta,
        local: novaForm.local || "A definir",
        auditor: novaForm.auditor,
        status: "PLANEJADA",
        startedAt: `${novaForm.data}T${novaForm.horaInicio}:00`,
        escopo: undefined,
        finishedAt: undefined,
      } as any);

      setAuditorias((prev) => [...prev, nova]);
      toast({
        title: "Auditoria programada",
        description: `${nova.tplNome} em ${novaForm.data} às ${novaForm.horaInicio}`,
      });
      setNovaForm({
        tplId: "",
        tplNome: "",
        planta: "",
        local: "",
        auditor: "",
        data: "",
        horaInicio: "08:00",
      });
      setDialogOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao programar auditoria.";
      toast({ title: "Erro ao programar auditoria", description: message, variant: "destructive" });
    }
  };

  const selectedDayAuditorias = selectedDay ? (auditoriasByDay[selectedDay] || []) : [];
  const todayDay =
    today.getFullYear() === currentYear && today.getMonth() === currentMonth
      ? today.getDate()
      : null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/auditorias")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
              <CalendarDays className="w-6 h-6 text-primary" />
              Calendário de Auditorias
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">Programação mensal de auditorias</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select value={filterPlanta} onValueChange={setFilterPlanta}>
            <SelectTrigger className="w-[160px]">
              <ListFilter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODAS">Todas as Plantas</SelectItem>
              {(Object.keys(PLANTA_LABELS) as Planta[]).map((planta) => (
                <SelectItem key={planta} value={planta}>
                  {planta} - {PLANTA_LABELS[planta]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Programar
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Programar Nova Auditoria</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 pt-2">
                <FormField label="Tipo de Auditoria" required>
                  <Select
                    value={novaForm.tplId}
                    onValueChange={(value) => {
                      const template = templates.find((item) => item.id === value);
                      setNovaForm((prev) => ({
                        ...prev,
                        tplId: value,
                        tplNome: template?.nome || "",
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de auditoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <FormField label="Planta" required>
                    <Select
                      value={novaForm.planta}
                      onValueChange={(value) => setNovaForm((prev) => ({ ...prev, planta: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Planta" />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(PLANTA_LABELS) as Planta[]).map((planta) => (
                          <SelectItem key={planta} value={planta}>
                            {planta}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField label="Data" required>
                    <Input
                      type="date"
                      value={novaForm.data}
                      onChange={(e) => setNovaForm((prev) => ({ ...prev, data: e.target.value }))}
                    />
                  </FormField>

                  <FormField label="Hora de Início" required>
                    <Input
                      type="time"
                      value={novaForm.horaInicio}
                      onChange={(e) => setNovaForm((prev) => ({ ...prev, horaInicio: e.target.value }))}
                    />
                  </FormField>
                </div>

                <FormField label="Local">
                  <Input
                    value={novaForm.local}
                    onChange={(e) => setNovaForm((prev) => ({ ...prev, local: e.target.value }))}
                  />
                </FormField>

                <FormField label="Auditor" required>
                  <Input
                    value={novaForm.auditor}
                    onChange={(e) => setNovaForm((prev) => ({ ...prev, auditor: e.target.value }))}
                  />
                </FormField>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => void handleAddAuditoria()}>Programar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={prevMonth}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <CardTitle className="text-lg">
              {MONTHS[currentMonth]} {currentYear}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={nextMonth}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="mb-1 grid grid-cols-7">
            {WEEKDAYS.map((dayLabel) => (
              <div key={dayLabel} className="py-2 text-center text-xs font-medium text-muted-foreground">
                {dayLabel}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-24 border border-border/30" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayAuds = auditoriasByDay[day] || [];
              const isToday = day === todayDay;
              const isSelected = day === selectedDay;

              return (
                <div
                  key={day}
                  onClick={() => openProgramarAuditoriaDialog(day)}
                  className={cn(
                    "h-24 cursor-pointer overflow-hidden border border-border/30 p-1 transition-colors hover:bg-accent/30",
                    isToday && "bg-primary/5",
                    isSelected && "bg-primary/10 ring-2 ring-primary",
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                      isToday && "bg-primary text-primary-foreground",
                    )}
                  >
                    {day}
                  </span>

                  <div className="mt-0.5 space-y-0.5">
                    {dayAuds.slice(0, 2).map((auditoria) => (
                      <div
                        key={auditoria.id}
                        className={cn(
                          "flex items-center gap-1 truncate rounded px-1 py-0.5 text-[10px] leading-tight",
                          STATUS_COLORS[auditoria.status],
                        )}
                        title={`${extractHoraInicio(auditoria.startedAt)} - ${auditoria.tplNome}`}
                      >
                        <span className="shrink-0 font-mono">{extractHoraInicio(auditoria.startedAt)}</span>
                        <span className="truncate">{auditoria.tplNome}</span>
                      </div>
                    ))}
                    {dayAuds.length > 2 && (
                      <div className="px-1 text-[10px] text-muted-foreground">+{dayAuds.length - 2} mais</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

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
              <p className="py-6 text-center text-sm text-muted-foreground">Nenhuma auditoria programada para este dia</p>
            ) : (
              <div className="space-y-3">
                {selectedDayAuditorias.map((auditoria) => (
                  <div key={auditoria.id} className="flex items-start gap-4 rounded-lg border border-border bg-card p-3">
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="font-mono text-xs font-medium text-primary">{auditoria.id}</span>
                        <span className={cn("rounded-full px-2 py-0.5 text-xs", STATUS_COLORS[auditoria.status])}>
                          {statusLabel[auditoria.status]}
                        </span>
                      </div>

                      <h4 className="text-sm font-medium text-foreground">{auditoria.tplNome}</h4>

                      <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                        <div>
                          Início: <span className="font-mono text-foreground">{extractHoraInicio(auditoria.startedAt)}</span>
                        </div>
                        <div>
                          Planta: <span className="font-mono">{auditoria.planta}</span> - {PLANTA_LABELS[auditoria.planta as Planta]}
                        </div>
                        <div>Local: {auditoria.local}</div>
                        <div>
                          Auditor: <span className="font-medium text-foreground">{auditoria.auditor}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CalendarioAuditoriasPage;
