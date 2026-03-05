import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Search, AlertTriangle, Warehouse } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import SectionCard from "@/components/forms/SectionCard";
import FormField from "@/components/forms/FormField";
import { buscarOS, listarReqAssistencia, registrarConsumo, listarEstoque } from "@/services/assistencia";
import { registrarAuditoria } from "@/services/auditoria";
import { hasPermission, getCurrentUserName } from "@/lib/rbac";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { OrdemServico, RequisicaoAssistencia } from "@/types/assistencia";
import { EstoqueItem } from "@/data/mockAssistenciaData";
import { toast } from "@/hooks/use-toast";

const ConsumoOSPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [os, setOs] = useState<OrdemServico | null>(null);
  const [reqs, setReqs] = useState<RequisicaoAssistencia[]>([]);
  const [selectedReqId, setSelectedReqId] = useState("");
  const [codMaterial, setCodMaterial] = useState("");
  const [descricaoMaterial, setDescricaoMaterial] = useState("");
  const [un, setUn] = useState("");
  const [qtdConsumida, setQtdConsumida] = useState(1);
  const [observacao, setObservacao] = useState("");

  // Material picker
  const [showEstoque, setShowEstoque] = useState(false);
  const [estoque, setEstoque] = useState<EstoqueItem[]>([]);
  const [estoqueFilter, setEstoqueFilter] = useState("");

  const canConsumo = hasPermission("ASSIST_CONSUMO_CREATE");

  useEffect(() => {
    if (!id) return;
    buscarOS(id).then((data) => { if (data) setOs(data); });
    listarReqAssistencia().then((all) => {
      const osReqs = all.filter((r) => r.osId === id);
      setReqs(osReqs);
    });
  }, [id]);

  if (!os) return <div className="p-8 text-muted-foreground">Carregando...</div>;

  const reqsRecebidas = reqs.filter((r) => r.status === "RECEBIDA_ASSISTENCIA");
  const consumoLiberado = reqsRecebidas.length > 0;

  const openEstoque = async () => {
    const est = await listarEstoque();
    setEstoque(est);
    setEstoqueFilter("");
    setShowEstoque(true);
  };

  const selectMaterial = (item: EstoqueItem) => {
    setCodMaterial(item.codMaterial);
    setDescricaoMaterial(item.descricao);
    setUn(item.un);
    setShowEstoque(false);
  };

  const filteredEstoque = estoque.filter((e) =>
    !estoqueFilter || e.descricao.toLowerCase().includes(estoqueFilter.toLowerCase()) || e.codMaterial.toLowerCase().includes(estoqueFilter.toLowerCase())
  );

  const handleSalvar = async () => {
    if (!canConsumo) {
      toast({ title: "Sem permissão", variant: "destructive" });
      return;
    }
    if (!codMaterial || qtdConsumida <= 0) {
      toast({ title: "Campos obrigatórios", description: "Selecione um material e informe quantidade > 0.", variant: "destructive" });
      return;
    }

    const novo = await registrarConsumo({
      osId: os.id,
      reqId: selectedReqId || undefined,
      codMaterial,
      descricao: descricaoMaterial,
      un,
      qtdConsumida,
      tecnico: getCurrentUserName(),
      dataConsumo: new Date().toISOString().slice(0, 10),
    });

    registrarAuditoria("REGISTRAR_CONSUMO", "CONSUMO", novo.id, `OS: ${os.id}. Material: ${codMaterial} — Qtd: ${qtdConsumida} ${un}. Req: ${selectedReqId || "—"}`);
    toast({ title: "Consumo registrado", description: `${novo.id} — ${descricaoMaterial}` });
    navigate(`/assistencia/os/${os.id}`);
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/assistencia/os/${os.id}`)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Registrar Consumo — {os.id}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Registrar consumo de peça/material vinculado à OS</p>
        </div>
      </div>

      {!consumoLiberado && (
        <Alert variant="destructive">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>
            <strong>Consumo bloqueado.</strong> É necessário que ao menos uma requisição vinculada a esta OS tenha sido recebida na assistência (status "Recebida na Assistência") para registrar consumo.
          </AlertDescription>
        </Alert>
      )}

      <SectionCard title="Dados do Consumo">
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField label="Ordem de Serviço">
            <Input value={os.id} readOnly className="bg-muted/30" />
          </FormField>
          <FormField label="Requisição Vinculada" hint="Opcional — selecione a requisição de origem">
            <Select value={selectedReqId} onValueChange={setSelectedReqId}>
              <SelectTrigger><SelectValue placeholder="Nenhuma" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhuma</SelectItem>
                {reqsRecebidas.map((r) => (
                  <SelectItem key={r.id} value={r.id}>{r.id} — {r.itens.length} item(ns)</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mt-4">
          <FormField label="Material" required className="sm:col-span-2">
            <div className="flex gap-2">
              <Input value={codMaterial ? `${codMaterial} — ${descricaoMaterial}` : ""} readOnly placeholder="Selecione um material" className="bg-muted/30 flex-1" />
              <Button variant="outline" onClick={openEstoque} disabled={!consumoLiberado}>
                <Warehouse className="w-4 h-4 mr-1" /> Buscar
              </Button>
            </div>
          </FormField>
          <FormField label="Quantidade" required>
            <Input type="number" min={1} value={qtdConsumida} onChange={(e) => setQtdConsumida(Number(e.target.value))} disabled={!consumoLiberado} />
          </FormField>
        </div>

        <FormField label="Observação" className="mt-4">
          <Textarea placeholder="Observações sobre o consumo..." value={observacao} onChange={(e) => setObservacao(e.target.value)} rows={3} disabled={!consumoLiberado} />
        </FormField>
      </SectionCard>

      <div className="flex justify-end gap-3 pb-6">
        <Button variant="outline" onClick={() => navigate(`/assistencia/os/${os.id}`)}>Cancelar</Button>
        {canConsumo ? (
          <Button onClick={handleSalvar} disabled={!consumoLiberado} className="gap-2">
            <Save className="w-4 h-4" /> Registrar Consumo
          </Button>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <span><Button disabled className="gap-2"><Save className="w-4 h-4" /> Registrar Consumo</Button></span>
            </TooltipTrigger>
            <TooltipContent>Sem permissão para registrar consumo</TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Modal Estoque */}
      <Dialog open={showEstoque} onOpenChange={setShowEstoque}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Selecionar Material</DialogTitle>
            <DialogDescription>Busque e selecione o material consumido</DialogDescription>
          </DialogHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar..." value={estoqueFilter} onChange={(e) => setEstoqueFilter(e.target.value)} className="pl-9" />
          </div>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs">Código</TableHead>
                  <TableHead className="text-xs">Descrição</TableHead>
                  <TableHead className="text-xs">UN</TableHead>
                  <TableHead className="text-xs w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEstoque.map((item) => (
                  <TableRow key={item.codMaterial} className="cursor-pointer hover:bg-muted/30" onClick={() => selectMaterial(item)}>
                    <TableCell className="font-mono text-xs">{item.codMaterial}</TableCell>
                    <TableCell className="text-xs">{item.descricao}</TableCell>
                    <TableCell className="text-xs">{item.un}</TableCell>
                    <TableCell><Button size="sm" variant="ghost" className="text-xs">Selecionar</Button></TableCell>
                  </TableRow>
                ))}
                {filteredEstoque.length === 0 && (
                  <TableRow><TableCell colSpan={4} className="text-center py-6 text-muted-foreground text-sm">Nenhum material encontrado.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConsumoOSPage;
