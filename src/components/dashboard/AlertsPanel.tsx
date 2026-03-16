import { AlertTriangle, Bell, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export interface AlertItem {
  id: string;
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description?: string;
  module: string;
  route?: string;
  timestamp?: string;
}

const SEVERITY_STYLES: Record<string, string> = {
  critical: "border-l-destructive bg-destructive/5",
  high: "border-l-warning bg-warning/5",
  medium: "border-l-accent bg-accent/5",
  low: "border-l-muted-foreground bg-muted/30",
};

const SEVERITY_DOT: Record<string, string> = {
  critical: "bg-destructive",
  high: "bg-warning",
  medium: "bg-accent",
  low: "bg-muted-foreground",
};

interface AlertsPanelProps {
  alerts: AlertItem[];
  title?: string;
  maxItems?: number;
  className?: string;
}

const AlertsPanel = ({ alerts, title = "Alertas e Atenção", maxItems = 6, className }: AlertsPanelProps) => {
  const visible = alerts.slice(0, maxItems);

  return (
    <div className={cn("glass-card rounded-lg p-5", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Bell className="h-4 w-4 text-warning" />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {alerts.length > maxItems && (
          <span className="ml-auto text-xs text-muted-foreground">+{alerts.length - maxItems} mais</span>
        )}
      </div>
      {visible.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">Nenhum alerta ativo no momento.</p>
      ) : (
        <div className="space-y-2">
          {visible.map((alert) => {
            const Wrapper = alert.route ? Link : "div";
            const wrapperProps = alert.route ? { to: alert.route } : {};
            return (
              <Wrapper
                key={alert.id}
                {...(wrapperProps as any)}
                className={cn(
                  "flex items-start gap-3 rounded-md border-l-4 p-3 transition-colors",
                  SEVERITY_STYLES[alert.severity],
                  alert.route && "hover:bg-muted/50 cursor-pointer",
                )}
              >
                <span className={cn("mt-0.5 h-2 w-2 rounded-full shrink-0", SEVERITY_DOT[alert.severity])} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase">{alert.module}</span>
                    {alert.timestamp && <span className="text-xs text-muted-foreground">• {alert.timestamp}</span>}
                  </div>
                  <p className="text-sm font-medium text-foreground">{alert.title}</p>
                  {alert.description && <p className="text-xs text-muted-foreground mt-0.5 truncate">{alert.description}</p>}
                </div>
                {alert.route && <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />}
              </Wrapper>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AlertsPanel;
