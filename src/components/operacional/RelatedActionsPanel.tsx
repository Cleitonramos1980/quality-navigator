import { Link } from "react-router-dom";
import { ExternalLink, ShieldAlert, FileWarning, ClipboardCheck, Search, BookOpen } from "lucide-react";

interface RelatedAction {
  label: string;
  icon: React.ReactNode;
  to: string;
  variant?: "default" | "destructive" | "warning";
}

interface RelatedActionsPanelProps {
  actions?: RelatedAction[];
  origemId?: string;
  origemTipo?: string;
}

const defaultActions = (origemId?: string): RelatedAction[] => [
  { label: "Abrir SAC", icon: <Search className="h-4 w-4" />, to: `/sac/novo${origemId ? `?origem=${origemId}` : ""}` },
  { label: "Abrir Garantia", icon: <ShieldAlert className="h-4 w-4" />, to: `/garantias/nova${origemId ? `?origem=${origemId}` : ""}` },
  { label: "Abrir NC", icon: <FileWarning className="h-4 w-4" />, to: `/nao-conformidades/nova${origemId ? `?origem=${origemId}` : ""}`, variant: "warning" },
  { label: "Abrir CAPA", icon: <ClipboardCheck className="h-4 w-4" />, to: `/capa/nova${origemId ? `?origem=${origemId}` : ""}` },
  { label: "Vincular Auditoria", icon: <BookOpen className="h-4 w-4" />, to: `/auditorias${origemId ? `?vinculo=${origemId}` : ""}` },
];

const RelatedActionsPanel = ({ actions, origemId }: RelatedActionsPanelProps) => {
  const items = actions ?? defaultActions(origemId);

  return (
    <div className="glass-card rounded-lg p-4">
      <h3 className="mb-3 text-sm font-semibold text-foreground">Ações Relacionadas</h3>
      <div className="flex flex-wrap gap-2">
        {items.map((action) => (
          <Link
            key={action.label}
            to={action.to}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
          >
            {action.icon}
            {action.label}
            <ExternalLink className="h-3 w-3 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedActionsPanel;
