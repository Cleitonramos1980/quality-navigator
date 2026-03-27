import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ClipboardCopy, ExternalLink, Link2, Loader2, Send, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatusSemaphore from "@/components/operacional/StatusSemaphore";
import { getCurrentUserName } from "@/lib/rbac";
import { toast } from "@/hooks/use-toast";
import { criarSolicitacaoAcesso, marcarSolicitacaoAcessoComoEnviada } from "@/services/operacional";
import type { CriarSolicitacaoAcessoResponse } from "@/services/operacional";
import type { TipoAcesso } from "@/types/operacional";

const TIPO_ACESSO_OPTIONS: Array<{ value: TipoAcesso; label: string }> = [
  { value: "VISITANTE", label: "Visitante" },
  { value: "MOTORISTA", label: "Motorista" },
  { value: "PRESTADOR", label: "Prestador" },
  { value: "FUNCIONARIO", label: "Funcionario" },
  { value: "ENTREGA", label: "Entrega" },
];

const VALIDADE_OPTIONS = [
  { value: "4", label: "4 horas" },
  { value: "8", label: "8 horas" },
  { value: "24", label: "24 horas" },
  { value: "48", label: "48 horas" },
  { value: "72", label: "72 horas" },
];

function nowDateParts(): { date: string; time: string } {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  return {
    date: `${yyyy}-${mm}-${dd}`,
    time: `${hh}:${min}`,
  };
}

