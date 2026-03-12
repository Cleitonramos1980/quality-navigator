import { cn } from "@/lib/utils";
import { AlertTriangle, Shield, TrendingUp } from "lucide-react";

interface RiskScoreCardProps {
  score: number;
  label?: string;
  motivoRisco?: string;
  acaoRecomendada?: string;
  className?: string;
}

function getScoreColor(score: number) {
  if (score <= 25) return { bg: "bg-success/10", text: "text-success", border: "border-success/30" };
  if (score <= 50) return { bg: "bg-warning/10", text: "text-warning", border: "border-warning/30" };
  if (score <= 75) return { bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/30" };
  return { bg: "bg-destructive/20", text: "text-destructive", border: "border-destructive/50" };
}

function getScoreLabel(score: number) {
  if (score <= 25) return "Baixo";
  if (score <= 50) return "Moderado";
  if (score <= 75) return "Alto";
  return "Crítico";
}

const RiskScoreCard = ({ score, label, motivoRisco, acaoRecomendada, className }: RiskScoreCardProps) => {
  const colors = getScoreColor(score);
  return (
    <div className={cn("rounded-lg border p-4", colors.border, colors.bg, className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {score > 50 ? <AlertTriangle className={cn("h-5 w-5", colors.text)} /> : <Shield className={cn("h-5 w-5", colors.text)} />}
          <span className="text-xs font-medium text-muted-foreground">{label || "Score de Risco"}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className={cn("text-2xl font-bold", colors.text)}>{score}</span>
          <span className="text-xs text-muted-foreground">/100</span>
        </div>
      </div>
      <p className={cn("mt-1 text-sm font-semibold", colors.text)}>{getScoreLabel(score)}</p>
      {motivoRisco && <p className="mt-2 text-xs text-foreground/80">{motivoRisco}</p>}
      {acaoRecomendada && (
        <div className="mt-2 flex items-start gap-1.5 text-xs text-foreground/70">
          <TrendingUp className="mt-0.5 h-3 w-3 shrink-0" />
          <span>{acaoRecomendada}</span>
        </div>
      )}
    </div>
  );
};

export default RiskScoreCard;
