import { cn } from "@/lib/utils";

interface TraceabilityCardProps {
  dados: { label: string; valor: string | undefined | null }[];
  titulo?: string;
  className?: string;
}

const TraceabilityCard = ({ dados, titulo, className }: TraceabilityCardProps) => (
  <div className={cn("glass-card rounded-lg p-4", className)}>
    {titulo && <h3 className="mb-3 text-sm font-semibold text-foreground">{titulo}</h3>}
    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 lg:grid-cols-3">
      {dados.filter(d => d.valor).map((d) => (
        <div key={d.label}>
          <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{d.label}</dt>
          <dd className="text-sm text-foreground">{d.valor}</dd>
        </div>
      ))}
    </dl>
  </div>
);

export default TraceabilityCard;
