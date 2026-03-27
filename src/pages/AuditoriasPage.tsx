import StatusBadge from "@/components/StatusBadge";
import { Plus, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAuditorias } from "@/services/auditorias";
import type { AudExec } from "@/types/sgq";
import { useToast } from "@/components/ui/use-toast";

const AuditoriasPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [auditorias, setAuditorias] = useState<AudExec[]>([]);

  useEffect(() => {
    getAuditorias()
      .then(setAuditorias)
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Falha ao carregar auditorias.";
        toast({ title: "Erro ao carregar auditorias", description: message, variant: "destructive" });
      });
  }, [toast]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Auditorias</h1>
          <p className="text-sm text-muted-foreground mt-1">Planejamento e execução de auditorias internas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => navigate("/auditorias/calendario")}><CalendarDays className="w-4 h-4" />Calendário</Button>
          <Button className="gap-2" onClick={() => navigate("/auditorias/nova")}><Plus className="w-4 h-4" />Nova Auditoria</Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {auditorias.map((a) => (
          <div key={a.id} className="glass-card rounded-lg p-5 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start justify-between mb-2">
              <span className="font-mono text-xs font-medium text-primary">{a.id}</span>
              <StatusBadge status={a.status} />
            </div>
            <h3 className="font-medium text-foreground mb-1">{a.tplNome}</h3>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div>Planta: <span className="font-mono">{a.planta}</span> · Local: {a.local}</div>
              <div>Auditor: <strong className="text-foreground">{a.auditor}</strong></div>
              <div>Início: {a.startedAt}{a.finishedAt && ` · Fim: ${a.finishedAt}`}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuditoriasPage;

