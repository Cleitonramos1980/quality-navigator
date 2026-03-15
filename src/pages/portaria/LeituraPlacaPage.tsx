import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Search, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatusSemaphore from "@/components/operacional/StatusSemaphore";
import { mockAcessos, mockVeiculosVisitantes, mockFrota, mockVeiculosTerceiros } from "@/data/mockOperacionalData";
import { toast } from "@/hooks/use-toast";

const LeituraPlacaPage = () => {
  const navigate = useNavigate();
  const [placa, setPlaca] = useState("");
  const [resultado, setResultado] = useState<any>(null);

  const buscarPlaca = () => {
    const q = placa.trim().toUpperCase();
    if (!q) return;

    const acesso = mockAcessos.find((a) => a.placa?.toUpperCase() === q);
    const veiculoVisitante = mockVeiculosVisitantes.find((v) => v.placa.toUpperCase() === q);
    const veiculoFrota = mockFrota.find((v) => v.placa.toUpperCase() === q);
    const veiculoTerceiro = mockVeiculosTerceiros.find((v) => v.placa.toUpperCase() === q);

    if (acesso) {
      setResultado({ tipo: "ACESSO", dados: { nome: acesso.nome, empresa: acesso.empresa, documento: acesso.documento, placa: acesso.placa, status: acesso.status, tipoVeiculo: acesso.tipoVeiculo } });
    } else if (veiculoVisitante) {
      setResultado({ tipo: "VISITANTE", dados: { nome: veiculoVisitante.visitanteNome, empresa: veiculoVisitante.empresaOrigem, placa: veiculoVisitante.placa, status: veiculoVisitante.status, tipoVeiculo: `${veiculoVisitante.tipo} - ${veiculoVisitante.modelo}` } });
    } else if (veiculoFrota) {
      setResultado({ tipo: "FROTA", dados: { nome: veiculoFrota.motoristaResponsavel, empresa: `Setor: ${veiculoFrota.setor}`, placa: veiculoFrota.placa, status: veiculoFrota.status, tipoVeiculo: `${veiculoFrota.tipo} - ${veiculoFrota.modelo}` } });
    } else if (veiculoTerceiro) {
      setResultado({ tipo: "TERCEIRO", dados: { nome: veiculoTerceiro.motoristaNome, empresa: veiculoTerceiro.transportadoraNome, placa: veiculoTerceiro.placa, status: veiculoTerceiro.statusOperacao, tipoVeiculo: veiculoTerceiro.tipo } });
    } else {
      setResultado(null);
      toast({ title: "Placa não encontrada", description: `Nenhum veículo com placa "${q}" nos registros.`, variant: "destructive" });
    }
  };

  const handleLiberar = () => {
    toast({ title: "Entrada liberada", description: `Veículo ${resultado?.dados?.placa} liberado.` });
    setResultado(null);
    setPlaca("");
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/portaria")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Leitura de Placa</h1>
          <p className="text-sm text-muted-foreground">Identifique veículos pela placa para controle de acesso</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Camera className="h-5 w-5 text-primary" /> Captura de Placa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="aspect-video rounded-lg border-2 border-dashed border-border bg-muted/30 flex items-center justify-center">
            <div className="text-center space-y-2">
              <Camera className="h-16 w-16 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">Câmera de leitura de placa (LPR/ALPR)</p>
              <p className="text-xs text-muted-foreground">Aguardando integração com dispositivo de captura</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Input
              value={placa}
              onChange={(e) => setPlaca(e.target.value)}
              placeholder="Digite a placa (ex: ABC-1D23)..."
              onKeyDown={(e) => e.key === "Enter" && buscarPlaca()}
            />
            <Button onClick={buscarPlaca} className="gap-1.5">
              <Search className="h-4 w-4" /> Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {resultado && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Veículo Identificado — {resultado.tipo}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div>
                <dt className="text-muted-foreground">Placa</dt>
                <dd className="font-mono font-bold text-foreground">{resultado.dados.placa}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Tipo</dt>
                <dd className="text-foreground">{resultado.dados.tipoVeiculo || "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Condutor/Responsável</dt>
                <dd className="font-medium text-foreground">{resultado.dados.nome}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Empresa/Setor</dt>
                <dd className="text-foreground">{resultado.dados.empresa}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Status</dt>
                <dd><StatusSemaphore status={resultado.dados.status} /></dd>
              </div>
            </dl>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleLiberar} className="gap-1.5">
                <CheckCircle className="h-4 w-4" /> Liberar Entrada
              </Button>
              <Button variant="outline" onClick={() => { setResultado(null); setPlaca(""); }}>
                Nova Leitura
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LeituraPlacaPage;
