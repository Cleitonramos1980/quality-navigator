import { useMemo, useState } from "react";
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
import FormStepGuide from "@/components/forms/FormStepGuide";
import { criarOS } from "@/services/assistencia";
import { registrarAuditoria } from "@/services/auditoria";
import { buscarClientesERP, buscarPedidosERP, buscarItensPedidoERP } from "@/services/sac";
import { getApiErrorMessage } from "@/services/api";
import { OS_TIPO_LABELS, OS_PRIORIDADE_LABELS } from "@/types/assistencia";
import type { OSTipo, OSPrioridade, OSOrigemTipo } from "@/types/assistencia";
import { PLANTA_LABELS, Planta } from "@/types/sgq";
import { toast } from "@/hooks/use-toast";
import { loadDraft, useDraftAutosave } from "@/hooks/useDraftAutosave";
import { useUxMetrics } from "@/hooks/useUxMetrics";

interface ClienteERP {
  codcli: string;
  nome: string;
  cgcent: string;
  telefones: string;
  cidade: string;
  uf: string;
}
interface PedidoERP {
  numped: string;
  numnf: string;
  codcli: string;
  dtPedido: string;
  vlrPedido: number;
  status: string;
  canal: string;
}
interface ItemPedidoERP {
  numped: string;
  numnf: string;
  codprod: string;
  descricao: string;
  un: string;
  qtd: number;
  vlrUnit: number;
  vlrTotal: number;
}

const DRAFT_KEY = "draft:assistencia:nova-os";

const toText = (value: unknown): string => (value == null ? "" : String(value));
const toOptionalText = (value: unknown): string | undefined => {
  const trimmed = toText(value).trim();
  return trimmed ? trimmed : undefined;
};

const NovaOSPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as Record<string, unknown>) || {};
  const { trackAction, trackError } = useUxMetrics("ASSISTENCIA_NOVA_OS");

  const draftInitial = loadDraft(DRAFT_KEY, {
    codcli: toText(state.codcli),
    clienteNome: toText(state.clienteNome ?? state.nome),
    numPedido: toText(state.numPedido ?? state.numped),
    nfVenda: toText(state.numNfVenda ?? state.nfVenda ?? state.numnf),
    codprod: toText(state.codprod),
    produtoRelacionado: toText(state.produtoRelacionado),
    planta: (state.plantaResp as Planta) || "MAO",
    tipoOs: "ASSISTENCIA_EXTERNA" as OSTipo,
    prioridade: "MEDIA" as OSPrioridade,
    origemTipo: "AVULSA" as OSOrigemTipo,
    origemId: "",
    tecnicoResponsavel: "",
    descricaoProblema: toText(state.descricao),
    dataPrevista: "",
  });

  const [codcli, setCodcli] = useState(draftInitial.codcli);
  const [clienteNome, setClienteNome] = useState(draftInitial.clienteNome);
  const [numPedido, setNumPedido] = useState(draftInitial.numPedido);
  const [nfVenda, setNfVenda] = useState(draftInitial.nfVenda);
  const [codprod, setCodprod] = useState(draftInitial.codprod);
  const [produtoRelacionado, setProdutoRelacionado] = useState(draftInitial.produtoRelacionado);
  const [planta, setPlanta] = useState<Planta>(draftInitial.planta);
  const [tipoOs, setTipoOs] = useState<OSTipo>(draftInitial.tipoOs);
  const [prioridade, setPrioridade] = useState<OSPrioridade>(draftInitial.prioridade);
  const [origemTipo, setOrigemTipo] = useState<OSOrigemTipo>(draftInitial.origemTipo);
  const [origemId, setOrigemId] = useState(draftInitial.origemId);
  const [tecnicoResponsavel, setTecnicoResponsavel] = useState(draftInitial.tecnicoResponsavel);
  const [descricaoProblema, setDescricaoProblema] = useState(draftInitial.descricaoProblema);
  const [dataPrevista, setDataPrevista] = useState(draftInitial.dataPrevista);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [showClientSearch, setShowClientSearch] = useState(false);
  const [clientSearchFilter, setClientSearchFilter] = useState({ codcli: "", nome: "", cgcent: "", telefone: "" });
  const [clientResults, setClientResults] = useState<ClienteERP[]>([]);
  const [pedidos, setPedidos] = useState<PedidoERP[]>([]);
  const [selectedPedido, setSelectedPedido] = useState("");
  const [itens, setItens] = useState<ItemPedidoERP[]>([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const draftValue = useMemo(
    () => ({
      codcli,
      clienteNome,
      numPedido,
      nfVenda,
      codprod,
      produtoRelacionado,
      planta,
      tipoOs,
      prioridade,
      origemTipo,
      origemId,
      tecnicoResponsavel,
      descricaoProblema,
      dataPrevista,
    }),
    [
      codcli,
      clienteNome,
      numPedido,
      nfVenda,
      codprod,
      produtoRelacionado,
      planta,
      tipoOs,
      prioridade,
      origemTipo,
      origemId,
      tecnicoResponsavel,
      descricaoProblema,
      dataPrevista,
    ],
  );

  const { lastSavedAt, clear: clearDraft } = useDraftAutosave(DRAFT_KEY, draftValue);

  const steps = useMemo(
    () => [
      { id: "origem", label: "Origem", complete: Boolean(origemTipo), anchorId: "os-step-origem" },
      { id: "cliente", label: "Cliente", complete: Boolean(codcli && clienteNome), anchorId: "os-step-cliente" },
      { id: "pedido", label: "Pedido e Item", complete: Boolean(numPedido && codprod), anchorId: "os-step-pedido" },
      {
        id: "dados",
        label: "Dados da OS",
        complete: Boolean(tecnicoResponsavel.trim() && descricaoProblema.trim()),
        anchorId: "os-step-dados",
      },
    ],
    [origemTipo, codcli, clienteNome, numPedido, codprod, tecnicoResponsavel, descricaoProblema],
  );

  const setError = (field: string, value = "") => setErrors((prev) => ({ ...prev, [field]: value }));

  const handleClientSearch = async () => {
    if (!clientSearchFilter.codcli && !clientSearchFilter.cgcent && !clientSearchFilter.telefone) {
      toast({
        title: "Informe um filtro",
        description: "Use CODCLI, CPF/CNPJ ou Telefone para pesquisar cliente.",
        variant: "destructive",
      });
      return;
    }
    try {
      trackAction("SEARCH_CLIENT");
      const results = await buscarClientesERP(clientSearchFilter);
      setClientResults(results);
      if (results.length === 0) {
        toast({
          title: "Nenhum cliente encontrado",
          description: "Não foi encontrado cliente com os filtros informados.",
        });
      }
    } catch (error) {
      const message = getApiErrorMessage(error, "Falha ao consultar clientes no ERP.");
      trackError("SEARCH_CLIENT", message);
      setClientResults([]);
      toast({ title: "Erro ao pesquisar cliente", description: message, variant: "destructive" });
    }
  };

  const handleSelectClient = async (c: ClienteERP) => {
    setCodcli(String(c.codcli ?? ""));
    setClienteNome(String(c.nome ?? ""));
    setError("codcli");
    setShowClientSearch(false);
    trackAction("SELECT_CLIENT", { codcli: c.codcli });
    try {
      const peds = await buscarPedidosERP(c.codcli);
      setPedidos(peds);
      setSelectedPedido("");
      setItens([]);
      setSelectedItem("");
      setNumPedido("");
      setNfVenda("");
      setCodprod("");
      setProdutoRelacionado("");
    } catch (error) {
      const message = getApiErrorMessage(error, "Falha ao buscar pedidos do cliente.");
      trackError("LOAD_PEDIDOS", message, { codcli: c.codcli });
      setPedidos([]);
      setSelectedPedido("");
      setItens([]);
      setSelectedItem("");
      setNumPedido("");
      setNfVenda("");
      setCodprod("");
      setProdutoRelacionado("");
      toast({ title: "Erro ao carregar pedidos", description: message, variant: "destructive" });
    }
  };

  const handleSelectPedido = async (numped: string) => {
    const pedidoId = String(numped ?? "");
    setSelectedPedido(pedidoId);
    const ped = pedidos.find((p) => String(p.numped) === pedidoId);
    setNumPedido(pedidoId);
    setNfVenda(ped?.numnf != null ? String(ped.numnf) : "");
    trackAction("SELECT_PEDIDO", { numped: pedidoId });
    try {
      const items = await buscarItensPedidoERP(pedidoId);
      setItens(items);
      setSelectedItem("");
      setCodprod("");
      setProdutoRelacionado("");
    } catch (error) {
      const message = getApiErrorMessage(error, "Falha ao buscar itens do pedido.");
      trackError("LOAD_ITENS", message, { numped: pedidoId });
      setItens([]);
      setSelectedItem("");
      setCodprod("");
      setProdutoRelacionado("");
      toast({ title: "Erro ao carregar itens", description: message, variant: "destructive" });
    }
  };

  const handleSelectItem = (selectedCodprod: string) => {
    setSelectedItem(selectedCodprod);
    const item = itens.find((i) => i.codprod === selectedCodprod);
    if (item) {
      setCodprod(item.codprod);
      setProdutoRelacionado(`${item.codprod} - ${item.descricao}`);
    }
    trackAction("SELECT_ITEM", { codprod: selectedCodprod });
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!codcli.trim()) nextErrors.codcli = "Selecione um cliente.";
    if (!tecnicoResponsavel.trim()) nextErrors.tecnicoResponsavel = "Informe o técnico responsável.";
    if (!descricaoProblema.trim()) nextErrors.descricaoProblema = "Descreva o problema.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSalvar = async () => {
    if (isSaving) return;
    if (!validate()) {
      toast({ title: "Campos obrigatórios", description: "Revise os campos destacados.", variant: "destructive" });
      return;
    }

    const codcliValue = toText(codcli).trim();
    const clienteNomeValue = toText(clienteNome).trim();
    const tecnicoResponsavelValue = toText(tecnicoResponsavel).trim();
    const descricaoProblemaValue = toText(descricaoProblema).trim();

    setIsSaving(true);
    trackAction("CRIAR_OS_START");
    try {
      const novaOS = await criarOS({
        origemTipo,
        origemId: toOptionalText(origemId),
        codcli: codcliValue,
        clienteNome: clienteNomeValue,
        numPedido: toOptionalText(numPedido),
        nfVenda: toOptionalText(nfVenda),
        codprod: toOptionalText(codprod),
        planta,
        tipoOs,
        status: "ABERTA",
        prioridade,
        tecnicoResponsavel: tecnicoResponsavelValue,
        descricaoProblema: descricaoProblemaValue,
        dataAbertura: new Date().toISOString().slice(0, 10),
        dataPrevista: dataPrevista || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      });

      registrarAuditoria(
        "CRIAR",
        "OS",
        novaOS.id,
        `Tipo: ${tipoOs}. Cliente: ${clienteNomeValue}. Planta: ${planta}. Técnico: ${tecnicoResponsavelValue}`,
      );
      clearDraft();
      trackAction("CRIAR_OS_SUCCESS", { id: novaOS.id });
      toast({ title: "OS criada com sucesso", description: `Ordem de Serviço ${novaOS.id} foi criada.` });
      navigate(`/assistencia/os/${novaOS.id}`);
    } catch (error) {
      const message = getApiErrorMessage(error, "Falha ao criar a OS.");
      trackError("CRIAR_OS_ERROR", message);
      toast({
        title: "Erro ao criar OS",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/assistencia/os")} aria-label="Voltar para lista de OS">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Nova Ordem de Serviço</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Preencha os dados para abrir uma nova OS</p>
        </div>
      </div>

      <FormStepGuide title="Assistente de preenchimento" steps={steps} />
      <p className="text-xs text-muted-foreground">
        Rascunho salvo automaticamente{lastSavedAt ? ` às ${new Date(lastSavedAt).toLocaleTimeString("pt-BR")}` : ""}.
      </p>

      <SectionCard id="os-step-origem" title="Origem" description="De onde vem esta OS?">
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

      <SectionCard id="os-step-cliente" title="Dados do Cliente">
        <div className="grid md:grid-cols-4 gap-4">
          <FormField label="CODCLI" hint="Código do cliente no ERP" error={errors.codcli}>
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

      <SectionCard
        id="os-step-pedido"
        title="Pedidos do Cliente"
        description={codcli ? `Pedidos encontrados para CODCLI ${codcli}` : "Selecione um cliente para carregar os pedidos"}
      >
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
                    <TableCell><span className="px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">{p.status}</span></TableCell>
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

      {produtoRelacionado && (
        <SectionCard title="Produto Selecionado">
          <FormField label="Produto Relacionado" hint="Preenchido ao selecionar item do pedido">
            <Input value={produtoRelacionado} readOnly className="bg-muted/30" />
          </FormField>
        </SectionCard>
      )}

      <SectionCard id="os-step-dados" title="Dados da OS">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormField label="Planta">
            <Select value={planta} onValueChange={(v) => setPlanta(v as Planta)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(PLANTA_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{k} – {v}</SelectItem>)}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Tipo de OS">
            <Select value={tipoOs} onValueChange={(v) => setTipoOs(v as OSTipo)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(OS_TIPO_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Prioridade">
            <Select value={prioridade} onValueChange={(v) => setPrioridade(v as OSPrioridade)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(OS_PRIORIDADE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Data Prevista">
            <Input type="date" value={dataPrevista} onChange={(e) => setDataPrevista(e.target.value)} />
          </FormField>
        </div>
        <FormField label="Técnico Responsável" required className="mt-4" error={errors.tecnicoResponsavel}>
          <Input
            placeholder="Nome do técnico"
            value={tecnicoResponsavel}
            onChange={(e) => {
              setTecnicoResponsavel(e.target.value);
              setError("tecnicoResponsavel");
            }}
          />
        </FormField>
        <FormField label="Descrição do Problema" required className="mt-4" error={errors.descricaoProblema}>
          <Textarea
            placeholder="Descreva o problema relatado..."
            value={descricaoProblema}
            onChange={(e) => {
              setDescricaoProblema(e.target.value);
              setError("descricaoProblema");
            }}
            rows={4}
          />
        </FormField>
      </SectionCard>

      <div className="flex justify-end gap-3 pb-6">
        <Button variant="outline" onClick={() => navigate("/assistencia/os")}>Cancelar</Button>
        <Button variant="outline" onClick={() => { clearDraft(); toast({ title: "Rascunho limpo" }); }}>Limpar Rascunho</Button>
        <Button onClick={() => { void handleSalvar(); }} className="gap-2" disabled={isSaving}>
          <Save className="w-4 h-4" /> {isSaving ? "Criando..." : "Criar OS"}
        </Button>
      </div>

      <Dialog open={showClientSearch} onOpenChange={setShowClientSearch}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Buscar Cliente</DialogTitle>
            <DialogDescription>Pesquise no cadastro de clientes do ERP</DialogDescription>
          </DialogHeader>
          <div className="grid md:grid-cols-4 gap-3">
            <Input placeholder="CODCLI" value={clientSearchFilter.codcli} onChange={(e) => setClientSearchFilter((p) => ({ ...p, codcli: e.target.value }))} />
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
          {clientResults.length === 0 && (clientSearchFilter.codcli || clientSearchFilter.cgcent || clientSearchFilter.telefone) && (
            <div className="text-sm text-muted-foreground text-center py-2">Nenhum resultado para os filtros informados.</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NovaOSPage;
