import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { CalendarIcon, User } from "lucide-react";
import { SETORES_CHECKLIST } from "@/types/checklistPreInventario";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const RESPONSAVEIS = [
  "Carlos Lima", "Ana Souza", "Pedro Santos", "Joana Costa",
  "Marcos Silva", "Fernanda Oliveira", "Rafael Almeida", "Juliana Pereira",
  "Roberto Mendes", "Camila Rocha", "Lucas Ferreira", "Beatriz Nunes",
];

interface EditarItemChecklistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: { id: string; descricao: string; responsavel: string; data: string; setor: string } | null;
  onSave: (itemId: string, data: { responsavel: string; data: string; setor: string }) => void;
}

export default function EditarItemChecklistModal({ open, onOpenChange, item, onSave }: EditarItemChecklistModalProps) {
  const [responsavel, setResponsavel] = useState("");
  const [date, setDate] = useState<Date | undefined>();
  const [setor, setSetor] = useState("");
  const [responsavelSearchOpen, setResponsavelSearchOpen] = useState(false);

  const [lastItemId, setLastItemId] = useState<string | null>(null);
  if (item && item.id !== lastItemId) {
    setResponsavel(item.responsavel);
    setDate(item.data ? new Date(item.data) : undefined);
    setSetor(item.setor);
    setLastItemId(item.id);
  }

  const handleSave = () => {
    if (!item) return;
    if (!responsavel.trim()) {
      toast({ title: "Erro", description: "Informe o responsável.", variant: "destructive" });
      return;
    }
    onSave(item.id, { responsavel: responsavel.trim(), data: date ? format(date, "yyyy-MM-dd") : "", setor });
    onOpenChange(false);
    toast({ title: "Item atualizado", description: `"${item.descricao}" foi atualizado com sucesso.` });
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-base">Editar Item</DialogTitle>
          <p className="text-sm text-muted-foreground">{item.descricao}</p>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {/* Responsável com busca */}
          <div className="space-y-1.5">
            <Label>Responsável</Label>
            <Popover open={responsavelSearchOpen} onOpenChange={setResponsavelSearchOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                  {responsavel || "Buscar responsável..."}
                  <User className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0 pointer-events-auto" align="start">
                <Command>
                  <CommandInput placeholder="Pesquisar nome..." />
                  <CommandList>
                    <CommandEmpty>Nenhum responsável encontrado.</CommandEmpty>
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

          {/* Data com calendário */}
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
