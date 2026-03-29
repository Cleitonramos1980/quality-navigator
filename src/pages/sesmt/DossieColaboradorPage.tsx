import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search, Printer, FileDown, RefreshCw, Share2, AlertTriangle, User, Calendar,
  MapPin, Briefcase, Shield, Activity, Syringe, Pill, HardHat, FileText,
  Clock, Heart, Stethoscope, Eye, ChevronRight, Filter, BadgeAlert,
  GraduationCap, FlaskConical, Flame, CircleAlert, CheckCircle2, XCircle,
  CircleDot, ArrowUpDown, Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import type { Colaborador, DossieColaborador } from "@/data/mockDossieColaborador";
import {
  exportSesmtColaboradorDossie,
  getSesmtColaboradorDossie,
  listSesmtColaboradores,
} from "@/services/sesmt";
import { toast } from "@/hooks/use-toast";

/* ───── helpers ───── */
const statusColor = (s: string) => {
  const m: Record<string, string> = {
    ATIVO: "bg-[hsl(var(--status-done-bg))] text-[hsl(var(--status-done-fg))] border-[hsl(var(--status-done-border))]",
    AFASTADO: "bg-[hsl(var(--status-overdue-bg))] text-[hsl(var(--status-overdue-fg))] border-[hsl(var(--status-overdue-border))]",
    FERIAS: "bg-[hsl(var(--status-progress-bg))] text-[hsl(var(--status-progress-fg))] border-[hsl(var(--status-progress-border))]",
    DESLIGADO: "bg-[hsl(var(--status-open-bg))] text-[hsl(var(--status-open-fg))] border-[hsl(var(--status-open-border))]",
    REALIZADO: "bg-[hsl(var(--status-done-bg))] text-[hsl(var(--status-done-fg))]",
    CONCLUIDO: "bg-[hsl(var(--status-done-bg))] text-[hsl(var(--status-done-fg))]",
    VIGENTE: "bg-[hsl(var(--status-done-bg))] text-[hsl(var(--status-done-fg))]",
    PENDENTE: "bg-[hsl(var(--crit-medium-bg))] text-[hsl(var(--crit-medium-fg))]",
    VENCIDO: "bg-[hsl(var(--status-overdue-bg))] text-[hsl(var(--status-overdue-fg))]",
    EM_ANDAMENTO: "bg-[hsl(var(--status-progress-bg))] text-[hsl(var(--status-progress-fg))]",
    APLICADA: "bg-[hsl(var(--status-done-bg))] text-[hsl(var(--status-done-fg))]",
    ATRASADA: "bg-[hsl(var(--status-overdue-bg))] text-[hsl(var(--status-overdue-fg))]",
    ACEITO: "bg-[hsl(var(--status-done-bg))] text-[hsl(var(--status-done-fg))]",
    CONTESTADO: "bg-[hsl(var(--status-overdue-bg))] text-[hsl(var(--status-overdue-fg))]",
    ENCERRADO: "bg-[hsl(var(--status-open-bg))] text-[hsl(var(--status-open-fg))]",
    INVESTIGADO: "bg-[hsl(var(--status-done-bg))] text-[hsl(var(--status-done-fg))]",
    EM_INVESTIGACAO: "bg-[hsl(var(--status-progress-bg))] text-[hsl(var(--status-progress-fg))]",
    APTO: "bg-[hsl(var(--status-done-bg))] text-[hsl(var(--status-done-fg))]",
    INAPTO: "bg-[hsl(var(--status-overdue-bg))] text-[hsl(var(--status-overdue-fg))]",
    APTO_COM_RESTRICAO: "bg-[hsl(var(--crit-medium-bg))] text-[hsl(var(--crit-medium-fg))]",
    PROXIMO_VENCIMENTO: "bg-[hsl(var(--crit-medium-bg))] text-[hsl(var(--crit-medium-fg))]",
    RETORNO_PENDENTE: "bg-[hsl(var(--crit-medium-bg))] text-[hsl(var(--crit-medium-fg))]",
    PRORROGADO: "bg-[hsl(var(--crit-high-bg))] text-[hsl(var(--crit-high-fg))]",
  };
  return m[s] ?? "bg-muted text-muted-foreground";
};

