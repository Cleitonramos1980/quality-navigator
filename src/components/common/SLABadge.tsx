import { Badge } from "@/components/ui/badge";
import type { SlaEvaluation } from "@/lib/sla";

interface SLABadgeProps {
  evaluation: SlaEvaluation;
}

const COLOR_BY_LEVEL: Record<SlaEvaluation["level"], string> = {
  ok: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  breach: "bg-destructive/15 text-destructive",
};

const SLABadge = ({ evaluation }: SLABadgeProps) => (
  <Badge className={`text-[10px] ${COLOR_BY_LEVEL[evaluation.level]}`}>{evaluation.text}</Badge>
);

export default SLABadge;
