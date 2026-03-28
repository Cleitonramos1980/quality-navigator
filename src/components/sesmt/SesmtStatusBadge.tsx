import { cn } from "@/lib/utils";

const STATUS_CLASSES: Record<string, string> = {
  ABERTO: "bg-[hsl(var(--status-open-bg))] text-[hsl(var(--status-open-fg))] border-[hsl(var(--status-open-border))]",
  EM_ANDAMENTO: "bg-[hsl(var(--status-progress-bg))] text-[hsl(var(--status-progress-fg))] border-[hsl(var(--status-progress-border))]",
  CONCLUIDO: "bg-[hsl(var(--status-done-bg))] text-[hsl(var(--status-done-fg))] border-[hsl(var(--status-done-border))]",
  ATRASADO: "bg-[hsl(var(--status-overdue-bg))] text-[hsl(var(--status-overdue-fg))] border-[hsl(var(--status-overdue-border))]",
};

const CRIT_CLASSES: Record<string, string> = {
  BAIXA: "bg-[hsl(var(--crit-low-bg))] text-[hsl(var(--crit-low-fg))] border-[hsl(var(--crit-low-border))]",
  MEDIA: "bg-[hsl(var(--crit-medium-bg))] text-[hsl(var(--crit-medium-fg))] border-[hsl(var(--crit-medium-border))]",
  ALTA: "bg-[hsl(var(--crit-high-bg))] text-[hsl(var(--crit-high-fg))] border-[hsl(var(--crit-high-border))]",
  CRITICA: "bg-[hsl(var(--crit-critical-bg))] text-[hsl(var(--crit-critical-fg))] border-[hsl(var(--crit-critical-border))]",
};

export function StatusBadgeInline({ status }: { status: string }) {
  const cls = STATUS_CLASSES[status] || STATUS_CLASSES.ABERTO;
  return <span className={cn("inline-flex rounded-md border px-1.5 py-0.5 text-[10px] font-medium", cls)}>{status}</span>;
}

export function CriticidadeBadgeInline({ criticidade }: { criticidade: string }) {
  const cls = CRIT_CLASSES[criticidade] || CRIT_CLASSES.MEDIA;
  return <span className={cn("inline-flex rounded-md border px-1.5 py-0.5 text-[10px] font-medium", cls)}>{criticidade}</span>;
}