const fmt = (d: string) => {
  if (!d || d === "—") return "—";
  try { return new Date(d).toLocaleDateString("pt-BR"); } catch { return d; }
};

const scoreColor = (v: number) =>
  v >= 80 ? "text-[hsl(var(--status-done-fg))]" : v >= 60 ? "text-[hsl(var(--crit-medium-fg))]" : "text-[hsl(var(--status-overdue-fg))]";

const timelineIconColor = (cor?: string) => {
  const m: Record<string, string> = {
    success: "bg-[hsl(var(--status-done-bg))] text-[hsl(var(--status-done-fg))] border-[hsl(var(--status-done-border))]",
    warning: "bg-[hsl(var(--crit-medium-bg))] text-[hsl(var(--crit-medium-fg))] border-[hsl(var(--crit-medium-border))]",
    destructive: "bg-[hsl(var(--status-overdue-bg))] text-[hsl(var(--status-overdue-fg))] border-[hsl(var(--status-overdue-border))]",
    info: "bg-[hsl(var(--status-progress-bg))] text-[hsl(var(--status-progress-fg))] border-[hsl(var(--status-progress-border))]",
  };
  return m[cor ?? ""] ?? "bg-muted text-muted-foreground border-border";
};

const timelineIcon = (tipo: string) => {
  const m: Record<string, typeof Activity> = {
    EXAME: FlaskConical, ASO: Stethoscope, TREINAMENTO: GraduationCap,
    ATENDIMENTO: Heart, VACINA: Syringe, MEDICACAO: Pill,
    ACIDENTE: Flame, AFASTAMENTO: CircleAlert, ATESTADO: FileText,
    EPI: HardHat, ADVERTENCIA: BadgeAlert, LAUDO: FileText,
    ADMISSAO: User, COMUNICADO: Share2,
  };
  return m[tipo] ?? Activity;
};

