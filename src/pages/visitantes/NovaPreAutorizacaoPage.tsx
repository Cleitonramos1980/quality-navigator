import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ArrowRight, Copy, Send, Check, Link2 } from "lucide-react";
import { toast } from "sonner";

const STEPS = ["Dados Básicos", "Dados do Visitante", "Veículo", "Resumo e Envio"];

const NovaPreAutorizacaoPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    motivo: "",
    setor: "",
    responsavel: "",
    dataPrevista: "",
    horaPrevista: "",
    observacoes: "",
    nomeVisitante: "",
    documento: "",
    empresa: "",
    telefone: "",
    email: "",
    possuiVeiculo: false,
    placa: "",
    tipoVeiculo: "",
    modelo: "",
    cor: "",
  });

  const set = (key: string, value: string | boolean) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = () => {
    setSaved(true);
    toast.success("Pré-autorização criada com sucesso!");
  };

  const generatedToken = crypto.randomUUID().slice(0, 12);
  const publicAppUrl = (import.meta.env.VITE_PUBLIC_APP_URL as string | undefined)?.trim();
  const baseUrl = (publicAppUrl || window.location.origin).replace(/\/+$/, "");
  const mockLink = `${baseUrl}/visitante/cadastro/${generatedToken}`;

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/visitantes")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nova Pré-autorização</h1>
          <p className="text-sm text-muted-foreground">Cadastre e envie o convite ao visitante</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center h-8 w-8 rounded-full text-xs font-bold border-2 transition-colors ${
                i < step
                  ? "bg-primary text-primary-foreground border-primary"
                  : i === step
                  ? "border-primary text-primary bg-primary/10"
                  : "border-muted text-muted-foreground"
              }`}
            >
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={`text-xs hidden sm:inline ${i === step ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{s}</span>
            {i < STEPS.length - 1 && <div className="w-6 h-px bg-border" />}
          </div>
        ))}
      </div>

      {!saved ? (
        <Card>
          <CardContent className="pt-6 space-y-5">
            {step === 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Motivo da Visita</Label>
                    <Select value={form.motivo} onValueChange={(v) => set("motivo", v)}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reuniao">Reunião</SelectItem>
                        <SelectItem value="auditoria">Auditoria</SelectItem>
                        <SelectItem value="entrega">Entrega</SelectItem>
                        <SelectItem value="manutencao">Manutenção</SelectItem>
                        <SelectItem value="visita_tecnica">Visita Técnica</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Setor de Destino</Label>
                    <Select value={form.setor} onValueChange={(v) => set("setor", v)}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="diretoria">Diretoria</SelectItem>
                        <SelectItem value="qualidade">Qualidade</SelectItem>
                        <SelectItem value="logistica">Logística</SelectItem>
                        <SelectItem value="producao">Produção</SelectItem>
                        <SelectItem value="comercial">Comercial</SelectItem>
                        <SelectItem value="ti">TI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Responsável Interno</Label>
                    <Input value={form.responsavel} onChange={(e) => set("responsavel", e.target.value)} placeholder="Nome do responsável" />
                  </div>
                  <div className="space-y-2">
                    <Label>Data Prevista</Label>
                    <Input type="date" value={form.dataPrevista} onChange={(e) => set("dataPrevista", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Horário Previsto</Label>
                    <Input type="time" value={form.horaPrevista} onChange={(e) => set("horaPrevista", e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Textarea value={form.observacoes} onChange={(e) => set("observacoes", e.target.value)} placeholder="Observações adicionais..." />
                </div>
              </>
            )}

            {step === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome Completo</Label>
                  <Input value={form.nomeVisitante} onChange={(e) => set("nomeVisitante", e.target.value)} placeholder="Nome do visitante" />
                </div>
                <div className="space-y-2">
                  <Label>CPF / Documento</Label>
                  <Input value={form.documento} onChange={(e) => set("documento", e.target.value)} placeholder="000.000.000-00" />
                </div>
                <div className="space-y-2">
                  <Label>Empresa</Label>
                  <Input value={form.empresa} onChange={(e) => set("empresa", e.target.value)} placeholder="Empresa do visitante" />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input value={form.telefone} onChange={(e) => set("telefone", e.target.value)} placeholder="(00) 00000-0000" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>E-mail</Label>
                  <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="email@empresa.com" />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Checkbox checked={form.possuiVeiculo} onCheckedChange={(v) => set("possuiVeiculo", !!v)} id="veiculo" />
                  <Label htmlFor="veiculo">Visitante virá com veículo</Label>
                </div>
                {form.possuiVeiculo && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Placa</Label>
                      <Input value={form.placa} onChange={(e) => set("placa", e.target.value)} placeholder="ABC-1D23" />
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo</Label>
                      <Select value={form.tipoVeiculo} onValueChange={(v) => set("tipoVeiculo", v)}>
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="carro">Carro</SelectItem>
                          <SelectItem value="moto">Moto</SelectItem>
                          <SelectItem value="utilitario">Utilitário</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Modelo</Label>
                      <Input value={form.modelo} onChange={(e) => set("modelo", e.target.value)} placeholder="Modelo do veículo" />
                    </div>
                    <div className="space-y-2">
                      <Label>Cor</Label>
                      <Input value={form.cor} onChange={(e) => set("cor", e.target.value)} placeholder="Cor do veículo" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Resumo da Pré-autorização</h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <span className="text-muted-foreground">Motivo:</span><span className="font-medium">{form.motivo || "—"}</span>
                  <span className="text-muted-foreground">Setor:</span><span className="font-medium">{form.setor || "—"}</span>
                  <span className="text-muted-foreground">Responsável:</span><span className="font-medium">{form.responsavel || "—"}</span>
                  <span className="text-muted-foreground">Data/Hora:</span><span className="font-medium">{form.dataPrevista} {form.horaPrevista}</span>
                  <span className="text-muted-foreground">Visitante:</span><span className="font-medium">{form.nomeVisitante || "—"}</span>
                  <span className="text-muted-foreground">Documento:</span><span className="font-medium">{form.documento || "—"}</span>
                  <span className="text-muted-foreground">Empresa:</span><span className="font-medium">{form.empresa || "—"}</span>
                  <span className="text-muted-foreground">Telefone:</span><span className="font-medium">{form.telefone || "—"}</span>
                  <span className="text-muted-foreground">E-mail:</span><span className="font-medium">{form.email || "—"}</span>
                  <span className="text-muted-foreground">Veículo:</span><span className="font-medium">{form.possuiVeiculo ? `${form.placa} - ${form.modelo} ${form.cor}` : "Não"}</span>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => step > 0 ? setStep(step - 1) : navigate("/visitantes")} >
                <ArrowLeft className="mr-1.5 h-4 w-4" />{step === 0 ? "Cancelar" : "Voltar"}
              </Button>
              {step < 3 ? (
                <Button onClick={() => setStep(step + 1)}>
                  Próximo <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSave}>
                  <Send className="mr-1.5 h-4 w-4" /> Criar e Gerar Link
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Check className="h-5 w-5 text-green-500" /> Pré-autorização Criada</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>Link seguro para o visitante</Label>
              <div className="flex gap-2">
                <Input readOnly value={mockLink} className="font-mono text-xs" />
                <Button variant="outline" size="icon" onClick={() => { navigator.clipboard.writeText(mockLink); toast.success("Link copiado!"); }}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="gap-2" onClick={() => toast.success("Link enviado por WhatsApp (simulado)")}>
                <Send className="h-4 w-4" /> Enviar por WhatsApp
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => toast.success("Link enviado por e-mail (simulado)")}>
                <Send className="h-4 w-4" /> Enviar por E-mail
              </Button>
            </div>
            <div className="pt-2">
              <Button onClick={() => navigate("/visitantes")}>Voltar para Visitantes</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NovaPreAutorizacaoPage;
