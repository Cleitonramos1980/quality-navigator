import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, SendHorizonal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SectionCard from "@/components/forms/SectionCard";
import { criarOS } from "@/services/assistencia";
import { OS_TIPO_LABELS, OS_PRIORIDADE_LABELS } from "@/types/assistencia";
import type { OSTipo, OSPrioridade, OSOrigemTipo } from "@/types/assistencia";
import { PLANTA_LABELS, Planta } from "@/types/sgq";
import { toast } from "@/hooks/use-toast";

const NovaOSPage = () => {
  const navigate = useNavigate();

  const [codcli, setCodcli] = useState("");
  const [clienteNome, setClienteNome] = useState("");
  const [numPedido, setNumPedido] = useState("");
  const [nfVenda, setNfVenda] = useState("");
  const [planta, setPlanta] = useState<Planta>("MAO");
  const [tipoOs, setTipoOs] = useState<OSTipo>("ASSISTENCIA");
  const [prioridade, setPrioridade] = useState<OSPrioridade>("MEDIA");
  const [origemTipo, setOrigemTipo] = useState<OSOrigemTipo>("AVULSA");
  const [origemId, setOrigemId] = useState("");
  const [tecnicoResponsavel, setTecnicoResponsavel] = useState("");
  const [descricaoProblema, setDescricaoProblema] = useState("");
  const [dataPrevista, setDataPrevista] = useState("");

  const handleSalvar = async () => {
    if (!codcli || !clienteNome || !tecnicoResponsavel || !descricaoProblema) {
      toast({ title: "Campos obrigatórios", description: "Preencha cliente, técnico e descrição do problema.", variant: "destructive" });
      return;
    }

    const novaOS = await criarOS({
      origemTipo,
      origemId: origemId || undefined,
      codcli,
      clienteNome,
      numPedido: numPedido || undefined,
      nfVenda: nfVenda || undefined,
      planta,
      tipoOs,
      status: "ABERTA",
      prioridade,
      tecnicoResponsavel,
      descricaoProblema,
      dataAbertura: new Date().toISOString().slice(0, 10),
      dataPrevista: dataPrevista || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    });

    toast({ title: "OS criada com sucesso", description: `Ordem de Serviço ${novaOS.id} foi criada.` });
    navigate(`/assistencia/os/${novaOS.id}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/assistencia/os")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Nova Ordem de Serviço</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Preencha os dados para abrir uma nova OS</p>
        </div>
      </div>

      {/* Origem */}
      <SectionCard title="Origem" description="De onde vem esta OS?">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Tipo de Origem</label>
            <Select value={origemTipo} onValueChange={(v) => setOrigemTipo(v as OSOrigemTipo)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="AVULSA">Avulsa</SelectItem>
                <SelectItem value="SAC">SAC</SelectItem>
                <SelectItem value="GARANTIA">Garantia</SelectItem>
                <SelectItem value="NC">Não Conformidade</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {origemTipo !== "AVULSA" && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">ID de Origem</label>
              <Input placeholder="Ex: SAC-001" value={origemId} onChange={(e) => setOrigemId(e.target.value)} />
            </div>
          )}
        </div>
      </SectionCard>

      {/* Cliente */}
      <SectionCard title="Dados do Cliente">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">CODCLI *</label>
            <Input placeholder="Código do cliente" value={codcli} onChange={(e) => setCodcli(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Nome do Cliente *</label>
            <Input placeholder="Nome do cliente" value={clienteNome} onChange={(e) => setClienteNome(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Nº Pedido</label>
            <Input placeholder="PED-00000" value={numPedido} onChange={(e) => setNumPedido(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">NF Venda</label>
            <Input placeholder="NF-000000" value={nfVenda} onChange={(e) => setNfVenda(e.target.value)} />
          </div>
        </div>
      </SectionCard>

      {/* OS */}
      <SectionCard title="Dados da OS">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Planta</label>
            <Select value={planta} onValueChange={(v) => setPlanta(v as Planta)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(PLANTA_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{k} – {v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Tipo de OS</label>
            <Select value={tipoOs} onValueChange={(v) => setTipoOs(v as OSTipo)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(OS_TIPO_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Prioridade</label>
            <Select value={prioridade} onValueChange={(v) => setPrioridade(v as OSPrioridade)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(OS_PRIORIDADE_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Data Prevista</label>
            <Input type="date" value={dataPrevista} onChange={(e) => setDataPrevista(e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Técnico Responsável *</label>
          <Input placeholder="Nome do técnico" value={tecnicoResponsavel} onChange={(e) => setTecnicoResponsavel(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Descrição do Problema *</label>
          <Textarea placeholder="Descreva o problema relatado..." value={descricaoProblema} onChange={(e) => setDescricaoProblema(e.target.value)} rows={4} />
        </div>
      </SectionCard>

      {/* Ações */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate("/assistencia/os")}>Cancelar</Button>
        <Button onClick={handleSalvar} className="gap-2">
          <Save className="w-4 h-4" /> Criar OS
        </Button>
      </div>
    </div>
  );
};

export default NovaOSPage;
