import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import StatusBadge from "@/components/StatusBadge";
import { getNCs } from "@/services/nc";
import type { NCRegistro } from "@/types/sgq";
import { evaluateSlaFromDueDate } from "@/lib/sla";
import SLABadge from "@/components/common/SLABadge";
import { useUxMetrics } from "@/hooks/useUxMetrics";

const NCPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [ncs, setNcs] = useState<NCRegistro[]>([]);
  const [selectedNC, setSelectedNC] = useState<NCRegistro | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { trackAction } = useUxMetrics("NC_LISTA");

  useEffect(() => {
    getNCs().then(setNcs);
  }, []);

  const filtered = ncs.filter(
    (nc) =>
      nc.descricao.toLowerCase().includes(search.toLowerCase()) ||
      nc.id.toLowerCase().includes(search.toLowerCase()) ||
      nc.responsavel.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Não Conformidades</h1>
          <p className="text-sm text-muted-foreground mt-1">Registro e acompanhamento de não conformidades</p>
        </div>
        <Button className="gap-2" onClick={() => navigate("/nao-conformidades/nova")}>
          <Plus className="w-4 h-4" />
          Nova NC
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button variant="outline" size="icon"><Filter className="w-4 h-4" /></Button>
      </div>

      <div className="glass-card rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">ID</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Descrição</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tipo</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Gravidade</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Planta</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Responsável</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">SLA</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Prazo</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((nc) => (
                <tr
                  key={nc.id}
                  className="border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => {
                    trackAction("OPEN_NC_DETAIL", { id: nc.id });
                    setSelectedNC(nc);
                    setDetailsOpen(true);
                  }}
                >
                  <td className="px-4 py-3 font-mono text-xs font-medium text-primary">{nc.id}</td>
                  <td className="px-4 py-3 max-w-xs truncate">{nc.descricao}</td>
                  <td className="px-4 py-3 text-xs">{nc.tipoNc}</td>
                  <td className="px-4 py-3"><StatusBadge status={nc.gravidade} /></td>
                  <td className="px-4 py-3 font-mono text-xs">{nc.planta}</td>
                  <td className="px-4 py-3">{nc.responsavel}</td>
                  <td className="px-4 py-3"><StatusBadge status={nc.status} /></td>
                  <td className="px-4 py-3"><SLABadge evaluation={evaluateSlaFromDueDate(nc.prazo)} /></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{nc.prazo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Não Conformidade</DialogTitle>
          </DialogHeader>

          {selectedNC ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">ID</p>
                <p className="font-mono font-medium text-primary">{selectedNC.id}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <StatusBadge status={selectedNC.status} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tipo</p>
                <p>{selectedNC.tipoNc}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Gravidade</p>
                <StatusBadge status={selectedNC.gravidade} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Planta</p>
                <p className="font-mono">{selectedNC.planta}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Responsável</p>
                <p>{selectedNC.responsavel}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Prazo</p>
                <p>{selectedNC.prazo}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Motivo</p>
                <p>{selectedNC.motivoId}</p>
              </div>
              {selectedNC.clienteNome && (
                <div>
                  <p className="text-xs text-muted-foreground">Cliente</p>
                  <p>{selectedNC.clienteNome}</p>
                </div>
              )}
              {selectedNC.codcli && (
                <div>
                  <p className="text-xs text-muted-foreground">CODCLI</p>
                  <p className="font-mono">{selectedNC.codcli}</p>
                </div>
              )}
              {selectedNC.numPedido && (
                <div>
                  <p className="text-xs text-muted-foreground">Pedido</p>
                  <p className="font-mono">{selectedNC.numPedido}</p>
                </div>
              )}
              {selectedNC.numNf && (
                <div>
                  <p className="text-xs text-muted-foreground">NF</p>
                  <p className="font-mono">{selectedNC.numNf}</p>
                </div>
              )}
              {selectedNC.codprod && (
                <div>
                  <p className="text-xs text-muted-foreground">CODPROD</p>
                  <p className="font-mono">{selectedNC.codprod}</p>
                </div>
              )}
              <div className="sm:col-span-2">
                <p className="text-xs text-muted-foreground">Descrição</p>
                <p className="whitespace-pre-wrap">{selectedNC.descricao}</p>
              </div>
              {selectedNC.causaRaiz && (
                <div className="sm:col-span-2">
                  <p className="text-xs text-muted-foreground">Causa Raiz</p>
                  <p className="whitespace-pre-wrap">{selectedNC.causaRaiz}</p>
                </div>
              )}
              {selectedNC.planoAcao && (
                <div className="sm:col-span-2">
                  <p className="text-xs text-muted-foreground">Plano de Ação</p>
                  <p className="whitespace-pre-wrap">{selectedNC.planoAcao}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma NC selecionada.</p>
          )}

          <div className="flex justify-end pt-2">
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NCPage;


