import {
  CheckCircle2, Copy, RefreshCw, Save, UploadCloud, X,
} from "lucide-react";
import FormField from "@/components/forms/FormField";
import AttachmentUploader from "@/components/upload/AttachmentUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SesmtRecord, SesmtEvidence, SesmtHistoryEntry } from "@/types/sesmt";

const CRITICALITY_OPTIONS = ["BAIXA", "MEDIA", "ALTA", "CRITICA"] as const;
const STATUS_OPTIONS = ["ABERTO", "EM_ANDAMENTO", "CONCLUIDO", "ATRASADO"] as const;
const UNIT_OPTIONS = ["MAO", "BEL", "AGR"] as const;

interface FormValues {
  titulo: string; descricao: string; unidade: string; status: string;
  responsavel: string; criticidade: string; nr: string; setor: string;
  funcao: string; vencimentoAt: string; investimento: string; custo: string;
  riscoInerente: string; riscoResidual: string;
}

interface FieldSchema {
  key: string; label: string; type: string; required?: boolean;
  placeholder?: string; options?: { value: string; label: string }[];
}

interface SesmtComment {
  id: string; texto: string; usuario: string; data: string; parentId?: string;
}

interface SesmtFormPanelProps {
  selected: SesmtRecord | null;
  form: FormValues;
  specificForm: Record<string, string>;
  moduleSchema: FieldSchema[];
  panelTab: string;
  evidenceText: string;
  uploadFiles: File[];
  commentDraft: string;
  replyToCommentId: string | null;
  comments: SesmtComment[];
  evidencias: SesmtEvidence[];
  historico: SesmtHistoryEntry[];
  onClose: () => void;
  onSetField: (field: keyof FormValues, value: string) => void;
  onSetSpecificField: (field: string, value: string) => void;
  onSetPanelTab: (tab: string) => void;
  onSetEvidenceText: (text: string) => void;
  onSetUploadFiles: (files: File[]) => void;
  onSetCommentDraft: (text: string) => void;
  onSetReplyToCommentId: (id: string | null) => void;
  onCreate: () => void;
  onUpdate: () => void;
  onClear: () => void;
  onEvidence: () => void;
  onUpload: () => void;
  onAddComment: () => void;
  onSetStatus: (record: SesmtRecord, status: string) => void;
  onDuplicate: (record: SesmtRecord) => void;
}

