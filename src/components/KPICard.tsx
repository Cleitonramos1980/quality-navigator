import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: { value: number; positive: boolean };
  className?: string;
  onClick?: () => void;
}

const KPICard = ({ title, value, subtitle, icon, trend, className, onClick }: KPICardProps) => (
  <div
    className={cn(
      "glass-card rounded-lg p-5 animate-fade-in",
      onClick && "cursor-pointer hover:ring-2 hover:ring-primary/30 hover:shadow-lg transition-all",
      className
    )}
    onClick={onClick}
    role={onClick ? "button" : undefined}
    tabIndex={onClick ? 0 : undefined}
    onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") onClick(); } : undefined}
  >
    <div className="flex items-start justify-between mb-3">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</span>
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>
    </div>
    <div className="text-2xl font-bold text-foreground">{value}</div>
    {(subtitle || trend) && (
      <div className="flex items-center gap-2 mt-1">
        {trend && (
          <span className={cn("text-xs font-medium", trend.positive ? "text-success" : "text-destructive")}>
            {trend.positive ? "↓" : "↑"} {Math.abs(trend.value)}%
          </span>
        )}
        {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
      </div>
    )}
  </div>
);

export default KPICard;
