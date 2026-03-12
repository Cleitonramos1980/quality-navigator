import { cn } from "@/lib/utils";
import { INVENTARIO_STATUS_LABELS, INVENTARIO_STATUS_COLORS, type InventarioStatus } from "@/types/inventario";

interface Props {
  status: InventarioStatus;
  className?: string;
}

const InventoryStatusPill = ({ status, className }: Props) => (
  <span className={cn("status-badge", INVENTARIO_STATUS_COLORS[status], className)}>
    {INVENTARIO_STATUS_LABELS[status]}
  </span>
);

export default InventoryStatusPill;
