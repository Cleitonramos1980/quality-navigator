import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface TrendMiniCardProps {
  label: string;
  value: string | number;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  trendPositive?: boolean; // when true, "up" is good; when false, "down" is good
  className?: string;
}

const TrendMiniCard = ({ label, value, trend = "neutral", trendValue, trendPositive = true, className }: TrendMiniCardProps) => {
  const isGood = trend === "neutral" ? null : (trend === "up") === trendPositive;
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  return (
    <div className={cn("rounded-lg border border-border bg-card p-4", className)}>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-foreground">{value}</span>
        {trendValue && (
          <span className={cn(
            "flex items-center gap-0.5 text-xs font-medium mb-0.5",
            isGood === true && "text-success",
            isGood === false && "text-destructive",
            isGood === null && "text-muted-foreground",
          )}>
            <TrendIcon className="h-3 w-3" />
            {trendValue}
          </span>
        )}
      </div>
    </div>
  );
};

export default TrendMiniCard;
