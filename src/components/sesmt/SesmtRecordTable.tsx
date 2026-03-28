import { CheckCircle2, Copy, Eye, Pencil, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { StatusBadgeInline, CriticidadeBadgeInline } from "./SesmtStatusBadge";
import type { SesmtRecord } from "@/types/sesmt";

interface SesmtRecordTableProps {
  records: SesmtRecord[];
  totalRecords: number;
  loading: boolean;
  selectedId?: string;
  page: number;
  totalPages: number;
  getRecordTypeLabel: (record: SesmtRecord) => string;
  isOverdue: (record: SesmtRecord) => boolean;
  onOpenRecord: (id: string, tab?: "form" | "historico" | "evidencias" | "comentarios" | "acoes") => void;
  onDuplicate: (record: SesmtRecord) => void;
  onSetStatus: (record: SesmtRecord, status: string) => void;
  onPageChange: (page: number) => void;
}

const SesmtRecordTable = ({
  records, totalRecords, loading, selectedId, page, totalPages,
  getRecordTypeLabel, isOverdue, onOpenRecord, onDuplicate, onSetStatus, onPageChange,
}: SesmtRecordTableProps) => (
  <div className="rounded-lg border border-border bg-card overflow-hidden">
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs">Tipo</TableHead>
            <TableHead className="text-xs">Código</TableHead>
            <TableHead className="text-xs">Título</TableHead>
            <TableHead className="text-xs">Unidade</TableHead>
            <TableHead className="text-xs">Status</TableHead>
            <TableHead className="text-xs">Criticidade</TableHead>
            <TableHead className="text-xs">Vencimento</TableHead>
            <TableHead className="text-xs">NR</TableHead>
            <TableHead className="text-xs">Responsável</TableHead>
            <TableHead className="text-xs text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading && (
            <TableRow>
              <TableCell className="text-center text-muted-foreground text-xs py-8" colSpan={10}>Carregando registros...</TableCell>
            </TableRow>
          )}
          {!loading && records.length === 0 && (
            <TableRow>
              <TableCell className="text-center text-muted-foreground text-xs py-8" colSpan={10}>
                Nenhum registro encontrado. Clique em <strong>Novo</strong> para criar o primeiro.
              </TableCell>
            </TableRow>
          )}
          {records.map((record) => (
            <TableRow
              key={record.id}
              className={`cursor-pointer hover:bg-muted/40 ${selectedId === record.id ? "bg-primary/5" : ""}`}
              onClick={() => onOpenRecord(record.id)}
            >
              <TableCell className="whitespace-nowrap text-xs py-2">{getRecordTypeLabel(record)}</TableCell>
              <TableCell className="whitespace-nowrap font-medium text-xs py-2">{record.id}</TableCell>
              <TableCell className="text-xs py-2 max-w-[200px] truncate">{record.titulo}</TableCell>
              <TableCell className="text-xs py-2">{record.unidade}</TableCell>
              <TableCell className="py-2"><StatusBadgeInline status={record.status} /></TableCell>
              <TableCell className="py-2"><CriticidadeBadgeInline criticidade={record.criticidade} /></TableCell>
              <TableCell className="py-2">
                <span className={`text-xs ${isOverdue(record) ? "font-semibold text-destructive" : "text-foreground"}`}>{record.vencimentoAt || "-"}</span>
              </TableCell>
              <TableCell className="text-xs py-2">{record.nr || "-"}</TableCell>
              <TableCell className="text-xs py-2">{record.responsavel || "-"}</TableCell>
              <TableCell className="py-2" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-end gap-0.5">
                  <Button type="button" size="icon" variant="ghost" className="h-7 w-7" title="Editar" onClick={() => onOpenRecord(record.id, "form")}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button type="button" size="icon" variant="ghost" className="h-7 w-7" title="Histórico" onClick={() => onOpenRecord(record.id, "historico")}>
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  <Button type="button" size="icon" variant="ghost" className="h-7 w-7" title="Evidência" onClick={() => onOpenRecord(record.id, "evidencias")}>
                    <UploadCloud className="h-3.5 w-3.5" />
                  </Button>
                  <Button type="button" size="icon" variant="ghost" className="h-7 w-7" title="Duplicar" onClick={() => onDuplicate(record)}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-[hsl(var(--status-done-fg))]" title="Concluir" disabled={record.status === "CONCLUIDO"} onClick={() => onSetStatus(record, "CONCLUIDO")}>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
    <div className="flex items-center justify-between border-t border-border px-3 py-2 text-xs text-muted-foreground">
      <p>{records.length} de {totalRecords} • Pág. {Math.min(page, totalPages)}/{totalPages}</p>
      <div className="flex items-center gap-1.5">
        <Button type="button" size="sm" variant="outline" className="h-7 text-xs" disabled={loading || page <= 1} onClick={() => onPageChange(Math.max(1, page - 1))}>Anterior</Button>
        <Button type="button" size="sm" variant="outline" className="h-7 text-xs" disabled={loading || page >= totalPages} onClick={() => onPageChange(Math.min(totalPages, page + 1))}>Próxima</Button>
      </div>
    </div>
  </div>
);

export default SesmtRecordTable;