const NovoAcessoPage = () => {
  const navigate = useNavigate();
  const initialDateTime = nowDateParts();
  const [form, setForm] = useState({
    tipoAcesso: "VISITANTE" as TipoAcesso,
    responsavelInterno: "",
    setorDestino: "",
    unidadePlanta: "MAO",
    validadeHoras: "24",
    observacaoInterna: "",
    solicitadoPor: getCurrentUserName(),
    dataPrevista: initialDateTime.date,
    horaPrevista: initialDateTime.time,
  });
  const [result, setResult] = useState<CriarSolicitacaoAcessoResponse | null>(null);
  const [saving, setSaving] = useState(false);
  const [markingSent, setMarkingSent] = useState(false);

  const horarioPrevistoIso = useMemo(() => {
    if (!form.dataPrevista) return undefined;
    const merged = `${form.dataPrevista}T${form.horaPrevista || "00:00"}:00`;
    const dt = new Date(merged);
    if (Number.isNaN(dt.getTime())) return undefined;
    return dt.toISOString();
  }, [form.dataPrevista, form.horaPrevista]);

  const update = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const ensureRequiredFields = (): boolean => {
    if (!form.tipoAcesso || !form.responsavelInterno.trim() || !form.setorDestino.trim() || !form.unidadePlanta.trim() || !form.solicitadoPor.trim()) {
      toast({
        title: "Campos obrigatorios",
        description: "Preencha tipo de acesso, responsavel interno, setor, planta e solicitante.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleCreate = async () => {
    if (!ensureRequiredFields()) return;

    setSaving(true);
    try {
      const created = await criarSolicitacaoAcesso({
        tipoAcesso: form.tipoAcesso,
        responsavelInterno: form.responsavelInterno.trim(),
        setorDestino: form.setorDestino.trim(),
        unidadePlanta: form.unidadePlanta.trim(),
        validadeHoras: Number(form.validadeHoras),
        observacaoInterna: form.observacaoInterna.trim(),
        solicitadoPor: form.solicitadoPor.trim(),
        horarioPrevisto: horarioPrevistoIso,
      });
      setResult(created);
      toast({
        title: "Link gerado",
        description: `Solicitacao ${created.solicitacao.codigo} criada com sucesso.`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao gerar link",
        description: error?.message || "Nao foi possivel criar a solicitacao de acesso.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const markAsSent = async () => {
    if (!result || result.solicitacao.status !== "LINK_GERADO") return;
    setMarkingSent(true);
    try {
      const updated = await marcarSolicitacaoAcessoComoEnviada(result.solicitacao.id);
      setResult((prev) => (prev ? { ...prev, solicitacao: updated } : prev));
    } catch {
      // Non-blocking action. The primary flow remains available.
    } finally {
      setMarkingSent(false);
    }
  };

  const copyLink = async () => {
    if (!result?.solicitacao.linkPreenchimento) return;
    try {
      await navigator.clipboard.writeText(result.solicitacao.linkPreenchimento);
      await markAsSent();
      toast({ title: "Link copiado", description: "O link foi copiado para a area de transferencia." });
    } catch {
      toast({ title: "Falha ao copiar", description: "Nao foi possivel copiar o link automaticamente.", variant: "destructive" });
    }
  };

  const openLink = async () => {
    if (!result?.solicitacao.linkPreenchimento) return;
    window.open(result.solicitacao.linkPreenchimento, "_blank", "noopener,noreferrer");
    await markAsSent();
  };

  const shareLink = async () => {
    if (!result?.solicitacao.linkPreenchimento) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Formulario de acesso",
          text: "Preencha os dados de acesso neste link seguro.",
          url: result.solicitacao.linkPreenchimento,
        });
        await markAsSent();
        toast({ title: "Link compartilhado", description: "Compartilhamento enviado com sucesso." });
        return;
      }
      await copyLink();
    } catch {
      toast({ title: "Compartilhamento cancelado", description: "O link segue disponivel para copia manual." });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/portaria")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Novo Acesso</h1>
          <p className="text-sm text-muted-foreground">
            Fluxo interno para gerar um link unico de preenchimento. O formulario final sera aberto apenas pelo link.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Geracao de Link de Preenchimento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de acesso</Label>
              <Select value={form.tipoAcesso} onValueChange={(v) => update("tipoAcesso", v)}>
                <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                <SelectContent>
                  {TIPO_ACESSO_OPTIONS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Responsavel interno</Label>
              <Input value={form.responsavelInterno} onChange={(e) => update("responsavelInterno", e.target.value)} placeholder="Quem responde por esta liberacao" />
            </div>
            <div className="space-y-2">
              <Label>Setor de destino</Label>
              <Input value={form.setorDestino} onChange={(e) => update("setorDestino", e.target.value)} placeholder="Ex.: Doca 03, Diretoria, Qualidade" />
            </div>
            <div className="space-y-2">
              <Label>Unidade / Planta</Label>
              <Input value={form.unidadePlanta} onChange={(e) => update("unidadePlanta", e.target.value)} placeholder="Ex.: MAO" />
            </div>
            <div className="space-y-2">
              <Label>Validade do link</Label>
              <Select value={form.validadeHoras} onValueChange={(v) => update("validadeHoras", v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {VALIDADE_OPTIONS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Solicitado por</Label>
              <Input value={form.solicitadoPor} onChange={(e) => update("solicitadoPor", e.target.value)} placeholder="Usuario solicitante" />
            </div>
            <div className="space-y-2">
              <Label>Data prevista</Label>
              <Input type="date" value={form.dataPrevista} onChange={(e) => update("dataPrevista", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Hora prevista</Label>
              <Input type="time" value={form.horaPrevista} onChange={(e) => update("horaPrevista", e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Observacao interna</Label>
            <Textarea
              rows={3}
              value={form.observacaoInterna}
              onChange={(e) => update("observacaoInterna", e.target.value)}
              placeholder="Contexto interno para validacao da portaria."
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => navigate("/portaria")}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
              Gerar Link
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-3">
              <span>Solicitacao Criada: {result.solicitacao.codigo}</span>
              <StatusSemaphore status={result.solicitacao.status} />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Link unico de preenchimento</Label>
              <div className="flex gap-2">
                <Input readOnly value={result.solicitacao.linkPreenchimento} className="font-mono text-xs" />
                <Button type="button" variant="outline" size="icon" onClick={copyLink} disabled={markingSent}>
                  <ClipboardCopy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="rounded-md border border-border p-3">
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="font-medium">{result.solicitacao.status}</p>
              </div>
              <div className="rounded-md border border-border p-3">
                <p className="text-xs text-muted-foreground">Expira em</p>
                <p className="font-medium">{new Date(result.solicitacao.expiraEm).toLocaleString("pt-BR")}</p>
              </div>
              <div className="rounded-md border border-border p-3">
                <p className="text-xs text-muted-foreground">Codigo de acesso vinculado</p>
                <p className="font-medium">{result.acesso.id}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={copyLink} className="gap-2" disabled={markingSent}>
                {markingSent ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardCopy className="h-4 w-4" />}
                Copiar Link
              </Button>
              <Button type="button" variant="outline" onClick={openLink} className="gap-2" disabled={markingSent}>
                <ExternalLink className="h-4 w-4" />
                Abrir Link
              </Button>
              <Button type="button" variant="outline" onClick={shareLink} className="gap-2" disabled={markingSent}>
                <Share2 className="h-4 w-4" />
                Compartilhar
              </Button>
              <Button type="button" onClick={() => navigate(`/portaria/solicitacoes/${result.solicitacao.id}`)} className="gap-2">
                <Send className="h-4 w-4" />
                Ver Solicitacao
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NovoAcessoPage;
