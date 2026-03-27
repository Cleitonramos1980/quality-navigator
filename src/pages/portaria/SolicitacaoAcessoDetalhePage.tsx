import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ClipboardCopy, ExternalLink, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import StatusSemaphore from "@/components/operacional/StatusSemaphore";
import { getSolicitacaoAcessoById } from "@/services/operacional";
import type { SolicitacaoAcesso } from "@/types/operacional";
import { toast } from "@/hooks/use-toast";

const SolicitacaoAcessoDetalhePage = () => {
  const { id } = useParams();
  const [solicitacao, setSolicitacao] = useState<SolicitacaoAcesso | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getSolicitacaoAcessoById(id)
      .then(setSolicitacao)
      .catch((error: any) => {
        toast({
          title: "Erro ao carregar solicitacao",
          description: error?.message || "Nao foi possivel obter os dados da solicitacao.",
          variant: "destructive",
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const hasVisitorData = useMemo(
    () => Boolean(solicitacao?.preenchimento?.nome && solicitacao?.preenchimento?.documento),
    [solicitacao],
  );

  const copyLink = async () => {
    if (!solicitacao?.linkPreenchimento) return;
    try {
      await navigator.clipboard.writeText(solicitacao.linkPreenchimento);
      toast({ title: "Link copiado", description: "Link de preenchimento copiado." });
    } catch {
      toast({ title: "Falha ao copiar", description: "Copie o link manualmente.", variant: "destructive" });
    }
  };

  const openLink = () => {
    if (!solicitacao?.linkPreenchimento) return;
    window.open(solicitacao.linkPreenchimento, "_blank", "noopener,noreferrer");
  };

  const shareLink = async () => {
    if (!solicitacao?.linkPreenchimento) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Link de acesso",
          text: `Solicitacao ${solicitacao.codigo}`,
          url: solicitacao.linkPreenchimento,
        });
        return;
      } catch {
        // fallback to copy below
      }
    }
    await copyLink();
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Carregando solicitacao...</div>;
  }

  if (!solicitacao) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">Solicitacao nao encontrada.</p>
        <Button variant="outline" asChild><Link to="/portaria">Voltar para Portaria</Link></Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/portaria"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{solicitacao.codigo}</h1>
            <StatusSemaphore status={solicitacao.status} />
          </div>
          <p className="text-sm text-muted-foreground">Solicitacao de acesso com link unico de preenchimento</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Link de Preenchimento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input readOnly value={solicitacao.linkPreenchimento} className="font-mono text-xs" />
            <Button variant="outline" size="icon" onClick={copyLink}><ClipboardCopy className="h-4 w-4" /></Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={openLink} className="gap-2">
              <ExternalLink className="h-4 w-4" />
              Abrir Link
            </Button>
            <Button variant="outline" onClick={shareLink} className="gap-2">
              <Share2 className="h-4 w-4" />
              Compartilhar
            </Button>
            <Button asChild>
              <Link to={`/portaria/${solicitacao.acessoId}`}>Abrir Acesso Vinculado</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Dados da Solicitacao</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between gap-3"><span className="text-muted-foreground">Tipo</span><span className="font-medium">{solicitacao.tipoAcesso}</span></div>
            <div className="flex justify-between gap-3"><span className="text-muted-foreground">Responsavel interno</span><span className="font-medium">{solicitacao.responsavelInterno}</span></div>
            <div className="flex justify-between gap-3"><span className="text-muted-foreground">Setor destino</span><span className="font-medium">{solicitacao.setorDestino}</span></div>
            <div className="flex justify-between gap-3"><span className="text-muted-foreground">Planta</span><span className="font-medium">{solicitacao.unidadePlanta}</span></div>
            <div className="flex justify-between gap-3"><span className="text-muted-foreground">Solicitado por</span><span className="font-medium">{solicitacao.solicitadoPor}</span></div>
            <div className="flex justify-between gap-3"><span className="text-muted-foreground">Criado em</span><span className="font-medium">{new Date(solicitacao.criadoEm).toLocaleString("pt-BR")}</span></div>
            <div className="flex justify-between gap-3"><span className="text-muted-foreground">Expira em</span><span className="font-medium">{new Date(solicitacao.expiraEm).toLocaleString("pt-BR")}</span></div>
            {solicitacao.observacaoInterna && (
              <div className="pt-2">
                <p className="text-muted-foreground">Observacao interna</p>
                <p className="font-medium">{solicitacao.observacaoInterna}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dados Preenchidos pelo Visitante</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {!hasVisitorData && (
              <p className="text-muted-foreground">Ainda nao houve preenchimento no formulario externo.</p>
            )}
            {hasVisitorData && (
              <>
                <div className="flex justify-between gap-3"><span className="text-muted-foreground">Nome</span><span className="font-medium">{solicitacao.preenchimento?.nome}</span></div>
                <div className="flex justify-between gap-3"><span className="text-muted-foreground">Documento</span><span className="font-medium">{solicitacao.preenchimento?.documento}</span></div>
                <div className="flex justify-between gap-3"><span className="text-muted-foreground">Empresa</span><span className="font-medium">{solicitacao.preenchimento?.empresa}</span></div>
                <div className="flex justify-between gap-3"><span className="text-muted-foreground">Telefone</span><span className="font-medium">{solicitacao.preenchimento?.telefone}</span></div>
                {solicitacao.preenchimento?.email && (
                  <div className="flex justify-between gap-3"><span className="text-muted-foreground">E-mail</span><span className="font-medium">{solicitacao.preenchimento.email}</span></div>
                )}
                {solicitacao.preenchimento?.placa && (
                  <div className="flex justify-between gap-3"><span className="text-muted-foreground">Placa</span><span className="font-medium">{solicitacao.preenchimento.placa}</span></div>
                )}
                {solicitacao.preenchimento?.obs && (
                  <div className="pt-2">
                    <p className="text-muted-foreground">Observacao do visitante</p>
                    <p className="font-medium">{solicitacao.preenchimento.obs}</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historico da Solicitacao</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {solicitacao.historico.length === 0 && (
            <p className="text-sm text-muted-foreground">Sem eventos registrados.</p>
          )}
          {solicitacao.historico.map((evt) => (
            <div key={evt.id} className="rounded-md border border-border p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">{evt.tipo}</p>
                <p className="text-xs text-muted-foreground">{new Date(evt.dataHora).toLocaleString("pt-BR")}</p>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{evt.descricao}</p>
              <p className="text-xs text-muted-foreground mt-1">Usuario: {evt.usuario}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default SolicitacaoAcessoDetalhePage;
