import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft, ShieldAlert, User, Clock, AlertTriangle, CheckCircle2,
  ExternalLink, MessageSquare, ArrowUpRight, Eye, Edit, Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import RiskScoreCard from "@/components/operacional/RiskScoreCard";
import {
  getExcecaoById, atribuirResponsavel, atualizarStatusExcecao, registrarTratativa,
} from "@/services/torreControle";
import type { ExcecaoTorre, ExcecaoStatus } from "@/types/torreControle";
import {
  EXCECAO_STATUS_LABELS, EXCECAO_STATUS_COLORS, EXCECAO_CATEGORIA_LABELS,
  CRITICIDADE_LABELS, CRITICIDADE_COLORS,
} from "@/types/torreControle";

/* ── Action Modal ─────────────────────────────── */
function ActionModal({
  trigger, title, children, onConfirm, loading,
}: {
  trigger: React.ReactNode; title: string; children: React.ReactNode;
  onConfirm: () => Promise<void>; loading: boolean;
}) {
  const [open, setOpen] = useState(false);
  const handle = async () => { await onConfirm(); setOpen(false); };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        {children}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handle} disabled={loading}>{loading ? "Salvando..." : "Confirmar"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const ExcecaoDetalhePage = () => {
  const { id } = useParams();
  const [data, setData] = useState<ExcecaoTorre | null>(null);
  const [saving, setSaving] = useState(false);

  // form states
  const [resp, setResp] = useState("");
  const [novoStatus, setNovoStatus] = useState<ExcecaoStatus>("EM_ANALISE");
  const [justificativa, setJustificativa] = useState("");
  const [tratativa, setTratativa] = useState("");

  const reload = useCallback(() => {
    if (id) getExcecaoById(id).then(d => setData(d || null));
  }, [id]);

  useEffect(reload, [reload]);

  const wrap = async (fn: () => Promise<ExcecaoTorre>) => {
    setSaving(true);
    try {
      const updated = await fn();
      setData(updated);
      toast.success("Ação realizada com sucesso");
    } catch { toast.error("Erro ao executar ação"); }
    finally { setSaving(false); }
  };

  if (!data) return <div className="p-8 text-center text-muted-foreground">Carregando...</div>;

  const prazoVencido = data.prazo && new Date(data.prazo) < new Date();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/torre-controle"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground">{data.titulo}</h1>
            <Badge className={CRITICIDADE_COLORS[data.criticidade]}>{CRITICIDADE_LABELS[data.criticidade]}</Badge>
            <Badge className={EXCECAO_STATUS_COLORS[data.status]}>{EXCECAO_STATUS_LABELS[data.status]}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{data.descricao}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Executive header cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass-card rounded-lg p-4 text-center">
              <p className="text-xs text-muted-foreground">Categoria</p>
              <p className="text-sm font-bold">{EXCECAO_CATEGORIA_LABELS[data.categoria]}</p>
            </div>
            <div className="glass-card rounded-lg p-4 text-center">
              <p className="text-xs text-muted-foreground">Responsável</p>
              <p className={`text-sm font-bold ${!data.responsavel ? "text-destructive" : ""}`}>
                {data.responsavel || "Sem dono"}
              </p>
            </div>
            <div className="glass-card rounded-lg p-4 text-center">
              <p className="text-xs text-muted-foreground">Prazo</p>
              <p className={`text-sm font-bold ${prazoVencido ? "text-destructive" : ""}`}>
                {data.prazo ? new Date(data.prazo).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—"}
                {prazoVencido && <span className="block text-[10px]">VENCIDO</span>}
              </p>
            </div>
            <div className="glass-card rounded-lg p-4 text-center">
              <p className="text-xs text-muted-foreground">Reincidências</p>
              <p className={`text-sm font-bold ${data.reincidencias > 0 ? "text-destructive" : ""}`}>
                {data.reincidencias}x
              </p>
            </div>
          </div>

          {/* Actions bar */}
          <div className="glass-card rounded-lg p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Ações Operacionais</h3>
            <div className="flex flex-wrap gap-2">
              {/* Atribuir responsável */}
              <ActionModal
                trigger={<Button size="sm" variant="outline" className="gap-1.5"><User className="h-3.5 w-3.5" />Atribuir Responsável</Button>}
                title="Atribuir Responsável"
                onConfirm={() => wrap(() => atribuirResponsavel(data.id, resp))}
                loading={saving}
              >
                <div className="space-y-2 py-2">
                  <Label>Responsável</Label>
                  <Input placeholder="Nome do responsável" value={resp} onChange={e => setResp(e.target.value)} />
                </div>
              </ActionModal>

              {/* Mudar status */}
              <ActionModal
                trigger={<Button size="sm" variant="outline" className="gap-1.5"><Edit className="h-3.5 w-3.5" />Mudar Status</Button>}
                title="Alterar Status"
                onConfirm={() => wrap(() => atualizarStatusExcecao(data.id, novoStatus, justificativa))}
                loading={saving}
              >
                <div className="space-y-3 py-2">
                  <div className="space-y-1.5">
                    <Label>Novo Status</Label>
                    <Select value={novoStatus} onValueChange={v => setNovoStatus(v as ExcecaoStatus)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(Object.keys(EXCECAO_STATUS_LABELS) as ExcecaoStatus[]).map(s => (
                          <SelectItem key={s} value={s}>{EXCECAO_STATUS_LABELS[s]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Justificativa</Label>
                    <Textarea placeholder="Motivo da mudança..." value={justificativa} onChange={e => setJustificativa(e.target.value)} rows={3} />
                  </div>
                </div>
              </ActionModal>

              {/* Registrar tratativa */}
              <ActionModal
                trigger={<Button size="sm" variant="outline" className="gap-1.5"><MessageSquare className="h-3.5 w-3.5" />Registrar Tratativa</Button>}
                title="Registrar Tratativa"
                onConfirm={() => wrap(() => registrarTratativa(data.id, tratativa))}
                loading={saving}
              >
                <div className="space-y-2 py-2">
                  <Label>Tratativa / Ação Realizada</Label>
                  <Textarea placeholder="Descreva a tratativa..." value={tratativa} onChange={e => setTratativa(e.target.value)} rows={4} />
                </div>
              </ActionModal>

              {/* Quick actions */}
              <Button size="sm" variant="outline" className="gap-1.5" disabled={saving}
                onClick={() => wrap(() => atualizarStatusExcecao(data.id, "ESCALADA", "Escalada pelo operador"))}>
                <ArrowUpRight className="h-3.5 w-3.5" />Escalar
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5" disabled={saving}
                onClick={() => wrap(() => atualizarStatusExcecao(data.id, "MONITORADA"))}>
                <Eye className="h-3.5 w-3.5" />Monitorar
              </Button>
              <Button size="sm" className="gap-1.5" disabled={saving}
                onClick={() => wrap(() => atualizarStatusExcecao(data.id, "RESOLVIDA"))}>
                <CheckCircle2 className="h-3.5 w-3.5" />Resolver
              </Button>
            </div>
          </div>

          {/* Tratativa & Ação sugerida */}
          {(data.tratativa || data.acaoSugerida) && (
            <div className="glass-card rounded-lg p-5 space-y-3">
              {data.acaoSugerida && (
                <div>
                  <p className="text-xs font-semibold text-primary mb-1">Ação Sugerida</p>
                  <p className="text-sm text-foreground">{data.acaoSugerida}</p>
                </div>
              )}
              {data.tratativa && (
                <div>
                  <p className="text-xs font-semibold text-foreground mb-1">Última Tratativa</p>
                  <p className="text-sm text-muted-foreground">{data.tratativa}</p>
                </div>
              )}
            </div>
          )}

          {/* Timeline */}
          <div className="glass-card rounded-lg p-5">
            <h3 className="mb-4 text-sm font-semibold text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> Histórico de Tratativas
            </h3>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
              <div className="space-y-4">
                {data.historico.map((ev, idx) => (
                  <div key={ev.id} className="relative flex items-start gap-4 pl-9">
                    <div className={`absolute left-2.5 top-1 h-3 w-3 rounded-full border-2 ${idx === 0 ? "border-primary bg-primary" : "border-success bg-success"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px]">{ev.tipo}</Badge>
                        <span className="text-[10px] text-muted-foreground">{new Date(ev.dataHora).toLocaleString("pt-BR")}</span>
                      </div>
                      <p className="text-xs text-foreground mt-0.5">{ev.descricao}</p>
                      <p className="text-[10px] text-muted-foreground">por {ev.usuario}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Origin link */}
          {data.origemRota && (
            <div className="glass-card rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-2">Origem Relacionada</p>
              <Button variant="outline" size="sm" asChild className="w-full gap-2">
                <Link to={data.origemRota}>
                  <ExternalLink className="h-3.5 w-3.5" />
                  Abrir {data.origem} — {data.origemId}
                </Link>
              </Button>
            </div>
          )}

          {/* Info card */}
          <div className="glass-card rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Informações</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">ID</span><span className="font-mono">{data.id}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Origem</span><span>{data.origem}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Planta</span><span>{data.planta}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Criado em</span><span>{new Date(data.criadoEm).toLocaleString("pt-BR")}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Atualizado</span><span>{new Date(data.atualizadoEm).toLocaleString("pt-BR")}</span></div>
            </div>
          </div>

          {/* Tags */}
          {data.tags.length > 0 && (
            <div className="glass-card rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-2">Tags</p>
              <div className="flex flex-wrap gap-1">
                {data.tags.map(tag => (
                  <span key={tag} className="inline-block rounded bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExcecaoDetalhePage;
