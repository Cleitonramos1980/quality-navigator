import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import { ItemRequisicao } from "@/types/sacRequisicao";

interface RequisicaoItensTableProps {
  itens: ItemRequisicao[];
  onRemove?: (idx: number) => void;
  onChangeQtd?: (idx: number, qtd: number) => void;
  onChangeObs?: (idx: number, obs: string) => void;
  readOnly?: boolean;
}

const RequisicaoItensTable = ({ itens, onRemove, onChangeQtd, onChangeObs, readOnly }: RequisicaoItensTableProps) => {
  if (itens.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-6">Nenhum item adicionado</p>;
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40">
            <TableHead>CODMAT</TableHead>
            <TableHead>DESCRIÇÃO</TableHead>
            <TableHead>UN</TableHead>
            <TableHead className="text-right">QTD</TableHead>
            <TableHead>OBSERVAÇÃO</TableHead>
            {!readOnly && <TableHead className="w-10"></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {itens.map((item, idx) => (
            <TableRow key={idx}>
              <TableCell className="font-mono text-xs">{item.codmat}</TableCell>
              <TableCell>{item.descricaoMaterial}</TableCell>
              <TableCell>{item.un}</TableCell>
              <TableCell className="text-right">
                {readOnly ? (
                  item.qtdSolicitada
                ) : (
                  <Input
                    type="number"
                    min={1}
                    value={item.qtdSolicitada}
                    onChange={(e) => onChangeQtd?.(idx, parseInt(e.target.value) || 1)}
                    className="w-20 text-right ml-auto"
                  />
                )}
              </TableCell>
              <TableCell>
                {readOnly ? (
                  item.observacao || "—"
                ) : (
                  <Input
                    value={item.observacao || ""}
                    onChange={(e) => onChangeObs?.(idx, e.target.value)}
                    placeholder="Opcional"
                    className="min-w-[120px]"
                  />
                )}
              </TableCell>
              {!readOnly && (
                <TableCell>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onRemove?.(idx)}>
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RequisicaoItensTable;


