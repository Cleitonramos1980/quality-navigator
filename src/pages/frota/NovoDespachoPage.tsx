import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Truck, MapPin, FileText, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SectionCard from "@/components/forms/SectionCard";
import { getVeiculosFrota } from "@/services/operacional";
import type { VeiculoFrota } from "@/types/operacional";
import { toast } from "sonner";

const motoristas = [
  "Antônio Souza", "Paulo Roberto", "Marcos Vieira",
  "José Oliveira", "Raimundo Costa", "Diego Santos", "Luís Fernando",
];

const NovoDespachoPage = () => {
  const navigate = useNavigate();
  const [veiculoId, setVeiculoId] = useState("");
  const [motorista, setMotorista] = useState("");
  const [origem, setOrigem] = useState("");
  const [destino, setDestino] = useState("");
  const [observacao, setObservacao] = useState("");
  const [notas, setNotas] = useState<{ numero: string; descricao: string }[]>([{ numero: "", descricao: "" }]);
  const [allFrota, setAllFrota] = useState<VeiculoFrota[]>([]);

  useEffect(() => { getVeiculosFrota().then(setAllFrota); }, []);

  const veiculosDisponiveis = allFrota.filter(
    (v) => v.status === "DISPONIVEL" || v.status === "PARADA_PROGRAMADA"
  );

  const veiculoSelecionado = allFrota.find((v) => v.id === veiculoId);

  const addNota = () => setNotas([...notas, { numero: "", descricao: "" }]);
  const removeNota = (idx: number) => setNotas(notas.filter((_, i) => i !== idx));
  const updateNota = (idx: number, field: "numero" | "descricao", value: string) => {
    const updated = [...notas];
    updated[idx][field] = value;
    setNotas(updated);
  };

  const notasValidas = notas.filter((n) => n.numero.trim());

  const handleSubmit = () => {
    if (!veiculoId || !motorista || !origem || !destino || notasValidas.length === 0) {
      toast.error("Preencha todos os campos obrigatórios e adicione pelo menos uma nota fiscal.");
      return;
    }
    toast.success(
      `Despacho registrado — ${veiculoSelecionado?.placa} com ${notasValidas.length} NF(s), ${origem} → ${destino}`
    );
    navigate("/frota");
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/frota")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Registrar Despacho</h1>
          <p className="text-sm text-muted-foreground">Informe veículo, motorista, notas fiscais, origem e destino</p>
        </div>
      </div>

      {/* Veículo e Motorista */}
      <SectionCard title="Veículo e Motorista">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Veículo *</Label>
            <Select value={veiculoId} onValueChange={setVeiculoId}>
              <SelectTrigger><SelectValue placeholder="Selecione o veículo" /></SelectTrigger>
              <SelectContent>
                {veiculosDisponiveis.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.placa} — {v.modelo} ({v.tipo})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Motorista *</Label>
            <Select value={motorista} onValueChange={setMotorista}>
              <SelectTrigger><SelectValue placeholder="Selecione o motorista" /></SelectTrigger>
              <SelectContent>
                {motoristas.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {veiculoSelecionado && (
          <div className="mt-3 rounded-md border bg-muted/30 p-3 text-sm space-y-1">
            <div className="flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Responsável atual:</span>
              <span className="font-medium text-foreground">{veiculoSelecionado.motoristaResponsavel}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Km: {veiculoSelecionado.quilometragem.toLocaleString("pt-BR")} • Setor: {veiculoSelecionado.setor}
            </p>
          </div>
        )}
      </SectionCard>

      {/* Rota */}
      <SectionCard title="Rota">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Origem *</Label>
            <Input value={origem} onChange={(e) => setOrigem(e.target.value)} placeholder="Ex: Fábrica MAO, CD Manaus..." />
          </div>
          <div className="space-y-1.5">
            <Label>Destino *</Label>
            <Input value={destino} onChange={(e) => setDestino(e.target.value)} placeholder="Ex: Cliente Magazine Luiza - Centro" />
          </div>
        </div>
      </SectionCard>

      {/* Notas Fiscais */}
      <SectionCard title={`Notas Fiscais (${notasValidas.length})`}>
        <div className="space-y-3">
          {notas.map((n, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Nº da NF *</Label>
                  <Input
                    value={n.numero}
                    onChange={(e) => updateNota(idx, "numero", e.target.value)}
                    placeholder="Ex: 112500"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Descrição / Cliente</Label>
                  <Input
                    value={n.descricao}
                    onChange={(e) => updateNota(idx, "descricao", e.target.value)}
                    placeholder="Ex: Colchões King - Loja Centro"
                  />
                </div>
              </div>
              {notas.length > 1 && (
                <Button variant="ghost" size="icon" className="mt-5 text-destructive" onClick={() => removeNota(idx)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addNota} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Adicionar NF
          </Button>
        </div>
      </SectionCard>

      {/* Observação */}
      <SectionCard title="Observação">
        <Textarea
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          placeholder="Informações adicionais sobre o despacho..."
          rows={3}
        />
      </SectionCard>

      {/* Resumo e ações */}
      {veiculoId && motorista && origem && destino && notasValidas.length > 0 && (
        <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-4 space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Resumo do Despacho</h3>
          <div className="text-sm text-foreground/80 space-y-1">
            <p><strong>Veículo:</strong> {veiculoSelecionado?.placa} — {veiculoSelecionado?.modelo}</p>
            <p><strong>Motorista:</strong> {motorista}</p>
            <p><strong>Rota:</strong> {origem} → {destino}</p>
            <p><strong>Notas Fiscais:</strong> {notasValidas.map((n) => n.numero).join(", ")}</p>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Status do veículo será alterado para <strong>EM_DESLOCAMENTO</strong> (Em Rota)
          </p>
        </div>
      )}

      <div className="flex justify-end gap-3 pb-8">
        <Button variant="outline" onClick={() => navigate("/frota")}>Cancelar</Button>
        <Button onClick={handleSubmit} className="gap-2">
          <Truck className="h-4 w-4" /> Registrar Despacho
        </Button>
      </div>
    </div>
  );
};

export default NovoDespachoPage;