/* ───── Sub-components ───── */
const KPI = ({ label, value, tone }: { label: string; value: number; tone?: string }) => (
  <div className="rounded-lg border border-border bg-card px-3 py-2">
    <p className="text-[10px] text-muted-foreground leading-tight truncate">{label}</p>
    <p className={`text-lg font-bold leading-tight ${tone || "text-foreground"}`}>{value}</p>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => (
  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${statusColor(status)}`}>
    {status.replace(/_/g, " ")}
  </Badge>
);

/* ───── Collaborator search panel ───── */
const ColaboradorSearchPanel = ({ colaboradores, onSelect }: { colaboradores: Colaborador[]; onSelect: (c: Colaborador) => void }) => {
  const [search, setSearch] = useState("");
  const [unidade, setUnidade] = useState("all");

  const filtered = useMemo(() => {
    let list = colaboradores;
    if (unidade !== "all") list = list.filter(c => c.unidade === unidade);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.nome.toLowerCase().includes(q) ||
        c.matricula.toLowerCase().includes(q) ||
        c.cpf.includes(q)
      );
    }
    return list;
  }, [colaboradores, search, unidade]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome, matrícula ou CPF..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <Select value={unidade} onValueChange={setUnidade}>
          <SelectTrigger className="w-[140px] h-9"><SelectValue placeholder="Unidade" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="MAO">MAO</SelectItem>
            <SelectItem value="BEL">BEL</SelectItem>
            <SelectItem value="AGR">AGR</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg divide-y bg-card">
        {filtered.length === 0 && <p className="p-4 text-sm text-muted-foreground text-center">Nenhum colaborador encontrado</p>}
        {filtered.map(c => (
          <button key={c.id} onClick={() => onSelect(c)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{c.nome}</p>
              <p className="text-xs text-muted-foreground">{c.matricula} · {c.cargo} · {c.unidade}</p>
            </div>
            <StatusBadge status={c.status} />
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
};

/* ───── Collaborator Header Card ───── */
const ColaboradorHeader = ({ c, onClear }: { c: Colaborador; onClear: () => void }) => (
  <Card className="border-l-4 border-l-primary">
    <CardContent className="p-4">
      <div className="flex flex-wrap gap-4 items-start">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <User className="h-8 w-8 text-primary" />
        </div>
        <div className="flex-1 min-w-[200px] space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-bold">{c.nome}</h2>
            <StatusBadge status={c.status} />
            {c.alertas.length > 0 && (
              <Badge variant="outline" className="bg-[hsl(var(--status-overdue-bg))] text-[hsl(var(--status-overdue-fg))] border-[hsl(var(--status-overdue-border))] text-[10px]">
                <AlertTriangle className="h-3 w-3 mr-1" />{c.alertas.length} alerta(s)
              </Badge>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{c.cargo}</span>
            <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{c.unidade} · {c.setor}</span>
            <span className="flex items-center gap-1"><User className="h-3 w-3" />{c.matricula}</span>
            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Adm: {fmt(c.dataAdmissao)}</span>
            <span className="flex items-center gap-1"><Shield className="h-3 w-3" />{c.gestor}</span>
          </div>
          {c.grupoRisco && <p className="text-[11px] text-muted-foreground"><MapPin className="inline h-3 w-3 mr-1" />{c.grupoRisco}</p>}
        </div>
        <div className="flex flex-col items-center gap-1 shrink-0">
          <p className="text-[10px] text-muted-foreground">Score Atenção</p>
          <span className={`text-2xl font-black ${scoreColor(c.scoreAtencao)}`}>{c.scoreAtencao}</span>
          <Button variant="ghost" size="sm" className="text-xs mt-1" onClick={onClear}>← Trocar</Button>
        </div>
      </div>
      {c.alertas.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {c.alertas.map((a, i) => (
            <Badge key={i} variant="outline" className="bg-[hsl(var(--status-overdue-bg))] text-[hsl(var(--status-overdue-fg))] border-[hsl(var(--status-overdue-border))] text-[10px] font-normal">
              <AlertTriangle className="h-3 w-3 mr-1" />{a}
            </Badge>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);

/* ───── Tab: Visao Geral ───── */
const TabVisaoGeral = ({ d }: { d: DossieColaborador }) => {
  const pendencias = [
    ...d.exames.filter(e => e.status === "VENCIDO").map(e => ({ tipo: "Exame vencido", desc: e.tipo })),
    ...d.exames.filter(e => e.status === "PENDENTE").map(e => ({ tipo: "Exame pendente", desc: e.tipo })),
    ...d.asos.filter(a => a.status === "VENCIDO").map(a => ({ tipo: "ASO vencido", desc: a.tipo })),
    ...d.treinamentos.filter(t => t.status === "VENCIDO").map(t => ({ tipo: "Treinamento vencido", desc: t.nome })),
    ...d.treinamentos.filter(t => t.status === "PENDENTE").map(t => ({ tipo: "Treinamento pendente", desc: t.nome })),
    ...d.vacinas.filter(v => v.status === "PENDENTE").map(v => ({ tipo: "Vacina pendente", desc: `${v.vacina} – ${v.dose}` })),
    ...d.afastamentos.filter(a => a.status === "ATIVO").map(a => ({ tipo: "Afastamento ativo", desc: a.motivo })),
  ];

  return (
    <div className="space-y-4">
      {pendencias.length > 0 && (
        <Card>
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-[hsl(var(--status-overdue-fg))]" />Alertas e Pendências ({pendencias.length})</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="grid gap-1.5 sm:grid-cols-2">
              {pendencias.map((p, i) => (
                <div key={i} className="flex items-center gap-2 rounded border border-[hsl(var(--status-overdue-border))] bg-[hsl(var(--status-overdue-bg))] px-3 py-1.5">
                  <CircleAlert className="h-3.5 w-3.5 text-[hsl(var(--status-overdue-fg))] shrink-0" />
                  <span className="text-xs"><strong className="text-[hsl(var(--status-overdue-fg))]">{p.tipo}</strong> — {p.desc}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2 pt-3 px-4"><CardTitle className="text-sm">Últimos Eventos</CardTitle></CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="space-y-2">
            {d.timeline.slice(0, 6).map(ev => {
              const Icon = timelineIcon(ev.tipo);
              return (
                <div key={ev.id} className="flex items-start gap-3">
                  <div className={`rounded-full p-1.5 border ${timelineIconColor(ev.cor)} shrink-0 mt-0.5`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">{ev.titulo}</p>
                    <p className="text-[11px] text-muted-foreground">{ev.descricao}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">{fmt(ev.data)}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid sm:grid-cols-2 gap-3">
        <Card>
          <CardHeader className="pb-2 pt-3 px-4"><CardTitle className="text-sm">Situação Ocupacional</CardTitle></CardHeader>
          <CardContent className="px-4 pb-3 text-xs space-y-1">
            <p><strong>Situação:</strong> {d.colaborador.situacaoOcupacional}</p>
            <p><strong>Grupo de risco:</strong> {d.colaborador.grupoRisco || "—"}</p>
            <p><strong>Função:</strong> {d.colaborador.funcao}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 pt-3 px-4"><CardTitle className="text-sm">Resumo Rápido</CardTitle></CardHeader>
          <CardContent className="px-4 pb-3 text-xs space-y-1">
            <p>Exames realizados: <strong>{d.exames.filter(e => e.status === "REALIZADO").length}</strong></p>
            <p>Treinamentos concluídos: <strong>{d.treinamentos.filter(t => t.status === "CONCLUIDO").length}</strong></p>
            <p>EPIs entregues: <strong>{d.epis.filter(e => e.motivo === "ENTREGA" || e.motivo === "TROCA").length}</strong></p>
            <p>Acidentes/incidentes: <strong>{d.acidentes.length}</strong></p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

/* ───── Generic table tab ───── */
const SimpleTable = ({ headers, rows }: { headers: string[]; rows: (string | JSX.Element)[][] }) => (
  <div className="border rounded-lg overflow-auto">
    <Table>
      <TableHeader>
        <TableRow>{headers.map(h => <TableHead key={h} className="text-[11px] h-8">{h}</TableHead>)}</TableRow>
      </TableHeader>
      <TableBody>
        {rows.length === 0 && <TableRow><TableCell colSpan={headers.length} className="text-center text-xs text-muted-foreground py-6">Nenhum registro</TableCell></TableRow>}
        {rows.map((row, i) => (
          <TableRow key={i}>{row.map((cell, j) => <TableCell key={j} className="text-xs py-1.5">{cell}</TableCell>)}</TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

/* ───── Tab: Exames e ASOs ───── */
const TabExames = ({ d }: { d: DossieColaborador }) => (
  <div className="space-y-4">
    <h3 className="text-sm font-semibold">Exames</h3>
    <SimpleTable
      headers={["Tipo", "Data", "Resultado", "Laboratório", "Validade", "Status"]}
      rows={d.exames.map(e => [e.tipo, fmt(e.data), e.resultado, e.laboratorio || "—", fmt(e.validade || ""), <StatusBadge key={e.id} status={e.status} />])}
    />
    <Separator />
    <h3 className="text-sm font-semibold">ASOs</h3>
    <SimpleTable
      headers={["Tipo", "Data", "Resultado", "Médico", "Validade", "Status"]}
      rows={d.asos.map(a => [a.tipo, fmt(a.data), <StatusBadge key={a.id+"r"} status={a.resultado} />, a.medico, fmt(a.validade), <StatusBadge key={a.id} status={a.status} />])}
    />
  </div>
);

/* ───── Tab: Treinamentos ───── */
const TabTreinamentos = ({ d }: { d: DossieColaborador }) => (
  <SimpleTable
    headers={["Treinamento", "Tipo", "Data", "Carga (h)", "Instrutor", "Validade", "Cert.", "Status"]}
    rows={d.treinamentos.map(t => [
      t.nome, t.tipo, fmt(t.data), String(t.cargaHoraria), t.instrutor || "—", fmt(t.validade || ""),
      t.certificado ? <CheckCircle2 key={t.id+"c"} className="h-3.5 w-3.5 text-[hsl(var(--status-done-fg))]" /> : <XCircle key={t.id+"c"} className="h-3.5 w-3.5 text-muted-foreground" />,
      <StatusBadge key={t.id} status={t.status} />,
    ])}
  />
);

/* ───── Tab: Saúde ───── */
const TabSaude = ({ d }: { d: DossieColaborador }) => (
  <div className="space-y-4">
    <h3 className="text-sm font-semibold">Atendimentos Ambulatoriais</h3>
    <SimpleTable
      headers={["Data", "Tipo", "Descrição", "Profissional", "Restrição", "Status"]}
      rows={d.atendimentos.map(a => [fmt(a.data), a.tipo, a.descricao, a.profissional, a.restricao || "—", <StatusBadge key={a.id} status={a.status} />])}
    />
    <Separator />
    <h3 className="text-sm font-semibold">Atestados</h3>
    <SimpleTable
      headers={["Data", "Dias", "CID", "Médico", "Status"]}
      rows={d.atestados.map(a => [fmt(a.data), String(a.dias), a.cid || "—", a.medico, <StatusBadge key={a.id} status={a.status} />])}
    />
  </div>
);

/* ───── Tab: Vacinas e Medicações ───── */
const TabVacinas = ({ d }: { d: DossieColaborador }) => (
  <div className="space-y-4">
    <h3 className="text-sm font-semibold">Vacinas</h3>
    <SimpleTable
      headers={["Vacina", "Dose", "Data", "Campanha", "Próxima Dose", "Status"]}
      rows={d.vacinas.map(v => [v.vacina, v.dose, fmt(v.data), v.campanha || "—", fmt(v.proximaDose || ""), <StatusBadge key={v.id} status={v.status} />])}
    />
    <Separator />
    <h3 className="text-sm font-semibold">Medicações</h3>
    <SimpleTable
      headers={["Medicamento", "Data", "Tipo", "Qtd", "Responsável"]}
      rows={d.medicacoes.map(m => [m.medicamento, fmt(m.data), m.tipo, String(m.quantidade), m.responsavel])}
    />
  </div>
);

/* ───── Tab: Acidentes ───── */
const TabAcidentes = ({ d }: { d: DossieColaborador }) => (
  <div className="space-y-4">
    <h3 className="text-sm font-semibold">Acidentes e Incidentes</h3>
    <SimpleTable
      headers={["Tipo", "Data", "Descrição", "Causa", "Lesão", "Dias Afast.", "Status"]}
      rows={d.acidentes.map(a => [a.tipo, fmt(a.data), a.descricao, a.causa || "—", a.naturezaLesao || "—", String(a.diasAfastamento), <StatusBadge key={a.id} status={a.status} />])}
    />
    <Separator />
    <h3 className="text-sm font-semibold">Afastamentos</h3>
    <SimpleTable
      headers={["Tipo", "Início", "Fim", "Motivo", "Dias", "Status"]}
      rows={d.afastamentos.map(a => [a.tipo, fmt(a.dataInicio), fmt(a.dataFim || ""), a.motivo, String(a.diasAfastado), <StatusBadge key={a.id} status={a.status} />])}
    />
  </div>
);

/* ───── Tab: Laudos ───── */
const TabLaudos = ({ d }: { d: DossieColaborador }) => (
  <SimpleTable
    headers={["Tipo", "Descrição", "Data", "Vigência", "Agente/Risco", "GHE", "Recomendação"]}
    rows={d.laudos.map(l => [l.tipo, l.descricao, fmt(l.data), fmt(l.vigencia || ""), l.agenteRisco || "—", l.grupoHomogeneo || "—", l.recomendacao || "—"])}
  />
);

/* ───── Tab: EPI ───── */
const TabEPI = ({ d }: { d: DossieColaborador }) => (
  <div className="space-y-4">
    <h3 className="text-sm font-semibold">EPIs Entregues</h3>
    <SimpleTable
      headers={["Descrição", "CA", "Data Entrega", "Devolução", "Motivo", "Assinatura"]}
      rows={d.epis.map(e => [
        e.descricao, e.ca, fmt(e.dataEntrega), fmt(e.dataDevolucao || ""), e.motivo,
        e.assinatura ? <CheckCircle2 key={e.id} className="h-3.5 w-3.5 text-[hsl(var(--status-done-fg))]" /> : <XCircle key={e.id} className="h-3.5 w-3.5 text-muted-foreground" />,
      ])}
    />
    <Separator />
    <h3 className="text-sm font-semibold">Advertências</h3>
    <SimpleTable
      headers={["Data", "Tipo", "Descrição", "Responsável"]}
      rows={d.advertencias.map(a => [fmt(a.data), a.tipo, a.descricao, a.responsavel])}
    />
  </div>
);

/* ───── Tab: Documentos ───── */
const TabDocumentos = ({ d }: { d: DossieColaborador }) => (
  <SimpleTable
    headers={["Nome", "Tipo", "Data"]}
    rows={d.documentos.map(doc => [doc.nome, doc.tipo, fmt(doc.data)])}
  />
);

/* ───── Tab: Timeline ───── */
const TabTimeline = ({ d }: { d: DossieColaborador }) => (
  <div className="relative">
    <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border" />
    <div className="space-y-0">
      {d.timeline.map(ev => {
        const Icon = timelineIcon(ev.tipo);
        return (
          <div key={ev.id} className="relative flex items-start gap-4 py-2.5 pl-1">
            <div className={`relative z-10 rounded-full p-1.5 border ${timelineIconColor(ev.cor)} shrink-0`}>
              <Icon className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold">{ev.titulo}</span>
                <Badge variant="outline" className="text-[9px] px-1 py-0">{ev.tipo}</Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">{ev.descricao}</p>
            </div>
            <span className="text-[10px] text-muted-foreground shrink-0 pt-0.5">{fmt(ev.data)}</span>
          </div>
        );
      })}
    </div>
  </div>
);

/* ═══════════════════ MAIN PAGE ═══════════════════ */
const DossieColaboradorPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedId, setSelectedId] = useState<string | null>(searchParams.get("id") || null);
  const [activeTab, setActiveTab] = useState("geral");
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [dossie, setDossie] = useState<DossieColaborador | null>(null);
  const [loadingDossie, setLoadingDossie] = useState(false);

  useEffect(() => {
    let active = true;
    const loadColaboradores = async () => {
      const items = await listSesmtColaboradores();
      if (!active) return;
      setColaboradores(items);
    };
    void loadColaboradores();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const loadDossie = async () => {
      if (!selectedId) {
        setDossie(null);
        return;
      }
      setLoadingDossie(true);
      const result = await getSesmtColaboradorDossie(selectedId);
      if (!active) return;
      setDossie(result);
      setLoadingDossie(false);
    };
    void loadDossie();
    return () => {
      active = false;
    };
  }, [selectedId]);

  const handleSelect = (c: Colaborador) => {
    setSelectedId(c.id);
    setSearchParams({ id: c.id });
  };

  const handleClear = () => {
    setSelectedId(null);
    setSearchParams({});
    setActiveTab("geral");
  };

  const handleExportPdf = async () => {
    if (!selectedId) return;
    try {
      await exportSesmtColaboradorDossie(selectedId, { formato: "PDF" });
      toast({
        title: "Exportação solicitada",
        description: "O relatório do dossiê entrou na fila de geração.",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao exportar dossiê.";
      toast({
        title: "Erro na exportação",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleRefresh = async () => {
    if (!selectedId) return;
    setLoadingDossie(true);
    const result = await getSesmtColaboradorDossie(selectedId);
    setDossie(result);
    setLoadingDossie(false);
  };

  return (
    <div className="space-y-3 p-2 sm:p-4 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-bold">Dossiê Completo do Colaborador</h1>
          <p className="text-xs text-muted-foreground">Visão consolidada do histórico ocupacional, operacional e documental</p>
        </div>
        {dossie && (
          <div className="flex gap-1.5 flex-wrap">
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1"><Printer className="h-3.5 w-3.5" />Imprimir</Button>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={() => void handleExportPdf()}><FileDown className="h-3.5 w-3.5" />PDF</Button>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1"><Share2 className="h-3.5 w-3.5" />Compartilhar</Button>
            <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" onClick={() => void handleRefresh()}>
              <RefreshCw className={`h-3.5 w-3.5 ${loadingDossie ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
          </div>
        )}
      </div>

      <Separator />

      {!dossie ? (
        loadingDossie ? (
          <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">Carregando dossiê...</div>
        ) : (
          <ColaboradorSearchPanel colaboradores={colaboradores} onSelect={handleSelect} />
        )
      ) : (
        <>
          <ColaboradorHeader c={dossie.colaborador} onClear={handleClear} />

          {/* KPIs */}
          <div className="grid gap-2 grid-cols-2 sm:grid-cols-5 lg:grid-cols-10">
            <KPI label="Exames" value={dossie.exames.length} />
            <KPI label="Exames vencidos" value={dossie.exames.filter(e => e.status === "VENCIDO").length} tone="text-[hsl(var(--status-overdue-fg))]" />
            <KPI label="Treinamentos" value={dossie.treinamentos.length} />
            <KPI label="Trein. vencidos" value={dossie.treinamentos.filter(t => t.status === "VENCIDO").length} tone="text-[hsl(var(--status-overdue-fg))]" />
            <KPI label="Acidentes" value={dossie.acidentes.length} />
            <KPI label="Afastamentos" value={dossie.afastamentos.length} />
            <KPI label="Atestados" value={dossie.atestados.length} />
            <KPI label="Vacinas" value={dossie.vacinas.length} />
            <KPI label="Medicações" value={dossie.medicacoes.length} />
            <KPI label="Pendências" value={[
              ...dossie.exames.filter(e => e.status === "VENCIDO" || e.status === "PENDENTE"),
              ...dossie.treinamentos.filter(t => t.status === "VENCIDO" || t.status === "PENDENTE"),
              ...dossie.vacinas.filter(v => v.status === "PENDENTE"),
            ].length} tone="text-[hsl(var(--crit-high-fg))]" />
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-1">
            <TabsList className="flex flex-wrap h-auto gap-0.5 bg-muted/50 p-1">
              <TabsTrigger value="geral" className="text-xs h-7 px-2.5 data-[state=active]:bg-background">Visão Geral</TabsTrigger>
              <TabsTrigger value="exames" className="text-xs h-7 px-2.5 data-[state=active]:bg-background">Exames / ASOs</TabsTrigger>
              <TabsTrigger value="treinamentos" className="text-xs h-7 px-2.5 data-[state=active]:bg-background">Treinamentos</TabsTrigger>
              <TabsTrigger value="saude" className="text-xs h-7 px-2.5 data-[state=active]:bg-background">Saúde</TabsTrigger>
              <TabsTrigger value="vacinas" className="text-xs h-7 px-2.5 data-[state=active]:bg-background">Vacinas / Med.</TabsTrigger>
              <TabsTrigger value="acidentes" className="text-xs h-7 px-2.5 data-[state=active]:bg-background">Acidentes</TabsTrigger>
              <TabsTrigger value="laudos" className="text-xs h-7 px-2.5 data-[state=active]:bg-background">Laudos</TabsTrigger>
              <TabsTrigger value="epi" className="text-xs h-7 px-2.5 data-[state=active]:bg-background">EPI / Adv.</TabsTrigger>
              <TabsTrigger value="documentos" className="text-xs h-7 px-2.5 data-[state=active]:bg-background">Documentos</TabsTrigger>
              <TabsTrigger value="timeline" className="text-xs h-7 px-2.5 data-[state=active]:bg-background">Timeline</TabsTrigger>
            </TabsList>

            <TabsContent value="geral" className="mt-3"><TabVisaoGeral d={dossie} /></TabsContent>
            <TabsContent value="exames" className="mt-3"><TabExames d={dossie} /></TabsContent>
            <TabsContent value="treinamentos" className="mt-3"><TabTreinamentos d={dossie} /></TabsContent>
            <TabsContent value="saude" className="mt-3"><TabSaude d={dossie} /></TabsContent>
            <TabsContent value="vacinas" className="mt-3"><TabVacinas d={dossie} /></TabsContent>
            <TabsContent value="acidentes" className="mt-3"><TabAcidentes d={dossie} /></TabsContent>
            <TabsContent value="laudos" className="mt-3"><TabLaudos d={dossie} /></TabsContent>
            <TabsContent value="epi" className="mt-3"><TabEPI d={dossie} /></TabsContent>
            <TabsContent value="documentos" className="mt-3"><TabDocumentos d={dossie} /></TabsContent>
            <TabsContent value="timeline" className="mt-3"><TabTimeline d={dossie} /></TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default DossieColaboradorPage;