const SesmtFormPanel = ({
  selected, form, specificForm, moduleSchema, panelTab,
  evidenceText, uploadFiles, commentDraft, replyToCommentId, comments,
  evidencias, historico, onClose, onSetField, onSetSpecificField,
  onSetPanelTab, onSetEvidenceText, onSetUploadFiles, onSetCommentDraft,
  onSetReplyToCommentId, onCreate, onUpdate, onClear, onEvidence, onUpload,
  onAddComment, onSetStatus, onDuplicate,
}: SesmtFormPanelProps) => (
  <div className="rounded-lg border border-border bg-card overflow-hidden">
    <div className="flex items-center justify-between border-b border-border px-3 py-2">
      <h2 className="text-sm font-semibold text-foreground">
        {selected ? `${selected.id} — ${selected.titulo}` : "Novo registro"}
      </h2>
      <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={onClose}>
        <X className="h-4 w-4" />
      </Button>
    </div>

    <Tabs value={panelTab} onValueChange={onSetPanelTab} className="px-3 pb-3">
      <TabsList className="w-full grid grid-cols-5 h-8 mt-2">
        <TabsTrigger value="form" className="text-xs">Dados</TabsTrigger>
        <TabsTrigger value="historico" className="text-xs" disabled={!selected}>Histórico</TabsTrigger>
        <TabsTrigger value="evidencias" className="text-xs" disabled={!selected}>Evidências</TabsTrigger>
        <TabsTrigger value="comentarios" className="text-xs" disabled={!selected}>Coment.</TabsTrigger>
        <TabsTrigger value="acoes" className="text-xs" disabled={!selected}>Ações</TabsTrigger>
      </TabsList>

      <TabsContent value="form" className="space-y-3 mt-3">
        <div className="grid gap-2.5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          <div className="col-span-2">
            <FormField label="Título" required><Input value={form.titulo} onChange={(e) => onSetField("titulo", e.target.value)} /></FormField>
          </div>
          <FormField label="Responsável" required><Input value={form.responsavel} onChange={(e) => onSetField("responsavel", e.target.value)} /></FormField>
          <FormField label="Unidade">
            <Select value={form.unidade} onValueChange={(v) => onSetField("unidade", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{UNIT_OPTIONS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
            </Select>
          </FormField>
          <FormField label="Status">
            <Select value={form.status} onValueChange={(v) => onSetField("status", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </FormField>
          <FormField label="Criticidade">
            <Select value={form.criticidade} onValueChange={(v) => onSetField("criticidade", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CRITICALITY_OPTIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </FormField>
          <FormField label="NR"><Input value={form.nr} onChange={(e) => onSetField("nr", e.target.value)} /></FormField>
          <FormField label="Setor"><Input value={form.setor} onChange={(e) => onSetField("setor", e.target.value)} /></FormField>
          <FormField label="Função"><Input value={form.funcao} onChange={(e) => onSetField("funcao", e.target.value)} /></FormField>
          <FormField label="Vencimento"><Input type="date" value={form.vencimentoAt} onChange={(e) => onSetField("vencimentoAt", e.target.value)} /></FormField>
          <FormField label="Investimento (R$)"><Input value={form.investimento} onChange={(e) => onSetField("investimento", e.target.value)} /></FormField>
          <FormField label="Custo (R$)"><Input value={form.custo} onChange={(e) => onSetField("custo", e.target.value)} /></FormField>
          <FormField label="Risco Inerente"><Input value={form.riscoInerente} onChange={(e) => onSetField("riscoInerente", e.target.value)} /></FormField>
          <FormField label="Risco Residual"><Input value={form.riscoResidual} onChange={(e) => onSetField("riscoResidual", e.target.value)} /></FormField>
        </div>

        {moduleSchema.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-foreground mb-2 mt-1">Campos do submódulo</h3>
            <div className="grid gap-2.5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              {moduleSchema.map((field) => (
                <div key={field.key} className={field.type === "textarea" ? "col-span-2" : ""}>
                  <FormField label={field.label} required={field.required}>
                    {field.type === "textarea" && <Textarea rows={2} placeholder={field.placeholder} value={specificForm[field.key] || ""} onChange={(e) => onSetSpecificField(field.key, e.target.value)} />}
                    {field.type === "select" && (
                      <Select value={specificForm[field.key] || undefined} onValueChange={(v) => onSetSpecificField(field.key, v)}>
                        <SelectTrigger><SelectValue placeholder={field.placeholder || "Selecione"} /></SelectTrigger>
                        <SelectContent>{(field.options || []).map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                      </Select>
                    )}
                    {field.type === "number" && <Input inputMode="decimal" placeholder={field.placeholder} value={specificForm[field.key] || ""} onChange={(e) => onSetSpecificField(field.key, e.target.value)} />}
                    {field.type === "date" && <Input type="date" value={specificForm[field.key] || ""} onChange={(e) => onSetSpecificField(field.key, e.target.value)} />}
                    {field.type === "text" && <Input placeholder={field.placeholder} value={specificForm[field.key] || ""} onChange={(e) => onSetSpecificField(field.key, e.target.value)} />}
                  </FormField>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-2.5 grid-cols-1 lg:grid-cols-2">
          <FormField label="Observações">
            <Textarea value={form.descricao} onChange={(e) => onSetField("descricao", e.target.value)} rows={2} />
          </FormField>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="outline" size="sm" onClick={onClear}>Limpar</Button>
          {!selected && (
            <Button size="sm" onClick={onCreate} className="gap-1.5">
              <Save className="w-3.5 h-3.5" /> Salvar
            </Button>
          )}
          {selected && (
            <Button size="sm" onClick={onUpdate} className="gap-1.5">
              <Save className="w-3.5 h-3.5" /> Atualizar
            </Button>
          )}
        </div>
      </TabsContent>

      <TabsContent value="historico" className="space-y-2 mt-3">
        {historico.length === 0 && <p className="text-sm text-muted-foreground">Sem histórico registrado.</p>}
        <div className="max-h-[30vh] space-y-2 overflow-auto pr-1">
          {historico.map((item) => (
            <div key={item.id} className="rounded-md border border-border px-3 py-2">
              <p className="text-sm font-medium">{item.acao}</p>
              <p className="text-xs text-muted-foreground">{item.descricao}</p>
              <p className="text-xs text-muted-foreground">{new Date(item.data).toLocaleString("pt-BR")} • {item.usuario}</p>
            </div>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="evidencias" className="space-y-3 mt-3">
        <div className="grid gap-3 grid-cols-1 lg:grid-cols-2">
          <div className="space-y-2">
            <Textarea placeholder="Descreva a evidência" value={evidenceText} onChange={(e) => onSetEvidenceText(e.target.value)} rows={2} />
            <div className="flex justify-end">
              <Button type="button" size="sm" onClick={onEvidence} disabled={!evidenceText.trim()}>Adicionar evidência</Button>
            </div>
          </div>
          <div className="space-y-2">
            <AttachmentUploader maxFiles={8} accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.xlsx,.xls,.csv,.txt" onFilesChange={onSetUploadFiles} />
            <div className="flex justify-end">
              <Button type="button" size="sm" onClick={onUpload} disabled={uploadFiles.length === 0} className="gap-1.5">
                <UploadCloud className="h-3.5 w-3.5" /> Enviar anexos
              </Button>
            </div>
          </div>
        </div>
        <div className="max-h-[20vh] space-y-2 overflow-auto pr-1">
          {evidencias.length === 0 && <p className="text-sm text-muted-foreground">Sem evidências registradas.</p>}
          {evidencias.map((ev) => (
            <div key={ev.id} className="rounded-md border border-border px-3 py-2">
              <p className="text-sm font-medium">{ev.descricao}</p>
              <p className="text-xs text-muted-foreground">{ev.tipo} • {ev.responsavel} • {ev.data}</p>
            </div>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="comentarios" className="space-y-3 mt-3">
        <div className="grid gap-3 grid-cols-1 lg:grid-cols-2">
          <div className="space-y-2">
            {replyToCommentId && (
              <p className="text-xs text-muted-foreground">
                Respondendo {replyToCommentId}
                <Button type="button" variant="link" className="ml-1 h-auto p-0 text-xs" onClick={() => onSetReplyToCommentId(null)}>cancelar</Button>
              </p>
            )}
            <Textarea placeholder="Comentário" value={commentDraft} onChange={(e) => onSetCommentDraft(e.target.value)} rows={2} />
            <div className="flex justify-end">
              <Button type="button" size="sm" onClick={onAddComment} disabled={!commentDraft.trim()}>Comentar</Button>
            </div>
          </div>
          <div className="max-h-[20vh] space-y-2 overflow-auto pr-1">
            {comments.length === 0 && <p className="text-sm text-muted-foreground">Sem comentários.</p>}
            {comments.map((c) => (
              <div key={c.id} className="rounded-md border border-border px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{c.usuario}</p>
                  <p className="text-xs text-muted-foreground">{new Date(c.data).toLocaleString("pt-BR")}</p>
                </div>
                {c.parentId && <p className="text-xs text-muted-foreground">Resposta para {c.parentId}</p>}
                <p className="text-sm">{c.texto}</p>
                <div className="mt-1 flex justify-end">
                  <Button type="button" variant="ghost" size="sm" className="h-6 text-xs" onClick={() => onSetReplyToCommentId(c.id)}>Responder</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="acoes" className="space-y-3 mt-3">
        {selected && (
          <>
            <div className="grid gap-2 grid-cols-2 sm:grid-cols-4">
              <Button type="button" variant="outline" size="sm" className="justify-start gap-1.5 text-xs" onClick={() => onSetStatus(selected, "EM_ANDAMENTO")}>
                <RefreshCw className="h-3.5 w-3.5" /> Em andamento
              </Button>
              <Button type="button" variant="outline" size="sm" className="justify-start gap-1.5 text-xs" onClick={() => onSetStatus(selected, "ABERTO")}>
                <RefreshCw className="h-3.5 w-3.5" /> Reabrir
              </Button>
              <Button type="button" variant="outline" size="sm" className="justify-start gap-1.5 text-xs" onClick={() => onDuplicate(selected)}>
                <Copy className="h-3.5 w-3.5" /> Duplicar
              </Button>
              <Button type="button" size="sm" className="justify-start gap-1.5 text-xs" onClick={() => onSetStatus(selected, "CONCLUIDO")}>
                <CheckCircle2 className="h-3.5 w-3.5" /> Concluir
              </Button>
            </div>
            {moduleSchema.length > 0 && (
              <div className="grid gap-2 grid-cols-2 sm:grid-cols-4">
                {moduleSchema.map((field) => (
                  <div key={field.key} className="rounded-md border border-border px-2.5 py-1.5">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{field.label}</p>
                    <p className="text-sm font-medium">
                      {selected.dadosEspecificos?.[field.key] == null || String(selected.dadosEspecificos?.[field.key]).trim() === "" ? "-" : String(selected.dadosEspecificos?.[field.key])}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </TabsContent>
    </Tabs>
  </div>
);

export default SesmtFormPanel;
