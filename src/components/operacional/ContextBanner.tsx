import { cn } from "@/lib/utils";
import { AlertTriangle, Info } from "lucide-react";

interface ContextBannerProps {
  tipo: "info" | "warning" | "danger" | "success";
  titulo: string;
  descricao?: string;
  className?: string;
}

const bannerStyles = {
  info: "border-info/30 bg-info/5 text-info",
  warning: "border-warning/30 bg-warning/5 text-warning",
  danger: "border-destructive/30 bg-destructive/5 text-destructive",
  success: "border-success/30 bg-success/5 text-success",
};

const ContextBanner = ({ tipo, titulo, descricao, className }: ContextBannerProps) => (
  <div className={cn("flex items-start gap-3 rounded-lg border p-4", bannerStyles[tipo], className)}>
    {tipo === "danger" || tipo === "warning" ? (
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
    ) : (
      <Info className="mt-0.5 h-5 w-5 shrink-0" />
    )}
    <div>
      <p className="text-sm font-semibold">{titulo}</p>
      {descricao && <p className="mt-0.5 text-xs opacity-80">{descricao}</p>}
    </div>
  </div>
);

export default ContextBanner;
