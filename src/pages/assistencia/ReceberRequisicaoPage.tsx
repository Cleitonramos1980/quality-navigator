import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, PackageCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import SectionCard from "@/components/forms/SectionCard";
import { buscarReqAssistencia, receberRequisicao } from "@/services/assistencia";
import { REQ_ASSIST_STATUS_LABELS, REQ_ASSIST_STATUS_COLORS } from "@/types/assistencia";
import type { RequisicaoAssistencia } from "@/types/assistencia";
import { registrarAuditoria } from "@/services/auditoria";
import { hasPermission } from "@/lib/rbac";
import { toast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ItemRecebimento {
  codMaterial: string;
  descricao: string;
  un: string;
  qtdSolicitada: number;
  qtdAtendida: number;
  qtdRecebida: number;
  recebido: boolean;
}

const ReceberRequisicaoPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [req, setReq] = useState<RequisicaoAssistencia | null>(null);
  const [itens, setItens] = useState<ItemRecebimento[]>([]);
  const [observacao, setObservacao] = useState("");

  const canReceber = hasPermission("ASSIST_REQ_RECEBER");

  useEffect(() => {
    if (!id) return;
    buscarReqAssistencia(id).then((data) => {
      if (data) {
        setReq(data);
        setItens(data.itens.map((i) => ({
          codMaterial: i.codMaterial,
          descricao: i.descricao,
          un: i.un,
          qtdSolicitada: i.qtdSolicitada,
          qtdAtendida: i.qtdAtendida ?? i.qtdSolicitada,
          qtdRecebida: i.qtdAtendida ?? i.qtdSolicitada,
          recebido: true,
        })));
      }
    });
  }, [id]);

  if (!req) return <div className="p-8 text-muted-foreground">Carregando...</div>;

  const canProcess = req.status === "EM_TRANSFERENCIA";

  const handleConfirmar = async () => {
    if (!canReceber) {
      toast({ title: "Sem permissão", description: "Você não tem permissão para receber requisições.", variant: "destructive" });
      return;
    }

    const itensRecebidos = itens
      .filter((i) => i.recebido)
      .map((i) => ({ codMaterial: i.codMaterial, qtdRecebida: i.qtdRecebida }));

    if (itensRecebidos.length === 0) {
      toast({ title: "Nenhum item marcado", description: "Marque ao menos um item como recebido.", variant: "destructive" });
      return;
    }

    await receberRequisicao(req.id, itensRecebidos, observacao);
    registrarAuditoria("RECEBER", "REQUISICAO", req.id, `Recebimento confirmado. ${itensRecebidos.length} item(ns). Obs: ${observacao || "—"}`);
    toast({ title: "Recebimento confirmado", description: `Requisição ${req.id} marcada como Recebida na Assistência.` });
    navigate(`/assistencia/os/${req.osId}`);
  };

  const toggleRecebido = (codMaterial: string) => {
    setItens((prev) => prev.map((i) => i.codMaterial === codMaterial ? { ...i, recebido: !i.recebido } : i));
  };

  const updateQtd = (codMaterial: string, qtd: number) => {
    setItens((prev) => prev.map((i) => i.codMaterial === codMaterial ? { ...i, qtdRecebida: qtd } : i));
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Receber Requisição — {req.id}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Confirmar recebimento de material na assistência</p>
        </div>
        <Badge className={REQ_ASSIST_STATUS_COLORS[req.status]}>{REQ_ASSIST_STATUS_LABELS[req.status]}</Badge>
      </div>

      {!canProcess && (
        <Alert variant="destructive">
          <AlertDescription>
            Esta requisição está com status <strong>{REQ_ASSIST_STATUS_LABELS[req.status]}</strong> e não pode ser recebida. Somente requisições em <strong>Em Transferência</strong> podem ser recebidas.
          </AlertDescription>
        </Alert>
      )}

      {/* Dados da Requisição */}
      <SectionCard title="Dados da Requisição">
        <div className="grid sm:grid-cols-4 gap-4 text-sm">
          <div><span className="text-xs text-muted-foreground block">ID</span><span className="font-mono">{req.id}</span></div>
          <div><span className="text-xs text-muted-foreground block">OS Vinculada</span><span className="font-mono">{req.osId}</span></div>
          <div><span className="text-xs text-muted-foreground block">CD Origem</span><span>{req.cdResponsavel}</span></div>
          <div><span className="text-xs text-muted-foreground block">Planta Destino</span><span>{req.plantaDestino}</span></div>
        </div>
      </SectionCard>

      {/* Itens para recebimento */}
      <SectionCard title="Itens para Recebimento" description="Confirme a quantidade recebida de cada material">
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="w-12 text-center text-xs">✓</TableHead>
                <TableHead className="text-xs">Código</TableHead>
                <TableHead className="text-xs">Descrição</TableHead>
                <TableHead className="text-xs">UN</TableHead>
                <TableHead className="text-xs text-center">Solicitada</TableHead>
                <TableHead className="text-xs text-center">Atendida</TableHead>
                <TableHead className="text-xs text-center w-28">Recebida</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {itens.map((item) => (
                <TableRow key={item.codMaterial} className={item.recebido ? "" : "opacity-50"}>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={item.recebido}
                      onCheckedChange={() => toggleRecebido(item.codMaterial)}
                      disabled={!canProcess}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-xs">{item.codMaterial}</TableCell>
                  <TableCell className="text-xs">{item.descricao}</TableCell>
                  <TableCell className="text-xs">{item.un}</TableCell>
                  <TableCell className="text-xs text-center">{item.qtdSolicitada}</TableCell>
                  <TableCell className="text-xs text-center">{item.qtdAtendida}</TableCell>
                  <TableCell className="text-center">
                    <Input
                      type="number"
                      min={0}
                      max={item.qtdAtendida}
                      value={item.qtdRecebida}
                      onChange={(e) => updateQtd(item.codMaterial, Number(e.target.value))}
                      className="h-8 w-20 text-xs mx-auto"
                      disabled={!canProcess || !item.recebido}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>

      {/* Observação */}
      <SectionCard title="Observação">
        <Textarea
          placeholder="Observações sobre o recebimento..."
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          rows={3}
          disabled={!canProcess}
        />
      </SectionCard>

      {/* Ações */}
      <div className="flex justify-end gap-3 pb-6">
        <Button variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
        {canReceber ? (
          <Button onClick={handleConfirmar} disabled={!canProcess} className="gap-2">
            <PackageCheck className="w-4 h-4" /> Confirmar Recebimento
          </Button>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button disabled className="gap-2">
                  <PackageCheck className="w-4 h-4" /> Confirmar Recebimento
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>Sem permissão para receber requisições</TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
};

export default ReceberRequisicaoPage;
