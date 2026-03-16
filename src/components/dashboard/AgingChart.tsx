import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { cn } from "@/lib/utils";

export interface AgingBucket {
  label: string;
  count: number;
  severity?: "ok" | "warn" | "critical";
}

interface AgingChartProps {
  data: AgingBucket[];
  title?: string;
  className?: string;
  height?: number;
}

const SEVERITY_COLORS = {
  ok: "hsl(152, 60%, 40%)",
  warn: "hsl(38, 92%, 50%)",
  critical: "hsl(0, 72%, 51%)",
};

const AgingChart = ({ data, title = "Aging", className, height = 220 }: AgingChartProps) => (
  <div className={cn("glass-card rounded-lg p-5", className)}>
    {title && <h3 className="text-sm font-semibold text-foreground mb-4">{title}</h3>}
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {data.map((entry, idx) => (
            <Cell key={idx} fill={SEVERITY_COLORS[entry.severity || "ok"]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export default AgingChart;
