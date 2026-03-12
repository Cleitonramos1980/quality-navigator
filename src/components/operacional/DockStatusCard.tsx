import { cn } from "@/lib/utils";
import type { Doca } from "@/types/operacional";
import StatusSemaphore from "./StatusSemaphore";
import { Truck, Clock } from "lucide-react";

interface DockStatusCardProps {
  doca: Doca;
  className?: string;
  onClick?: () => void;
}

const DockStatusCard = ({ doca, className, onClick }: DockStatusCardProps) => {
  const statusColor = doca.status === "LIVRE" ? "border-success/40" : doca.status === "OCUPADA" ? "border-warning/40" : "border-muted";

  return (
    <div
      className={cn(
        "cursor-pointer rounded-lg border-2 bg-card p-4 transition-all hover:shadow-md",
        statusColor, className
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-foreground">{doca.nome}</h4>
        <StatusSemaphore status={doca.status} />
      </div>
      {doca.status === "OCUPADA" && (
        <div className="mt-2 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Truck className="h-3.5 w-3.5" />
            <span>{doca.placaAtual}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>{doca.tempoOcupacao} min</span>
          </div>
          {doca.operacaoAtual && <p className="text-xs text-foreground/70">{doca.operacaoAtual}</p>}
        </div>
      )}
      {doca.status === "MANUTENCAO" && (
        <p className="mt-2 text-xs text-muted-foreground">Em manutenção</p>
      )}
    </div>
  );
};

export default DockStatusCard;
