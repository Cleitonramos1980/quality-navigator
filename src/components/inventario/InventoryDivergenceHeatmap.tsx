import { cn } from "@/lib/utils";
import type { DivergenciaDiaria } from "@/types/inventario";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Props {
  data: DivergenciaDiaria[];
  onCellClick?: (item: DivergenciaDiaria) => void;
}

const NIVEL_COLORS: Record<string, string> = {
  ok: "bg-success/60",
  atencao: "bg-warning/60",
  alta: "bg-destructive/60",
  sem_contagem: "bg-muted-foreground/30",
};

const InventoryDivergenceHeatmap = ({ data, onCellClick }: Props) => {
  const lojas = [...new Set(data.map((d) => d.lojaNome))];
  const datas = [...new Set(data.map((d) => d.data))].sort().slice(-14);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            <th className="text-left p-1.5 font-medium text-muted-foreground sticky left-0 bg-card min-w-[160px]">Loja</th>
            {datas.map((d) => (
              <th key={d} className="p-1.5 font-medium text-muted-foreground text-center min-w-[36px]">
                {d.slice(8, 10)}/{d.slice(5, 7)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {lojas.map((loja) => (
            <tr key={loja}>
              <td className="p-1.5 font-medium text-foreground sticky left-0 bg-card truncate max-w-[160px]">{loja}</td>
              {datas.map((dt) => {
                const cell = data.find((d) => d.lojaNome === loja && d.data === dt);
                const nivel = cell?.nivel || "sem_contagem";
                return (
                  <td key={dt} className="p-0.5 text-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => cell && onCellClick?.(cell)}
                          className={cn(
                            "w-7 h-7 rounded-sm transition-all hover:ring-2 hover:ring-primary/40",
                            NIVEL_COLORS[nivel],
                            cell && onCellClick && "cursor-pointer"
                          )}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-medium">{loja}</p>
                        <p>{dt}</p>
                        {cell ? (
                          <>
                            <p>Acuracidade: {cell.acuracidade}%</p>
                            <p>Divergentes: {cell.itensDivergentes}</p>
                          </>
                        ) : (
                          <p>Sem contagem</p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-success/60" /> Dentro do esperado</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-warning/60" /> Atenção</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-destructive/60" /> Alta divergência</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-muted-foreground/30" /> Sem contagem</span>
      </div>
    </div>
  );
};

export default InventoryDivergenceHeatmap;
