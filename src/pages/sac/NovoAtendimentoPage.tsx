import { useMemo, useState } from "react";
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
import FormStepGuide from "@/components/forms/FormStepGuide";
import { CANAL_LABELS, TIPO_CONTATO_LABELS, CanalContato, TipoContato } from "@/types/sac";
import { Planta, PLANTA_LABELS } from "@/types/sgq";
import { ArrowLeft, Save, X, Search, FileWarning, ClipboardList, Shield, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { buscarClientesERP, buscarPedidosERP, buscarItensPedidoERP, criarAtendimento, uploadAtendimentoAnexos } from "@/services/sac";
import { getApiErrorMessage } from "@/services/api";
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

const FORM_DRAFT_KEY = "draft:sac:novo-atendimento";

const defaultForm = {
  codcli: "",
  clienteNome: "",
  cgcent: "",
  telefone: "",
  canal: "" as CanalContato | "",
  tipoContato: "" as TipoContato | "",
  descricao: "",
  plantaResp: "" as Planta | "",
  numPedido: "",
  numNfVenda: "",
  codprod: "",
  produtoRelacionado: "",
};

const NovoAtendimentoPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { trackAction, trackError } = useUxMetrics("SAC_NOVO_ATENDIMENTO");

  const [form, setForm] = useState(() => loadDraft(FORM_DRAFT_KEY, defaultForm));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [showClientSearch, setShowClientSearch] = useState(false);
  const [clientSearchFilter, setClientSearchFilter] = useState({ codcli: "", nome: "", cgcent: "", telefone: "" });
  const [clientResults, setClientResults] = useState<ClienteERP[]>([]);

  const [pedidos, setPedidos] = useState<PedidoERP[]>([]);
  const [selectedPedido, setSelectedPedido] = useState<string>("");
  const [itens, setItens] = useState<ItemPedidoERP[]>([]);
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingUploadAtendimentoId, setPendingUploadAtendimentoId] = useState<string | null>(null);

  const { lastSavedAt, clear: clearDraft } = useDraftAutosave(FORM_DRAFT_KEY, form);

  const set = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const steps = useMemo(
    () => [
      { id: "cliente", label: "Cliente", complete: Boolean(form.codcli && form.clienteNome), anchorId: "step-cliente" },
      { id: "pedido", label: "Pedido e Item", complete: Boolean(form.numPedido && form.codprod), anchorId: "step-pedido" },
      {
        id: "dados",
        label: "Dados do Atendimento",
        complete: Boolean(form.canal && form.tipoContato && form.plantaResp && form.descricao.trim()),
        anchorId: "step-dados",
      },
      { id: "evidencias", label: "Evidências", complete: true, anchorId: "step-evidencias" },
    ],
    [form],
  );

  const validateForm = (): Record<string, string> => {
    const nextErrors: Record<string, string> = {};
    if (!form.codcli) nextErrors.codcli = "Selecione um cliente.";
    if (!form.canal) nextErrors.canal = "Selecione o canal.";
    if (!form.tipoContato) nextErrors.tipoContato = "Selecione o tipo de contato.";
    if (!form.plantaResp) nextErrors.plantaResp = "Selecione a planta responsável.";
    if (!form.descricao.trim()) nextErrors.descricao = "Informe a descrição da reclamação.";
    return nextErrors;
  };

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
      trackAction("SEARCH_CLIENT", {
        codcli: clientSearchFilter.codcli || undefined,
        cgcent: clientSearchFilter.cgcent || undefined,
      });
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
      setClientResults([]);
      trackError("SEARCH_CLIENT", message);
      toast({
        title: "Erro ao pesquisar cliente",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleSelectClient = async (c: ClienteERP) => {
    setForm((p) => ({ ...p, codcli: c.codcli, clienteNome: c.nome, cgcent: c.cgcent, telefone: c.telefones }));
    setErrors((prev) => ({ ...prev, codcli: "" }));
    setShowClientSearch(false);
    trackAction("SELECT_CLIENT", { codcli: c.codcli });
    try {
      const peds = await buscarPedidosERP(c.codcli);
      setPedidos(peds);
      setSelectedPedido("");
      setItens([]);
      setSelectedItem("");
    } catch (error) {
      const message = getApiErrorMessage(error, "Falha ao buscar pedidos do cliente.");
      setPedidos([]);
      setSelectedPedido("");
      setItens([]);
      setSelectedItem("");
      trackError("LOAD_PEDIDOS_CLIENTE", message, { codcli: c.codcli });
      toast({ title: "Erro ao carregar pedidos", description: message, variant: "destructive" });
    }
  };

  const handleSelectPedido = async (numped: string) => {
    const pedidoId = String(numped ?? "");
    setSelectedPedido(pedidoId);
    const ped = pedidos.find((p) => String(p.numped) === pedidoId);
    setForm((p) => ({
      ...p,
      numPedido: pedidoId,
      numNfVenda: ped?.numnf != null ? String(ped.numnf) : "",
    }));
    try {
      trackAction("SELECT_PEDIDO", { numped: pedidoId });
      const items = await buscarItensPedidoERP(numped);
      setItens(items);
      setSelectedItem("");
      setForm((p) => ({ ...p, codprod: "", produtoRelacionado: "" }));
    } catch (error) {
      const message = getApiErrorMessage(error, "Falha ao buscar itens do pedido.");
      setItens([]);
      setSelectedItem("");
      setForm((p) => ({ ...p, codprod: "", produtoRelacionado: "" }));
      trackError("LOAD_ITENS_PEDIDO", message, { numped: pedidoId });
      toast({ title: "Erro ao carregar itens", description: message, variant: "destructive" });
    }
  };

  const handleSelectItem = (codprod: string) => {
    setSelectedItem(codprod);
    const item = itens.find((i) => i.codprod === codprod);
    if (item) {
      setForm((p) => ({ ...p, codprod: item.codprod, produtoRelacionado: `${item.codprod} - ${item.descricao}` }));
    }
    trackAction("SELECT_ITEM", { codprod });
  };

  const buildStatePayload = () => ({
    codcli: form.codcli,
    clienteNome: form.clienteNome,
    cgcent: form.cgcent,
    telefone: form.telefone,
    numPedido: form.numPedido,
    numNfVenda: form.numNfVenda,
    codprod: form.codprod,
    produtoRelacionado: form.produtoRelacionado,
    descricao: form.descricao,
    plantaResp: form.plantaResp,
    canal: form.canal,
    tipoContato: form.tipoContato,
  });

  const handleSave = async () => {
    const validation = validateForm();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      toast({
        title: "Campos obrigatórios",
        description: "Revise os campos destacados antes de salvar.",
        variant: "destructive",
      });
      return;
    }
    if (isSaving) return;

    trackAction("SAVE_ATENDIMENTO_START", { hasAttachments: attachments.length > 0 });
    setIsSaving(true);
    let atendimentoId = pendingUploadAtendimentoId;
    let createdAtendimentoId: string | null = null;

    try {
      if (!atendimentoId) {
        const created = await criarAtendimento({
          codcli: String(form.codcli || ""),
          clienteNome: form.clienteNome,
          cgcent: String(form.cgcent || ""),
          telefone: String(form.telefone || ""),
          canal: form.canal as CanalContato,
          tipoContato: form.tipoContato as TipoContato,
          descricao: form.descricao,
          plantaResp: form.plantaResp as Planta,
          numPedido: form.numPedido ? String(form.numPedido) : undefined,
          numNfVenda: form.numNfVenda ? String(form.numNfVenda) : undefined,
          codprod: form.codprod ? String(form.codprod) : undefined,
          produtoRelacionado: form.produtoRelacionado || undefined,
          status: "ABERTO",
        });
        atendimentoId = created.id;
        createdAtendimentoId = created.id;
      }

      if (attachments.length > 0 && atendimentoId) {
        const uploadResult = await uploadAtendimentoAnexos(atendimentoId, attachments);
        if (uploadResult.rejected && uploadResult.rejected.length > 0) {
          throw new Error(
            `Arquivos rejeitados: ${uploadResult.rejected
              .map((item) => `${item.nomeArquivo} (${item.motivo})`)
              .join(", ")}`,
          );
        }
        if (uploadResult.uploaded !== attachments.length) {
          throw new Error("Nem todos os anexos foram enviados.");
        }
      }

      setPendingUploadAtendimentoId(null);
      clearDraft();
      trackAction("SAVE_ATENDIMENTO_SUCCESS", { atendimentoId });
      toast({
        title: "Atendimento criado",
        description: attachments.length > 0
          ? "Chamado SAC e anexos registrados com sucesso."
          : "Chamado SAC registrado com sucesso.",
      });
      navigate("/sac/atendimentos");
    } catch (error) {
      const message = getApiErrorMessage(error, "Falha ao salvar atendimento.");
      if (atendimentoId) {
        setPendingUploadAtendimentoId(atendimentoId);
      }

      const partialSave = Boolean(createdAtendimentoId || pendingUploadAtendimentoId);
      trackError("SAVE_ATENDIMENTO_ERROR", message, { partialSave, atendimentoId });
      toast({
        title: partialSave ? "Atendimento salvo parcialmente" : "Erro ao salvar atendimento",
        description: partialSave
          ? `Atendimento ${atendimentoId} foi salvo, mas o upload dos anexos falhou (${message}). Corrija e tente novamente.`
          : message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Voltar">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Novo Atendimento SAC</h1>
          <p className="text-sm text-muted-foreground">Registrar novo chamado de atendimento ao cliente</p>
        </div>
      </div>

      <FormStepGuide title="Assistente de preenchimento" steps={steps} />
      <p className="text-xs text-muted-foreground">
        Rascunho salvo automaticamente{lastSavedAt ? ` às ${new Date(lastSavedAt).toLocaleTimeString("pt-BR")}` : ""}.
      </p>

      <SectionCard id="step-cliente" title="Dados do Cliente">
        <div className="grid md:grid-cols-4 gap-4">
          <FormField label="CODCLI" hint="Código do cliente no ERP" error={errors.codcli} fieldId="sac-codcli">
            <Input id="sac-codcli" value={form.codcli} readOnly placeholder="—" className="bg-muted/30" />
          </FormField>
          <FormField label="Cliente" required fieldId="sac-cliente">
            <Input id="sac-cliente" value={form.clienteNome} readOnly placeholder="Selecione um cliente" className="bg-muted/30" />
          </FormField>
          <FormField label="CPF/CNPJ" fieldId="sac-cgcent">
            <Input id="sac-cgcent" value={form.cgcent} readOnly placeholder="—" className="bg-muted/30" />
          </FormField>
          <FormField label="Telefone" fieldId="sac-telefone">
            <Input id="sac-telefone" value={form.telefone} readOnly placeholder="—" className="bg-muted/30" />
          </FormField>
        </div>
        <div className="mt-3">
          <Button variant="outline" onClick={() => setShowClientSearch(true)}>
            <Search className="w-4 h-4 mr-1" /> Buscar Cliente
          </Button>
        </div>
      </SectionCard>

      <SectionCard
        id="step-pedido"
        title="Pedidos do Cliente"
        description={form.codcli ? `Pedidos encontrados para CODCLI ${form.codcli}` : "Selecione um cliente para carregar os pedidos"}
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
            {form.codcli ? "Nenhum pedido encontrado para este cliente." : "Busque e selecione um cliente acima."}
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

      <SectionCard id="step-dados" title="Dados do Atendimento">
        <div className="grid md:grid-cols-3 gap-4">
          <FormField label="Canal de Contato" required error={errors.canal} fieldId="sac-canal">
            <Select value={form.canal} onValueChange={(v) => set("canal", v)}>
              <SelectTrigger id="sac-canal"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {Object.entries(CANAL_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Tipo de Contato" required error={errors.tipoContato} fieldId="sac-tipo">
            <Select value={form.tipoContato} onValueChange={(v) => set("tipoContato", v)}>
              <SelectTrigger id="sac-tipo"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {Object.entries(TIPO_CONTATO_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Planta Responsável" required error={errors.plantaResp} fieldId="sac-planta">
            <Select value={form.plantaResp} onValueChange={(v) => set("plantaResp", v)}>
              <SelectTrigger id="sac-planta"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {Object.entries(PLANTA_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </FormField>
        </div>
        <div className="grid md:grid-cols-3 gap-4 mt-4">
          <FormField label="Produto Relacionado" hint="Preenchido ao selecionar item do pedido" fieldId="sac-produto">
            <Input id="sac-produto" value={form.produtoRelacionado} readOnly placeholder="Selecione um item acima" className="bg-muted/30" />
          </FormField>
          <FormField label="Pedido Relacionado" fieldId="sac-pedido">
            <Input id="sac-pedido" value={form.numPedido} readOnly placeholder="—" className="bg-muted/30" />
          </FormField>
          <FormField label="Nota Fiscal Relacionada" fieldId="sac-nf">
            <Input id="sac-nf" value={form.numNfVenda} readOnly placeholder="—" className="bg-muted/30" />
          </FormField>
        </div>
        <FormField label="Descrição da Reclamação" required className="mt-4" error={errors.descricao} fieldId="sac-descricao">
          <Textarea
            id="sac-descricao"
            value={form.descricao}
            onChange={(e) => set("descricao", e.target.value)}
            placeholder="Descreva detalhadamente o problema relatado pelo cliente..."
            rows={4}
          />
        </FormField>
      </SectionCard>

      <SectionCard id="step-evidencias" title="Evidências">
        <AttachmentUploader
          onFilesChange={setAttachments}
          onValidationError={(message) => toast({ title: "Validação de anexo", description: message, variant: "destructive" })}
          maxFiles={10}
          maxFileSizeMB={25}
          accept="image/*,video/*,.pdf,.doc,.docx"
          disabled={isSaving}
        />
      </SectionCard>

      <div className="flex flex-wrap justify-end gap-3 pb-6">
        <Button variant="outline" onClick={() => navigate(-1)}><X className="w-4 h-4 mr-1" /> Cancelar</Button>
        <Button variant="outline" onClick={() => { navigate("/garantias/nova", { state: buildStatePayload() }); }}>
          <Shield className="w-4 h-4 mr-1" /> Criar Garantia
        </Button>
        <Button variant="outline" onClick={() => { navigate("/nao-conformidades/nova", { state: buildStatePayload() }); }}>
          <FileWarning className="w-4 h-4 mr-1" /> Criar NC
        </Button>
        <Button variant="outline" onClick={() => { navigate("/capa/nova", { state: buildStatePayload() }); }}>
          <ClipboardList className="w-4 h-4 mr-1" /> Criar CAPA
        </Button>
        <Button variant="outline" onClick={() => navigate("/sac/requisicoes/nova", { state: buildStatePayload() })}>
          <Package className="w-4 h-4 mr-1" /> Requisição
        </Button>
        <Button variant="outline" onClick={() => { clearDraft(); toast({ title: "Rascunho limpo" }); }}>Limpar Rascunho</Button>
        <Button disabled={isSaving} onClick={() => { void handleSave(); }}>
          <Save className="w-4 h-4 mr-1" /> {isSaving ? "Salvando..." : "Salvar Atendimento"}
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

export default NovoAtendimentoPage;
