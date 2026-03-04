import { cn } from "@/lib/utils";
import { STATUS_COLORS } from "@/types/sgq";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const formatStatus = (s: string) => s.replace(/_/g, " ");

const StatusBadge = ({ status, className }: StatusBadgeProps) => (
  <span className={cn("status-badge", STATUS_COLORS[status] || "bg-muted text-muted-foreground", className)}>
    {formatStatus(status)}
  </span>
);

export default StatusBadge;
