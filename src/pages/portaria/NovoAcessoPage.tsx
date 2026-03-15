import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import SectionCard from "@/components/forms/SectionCard";
import FormField from "@/components/forms/FormField";
import { toast } from "@/hooks/use-toast";

const NovoAcessoPage = () => {
  const navigate = useNavigate();
  const [tipo, setTipo] = useState("");
  const [nome, setNome] = useState("");
  const [documento, setDocumento] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [placa, setPlaca] = useState("");
  const [tipoVeiculo, setTipoVeiculo] = useState("");
  const [responsavelInterno, setResponsavelInterno] = useState("");
  const [setorDestino, setSetorDestino] = useState("");
  const [motivo, setMotivo] = useState("");
  const [obs, setObs] = useState("");

  const handleSubmit = () => {
    if (!tipo || !nome || !documento || !empresa || !responsavelInterno || !setorDestino) {
      toast({ title: "Campos obrigatórios", description: "Preencha todos os campos obrigatórios.", variant: "destructive" });
      return;
    }
    toast({ title: "Acesso registrado", description: `Acesso para ${nome} registrado com sucesso.` });
    navigate("/portaria");
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/portaria")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Novo Acesso</h1>
          <p className="text-sm text-muted-foreground">Registrar entrada de visitante, motorista ou prestador</p>
        </div>
      </div>

      <SectionCard title="Identificação">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Tipo de Acesso" required>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="VISITANTE">Visitante</SelectItem>
                <SelectItem value="MOTORISTA">Motorista</SelectItem>
                <SelectItem value="PRESTADOR">Prestador</SelectItem>
                <SelectItem value="ENTREGA">Entrega</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Nome Completo" required>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome da pessoa" />
          </FormField>
          <FormField label="Documento (CPF/CNPJ)" required>
            <Input value={documento} onChange={(e) => setDocumento(e.target.value)} placeholder="000.000.000-00" />
          </FormField>
          <FormField label="Empresa" required>
            <Input value={empresa} onChange={(e) => setEmpresa(e.target.value)} placeholder="Empresa de origem" />
          </FormField>
        </div>
      </SectionCard>

      <SectionCard title="Veículo (opcional)">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Placa">
            <Input value={placa} onChange={(e) => setPlaca(e.target.value)} placeholder="ABC-1D23" />
          </FormField>
          <FormField label="Tipo de Veículo">
            <Input value={tipoVeiculo} onChange={(e) => setTipoVeiculo(e.target.value)} placeholder="Carro, Caminhão..." />
          </FormField>
        </div>
      </SectionCard>

      <SectionCard title="Destino">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Responsável Interno" required>
            <Input value={responsavelInterno} onChange={(e) => setResponsavelInterno(e.target.value)} placeholder="Quem autorizou" />
          </FormField>
          <FormField label="Setor de Destino" required>
            <Input value={setorDestino} onChange={(e) => setSetorDestino(e.target.value)} placeholder="Ex: Diretoria, Doca 03..." />
          </FormField>
          <FormField label="Motivo da Visita" className="md:col-span-2">
            <Input value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Motivo do acesso" />
          </FormField>
        </div>
      </SectionCard>

      <SectionCard title="Observações">
        <Textarea value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Observações adicionais..." rows={3} />
      </SectionCard>

      <div className="flex justify-end gap-3 pb-8">
        <Button variant="outline" onClick={() => navigate("/portaria")}>Cancelar</Button>
        <Button onClick={handleSubmit} className="gap-2">
          <UserPlus className="h-4 w-4" /> Registrar Acesso
        </Button>
      </div>
    </div>
  );
};

export default NovoAcessoPage;
