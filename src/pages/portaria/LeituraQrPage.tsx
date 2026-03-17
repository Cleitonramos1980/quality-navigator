import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, QrCode, Search, CheckCircle, XCircle, AlertTriangle, Clock, ShieldCheck, User, Building2, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatusSemaphore from "@/components/operacional/StatusSemaphore";
import { getAcessos, getVisitantes } from "@/services/operacional";
import type { Acesso, Visitante } from "@/types/operacional";
import { toast } from "@/hooks/use-toast";

type ResultadoStatus = "encontrado" | "expirado" | "utilizado" | "bloqueado" | null;

const LeituraQrPage = () => {
  const navigate = useNavigate();
  const [codigoManual, setCodigoManual] = useState("");
  const [resultado, setResultado] = useState<any>(null);
  const [resultadoStatus, setResultadoStatus] = useState<ResultadoStatus>(null);
  const [scanning, setScanning] = useState(false);
  const [allAcessos, setAllAcessos] = useState<Acesso[]>([]);
  const [allVisitantes, setAllVisitantes] = useState<Visitante[]>([]);

  useEffect(() => {
    getAcessos().then(setAllAcessos);
    getVisitantes().then(setAllVisitantes);
  }, []);

  const buscarPorCodigo = () => {
    const q = codigoManual.trim().toUpperCase();
    if (!q) return;

    const acesso = allAcessos.find((a) => a.id === q || a.qrCode === q);
    const visitante = allVisitantes.find((v) => v.id === q || v.qrCodeUrl === q);

    if (acesso) {
      if (acesso.status === "EXPIRADO") {
        setResultado({ tipo: "ACESSO", dados: acesso });
        setResultadoStatus("expirado");
      } else if (acesso.status === "RECUSADO") {
        setResultado({ tipo: "ACESSO", dados: acesso });
        setResultadoStatus("bloqueado");
      } else if (acesso.status === "ENCERRADO") {
        setResultado({ tipo: "ACESSO", dados: acesso });
        setResultadoStatus("utilizado");
      } else {
        setResultado({ tipo: "ACESSO", dados: acesso });
        setResultadoStatus("encontrado");
      }
    } else if (visitante) {
      if (visitante.status === "EXPIRADO") {
        setResultado({ tipo: "VISITANTE", dados: visitante });
        setResultadoStatus("expirado");
      } else if (visitante.status === "REJEITADO") {
        setResultado({ tipo: "VISITANTE", dados: visitante });
        setResultadoStatus("bloqueado");
      } else if (["SAIDA_REALIZADA", "ENCERRADO"].includes(visitante.status)) {
        setResultado({ tipo: "VISITANTE", dados: visitante });
        setResultadoStatus("utilizado");
      } else {
        setResultado({ tipo: "VISITANTE", dados: visitante });
        setResultadoStatus("encontrado");
      }
    } else {
      setResultado(null);
      setResultadoStatus(null);
      toast({ title: "Não encontrado", description: `Nenhum registro para o código "${q}".`, variant: "destructive" });
    }
  };

  const handleLiberar = () => {
    toast({ title: "Entrada liberada", description: `Acesso liberado para ${resultado?.dados?.nome}.` });
    setResultado(null);
    setResultadoStatus(null);
    setCodigoManual("");
  };

  const novaLeitura = () => {
    setResultado(null);
    setResultadoStatus(null);
    setCodigoManual("");
  };

  const simulateScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      if (allAcessos.length > 0) {
        const random = allAcessos[Math.floor(Math.random() * allAcessos.length)];
        setCodigoManual(random.id);
        setResultado({ tipo: "ACESSO", dados: random });
        setResultadoStatus("encontrado");
      }
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/portaria")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Leitura de QR Code</h1>
          <p className="text-sm text-muted-foreground">Escaneie ou digite o código para identificar o visitante</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <QrCode className="h-5 w-5 text-primary" /> Área de Leitura
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className={`aspect-video rounded-lg border-2 ${scanning ? "border-primary animate-pulse" : "border-dashed border-border"} bg-muted/30 flex items-center justify-center cursor-pointer transition-all`}
            onClick={simulateScan}
          >
            <div className="text-center space-y-2">
              {scanning ? (
                <>
                  <div className="relative mx-auto w-24 h-24">
                    <QrCode className="h-24 w-24 text-primary animate-pulse" />
                    <div className="absolute inset-0 border-2 border-primary rounded-lg animate-ping opacity-30" />
                  </div>
                  <p className="text-sm font-medium text-primary">Escaneando...</p>
                  <p className="text-xs text-muted-foreground">Posicione o QR Code na área de captura</p>
                </>
              ) : (
                <>
                  <QrCode className="h-16 w-16 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">Câmera de leitura QR</p>
                  <p className="text-xs text-primary cursor-pointer hover:underline">Clique para simular leitura</p>
                </>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Input
              value={codigoManual}
              onChange={(e) => setCodigoManual(e.target.value)}
              placeholder="Ou digite o código manualmente..."
              onKeyDown={(e) => e.key === "Enter" && buscarPorCodigo()}
            />
            <Button onClick={buscarPorCodigo} className="gap-1.5">
              <Search className="h-4 w-4" /> Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultado: Encontrado */}
      {resultado && resultadoStatus === "encontrado" && (
        <Card className="border-success/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-success" /> Identificação Confirmada — {resultado.tipo}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div><dt className="text-muted-foreground">Nome</dt><dd className="font-medium text-foreground">{resultado.dados.nome}</dd></div>
              <div><dt className="text-muted-foreground">Documento</dt><dd className="font-mono text-foreground">{resultado.dados.documento}</dd></div>
              <div><dt className="text-muted-foreground">Empresa</dt><dd className="text-foreground">{resultado.dados.empresa}</dd></div>
              <div><dt className="text-muted-foreground">Status</dt><dd><StatusSemaphore status={resultado.dados.status} /></dd></div>
            </dl>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleLiberar} className="gap-1.5 bg-success hover:bg-success/90">
                <CheckCircle className="h-4 w-4" /> Liberar Entrada
              </Button>
              <Button variant="outline" asChild>
                <Link to={resultado.tipo === "ACESSO" ? `/portaria/${resultado.dados.id}` : `/visitantes/${resultado.dados.id}`}>
                  Ver Detalhe
                </Link>
              </Button>
              <Button variant="ghost" onClick={novaLeitura}>Nova Leitura</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resultado: Expirado */}
      {resultado && resultadoStatus === "expirado" && (
        <Card className="border-warning/30">
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center"><Clock className="h-6 w-6 text-warning" /></div>
              <div>
                <h3 className="font-semibold text-foreground">QR Code Expirado</h3>
                <p className="text-sm text-muted-foreground">A pré-autorização de <strong>{resultado.dados.nome}</strong> expirou.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={novaLeitura}>Nova Leitura</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resultado: Já utilizado */}
      {resultado && resultadoStatus === "utilizado" && (
        <Card className="border-primary/30">
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center"><CheckCircle className="h-6 w-6 text-primary" /></div>
              <div>
                <h3 className="font-semibold text-foreground">Acesso Já Utilizado</h3>
                <p className="text-sm text-muted-foreground">O registro de <strong>{resultado.dados.nome}</strong> já foi encerrado.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={novaLeitura}>Nova Leitura</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resultado: Bloqueado */}
      {resultado && resultadoStatus === "bloqueado" && (
        <Card className="border-destructive/30">
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center"><Ban className="h-6 w-6 text-destructive" /></div>
              <div>
                <h3 className="font-semibold text-destructive">Acesso Bloqueado / Recusado</h3>
                <p className="text-sm text-muted-foreground">O acesso de <strong>{resultado.dados.nome}</strong> foi recusado ou bloqueado.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={novaLeitura}>Nova Leitura</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LeituraQrPage;
