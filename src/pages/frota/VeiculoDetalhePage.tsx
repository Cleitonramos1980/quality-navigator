import { useParams, useNavigate } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import { ArrowLeft, Truck, MapPin, Clock, AlertTriangle, Wrench, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatusSemaphore from "@/components/operacional/StatusSemaphore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getVeiculosFrota, getDeslocamentos, getDocas, getMovimentacoesFrota } from "@/services/operacional";
import type { VeiculoFrota, DeslocamentoFrota, Doca } from "@/types/operacional";
import type { MovimentacaoFrota } from "@/services/operacional";

const VeiculoDetalhePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [allFrota, setAllFrota] = useState<VeiculoFrota[]>([]);
  const [allDeslocamentos, setAllDeslocamentos] = useState<DeslocamentoFrota[]>([]);
  const [allDocas, setAllDocas] = useState<Doca[]>([]);
  const [allMovimentacoes, setAllMovimentacoes] = useState<MovimentacaoFrota[]>([]);

  useEffect(() => {
    getVeiculosFrota().then(setAllFrota);
    getDeslocamentos().then(setAllDeslocamentos);
    getDocas().then(setAllDocas);
    getMovimentacoesFrota().then(setAllMovimentacoes);
  }, []);

  const veiculo = useMemo(() => allFrota.find((v) => v.id === id), [id, allFrota]);
  const deslocamentos = useMemo(() => allDeslocamentos.filter((d) => d.veiculoId === id), [id, allDeslocamentos]);
  const movimentacoes = useMemo(() => allMovimentacoes.filter((m) => m.veiculoId === id), [id, allMovimentacoes]);

  const docaAtual = useMemo(() => {
    if (!veiculo) return null;
    return mockDocas.find((d) => d.placaAtual === veiculo.placa) || null;
  }, [veiculo]);

  if (!veiculo) {
    return (
      <div className="space-y-4 animate-fade-in">
        <Button variant="ghost" onClick={() => navigate("/frota")}><ArrowLeft className="h-4 w-4 mr-2" />Voltar</Button>
        <p className="text-muted-foreground">Veículo não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/frota")}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{veiculo.placa} — {veiculo.modelo}</h1>
          <p className="text-sm text-muted-foreground">{veiculo.tipo} • {veiculo.setor} • {veiculo.ano}</p>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="glass-card rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Status</p>
          <StatusSemaphore status={veiculo.status} />
        </div>
        <div className="glass-card rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Motorista</p>
          <p className="font-medium text-foreground text-sm">{veiculo.motoristaResponsavel}</p>
        </div>
        <div className="glass-card rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Quilometragem</p>
          <p className="font-medium text-foreground text-sm">{veiculo.quilometragem.toLocaleString("pt-BR")} km</p>
        </div>
        <div className="glass-card rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Localização</p>
          <p className="font-medium text-foreground text-sm flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            {docaAtual ? docaAtual.nome : veiculo.status === "EM_DESLOCAMENTO" ? "Em rota" : "Garagem"}
          </p>
        </div>
        <div className="glass-card rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Doca Vinculada</p>
          <p className="font-medium text-foreground text-sm">{docaAtual ? docaAtual.nome : "—"}</p>
        </div>
      </div>

      {/* Alertas */}
      {veiculo.alertas.length > 0 && (
        <div className="glass-card rounded-lg p-4 border-warning/30 border">
          <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" /> Alertas
          </h3>
          <ul className="space-y-1">
            {veiculo.alertas.map((a, i) => (
              <li key={i} className="text-sm text-warning">{a}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Timeline de Movimentações */}
      <div className="glass-card rounded-lg p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Clock className="h-4 w-4" /> Histórico de Movimentações
        </h3>
        <div className="relative border-l-2 border-border ml-3 pl-6 space-y-6">
          {movimentacoes.map((mov) => (
            <div key={mov.id} className="relative">
              <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-primary bg-background" />
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <StatusSemaphore status={mov.statusNovo} />
                  <span className="text-xs text-muted-foreground">{new Date(mov.dataHora).toLocaleString("pt-BR")}</span>
                </div>
                <p className="text-sm text-foreground">{mov.descricao}</p>
                {mov.docaNome && <p className="text-xs text-primary">Doca: {mov.docaNome}</p>}
                <p className="text-xs text-muted-foreground">Por: {mov.usuario}</p>
              </div>
            </div>
          ))}
          {movimentacoes.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma movimentação registrada.</p>}
        </div>
      </div>

      {/* Deslocamentos */}
      {deslocamentos.length > 0 && (
        <div className="glass-card rounded-lg p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Truck className="h-4 w-4" /> Deslocamentos
          </h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Origem</TableHead>
                <TableHead>Destino</TableHead>
                <TableHead>Saída</TableHead>
                <TableHead>Previsão</TableHead>
                <TableHead>Chegada</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deslocamentos.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>{d.origem}</TableCell>
                  <TableCell>{d.destino}</TableCell>
                  <TableCell className="text-xs">{new Date(d.horarioSaida).toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</TableCell>
                  <TableCell className="text-xs">{new Date(d.horarioPrevistoChegada).toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</TableCell>
                  <TableCell className="text-xs">{d.horarioRealChegada ? new Date(d.horarioRealChegada).toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "—"}</TableCell>
                  <TableCell><StatusSemaphore status={d.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default VeiculoDetalhePage;
