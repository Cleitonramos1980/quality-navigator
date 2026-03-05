import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import SectionCard from "@/components/forms/SectionCard";
import FormField from "@/components/forms/FormField";
import RequisicaoStatusBadge from "@/components/sac/RequisicaoStatusBadge";
import { mockRequisicoes, atenderRequisicao } from "@/services/sacRequisicoes";
import { REQUISICAO_MOTIVO_LABELS, REQUISICAO_PRIORIDADE_LABELS, RequisicaoStatus, ItemRequisicaoSituacao, ItemRequisicao } from "@/types/sacRequisicao";
import { PLANTA_LABELS } from "@/types/sgq";
import { ArrowLeft, Save, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AtenderRequisicaoPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const req = mockRequisicoes.find((r) => r.id === id);

  const [itensAtendimento, setItensAtendimento] = useState<ItemRequisicao[]>(
    req ? req.itens.map((it) => ({ ...it, qtdAtendida: it.qtdSolicitada, situacao: "ATENDIDO" as ItemRequisicaoSituacao })) : []
  );
  const [statusFinal, setStatusFinal] = useState<RequisicaoStatus>("ATENDIDA");
  const [obsAtendimento, setObsAtendimento] = useState("");

  if (!req) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-muted-foreground">Requisição não encontrada</p>
        <Button variant="outline" onClick={() => navigate("/sac/requisicoes")}>Voltar</Button>
      </div>
    );
  }

  const updateItem = (idx: number, field: string, value: any) => {
    setItensAtendimento((prev) => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it));
  };

  const handleConcluir = async () => {
    await atenderRequisicao(req.id, {
      status: statusFinal,
      itens: itensAtendimento,
      observacoesAtendimento: obsAtendimento,
      atendidoPor: "Administrador",
    });
    toast({ title: "Requisição atendida", description: `Requisição ${req.id} concluída com sucesso.` });
    navigate("/sac/requisicoes");
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">Atender {req.id}</h1>
            <RequisicaoStatusBadge status={req.status} />
          </div>
          <p className="text-sm text-muted-foreground">{req.clienteNome} — {REQUISICAO_MOTIVO_LABELS[req.motivo]}</p>
        </div>
      </div>

      {/* Contexto */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Contexto</CardTitle></CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2 text-sm">
            <div><dt className="text-muted-foreground">Cliente</dt><dd className="font-medium text-foreground">{req.clienteNome}</dd></div>
            <div><dt className="text-muted-foreground">Planta/CD</dt><dd className="text-foreground">{req.plantaCd} – {PLANTA_LABELS[req.plantaCd]}</dd></div>
            <div><dt className="text-muted-foreground">Prioridade</dt><dd className="text-foreground">{REQUISICAO_PRIORIDADE_LABELS[req.prioridade]}</dd></div>
            {req.numPedido && <div><dt className="text-muted-foreground">Pedido</dt><dd className="font-mono text-foreground">{req.numPedido}</dd></div>}
          </dl>
          {req.observacoes && <p className="text-sm text-foreground mt-3 pt-3 border-t border-border">{req.observacoes}</p>}
        </CardContent>
      </Card>

      {/* Itens */}
      <SectionCard title="Itens para Atendimento" description="Informe a quantidade atendida e situação de cada item">
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>CODMAT</TableHead>
                <TableHead>DESCRIÇÃO</TableHead>
                <TableHead>UN</TableHead>
                <TableHead className="text-right">QTD SOLIC.</TableHead>
                <TableHead className="text-right">QTD ATENDIDA</TableHead>
                <TableHead>SITUAÇÃO</TableHead>
                <TableHead>OBS. ATENDENTE</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {itensAtendimento.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-mono text-xs">{item.codmat}</TableCell>
                  <TableCell>{item.descricaoMaterial}</TableCell>
                  <TableCell>{item.un}</TableCell>
                  <TableCell className="text-right">{item.qtdSolicitada}</TableCell>
                  <TableCell className="text-right">
                    <Input type="number" min={0} max={item.qtdSolicitada} value={item.qtdAtendida || 0}
                      onChange={(e) => updateItem(idx, "qtdAtendida", parseInt(e.target.value) || 0)} className="w-20 text-right ml-auto" />
                  </TableCell>
                  <TableCell>
                    <Select value={item.situacao || "ATENDIDO"} onValueChange={(v) => updateItem(idx, "situacao", v)}>
                      <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ATENDIDO">Atendido</SelectItem>
                        <SelectItem value="PARCIAL">Parcial</SelectItem>
                        <SelectItem value="INDISPONIVEL">Indisponível</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input value={item.observacaoAtendente || ""} onChange={(e) => updateItem(idx, "observacaoAtendente", e.target.value)} placeholder="Obs." className="min-w-[120px]" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>

      {/* Status Final */}
      <SectionCard title="Conclusão do Atendimento">
        <div className="grid md:grid-cols-2 gap-4">
          <FormField label="Status Final da Requisição" required>
            <Select value={statusFinal} onValueChange={(v) => setStatusFinal(v as RequisicaoStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ATENDIDA">Atendida</SelectItem>
                <SelectItem value="PARCIAL">Parcial</SelectItem>
                <SelectItem value="NEGADA">Negada</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>
        <FormField label="Observações do Atendimento" className="mt-4">
          <Textarea value={obsAtendimento} onChange={(e) => setObsAtendimento(e.target.value)} placeholder="Observações sobre o atendimento..." rows={3} />
        </FormField>
      </SectionCard>

      {/* Botões */}
      <div className="flex flex-wrap justify-end gap-3 pb-6">
        <Button variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
        <Button onClick={handleConcluir}><CheckCircle className="w-4 h-4 mr-1" /> Concluir Atendimento</Button>
      </div>
    </div>
  );
};

export default AtenderRequisicaoPage;
