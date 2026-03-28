import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

const UNIDADES = ["CD São Paulo", "CD Campinas", "CD Rio de Janeiro", "CD Belo Horizonte", "Filial Curitiba"];
const TIPOS = ["Inventário Geral", "Inventário Rotativo", "Inventário Cíclico", "Inventário de Corte"];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function NovoChecklistModal({ open, onOpenChange }: Props) {
  const [nome, setNome] = useState("");
  const [unidade, setUnidade] = useState("");
  const [tipo, setTipo] = useState("");
  const [dataPrevista, setDataPrevista] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const canSubmit = nome.trim() && unidade && tipo && dataPrevista && responsavel.trim();

  const handleSubmit = () => {
    toast({ title: "Checklist criado", description: `"${nome}" foi criado com sucesso com os 10 blocos padrão.` });
    setNome(""); setUnidade(""); setTipo(""); setDataPrevista(""); setResponsavel(""); setObservacoes("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Novo Checklist Pré-Inventário</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label htmlFor="ckl-nome">Nome do Checklist *</Label>
            <Input id="ckl-nome" placeholder="Ex: Checklist Inventário Geral Q2 2026" value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Unidade *</Label>
              <Select value={unidade} onValueChange={setUnidade}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {UNIDADES.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Tipo de Inventário *</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {TIPOS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="ckl-data">Data Prevista *</Label>
              <Input id="ckl-data" type="date" value={dataPrevista} onChange={(e) => setDataPrevista(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="ckl-resp">Responsável Geral *</Label>
              <Input id="ckl-resp" placeholder="Nome do responsável" value={responsavel} onChange={(e) => setResponsavel(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="ckl-obs">Observações</Label>
            <Textarea id="ckl-obs" placeholder="Observações gerais sobre o checklist..." rows={3} value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
          </div>
          <p className="text-xs text-muted-foreground">Os 10 blocos padrão (Planejamento, Organização, Bloqueio, Conciliação, Identificação, Exceções, Comunicação, Infraestrutura, Teste, Validação) serão gerados automaticamente.</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button disabled={!canSubmit} onClick={handleSubmit}>Criar Checklist</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
