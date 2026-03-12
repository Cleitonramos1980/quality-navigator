import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { mockDocas } from "@/data/mockOperacionalData";
import type { VeiculoFrota, FrotaStatus } from "@/types/operacional";
import { toast } from "sonner";

interface Props {
  veiculo: VeiculoFrota;
  open: boolean;
  onClose: () => void;
}

const STATUS_OPTIONS: { value: FrotaStatus; label: string }[] = [
  { value: "DISPONIVEL", label: "Disponível" },
  { value: "EM_DESLOCAMENTO", label: "Em Deslocamento" },
  { value: "PARADA_PROGRAMADA", label: "Parada Programada" },
  { value: "PARADA_NAO_PROGRAMADA", label: "Parada Não Programada" },
  { value: "EM_MANUTENCAO", label: "Em Manutenção" },
  { value: "BLOQUEADO", label: "Bloqueado" },
];

const docasLivres = mockDocas.filter((d) => d.status === "LIVRE");

const RegistrarMovimentacaoModal = ({ veiculo, open, onClose }: Props) => {
  const [novoStatus, setNovoStatus] = useState<FrotaStatus>(veiculo.status);
  const [docaSelecionada, setDocaSelecionada] = useState("");
  const [km, setKm] = useState(String(veiculo.quilometragem));
  const [observacao, setObservacao] = useState("");

  const needsDoca = novoStatus === "DISPONIVEL" || novoStatus === "PARADA_PROGRAMADA";

  const handleSubmit = () => {
    toast.success(`Movimentação registrada — ${veiculo.placa} → ${novoStatus.replace(/_/g, " ")}${docaSelecionada ? ` (${docaSelecionada})` : ""}`);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Movimentação — {veiculo.placa}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Veículo</Label>
            <p className="text-sm font-medium text-foreground">{veiculo.placa} — {veiculo.modelo} ({veiculo.tipo})</p>
          </div>

          <div className="space-y-1.5">
            <Label>Novo Status</Label>
            <Select value={novoStatus} onValueChange={(v) => setNovoStatus(v as FrotaStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {needsDoca && (
            <div className="space-y-1.5">
              <Label>Vincular a Doca (opcional)</Label>
              <Select value={docaSelecionada} onValueChange={setDocaSelecionada}>
                <SelectTrigger><SelectValue placeholder="Selecione uma doca" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="nenhuma">Nenhuma</SelectItem>
                  {docasLivres.map((d) => (
                    <SelectItem key={d.id} value={d.nome}>{d.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Quilometragem Atual</Label>
            <Input type="number" value={km} onChange={(e) => setKm(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label>Observação</Label>
            <Textarea value={observacao} onChange={(e) => setObservacao(e.target.value)} placeholder="Descrição da movimentação..." rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit}>Registrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RegistrarMovimentacaoModal;
