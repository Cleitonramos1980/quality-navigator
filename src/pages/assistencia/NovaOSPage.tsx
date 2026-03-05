import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Save, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import SectionCard from "@/components/forms/SectionCard";
import FormField from "@/components/forms/FormField";
import { criarOS } from "@/services/assistencia";
import { registrarAuditoria } from "@/services/auditoria";
import { buscarClientesERP, buscarPedidosERP, buscarItensPedidoERP } from "@/services/sac";
import { OS_TIPO_LABELS, OS_PRIORIDADE_LABELS } from "@/types/assistencia";
import type { OSTipo, OSPrioridade, OSOrigemTipo } from "@/types/assistencia";
import { PLANTA_LABELS, Planta } from "@/types/sgq";
import { toast } from "@/hooks/use-toast";

interface ClienteERP {
  codcli: string; nome: string; cgcent: string; telefones: string; cidade: string; uf: string;
}
interface PedidoERP {
  numped: string; numnf: string; codcli: string; dtPedido: string; vlrPedido: number; status: string; canal: string;
}
interface ItemPedidoERP {
  numped: string; numnf: string; codprod: string; descricao: string; un: string; qtd: number; vlrUnit: number; vlrTotal: number;
}

const NovaOSPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as Record<string, string>) || {};

  // Form state (pre-filled from navigation state if coming from SAC)
  const [codcli, setCodcli] = useState(state.codcli || "");
  const [clienteNome, setClienteNome] = useState(state.clienteNome || "");
  const [numPedido, setNumPedido] = useState(state.numPedido || "");
  const [nfVenda, setNfVenda] = useState(state.numNfVenda || "");
  const [produtoRelacionado, setProdutoRelacionado] = useState(state.produtoRelacionado || "");
  const [planta, setPlanta] = useState<Planta>((state.plantaResp as Planta) || "MAO");
  const [tipoOs, setTipoOs] = useState<OSTipo>("ASSISTENCIA_EXTERNA");
  const [prioridade, setPrioridade] = useState<OSPrioridade>("MEDIA");
  const [origemTipo, setOrigemTipo] = useState<OSOrigemTipo>("AVULSA");
  const [origemId, setOrigemId] = useState("");
  const [tecnicoResponsavel, setTecnicoResponsavel] = useState("");
  const [descricaoProblema, setDescricaoProblema] = useState(state.descricao || "");
  const [dataPrevista, setDataPrevista] = useState("");

  // Client search modal
  const [showClientSearch, setShowClientSearch] = useState(false);
  const [clientSearchFilter, setClientSearchFilter] = useState({ nome: "", cgcent: "", telefone: "" });
  const [clientResults, setClientResults] = useState<ClienteERP[]>([]);

  // Pedidos & Itens
  const [pedidos, setPedidos] = useState<PedidoERP[]>([]);
  const [selectedPedido, setSelectedPedido] = useState("");
  const [itens, setItens] = useState<ItemPedidoERP[]>([]);
  const [selectedItem, setSelectedItem] = useState("");

  // === Client Search ===
  const handleClientSearch = async () => {
    const results = await buscarClientesERP(clientSearchFilter);
    setClientResults(results);
  };

  const handleSelectClient = async (c: ClienteERP) => {
    setCodcli(c.codcli);
    setClienteNome(c.nome);
    setShowClientSearch(false);
    const peds = await buscarPedidosERP(c.codcli);
    setPedidos(peds);
    setSelectedPedido("");
    setItens([]);
    setSelectedItem("");
    setNumPedido("");
    setNfVenda("");
    setProdutoRelacionado("");
  };

  // === Pedido Selection ===
  const handleSelectPedido = async (numped: string) => {
    setSelectedPedido(numped);
    const ped = pedidos.find((p) => p.numped === numped);
    setNumPedido(numped);
    setNfVenda(ped?.numnf || "");
    const items = await buscarItensPedidoERP(numped);
    setItens(items);
    setSelectedItem("");
    setProdutoRelacionado("");
  };

  // === Item Selection ===
  const handleSelectItem = (codprod: string) => {
    setSelectedItem(codprod);
    const item = itens.find((i) => i.codprod === codprod);
    if (item) setProdutoRelacionado(`${item.codprod} - ${item.descricao}`);
  };

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

    registrarAuditoria("CRIAR", "OS", novaOS.id, `Tipo: ${tipoOs}. Cliente: ${clienteNome}. Planta: ${planta}. Técnico: ${tecnicoResponsavel}`);
    toast({ title: "OS criada com sucesso", description: `Ordem de Serviço ${novaOS.id} foi criada.` });
    navigate(`/assistencia/os/${novaOS.id}`);
  };

  return (
    <div className="space-y-6 max-w-6xl animate-fade-in">
      {/* Header */}
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
          <FormField label="Tipo de Origem">
            <Select value={origemTipo} onValueChange={(v) => setOrigemTipo(v as OSOrigemTipo)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="AVULSA">Avulsa</SelectItem>
                <SelectItem value="SAC">SAC</SelectItem>
                <SelectItem value="GARANTIA">Garantia</SelectItem>
                <SelectItem value="NC">Não Conformidade</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          {origemTipo !== "AVULSA" && (
            <FormField label="ID de Origem">
              <Input placeholder="Ex: SAC-001" value={origemId} onChange={(e) => setOrigemId(e.target.value)} />
            </FormField>
          )}
        </div>
      </SectionCard>

      {/* Dados do Cliente */}
      <SectionCard title="Dados do Cliente">
        <div className="grid md:grid-cols-4 gap-4">
          <FormField label="CODCLI" hint="Código do cliente no ERP">
            <Input value={codcli} readOnly placeholder="—" className="bg-muted/30" />
          </FormField>
          <FormField label="Cliente" required>
            <Input value={clienteNome} readOnly placeholder="Selecione um cliente" className="bg-muted/30" />
          </FormField>
          <FormField label="Pedido Vinculado">
            <Input value={numPedido} readOnly placeholder="—" className="bg-muted/30" />
          </FormField>
          <FormField label="NF Venda">
            <Input value={nfVenda} readOnly placeholder="—" className="bg-muted/30" />
          </FormField>
        </div>
        <div className="mt-3 flex gap-2">
          <Button variant="outline" onClick={() => setShowClientSearch(true)}>
            <Search className="w-4 h-4 mr-1" /> Buscar Cliente
          </Button>
        </div>
      </SectionCard>

      {/* Pedidos do Cliente */}
      <SectionCard title="Pedidos do Cliente" description={codcli ? `Pedidos encontrados para CODCLI ${codcli}` : "Selecione um cliente para carregar os pedidos"}>
        {pedidos.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>NUMPED</TableHead>
                  <TableHead>NF VENDA</TableHead>
                  <TableHead>DATA</TableHead>
                  <TableHead className="text-right">VALOR</TableHead>
                  <TableHead>STATUS</TableHead>
                  <TableHead>CANAL</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pedidos.map((p) => (
                  <TableRow
                    key={p.numped}
                    className={`cursor-pointer ${selectedPedido === p.numped ? "bg-primary/10 border-l-2 border-l-primary" : "hover:bg-muted/30"}`}
                    onClick={() => handleSelectPedido(p.numped)}
                  >
                    <TableCell className="font-medium">{p.numped}</TableCell>
                    <TableCell>{p.numnf || "—"}</TableCell>
                    <TableCell>{p.dtPedido}</TableCell>
                    <TableCell className="text-right">R$ {p.vlrPedido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell>
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">{p.status}</span>
                    </TableCell>
                    <TableCell>{p.canal}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
            {codcli ? "Nenhum pedido encontrado para este cliente." : "Busque e selecione um cliente acima."}
          </div>
        )}
      </SectionCard>

      {/* Itens do Pedido */}
      <SectionCard title="Itens do Pedido" description={selectedPedido ? `Itens do pedido ${selectedPedido}` : "Selecione um pedido para visualizar os itens"}>
        {itens.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>CODPROD</TableHead>
                  <TableHead>DESCRIÇÃO</TableHead>
                  <TableHead>UN</TableHead>
                  <TableHead className="text-right">QTD</TableHead>
                  <TableHead className="text-right">VLR UNIT</TableHead>
                  <TableHead className="text-right">VLR TOTAL</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {itens.map((it) => (
                  <TableRow
                    key={it.codprod}
                    className={`cursor-pointer ${selectedItem === it.codprod ? "bg-primary/10 border-l-2 border-l-primary" : "hover:bg-muted/30"}`}
                    onClick={() => handleSelectItem(it.codprod)}
                  >
                    <TableCell className="font-mono text-xs">{it.codprod}</TableCell>
                    <TableCell>{it.descricao}</TableCell>
                    <TableCell>{it.un}</TableCell>
                    <TableCell className="text-right">{it.qtd}</TableCell>
                    <TableCell className="text-right">R$ {it.vlrUnit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell className="text-right font-medium">R$ {it.vlrTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
            {selectedPedido ? "Nenhum item encontrado neste pedido." : "Selecione um pedido acima para carregar os itens."}
          </div>
        )}
      </SectionCard>

      {/* Produto Relacionado (read-only) */}
      {produtoRelacionado && (
        <SectionCard title="Produto Selecionado">
          <FormField label="Produto Relacionado" hint="Preenchido ao selecionar item do pedido">
            <Input value={produtoRelacionado} readOnly className="bg-muted/30" />
          </FormField>
        </SectionCard>
      )}

      {/* Dados da OS */}
      <SectionCard title="Dados da OS">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormField label="Planta">
            <Select value={planta} onValueChange={(v) => setPlanta(v as Planta)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(PLANTA_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{k} – {v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Tipo de OS">
            <Select value={tipoOs} onValueChange={(v) => setTipoOs(v as OSTipo)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(OS_TIPO_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Prioridade">
            <Select value={prioridade} onValueChange={(v) => setPrioridade(v as OSPrioridade)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(OS_PRIORIDADE_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Data Prevista">
            <Input type="date" value={dataPrevista} onChange={(e) => setDataPrevista(e.target.value)} />
          </FormField>
        </div>
        <FormField label="Técnico Responsável" required className="mt-4">
          <Input placeholder="Nome do técnico" value={tecnicoResponsavel} onChange={(e) => setTecnicoResponsavel(e.target.value)} />
        </FormField>
        <FormField label="Descrição do Problema" required className="mt-4">
          <Textarea placeholder="Descreva o problema relatado..." value={descricaoProblema} onChange={(e) => setDescricaoProblema(e.target.value)} rows={4} />
        </FormField>
      </SectionCard>

      {/* Ações */}
      <div className="flex justify-end gap-3 pb-6">
        <Button variant="outline" onClick={() => navigate("/assistencia/os")}>Cancelar</Button>
        <Button onClick={handleSalvar} className="gap-2">
          <Save className="w-4 h-4" /> Criar OS
        </Button>
      </div>

      {/* Modal Buscar Cliente */}
      <Dialog open={showClientSearch} onOpenChange={setShowClientSearch}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Buscar Cliente</DialogTitle>
            <DialogDescription>Pesquise no cadastro de clientes (VW_SGQ_CLIENTE)</DialogDescription>
          </DialogHeader>
          <div className="grid md:grid-cols-3 gap-3">
            <Input placeholder="Nome" value={clientSearchFilter.nome} onChange={(e) => setClientSearchFilter((p) => ({ ...p, nome: e.target.value }))} />
            <Input placeholder="CPF/CNPJ" value={clientSearchFilter.cgcent} onChange={(e) => setClientSearchFilter((p) => ({ ...p, cgcent: e.target.value }))} />
            <Input placeholder="Telefone" value={clientSearchFilter.telefone} onChange={(e) => setClientSearchFilter((p) => ({ ...p, telefone: e.target.value }))} />
          </div>
          <Button onClick={handleClientSearch} className="w-full"><Search className="w-4 h-4 mr-1" /> Pesquisar</Button>
          {clientResults.length > 0 && (
            <div className="border rounded-lg overflow-hidden max-h-64 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead>CODCLI</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>CPF/CNPJ</TableHead>
                    <TableHead>Cidade/UF</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientResults.map((c) => (
                    <TableRow key={c.codcli} className="cursor-pointer hover:bg-muted/30" onClick={() => handleSelectClient(c)}>
                      <TableCell className="font-medium">{c.codcli}</TableCell>
                      <TableCell>{c.nome}</TableCell>
                      <TableCell className="font-mono text-xs">{c.cgcent}</TableCell>
                      <TableCell>{c.cidade}/{c.uf}</TableCell>
                      <TableCell><Button size="sm" variant="ghost">Selecionar</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NovaOSPage;
