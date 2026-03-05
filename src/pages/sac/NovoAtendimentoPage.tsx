import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import FormField from "@/components/forms/FormField";
import SectionCard from "@/components/forms/SectionCard";
import AttachmentUploader from "@/components/upload/AttachmentUploader";
import { CANAL_LABELS, TIPO_CONTATO_LABELS, CanalContato, TipoContato } from "@/types/sac";
import { Planta, PLANTA_LABELS } from "@/types/sgq";
import { ArrowLeft, Save, X, Search, FileWarning, ClipboardList, Shield, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { buscarClientesERP, buscarPedidosERP, buscarItensPedidoERP } from "@/services/sac";

interface ClienteERP {
  codcli: string; nome: string; cgcent: string; telefones: string; cidade: string; uf: string;
}
interface PedidoERP {
  numped: string; numnf: string; codcli: string; dtPedido: string; vlrPedido: number; status: string; canal: string;
}
interface ItemPedidoERP {
  numped: string; numnf: string; codprod: string; descricao: string; un: string; qtd: number; vlrUnit: number; vlrTotal: number;
}

const NovoAtendimentoPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Client data
  const [form, setForm] = useState({
    codcli: "", clienteNome: "", cgcent: "", telefone: "",
    canal: "" as CanalContato | "", tipoContato: "" as TipoContato | "",
    descricao: "", plantaResp: "" as Planta | "",
    numPedido: "", numNfVenda: "", produtoRelacionado: "",
  });

  // Client search modal
  const [showClientSearch, setShowClientSearch] = useState(false);
  const [clientSearchFilter, setClientSearchFilter] = useState({ nome: "", cgcent: "", telefone: "" });
  const [clientResults, setClientResults] = useState<ClienteERP[]>([]);

  // Pedidos & Itens grids
  const [pedidos, setPedidos] = useState<PedidoERP[]>([]);
  const [selectedPedido, setSelectedPedido] = useState<string>("");
  const [itens, setItens] = useState<ItemPedidoERP[]>([]);
  const [selectedItem, setSelectedItem] = useState<string>("");

  const set = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  // === Client Search ===
  const handleClientSearch = async () => {
    const results = await buscarClientesERP(clientSearchFilter);
    setClientResults(results);
  };

  const handleSelectClient = async (c: ClienteERP) => {
    setForm((p) => ({ ...p, codcli: c.codcli, clienteNome: c.nome, cgcent: c.cgcent, telefone: c.telefones }));
    setShowClientSearch(false);
    // Auto-load pedidos
    const peds = await buscarPedidosERP(c.codcli);
    setPedidos(peds);
    setSelectedPedido("");
    setItens([]);
    setSelectedItem("");
  };

  // === Pedido Selection ===
  const handleSelectPedido = async (numped: string) => {
    setSelectedPedido(numped);
    const ped = pedidos.find((p) => p.numped === numped);
    setForm((p) => ({ ...p, numPedido: numped, numNfVenda: ped?.numnf || "" }));
    const items = await buscarItensPedidoERP(numped);
    setItens(items);
    setSelectedItem("");
    setForm((p) => ({ ...p, produtoRelacionado: "" }));
  };

  // === Item Selection ===
  const handleSelectItem = (codprod: string) => {
    setSelectedItem(codprod);
    const item = itens.find((i) => i.codprod === codprod);
    if (item) {
      setForm((p) => ({ ...p, produtoRelacionado: `${item.codprod} - ${item.descricao}` }));
    }
  };

  const buildStatePayload = () => ({
    codcli: form.codcli,
    clienteNome: form.clienteNome,
    cgcent: form.cgcent,
    telefone: form.telefone,
    numPedido: form.numPedido,
    numNfVenda: form.numNfVenda,
    produtoRelacionado: form.produtoRelacionado,
    descricao: form.descricao,
    plantaResp: form.plantaResp,
    canal: form.canal,
    tipoContato: form.tipoContato,
  });

  // === Save ===
  const handleSave = () => {
    if (!form.clienteNome || !form.descricao || !form.canal || !form.tipoContato || !form.plantaResp) {
      toast({ title: "Campos obrigatórios", description: "Preencha todos os campos obrigatórios.", variant: "destructive" });
      return;
    }
    toast({ title: "Atendimento criado", description: "Chamado SAC registrado com sucesso." });
    navigate("/sac/atendimentos");
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Novo Atendimento SAC</h1>
          <p className="text-sm text-muted-foreground">Registrar novo chamado de atendimento ao cliente</p>
        </div>
      </div>

      {/* BLOCO 1 — Dados do Cliente */}
      <SectionCard title="Dados do Cliente">
        <div className="grid md:grid-cols-4 gap-4">
          <FormField label="CODCLI" hint="Código do cliente no ERP">
            <Input value={form.codcli} readOnly placeholder="—" className="bg-muted/30" />
          </FormField>
          <FormField label="Cliente" required>
            <Input value={form.clienteNome} readOnly placeholder="Selecione um cliente" className="bg-muted/30" />
          </FormField>
          <FormField label="CPF/CNPJ">
            <Input value={form.cgcent} readOnly placeholder="—" className="bg-muted/30" />
          </FormField>
          <FormField label="Telefone">
            <Input value={form.telefone} readOnly placeholder="—" className="bg-muted/30" />
          </FormField>
        </div>
        <div className="mt-3">
          <Button variant="outline" onClick={() => setShowClientSearch(true)}>
            <Search className="w-4 h-4 mr-1" /> Buscar Cliente
          </Button>
        </div>
      </SectionCard>

      {/* BLOCO 2 — Pedidos do Cliente */}
      <SectionCard title="Pedidos do Cliente" description={form.codcli ? `Pedidos encontrados para CODCLI ${form.codcli}` : "Selecione um cliente para carregar os pedidos"}>
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
            {form.codcli ? "Nenhum pedido encontrado para este cliente." : "Busque e selecione um cliente acima."}
          </div>
        )}
      </SectionCard>

      {/* BLOCO 3 — Itens do Pedido */}
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

      {/* BLOCO 4 — Dados do Atendimento */}
      <SectionCard title="Dados do Atendimento">
        <div className="grid md:grid-cols-3 gap-4">
          <FormField label="Canal de Contato" required>
            <Select value={form.canal} onValueChange={(v) => set("canal", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {Object.entries(CANAL_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Tipo de Contato" required>
            <Select value={form.tipoContato} onValueChange={(v) => set("tipoContato", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {Object.entries(TIPO_CONTATO_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Planta Responsável" required>
            <Select value={form.plantaResp} onValueChange={(v) => set("plantaResp", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {Object.entries(PLANTA_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>
        <div className="grid md:grid-cols-3 gap-4 mt-4">
          <FormField label="Produto Relacionado" hint="Preenchido ao selecionar item do pedido">
            <Input value={form.produtoRelacionado} readOnly placeholder="Selecione um item acima" className="bg-muted/30" />
          </FormField>
          <FormField label="Pedido Relacionado">
            <Input value={form.numPedido} readOnly placeholder="—" className="bg-muted/30" />
          </FormField>
          <FormField label="Nota Fiscal Relacionada">
            <Input value={form.numNfVenda} readOnly placeholder="—" className="bg-muted/30" />
          </FormField>
        </div>
        <FormField label="Descrição da Reclamação" required className="mt-4">
          <Textarea value={form.descricao} onChange={(e) => set("descricao", e.target.value)} placeholder="Descreva detalhadamente o problema relatado pelo cliente..." rows={4} />
        </FormField>
      </SectionCard>

      {/* Evidências */}
      <SectionCard title="Evidências">
        <AttachmentUploader maxFiles={10} accept="image/*,video/*,.pdf,.doc,.docx" />
      </SectionCard>

      {/* Botões de Ação */}
      <div className="flex flex-wrap justify-end gap-3 pb-6">
        <Button variant="outline" onClick={() => navigate(-1)}><X className="w-4 h-4 mr-1" /> Cancelar</Button>
        <Button variant="outline" onClick={() => { handleSave(); navigate("/garantias/nova", { state: buildStatePayload() }); }}>
          <Shield className="w-4 h-4 mr-1" /> Criar Garantia
        </Button>
        <Button variant="outline" onClick={() => { handleSave(); navigate("/nao-conformidades/nova", { state: buildStatePayload() }); }}>
          <FileWarning className="w-4 h-4 mr-1" /> Criar NC
        </Button>
        <Button variant="outline" onClick={() => { handleSave(); navigate("/capa/nova", { state: buildStatePayload() }); }}>
          <ClipboardList className="w-4 h-4 mr-1" /> Criar CAPA
        </Button>
        <Button variant="outline" onClick={() => navigate("/sac/requisicoes/nova", { state: buildStatePayload() })}>
          <Package className="w-4 h-4 mr-1" /> Requisição
        </Button>
        <Button onClick={handleSave}><Save className="w-4 h-4 mr-1" /> Salvar Atendimento</Button>
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

export default NovoAtendimentoPage;
