import { cn } from "@/lib/utils";
import { STATUS_COLORS } from "@/types/sgq";
import { getStatusText } from "@/lib/statusText";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const StatusBadge = ({ status, className }: StatusBadgeProps) => (
  <span className={cn("status-badge", STATUS_COLORS[status] || "bg-muted text-muted-foreground", className)}>
    {getStatusText(status)}
  </span>
);

export default StatusBadge;
