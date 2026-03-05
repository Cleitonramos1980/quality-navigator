import { cn } from "@/lib/utils";
import { RequisicaoStatus, REQUISICAO_STATUS_LABELS, REQUISICAO_STATUS_COLORS } from "@/types/sacRequisicao";

interface RequisicaoStatusBadgeProps {
  status: RequisicaoStatus;
}

const RequisicaoStatusBadge = ({ status }: RequisicaoStatusBadgeProps) => (
  <span className={cn("status-badge px-2 py-0.5 rounded text-xs font-medium", REQUISICAO_STATUS_COLORS[status])}>
    {REQUISICAO_STATUS_LABELS[status]}
  </span>
);

export default RequisicaoStatusBadge;
