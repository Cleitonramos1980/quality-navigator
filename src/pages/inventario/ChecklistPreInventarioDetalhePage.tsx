import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle, FileText, Clock, User, Building2, Tag, Pencil, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { STATUS_LABELS, STATUS_COLORS, CRITICIDADE_LABELS, CRITICIDADE_COLORS, SETORES_CHECKLIST, type ChecklistItemStatus, type ChecklistCriticidade } from "@/types/checklistPreInventario";
import { toast } from "@/hooks/use-toast";
import { getChecklistPreInventarioById, getChecklistPreInventarioItemHistorico, updateChecklistPreInventarioItem } from "@/services/inventario";

const RESPONSAVEIS = [
  "Carlos Lima", "Ana Souza", "Pedro Santos", "Joana Costa",
  "Marcos Silva", "Fernanda Oliveira", "Rafael Almeida", "Juliana Pereira",
  "Roberto Mendes", "Camila Rocha", "Lucas Ferreira", "Beatriz Nunes",
];

export default function ChecklistPreInventarioDetalhePage() {
  const { checklistId, itemId } = useParams();
  const navigate = useNavigate();
  const [checklist, setChecklist] = useState<any | null>(null);
  const [itemHistorico, setItemHistorico] = useState<Array<{ id: string; data: string; usuario: string; acao: string; detalhe: string }>>([]);

  const [editOpen, setEditOpen] = useState(false);
  const [responsavel, setResponsavel] = useState("");
  const [date, setDate] = useState<Date | undefined>();
  const [setor, setSetor] = useState("");
  const [status, setStatus] = useState<ChecklistItemStatus>("PENDENTE");
  const [criticidade, setCriticidade] = useState<ChecklistCriticidade>("MEDIA");
  const [responsavelSearchOpen, setResponsavelSearchOpen] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!checklistId) return;
      const data = await getChecklistPreInventarioById(checklistId);
      if (!active) return;
      setChecklist(data);
    };
    void load();
    return () => {
      active = false;
    };
  }, [checklistId]);

  const item = useMemo(
    () => checklist?.blocos.flatMap((b: any) => b.itens).find((i: any) => i.id === itemId),
    [checklist, itemId],
  );
  const bloco = useMemo(
    () => checklist?.blocos.find((b: any) => b.id === item?.blocoId),
    [checklist, item?.blocoId],
  );

  useEffect(() => {
    let active = true;
    const loadHistorico = async () => {
      if (!checklistId || !itemId) return;
      const historico = await getChecklistPreInventarioItemHistorico(checklistId, itemId);
      if (!active) return;
      setItemHistorico(historico);
    };
    void loadHistorico();
    return () => {
      active = false;
    };
  }, [checklistId, itemId]);

  const openEdit = () => {
    if (!item) return;
    setResponsavel(item.responsavel);
    setDate(item.data ? new Date(item.data) : undefined);
    setSetor(item.setor);
    setStatus(item.status);
    setCriticidade(item.criticidade);
    setEditOpen(true);
  };

  const handleSave = async () => {
    if (!item) return;
    if (!responsavel.trim()) {
      toast({ title: "Erro", description: "Informe o responsável.", variant: "destructive" });
      return;
    }

    try {
      const payload = {
        responsavel: responsavel.trim(),
        data: date ? format(date, "yyyy-MM-dd") : "",
        setor,
        status,
        criticidade,
      };
      const updated = await updateChecklistPreInventarioItem(checklistId ?? "", item.id, payload);
      setChecklist((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          blocos: prev.blocos.map((blocoEntry: any) => ({
            ...blocoEntry,
            itens: blocoEntry.itens.map((itemEntry: any) => (
              itemEntry.id === item.id
                ? {
                  ...itemEntry,
                  ...updated,
                }
                : itemEntry
            )),
          })),
        };
      });
      const historico = await getChecklistPreInventarioItemHistorico(checklistId ?? "", item.id);
      setItemHistorico(historico);
      setEditOpen(false);
      toast({ title: "Item atualizado", description: `"${item.descricao}" foi atualizado com sucesso.` });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao salvar item.";
      toast({ title: "Erro", description: message, variant: "destructive" });
    }
  };

  if (!checklist || !item) {
    return (
      <div className="p-6 space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4 mr-1" />Voltar</Button>
        <p className="text-muted-foreground">Item nÃ£o encontrado.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-3xl">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4 mr-1" />Voltar ao Checklist</Button>

      {/* Header */}
      <div className="glass-card rounded-lg p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">{checklist.nome} â†’ {bloco?.nome}</p>
            <h1 className="text-lg font-bold text-foreground">{item.descricao}</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn("status-badge", STATUS_COLORS[item.status])}>{STATUS_LABELS[item.status]}</span>
            <Button variant="outline" size="sm" onClick={openEdit}><Pencil className="h-4 w-4 mr-1" />Editar</Button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          <div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">ResponsÃ¡vel:</span><span className="font-medium">{item.responsavel}</span></div>
          <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">Data:</span><span className="font-medium">{item.data}</span></div>
          <div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">Setor:</span><span className="font-medium">{item.setor}</span></div>
          <div className="flex items-center gap-2"><Tag className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">Criticidade:</span><span className={cn("status-badge text-[11px]", CRITICIDADE_COLORS[item.criticidade])}>{CRITICIDADE_LABELS[item.criticidade]}</span></div>
        </div>

        {item.observacao && (
          <>
            <Separator />
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">ObservaÃ§Ã£o</p>
              <p className="text-sm text-foreground">{item.observacao}</p>
            </div>
          </>
        )}

        {item.evidencias && item.evidencias.length > 0 && (
          <>
            <Separator />
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">EvidÃªncias</p>
              <div className="flex flex-wrap gap-2">
                {item.evidencias.map((e, i) => (
                  <Badge key={i} variant="outline" className="text-xs"><FileText className="h-3 w-3 mr-1" />{e}</Badge>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* HistÃ³rico */}
      <div className="glass-card rounded-lg p-5 space-y-3">
        <h2 className="text-sm font-semibold text-foreground">HistÃ³rico de AlteraÃ§Ãµes</h2>
        {itemHistorico.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum registro.</p>
        ) : (
          <div className="space-y-2">
            {itemHistorico.map((h) => (
              <div key={h.id} className="flex items-start gap-3 text-sm border-l-2 border-primary/30 pl-3 py-1">
                <div className="shrink-0">
                  <p className="text-xs text-muted-foreground">{new Date(h.data).toLocaleString("pt-BR")}</p>
                  <p className="text-xs font-medium">{h.usuario}</p>
                </div>
                <div>
                  <Badge variant="outline" className="text-[10px] mr-1">{h.acao}</Badge>
                  <span className="text-muted-foreground">{h.detalhe}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Editar */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-base">Editar Item</DialogTitle>
            <p className="text-sm text-muted-foreground">{item.descricao}</p>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* ResponsÃ¡vel com busca */}
            <div className="space-y-1.5">
              <Label>ResponsÃ¡vel</Label>
              <Popover open={responsavelSearchOpen} onOpenChange={setResponsavelSearchOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                    {responsavel || "Buscar responsÃ¡vel..."}
                    <User className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0 pointer-events-auto" align="start">
                  <Command>
                    <CommandInput placeholder="Pesquisar nome..." />
                    <CommandList>
                      <CommandEmpty>Nenhum responsÃ¡vel encontrado.</CommandEmpty>
                      <CommandGroup>
                        {RESPONSAVEIS.map((r) => (
                          <CommandItem key={r} value={r} onSelect={(val) => { setResponsavel(val); setResponsavelSearchOpen(false); }}>
                            {r}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Data com calendÃ¡rio */}
            <div className="space-y-1.5">
              <Label>Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>

            {/* Setor */}
            <div className="space-y-1.5">
              <Label>Setor</Label>
              <Select value={setor} onValueChange={setSetor}>
                <SelectTrigger><SelectValue placeholder="Selecione o setor" /></SelectTrigger>
                <SelectContent>
                  {SETORES_CHECKLIST.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as ChecklistItemStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(STATUS_LABELS) as ChecklistItemStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Criticidade */}
            <div className="space-y-1.5">
              <Label>Criticidade</Label>
              <Select value={criticidade} onValueChange={(v) => setCriticidade(v as ChecklistCriticidade)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(CRITICIDADE_LABELS) as ChecklistCriticidade[]).map((c) => (
                    <SelectItem key={c} value={c}>{CRITICIDADE_LABELS[c]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


