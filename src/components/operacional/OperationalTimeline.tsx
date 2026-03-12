import type { EventoTimeline } from "@/types/operacional";
import { cn } from "@/lib/utils";
import { Circle, CheckCircle, AlertTriangle, Clock, Truck, LogIn, LogOut, Wrench, FileText } from "lucide-react";

const TIPO_ICONS: Record<string, React.ReactNode> = {
  PRE_AUTORIZACAO: <Clock className="h-4 w-4" />,
  LINK_ENVIADO: <FileText className="h-4 w-4" />,
  CADASTRO_PREENCHIDO: <CheckCircle className="h-4 w-4" />,
  APROVACAO: <CheckCircle className="h-4 w-4" />,
  QR_GERADO: <CheckCircle className="h-4 w-4" />,
  ENTRADA_REGISTRADA: <LogIn className="h-4 w-4" />,
  SAIDA_REGISTRADA: <LogOut className="h-4 w-4" />,
  SAIDA_PORTARIA: <LogOut className="h-4 w-4" />,
  CHECKPOINT: <Truck className="h-4 w-4" />,
  RECEBIMENTO: <CheckCircle className="h-4 w-4" />,
  ALERTA: <AlertTriangle className="h-4 w-4" />,
  MANUTENCAO: <Wrench className="h-4 w-4" />,
};

interface OperationalTimelineProps {
  eventos: EventoTimeline[];
  className?: string;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

const OperationalTimeline = ({ eventos, className }: OperationalTimelineProps) => (
  <div className={cn("relative space-y-0", className)}>
    {eventos.map((evt, idx) => (
      <div key={evt.id} className="relative flex gap-4 pb-6 last:pb-0">
        {idx < eventos.length - 1 && (
          <div className="absolute left-[15px] top-8 h-[calc(100%-16px)] w-px bg-border" />
        )}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-card text-primary">
          {TIPO_ICONS[evt.tipo] || <Circle className="h-4 w-4" />}
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-sm font-medium text-foreground">{evt.descricao}</p>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
            <span>{formatDateTime(evt.dataHora)}</span>
            <span>•</span>
            <span>{evt.usuario}</span>
          </div>
          {evt.detalhes && <p className="mt-1 text-xs text-muted-foreground">{evt.detalhes}</p>}
        </div>
      </div>
    ))}
  </div>
);

export default OperationalTimeline;
