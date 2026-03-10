import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";
import { MaterialERP } from "@/types/sacRequisicao";
import { buscarMateriais } from "@/services/sacRequisicoes";
import { useToast } from "@/hooks/use-toast";

interface MaterialPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (material: MaterialERP) => void;
}

const MaterialPickerModal = ({ open, onOpenChange, onSelect }: MaterialPickerModalProps) => {
  const { toast } = useToast();
  const [filtro, setFiltro] = useState({ codigo: "", descricao: "" });
  const [results, setResults] = useState<MaterialERP[]>([]);

  const handleSearch = async () => {
    try {
      const r = await buscarMateriais(filtro);
      setResults(r);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao buscar materiais.";
      setResults([]);
      toast({ title: "Erro na busca", description: message, variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Buscar Material</DialogTitle>
          <DialogDescription>Pesquise materiais disponíveis no estoque</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <Input placeholder="Código" value={filtro.codigo} onChange={(e) => setFiltro((p) => ({ ...p, codigo: e.target.value }))} />
          <Input placeholder="Descrição" value={filtro.descricao} onChange={(e) => setFiltro((p) => ({ ...p, descricao: e.target.value }))} />
        </div>
        <Button onClick={handleSearch} className="w-full"><Search className="w-4 h-4 mr-1" /> Pesquisar</Button>
        {results.length > 0 && (
          <div className="border rounded-lg overflow-hidden max-h-64 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>CÓDIGO</TableHead>
                  <TableHead>DESCRIÇÃO</TableHead>
                  <TableHead>UN</TableHead>
                  <TableHead>CATEGORIA</TableHead>
                  <TableHead className="text-right">ESTOQUE</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((m) => (
                  <TableRow key={m.codmat} className="cursor-pointer hover:bg-muted/30" onClick={() => { onSelect(m); onOpenChange(false); }}>
                    <TableCell className="font-mono text-xs">{m.codmat}</TableCell>
                    <TableCell>{m.descricao}</TableCell>
                    <TableCell>{m.un}</TableCell>
                    <TableCell>{m.categoria}</TableCell>
                    <TableCell className="text-right">{m.estoqueDisponivel}</TableCell>
                    <TableCell><Button size="sm" variant="ghost">Selecionar</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MaterialPickerModal;


