import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RequisicaoStatusBadge from "@/components/sac/RequisicaoStatusBadge";
import RequisicaoItensTable from "@/components/sac/RequisicaoItensTable";
import { mockRequisicoes } from "@/services/sacRequisicoes";
import { REQUISICAO_MOTIVO_LABELS, REQUISICAO_PRIORIDADE_LABELS } from "@/types/sacRequisicao";
import { PLANTA_LABELS } from "@/types/sgq";
import { ArrowLeft } from "lucide-react";

const RequisicaoDetalhePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const req = mockRequisicoes.find((r) => r.id === id);

  if (!req) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-muted-foreground">Requisição não encontrada</p>
        <Button variant="outline" onClick={() => navigate("/sac/requisicoes")}>Voltar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{req.id}</h1>
            <RequisicaoStatusBadge status={req.status} />
          </div>
          <p className="text-sm text-muted-foreground">{req.clienteNome}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Dados do Cliente</CardTitle></CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div><dt className="text-muted-foreground">Cliente</dt><dd className="font-medium text-foreground">{req.clienteNome}</dd></div>
              <div><dt className="text-muted-foreground">CODCLI</dt><dd className="font-mono text-foreground">{req.codcli}</dd></div>
              <div><dt className="text-muted-foreground">CPF/CNPJ</dt><dd className="font-mono text-foreground">{req.cgcent}</dd></div>
              {req.numPedido && <div><dt className="text-muted-foreground">Pedido</dt><dd className="font-mono text-foreground">{req.numPedido}</dd></div>}
              {req.numNfVenda && <div><dt className="text-muted-foreground">NF Venda</dt><dd className="font-mono text-foreground">{req.numNfVenda}</dd></div>}
              {req.produtoRelacionado && <div className="col-span-2"><dt className="text-muted-foreground">Produto</dt><dd className="text-foreground">{req.produtoRelacionado}</dd></div>}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Dados da Requisição</CardTitle></CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div><dt className="text-muted-foreground">Motivo</dt><dd className="text-foreground">{REQUISICAO_MOTIVO_LABELS[req.motivo]}</dd></div>
              <div><dt className="text-muted-foreground">Prioridade</dt><dd className="text-foreground">{REQUISICAO_PRIORIDADE_LABELS[req.prioridade]}</dd></div>
              <div><dt className="text-muted-foreground">Planta/CD</dt><dd className="text-foreground">{req.plantaCd} – {PLANTA_LABELS[req.plantaCd]}</dd></div>
              <div><dt className="text-muted-foreground">Criado em</dt><dd className="text-foreground">{req.criadoAt}</dd></div>
              {req.atendimentoId && <div><dt className="text-muted-foreground">Atendimento</dt><dd className="font-mono text-foreground">{req.atendimentoId}</dd></div>}
            </dl>
            {req.observacoes && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-sm text-muted-foreground mb-1">Observações</p>
                <p className="text-sm text-foreground">{req.observacoes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Itens Requisitados</CardTitle></CardHeader>
        <CardContent>
          <RequisicaoItensTable itens={req.itens} readOnly />
        </CardContent>
      </Card>

      {req.atendidoPor && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Dados do Atendimento</CardTitle></CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div><dt className="text-muted-foreground">Atendida por</dt><dd className="text-foreground">{req.atendidoPor}</dd></div>
              <div><dt className="text-muted-foreground">Data</dt><dd className="text-foreground">{req.atendidoAt}</dd></div>
            </dl>
            {req.observacoesAtendimento && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-sm text-muted-foreground mb-1">Observações do Atendimento</p>
                <p className="text-sm text-foreground">{req.observacoesAtendimento}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RequisicaoDetalhePage;
