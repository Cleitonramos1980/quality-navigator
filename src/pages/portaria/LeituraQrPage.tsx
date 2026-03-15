import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, QrCode, Search, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatusSemaphore from "@/components/operacional/StatusSemaphore";
import { mockAcessos, mockVisitantes } from "@/data/mockOperacionalData";
import { toast } from "@/hooks/use-toast";

const LeituraQrPage = () => {
  const navigate = useNavigate();
  const [codigoManual, setCodigoManual] = useState("");
  const [resultado, setResultado] = useState<any>(null);

  const buscarPorCodigo = () => {
    const q = codigoManual.trim().toUpperCase();
    const acesso = mockAcessos.find((a) => a.id === q || a.qrCode === q);
    const visitante = mockVisitantes.find((v) => v.id === q || v.qrCodeUrl === q);

    if (acesso) {
      setResultado({ tipo: "ACESSO", dados: acesso });
    } else if (visitante) {
      setResultado({ tipo: "VISITANTE", dados: visitante });
    } else {
      setResultado(null);
      toast({ title: "Não encontrado", description: `Nenhum registro para "${q}".`, variant: "destructive" });
    }
  };

  const handleLiberar = () => {
    toast({ title: "Entrada liberada", description: `Acesso liberado para ${resultado?.dados?.nome}.` });
    setResultado(null);
    setCodigoManual("");
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
          <div className="aspect-video rounded-lg border-2 border-dashed border-border bg-muted/30 flex items-center justify-center">
            <div className="text-center space-y-2">
              <QrCode className="h-16 w-16 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">Câmera de leitura QR</p>
              <p className="text-xs text-muted-foreground">Aguardando integração com dispositivo de captura</p>
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

      {resultado && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resultado — {resultado.tipo}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div>
                <dt className="text-muted-foreground">Nome</dt>
                <dd className="font-medium text-foreground">{resultado.dados.nome}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Documento</dt>
                <dd className="font-mono text-foreground">{resultado.dados.documento}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Empresa</dt>
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
              <Button variant="outline" onClick={() => { setResultado(null); setCodigoManual(""); }}>
                Nova Leitura
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LeituraQrPage;
