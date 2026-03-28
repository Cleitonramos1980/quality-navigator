interface KPIItem {
  label: string;
  value: number;
  tone?: string;
}

interface SesmtKPIBarProps {
  cards: KPIItem[];
}

const SesmtKPIBar = ({ cards }: SesmtKPIBarProps) => (
  <div className="grid gap-2 grid-cols-3 lg:grid-cols-6">
    {cards.map((card) => (
      <div key={card.label} className="rounded-lg border border-border bg-card px-2.5 py-1.5">
        <p className="text-[10px] text-muted-foreground leading-tight">{card.label}</p>
        <p className={`text-lg font-bold leading-tight ${card.tone || "text-foreground"}`}>{card.value}</p>
      </div>
    ))}
  </div>
);

export default SesmtKPIBar;
