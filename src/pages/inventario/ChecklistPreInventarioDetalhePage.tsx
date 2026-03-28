import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle, FileText, Clock, User, Building2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { mockChecklists } from "@/data/mockChecklistPreInventario";
import { STATUS_LABELS, STATUS_COLORS, CRITICIDADE_LABELS, CRITICIDADE_COLORS } from "@/types/checklistPreInventario";

export default function ChecklistPreInventarioDetalhePage() {
  const { checklistId, itemId } = useParams();
  const navigate = useNavigate();

  const checklist = mockChecklists.find((c) => c.id === checklistId);
  const item = checklist?.blocos.flatMap((b) => b.itens).find((i) => i.id === itemId);
  const bloco = checklist?.blocos.find((b) => b.id === item?.blocoId);

  if (!checklist || !item) {
    return (
      <div className="p-6 space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4 mr-1" />Voltar</Button>
        <p className="text-muted-foreground">Item não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-3xl">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4 mr-1" />Voltar ao Checklist</Button>

      {/* Header */}
      <div className="glass-card rounded-lg p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">{checklist.nome} → {bloco?.nome}</p>
            <h1 className="text-lg font-bold text-foreground">{item.descricao}</h1>
          </div>
          <span className={cn("status-badge", STATUS_COLORS[item.status])}>{STATUS_LABELS[item.status]}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          <div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">Responsável:</span><span className="font-medium">{item.responsavel}</span></div>
          <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">Data:</span><span className="font-medium">{item.data}</span></div>
          <div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">Setor:</span><span className="font-medium">{item.setor}</span></div>
          <div className="flex items-center gap-2"><Tag className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">Criticidade:</span><span className={cn("status-badge text-[11px]", CRITICIDADE_COLORS[item.criticidade])}>{CRITICIDADE_LABELS[item.criticidade]}</span></div>
        </div>

        {item.observacao && (
          <>
            <Separator />
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Observação</p>
              <p className="text-sm text-foreground">{item.observacao}</p>
            </div>
          </>
        )}

        {item.evidencias && item.evidencias.length > 0 && (
          <>
            <Separator />
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Evidências</p>
              <div className="flex flex-wrap gap-2">
                {item.evidencias.map((e, i) => (
                  <Badge key={i} variant="outline" className="text-xs"><FileText className="h-3 w-3 mr-1" />{e}</Badge>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Histórico */}
      <div className="glass-card rounded-lg p-5 space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Histórico de Alterações</h2>
        {item.historico.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum registro.</p>
        ) : (
          <div className="space-y-2">
            {item.historico.map((h) => (
              <div key={h.id} className="flex items-start gap-3 text-sm border-l-2 border-primary/30 pl-3 py-1">
                <div className="shrink-0">
                  <p className="text-xs text-muted-foreground">{new Date(h.data).toLocaleString("pt-BR")}</p>
                  <p className="text-xs font-medium">{h.usuario}</p>
                </div>
                <div>
                  <Badge variant="outline" className="text-[10px] mr-1">{h.acao}</Badge>
                  <span className="text-muted-foreground">{h.detalhe}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
