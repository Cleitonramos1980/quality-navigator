import { useParams, Link } from "react-router-dom";
import { ArrowLeft, User, Building2, Phone, Mail, Car, MapPin, Clock, QrCode, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatusSemaphore from "@/components/operacional/StatusSemaphore";
import { mockVisitantes, mockVeiculosVisitantes } from "@/data/mockOperacionalData";
import { toast } from "@/hooks/use-toast";

const VisitanteDetalhePage = () => {
  const { id } = useParams();
  const visitante = mockVisitantes.find((v) => v.id === id) ?? mockVisitantes[0];
  const veiculo = visitante.veiculoId
    ? mockVeiculosVisitantes.find((v) => v.id === visitante.veiculoId)
    : null;

  const podeAprovar = ["CADASTRO_PREENCHIDO", "AGUARDANDO_VALIDACAO"].includes(visitante.status);
  const podeLiberarEntrada = ["APROVADO", "QR_GERADO"].includes(visitante.status);
  const podeRegistrarSaida = ["ENTRADA_REALIZADA", "VISITA_EM_ANDAMENTO"].includes(visitante.status);

  const handleAprovar = () => {
    toast({ title: "Visitante aprovado", description: `${visitante.nome} aprovado para visita.` });
  };

  const handleRejeitar = () => {
    toast({ title: "Visitante rejeitado", description: `A pré-autorização de ${visitante.nome} foi recusada.`, variant: "destructive" });
  };

  const handleLiberarEntrada = () => {
    toast({ title: "Entrada liberada", description: `Entrada de ${visitante.nome} registrada.` });
  };

  const handleRegistrarSaida = () => {
    toast({ title: "Saída registrada", description: `Saída de ${visitante.nome} registrada.` });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/visitantes"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{visitante.id}</h1>
            <StatusSemaphore status={visitante.status} />
          </div>
          <p className="text-sm text-muted-foreground">{visitante.nome} — {visitante.empresa}</p>
        </div>
        <div className="flex gap-2">
          {podeAprovar && (
            <>
              <Button size="sm" onClick={handleAprovar} className="gap-1.5">
                <CheckCircle className="h-4 w-4" /> Aprovar
              </Button>
              <Button size="sm" variant="destructive" onClick={handleRejeitar} className="gap-1.5">
                <XCircle className="h-4 w-4" /> Rejeitar
              </Button>
            </>
          )}
          {podeLiberarEntrada && (
            <Button size="sm" onClick={handleLiberarEntrada} className="gap-1.5">
              <CheckCircle className="h-4 w-4" /> Liberar Entrada
            </Button>
          )}
          {podeRegistrarSaida && (
            <Button size="sm" variant="secondary" onClick={handleRegistrarSaida} className="gap-1.5">
              <Clock className="h-4 w-4" /> Registrar Saída
            </Button>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4 text-primary" /> Dados Pessoais</CardTitle></CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div><dt className="text-muted-foreground">Nome</dt><dd className="font-medium text-foreground">{visitante.nome}</dd></div>
              <div><dt className="text-muted-foreground">Documento</dt><dd className="font-mono text-foreground">{visitante.documento}</dd></div>
              <div><dt className="text-muted-foreground flex items-center gap-1"><Building2 className="h-3 w-3" /> Empresa</dt><dd className="text-foreground">{visitante.empresa}</dd></div>
              <div><dt className="text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" /> Telefone</dt><dd className="text-foreground">{visitante.telefone}</dd></div>
              {visitante.email && (
                <div className="col-span-2"><dt className="text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" /> E-mail</dt><dd className="text-foreground">{visitante.email}</dd></div>
              )}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Visita</CardTitle></CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div><dt className="text-muted-foreground">Responsável Interno</dt><dd className="font-medium text-foreground">{visitante.responsavelInterno}</dd></div>
              <div><dt className="text-muted-foreground">Setor Destino</dt><dd className="text-foreground">{visitante.setorDestino}</dd></div>
              <div className="col-span-2"><dt className="text-muted-foreground">Motivo</dt><dd className="text-foreground">{visitante.motivoVisita}</dd></div>
              <div><dt className="text-muted-foreground">Data Prevista</dt><dd className="font-mono text-foreground">{visitante.dataVisitaPrevista}</dd></div>
              <div><dt className="text-muted-foreground">Última Visita</dt><dd className="font-mono text-foreground">{visitante.ultimaVisita || "Primeira visita"}</dd></div>
              <div><dt className="text-muted-foreground">Planta</dt><dd className="text-foreground">{visitante.planta}</dd></div>
              <div><dt className="text-muted-foreground">Criado por</dt><dd className="text-foreground">{visitante.criadoPor}</dd></div>
            </dl>
          </CardContent>
        </Card>
      </div>

      {veiculo && (
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Car className="h-4 w-4 text-primary" /> Veículo</CardTitle></CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3 text-sm">
              <div><dt className="text-muted-foreground">Placa</dt><dd className="font-mono font-bold text-foreground">{veiculo.placa}</dd></div>
              <div><dt className="text-muted-foreground">Modelo</dt><dd className="text-foreground">{veiculo.modelo}</dd></div>
              <div><dt className="text-muted-foreground">Tipo</dt><dd className="text-foreground">{veiculo.tipo}</dd></div>
              <div><dt className="text-muted-foreground">Cor</dt><dd className="text-foreground">{veiculo.cor}</dd></div>
              {veiculo.localVaga && (
                <div className="col-span-2"><dt className="text-muted-foreground">Local / Vaga</dt><dd className="text-foreground">{veiculo.localVaga}</dd></div>
              )}
              <div><dt className="text-muted-foreground">Status</dt><dd><StatusSemaphore status={veiculo.status} /></dd></div>
            </dl>
          </CardContent>
        </Card>
      )}

      {visitante.qrCodeUrl && (
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><QrCode className="h-4 w-4 text-primary" /> QR Code</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-4">
            <div className="h-32 w-32 rounded-lg border-2 border-dashed border-border bg-muted/30 flex items-center justify-center">
              <QrCode className="h-16 w-16 text-muted-foreground" />
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Código: <span className="font-mono text-foreground">{visitante.qrCodeUrl}</span></p>
              <p>Este QR Code pode ser apresentado na portaria para entrada rápida.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {visitante.linkPreenchimento && (
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">
              Link de preenchimento: <a href={visitante.linkPreenchimento} className="text-primary hover:underline font-mono text-xs">{visitante.linkPreenchimento}</a>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VisitanteDetalhePage;
