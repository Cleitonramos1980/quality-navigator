import { cn } from "@/lib/utils";
import { OPERACIONAL_STATUS_COLORS } from "@/types/operacional";
import { STATUS_COLORS } from "@/types/sgq";
import { getStatusText } from "@/lib/statusText";

interface StatusSemaphoreProps {
  status: string;
  className?: string;
}

const StatusSemaphore = ({ status, className }: StatusSemaphoreProps) => {
  const colorClass = OPERACIONAL_STATUS_COLORS[status] || STATUS_COLORS[status] || "bg-muted text-muted-foreground";
  return (
    <span className={cn("status-badge", colorClass, className)}>
      {getStatusText(status)}
    </span>
  );
};

export default StatusSemaphore;
