import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SETORES_CHECKLIST } from "@/types/checklistPreInventario";
import { toast } from "@/hooks/use-toast";

interface EditarItemChecklistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: { id: string; descricao: string; responsavel: string; data: string; setor: string } | null;
  onSave: (itemId: string, data: { responsavel: string; data: string; setor: string }) => void;
}

export default function EditarItemChecklistModal({ open, onOpenChange, item, onSave }: EditarItemChecklistModalProps) {
  const [responsavel, setResponsavel] = useState("");
  const [data, setData] = useState("");
  const [setor, setSetor] = useState("");

  // Sync state when item changes
  const [lastItemId, setLastItemId] = useState<string | null>(null);
  if (item && item.id !== lastItemId) {
    setResponsavel(item.responsavel);
    setData(item.data);
    setSetor(item.setor);
    setLastItemId(item.id);
  }

  const handleSave = () => {
    if (!item) return;
    if (!responsavel.trim()) {
      toast({ title: "Erro", description: "Informe o responsável.", variant: "destructive" });
      return;
    }
    onSave(item.id, { responsavel: responsavel.trim(), data, setor });
    onOpenChange(false);
    toast({ title: "Item atualizado", description: `"${item.descricao}" foi atualizado com sucesso.` });
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="text-base">Editar Item</DialogTitle>
          <p className="text-sm text-muted-foreground">{item.descricao}</p>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="responsavel">Responsável</Label>
            <Input id="responsavel" value={responsavel} onChange={(e) => setResponsavel(e.target.value)} placeholder="Nome do responsável" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="data">Data</Label>
            <Input id="data" type="date" value={data} onChange={(e) => setData(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="setor">Setor</Label>
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
