import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Camera, Search, CheckCircle, XCircle, AlertTriangle, Shield, Truck, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatusSemaphore from "@/components/operacional/StatusSemaphore";
import { getAcessos, getVeiculosVisitantes, getVeiculosFrota, getVeiculosTerceiros } from "@/services/operacional";
import type { Acesso, VeiculoVisitante, VeiculoFrota, VeiculoTerceiro } from "@/types/operacional";
import { toast } from "@/hooks/use-toast";

type DecisaoGate = "ALLOWLIST" | "BLOCKLIST" | "DESCONHECIDO" | null;

const LeituraPlacaPage = () => {
  const navigate = useNavigate();
  const [placa, setPlaca] = useState("");
  const [resultado, setResultado] = useState<any>(null);
  const [decisao, setDecisao] = useState<DecisaoGate>(null);
  const [scanning, setScanning] = useState(false);
  const [allAcessos, setAllAcessos] = useState<Acesso[]>([]);
  const [allVeiculosVisitantes, setAllVeiculosVisitantes] = useState<VeiculoVisitante[]>([]);
  const [allFrota, setAllFrota] = useState<VeiculoFrota[]>([]);
  const [allVeiculosTerceiros, setAllVeiculosTerceiros] = useState<VeiculoTerceiro[]>([]);

  useEffect(() => {
    getAcessos().then(setAllAcessos);
    getVeiculosVisitantes().then(setAllVeiculosVisitantes);
    getVeiculosFrota().then(setAllFrota);
    getVeiculosTerceiros().then(setAllVeiculosTerceiros);
  }, []);

  const buscarPlaca = () => {
    const q = placa.trim().toUpperCase();
    if (!q) return;

    const acesso = allAcessos.find((a) => a.placa?.toUpperCase() === q);
    const veiculoVisitante = allVeiculosVisitantes.find((v) => v.placa.toUpperCase() === q);
    const veiculoFrota = allFrota.find((v) => v.placa.toUpperCase() === q);
    const veiculoTerceiro = allVeiculosTerceiros.find((v) => v.placa.toUpperCase() === q);

    if (veiculoFrota) {
      setResultado({ tipo: "FROTA", dados: { nome: veiculoFrota.motoristaResponsavel, empresa: `Setor: ${veiculoFrota.setor}`, placa: veiculoFrota.placa, status: veiculoFrota.status, tipoVeiculo: `${veiculoFrota.tipo} — ${veiculoFrota.modelo}`, id: veiculoFrota.id } });
      setDecisao("ALLOWLIST");
    } else if (acesso) {
      const blocked = ["RECUSADO", "EXPIRADO"].includes(acesso.status);
      setResultado({ tipo: "ACESSO", dados: { nome: acesso.nome, empresa: acesso.empresa, documento: acesso.documento, placa: acesso.placa, status: acesso.status, tipoVeiculo: acesso.tipoVeiculo, id: acesso.id } });
      setDecisao(blocked ? "BLOCKLIST" : "ALLOWLIST");
    } else if (veiculoVisitante) {
      setResultado({ tipo: "VISITANTE", dados: { nome: veiculoVisitante.visitanteNome, empresa: veiculoVisitante.empresaOrigem, placa: veiculoVisitante.placa, status: veiculoVisitante.status, tipoVeiculo: `${veiculoVisitante.tipo} — ${veiculoVisitante.modelo}`, id: veiculoVisitante.id } });
      setDecisao("ALLOWLIST");
    } else if (veiculoTerceiro) {
      setResultado({ tipo: "TERCEIRO", dados: { nome: veiculoTerceiro.motoristaNome, empresa: veiculoTerceiro.transportadoraNome, placa: veiculoTerceiro.placa, status: veiculoTerceiro.statusOperacao, tipoVeiculo: veiculoTerceiro.tipo, id: veiculoTerceiro.id } });
      setDecisao("ALLOWLIST");
    } else {
      setResultado({ tipo: "DESCONHECIDO", dados: { placa: q } });
      setDecisao("DESCONHECIDO");
    }
  };

  const handleLiberar = () => {
    toast({ title: "Entrada liberada", description: `Veículo ${resultado?.dados?.placa} liberado.` });
    novaLeitura();
  };

  const novaLeitura = () => {
    setResultado(null);
    setDecisao(null);
    setPlaca("");
  };

  const simulateScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      const allPlates = [
        ...allFrota.map(v => v.placa),
        ...allVeiculosTerceiros.map(v => v.placa),
        ...allVeiculosVisitantes.map(v => v.placa),
      ];
      if (allPlates.length > 0) {
        const randomPlate = allPlates[Math.floor(Math.random() * allPlates.length)];
        setPlaca(randomPlate);
      }
    }, 2500);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/portaria")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gate Assistido — Leitura de Placa</h1>
          <p className="text-sm text-muted-foreground">Reconhecimento ALPR com decisão operacional automática</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Camera className="h-5 w-5 text-primary" /> Captura de Placa (LPR/ALPR)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className={`aspect-video rounded-lg border-2 ${scanning ? "border-primary" : "border-dashed border-border"} bg-foreground/5 flex items-center justify-center cursor-pointer transition-all relative overflow-hidden`}
            onClick={simulateScan}
          >
            {scanning ? (
              <div className="text-center space-y-2 z-10">
                <div className="relative mx-auto">
                  <Camera className="h-16 w-16 text-primary" />
                  <div className="absolute -inset-4 border border-primary/40 rounded-lg animate-pulse" />
                </div>
                <p className="text-sm font-medium text-primary">Capturando imagem...</p>
                <div className="w-48 mx-auto h-1 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-primary rounded-full animate-[pulse_1.5s_ease-in-out_infinite]" style={{ width: "70%" }} />
                </div>
              </div>
            ) : (
              <div className="text-center space-y-2">
                <Camera className="h-16 w-16 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">Câmera de reconhecimento de placa (LPR/ALPR)</p>
                <p className="text-xs text-primary cursor-pointer hover:underline">Clique para simular captura</p>
              </div>
            )}
            {/* Overlay lines */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/3 left-1/4 right-1/4 h-px bg-primary/20" />
              <div className="absolute bottom-1/3 left-1/4 right-1/4 h-px bg-primary/20" />
            </div>
          </div>

          <div className="flex gap-2">
            <Input
              value={placa}
              onChange={(e) => setPlaca(e.target.value.toUpperCase())}
              placeholder="Digite a placa (ex: ABC-1D23)..."
              onKeyDown={(e) => e.key === "Enter" && buscarPlaca()}
              className="font-mono text-lg tracking-wider"
            />
            <Button onClick={buscarPlaca} className="gap-1.5">
              <Search className="h-4 w-4" /> Consultar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultado: Allowlist */}
      {resultado && decisao === "ALLOWLIST" && (
        <Card className="border-success/30">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center"><CheckCircle className="h-5 w-5 text-success" /></div>
              <div>
                <CardTitle className="text-base">Veículo Autorizado — {resultado.tipo}</CardTitle>
                <p className="text-xs text-success font-medium">Placa presente na allowlist</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div><dt className="text-muted-foreground">Placa</dt><dd className="font-mono font-bold text-foreground text-lg">{resultado.dados.placa}</dd></div>
              <div><dt className="text-muted-foreground">Tipo</dt><dd className="text-foreground">{resultado.dados.tipoVeiculo || "—"}</dd></div>
              <div><dt className="text-muted-foreground">Condutor/Responsável</dt><dd className="font-medium text-foreground">{resultado.dados.nome}</dd></div>
              <div><dt className="text-muted-foreground">Empresa/Setor</dt><dd className="text-foreground">{resultado.dados.empresa}</dd></div>
              <div><dt className="text-muted-foreground">Status</dt><dd><StatusSemaphore status={resultado.dados.status} /></dd></div>
            </dl>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleLiberar} className="gap-1.5 bg-success hover:bg-success/90">
                <CheckCircle className="h-4 w-4" /> Liberar Entrada
              </Button>
              <Button variant="outline" onClick={novaLeitura}>Nova Leitura</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resultado: Blocklist */}
      {resultado && decisao === "BLOCKLIST" && (
        <Card className="border-destructive/30">
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center"><Ban className="h-6 w-6 text-destructive" /></div>
              <div>
                <h3 className="font-semibold text-destructive">Veículo Bloqueado</h3>
                <p className="text-sm text-muted-foreground">A placa <strong className="font-mono">{resultado.dados.placa}</strong> está na blocklist. Acesso negado.</p>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div><dt className="text-muted-foreground">Condutor</dt><dd className="text-foreground">{resultado.dados.nome}</dd></div>
              <div><dt className="text-muted-foreground">Empresa</dt><dd className="text-foreground">{resultado.dados.empresa}</dd></div>
              <div><dt className="text-muted-foreground">Status</dt><dd><StatusSemaphore status={resultado.dados.status} /></dd></div>
            </dl>
            <div className="flex gap-2">
              <Button variant="outline" onClick={novaLeitura}>Nova Leitura</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resultado: Desconhecido */}
      {resultado && decisao === "DESCONHECIDO" && (
        <Card className="border-warning/30">
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center"><AlertTriangle className="h-6 w-6 text-warning" /></div>
              <div>
                <h3 className="font-semibold text-warning">Placa Não Cadastrada</h3>
                <p className="text-sm text-muted-foreground">A placa <strong className="font-mono">{resultado.dados.placa}</strong> não foi encontrada nos registros.</p>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-muted/20 p-3">
              <p className="text-xs text-muted-foreground">Ações recomendadas:</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                <li>• Verificar se há erro de digitação na placa</li>
                <li>• Confirmar se o veículo possui autorização válida</li>
                <li>• Registrar um novo acesso manual se necessário</li>
              </ul>
            </div>
            <div className="flex gap-2">
              <Button asChild><Link to="/portaria/novo">Novo Acesso Manual</Link></Button>
              <Button variant="outline" onClick={novaLeitura}>Nova Leitura</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Histórico rápido */}
      <div className="glass-card rounded-lg p-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Últimas Leituras</h3>
        <p className="text-xs text-muted-foreground">O histórico de leituras estará disponível após integração com o dispositivo ALPR.</p>
      </div>
    </div>
  );
};

export default LeituraPlacaPage;
