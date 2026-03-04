import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatusBadge from "@/components/StatusBadge";
import AttachmentUploader from "@/components/upload/AttachmentUploader";
import { mockAtendimentos } from "@/data/mockSACData";
import { SAC_STATUS_LABELS, SAC_STATUS_COLORS, CANAL_LABELS, TIPO_CONTATO_LABELS, SACStatus } from "@/types/sac";
import { PLANTA_LABELS } from "@/types/sgq";
import { ArrowLeft, ShieldCheck, AlertTriangle, FileSearch, Clock, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const AtendimentoDetalhePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const atendimento = mockAtendimentos.find((a) => a.id === id);

  const [novoStatus, setNovoStatus] = useState<string>("");

  if (!atendimento) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-muted-foreground">Atendimento não encontrado</p>
        <Button variant="outline" onClick={() => navigate("/sac/atendimentos")}>Voltar</Button>
      </div>
    );
  }

  const handleStatusChange = () => {
    if (novoStatus) {
      toast({ title: "Status atualizado", description: `Status alterado para ${SAC_STATUS_LABELS[novoStatus as SACStatus]}` });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{atendimento.id}</h1>
            <span className={cn("status-badge", SAC_STATUS_COLORS[atendimento.status])}>{SAC_STATUS_LABELS[atendimento.status]}</span>
          </div>
          <p className="text-sm text-muted-foreground">{atendimento.clienteNome}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Dados do Cliente</CardTitle></CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div><dt className="text-muted-foreground">Cliente</dt><dd className="font-medium text-foreground">{atendimento.clienteNome}</dd></div>
                <div><dt className="text-muted-foreground">CODCLI</dt><dd className="font-mono text-foreground">{atendimento.codcli}</dd></div>
                <div><dt className="text-muted-foreground">CPF/CNPJ</dt><dd className="font-mono text-foreground">{atendimento.cgcent}</dd></div>
                <div><dt className="text-muted-foreground">Telefone</dt><dd className="text-foreground">{atendimento.telefone}</dd></div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Detalhes do Atendimento</CardTitle></CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div><dt className="text-muted-foreground">Canal</dt><dd className="text-foreground">{CANAL_LABELS[atendimento.canal]}</dd></div>
                <div><dt className="text-muted-foreground">Tipo</dt><dd className="text-foreground">{TIPO_CONTATO_LABELS[atendimento.tipoContato]}</dd></div>
                <div><dt className="text-muted-foreground">Planta</dt><dd className="text-foreground">{atendimento.plantaResp} – {PLANTA_LABELS[atendimento.plantaResp]}</dd></div>
                <div><dt className="text-muted-foreground">Abertura</dt><dd className="text-foreground">{atendimento.abertoAt}</dd></div>
                {atendimento.numPedido && <div><dt className="text-muted-foreground">Pedido</dt><dd className="font-mono text-foreground">{atendimento.numPedido}</dd></div>}
                {atendimento.numNfVenda && <div><dt className="text-muted-foreground">Nota Fiscal</dt><dd className="font-mono text-foreground">{atendimento.numNfVenda}</dd></div>}
              </dl>
              <div className="mt-4 pt-3 border-t border-border">
                <p className="text-sm text-muted-foreground mb-1">Descrição</p>
                <p className="text-sm text-foreground">{atendimento.descricao}</p>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Timeline do Atendimento</CardTitle></CardHeader>
            <CardContent>
              {atendimento.timeline && atendimento.timeline.length > 0 ? (
                <div className="space-y-4">
                  {atendimento.timeline.map((entry) => (
                    <div key={entry.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary mt-1.5" />
                        <div className="w-px flex-1 bg-border" />
                      </div>
                      <div className="pb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">{entry.acao}</span>
                          <span className="text-xs text-muted-foreground">{entry.data}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{entry.descricao}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">por {entry.usuario}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhum evento registrado</p>
              )}
            </CardContent>
          </Card>

          {/* Attachments */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Anexos / Evidências</CardTitle></CardHeader>
            <CardContent>
              <AttachmentUploader maxFiles={10} accept="image/*,video/*,.pdf,.doc,.docx" />
            </CardContent>
          </Card>
        </div>

        {/* Side Actions */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Ações</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Alterar Status</p>
                <Select value={novoStatus} onValueChange={setNovoStatus}>
                  <SelectTrigger><SelectValue placeholder="Novo status" /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(SAC_STATUS_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button className="w-full" size="sm" onClick={handleStatusChange} disabled={!novoStatus}>Confirmar</Button>
              </div>

              <div className="border-t border-border pt-3 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Criar a partir deste chamado</p>
                <Link to="/garantias/nova">
                  <Button variant="outline" size="sm" className="w-full justify-start"><ShieldCheck className="w-4 h-4 mr-2" /> Criar Garantia</Button>
                </Link>
                <Link to="/nao-conformidades/nova">
                  <Button variant="outline" size="sm" className="w-full justify-start"><AlertTriangle className="w-4 h-4 mr-2" /> Criar NC</Button>
                </Link>
                <Link to="/capa/nova">
                  <Button variant="outline" size="sm" className="w-full justify-start"><FileSearch className="w-4 h-4 mr-2" /> Criar CAPA</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AtendimentoDetalhePage;
