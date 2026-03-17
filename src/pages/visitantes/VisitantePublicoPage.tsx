import { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Camera, Check, Upload, User, Car, FileText, Send, QrCode, Shield, ArrowRight, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STEPS = ["Identificação", "Selfie", "Veículo", "Revisão"];

type PageStatus = "loading" | "form" | "submitted" | "expired" | "used" | "error";

const VisitantePublicoPage = () => {
  const { token } = useParams();
  const [status, setStatus] = useState<PageStatus>("form");
  const [step, setStep] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    nome: "",
    documento: "",
    empresa: "",
    telefone: "",
    email: "",
    possuiVeiculo: false,
    placa: "",
    tipoVeiculo: "",
    modelo: "",
    cor: "",
    obs: "",
  });

  const set = (key: string, value: string | boolean) => setForm((f) => ({ ...f, [key]: value }));

  const handleSelfieCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelfiePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    setStatus("submitted");
  };

  if (status === "expired") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <div className="h-16 w-16 mx-auto rounded-full bg-warning/10 flex items-center justify-center">
              <Shield className="h-8 w-8 text-warning" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Link Expirado</h2>
            <p className="text-sm text-muted-foreground">
              Este link de pré-autorização não é mais válido. Solicite um novo convite ao responsável interno.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "used") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <div className="h-16 w-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Check className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Cadastro Já Realizado</h2>
            <p className="text-sm text-muted-foreground">
              Seus dados já foram enviados. Apresente o QR Code na portaria para entrada rápida.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "submitted") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8 space-y-6">
            <div className="h-20 w-20 mx-auto rounded-full bg-success/10 flex items-center justify-center">
              <Check className="h-10 w-10 text-success" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Cadastro Enviado com Sucesso!</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Seus dados foram recebidos e estão sendo validados. Apresente o QR Code abaixo na portaria.
              </p>
            </div>
            <div className="mx-auto w-48 h-48 rounded-xl border-2 border-border bg-card flex items-center justify-center">
              <div className="text-center">
                <QrCode className="h-24 w-24 text-foreground mx-auto" />
                <p className="text-[10px] text-muted-foreground mt-2 font-mono">{token}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Salve uma captura de tela deste QR Code para apresentar na portaria.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground">Cadastro de Visitante</h1>
            <p className="text-xs text-muted-foreground">Portal de Pré-autorização Segura</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Stepper */}
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex items-center justify-center h-8 w-8 rounded-full text-xs font-bold border-2 transition-colors ${
                i < step ? "bg-primary text-primary-foreground border-primary" : i === step ? "border-primary text-primary bg-primary/10" : "border-muted text-muted-foreground"
              }`}>
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`text-xs hidden sm:inline ${i === step ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{s}</span>
              {i < STEPS.length - 1 && <div className="w-6 h-px bg-border" />}
            </div>
          ))}
        </div>

        <Card>
          <CardContent className="pt-6 space-y-5">
            {/* Step 0: Identificação */}
            {step === 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Dados Pessoais</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome Completo *</Label>
                    <Input value={form.nome} onChange={(e) => set("nome", e.target.value)} placeholder="Seu nome completo" />
                  </div>
                  <div className="space-y-2">
                    <Label>CPF / Documento *</Label>
                    <Input value={form.documento} onChange={(e) => set("documento", e.target.value)} placeholder="000.000.000-00" />
                  </div>
                  <div className="space-y-2">
                    <Label>Empresa *</Label>
                    <Input value={form.empresa} onChange={(e) => set("empresa", e.target.value)} placeholder="Empresa que representa" />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone *</Label>
                    <Input value={form.telefone} onChange={(e) => set("telefone", e.target.value)} placeholder="(00) 00000-0000" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>E-mail</Label>
                    <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="email@empresa.com" />
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Selfie */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Camera className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Foto de Identificação</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Tire uma selfie ou envie uma foto recente. A imagem será utilizada para conferência na portaria.
                </p>

                {selfiePreview ? (
                  <div className="space-y-3">
                    <div className="mx-auto w-48 h-48 rounded-xl overflow-hidden border-2 border-success">
                      <img src={selfiePreview} alt="Selfie" className="h-full w-full object-cover" />
                    </div>
                    <div className="flex justify-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => { setSelfiePreview(null); }} className="gap-1.5">
                        <RefreshCw className="h-4 w-4" /> Nova Foto
                      </Button>
                    </div>
                    <p className="text-xs text-success text-center flex items-center justify-center gap-1">
                      <Check className="h-3 w-3" /> Foto capturada com sucesso
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div
                      className="mx-auto w-48 h-48 rounded-xl border-2 border-dashed border-border bg-muted/30 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-xs text-muted-foreground text-center px-4">Toque para tirar foto ou enviar imagem</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      capture="user"
                      className="hidden"
                      onChange={handleSelfieCapture}
                    />
                    <div className="rounded-lg border border-border bg-muted/20 p-3">
                      <h4 className="text-xs font-semibold text-foreground mb-1">Instruções:</h4>
                      <ul className="text-xs text-muted-foreground space-y-0.5">
                        <li>• Posicione o rosto centralizado no enquadramento</li>
                        <li>• Garanta boa iluminação</li>
                        <li>• Não use óculos escuros ou acessórios que cubram o rosto</li>
                        <li>• A foto será armazenada de forma segura (LGPD)</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Veículo */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Car className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Veículo</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox checked={form.possuiVeiculo} onCheckedChange={(v) => set("possuiVeiculo", !!v)} id="veiculo-pub" />
                  <Label htmlFor="veiculo-pub">Vou com veículo</Label>
                </div>
                {form.possuiVeiculo && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Placa *</Label>
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
                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Textarea value={form.obs} onChange={(e) => set("obs", e.target.value)} placeholder="Alguma observação para a portaria..." rows={2} />
                </div>
              </div>
            )}

            {/* Step 3: Revisão */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Revisão Final</h3>
                </div>
                <p className="text-sm text-muted-foreground">Confira seus dados antes de enviar.</p>

                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <span className="text-muted-foreground">Nome:</span><span className="font-medium">{form.nome || "—"}</span>
                  <span className="text-muted-foreground">Documento:</span><span className="font-medium">{form.documento || "—"}</span>
                  <span className="text-muted-foreground">Empresa:</span><span className="font-medium">{form.empresa || "—"}</span>
                  <span className="text-muted-foreground">Telefone:</span><span className="font-medium">{form.telefone || "—"}</span>
                  <span className="text-muted-foreground">E-mail:</span><span className="font-medium">{form.email || "—"}</span>
                  <span className="text-muted-foreground">Selfie:</span>
                  <span className="font-medium flex items-center gap-1">
                    {selfiePreview ? <><Check className="h-3 w-3 text-success" /> Enviada</> : <span className="text-warning">Não enviada</span>}
                  </span>
                  <span className="text-muted-foreground">Veículo:</span>
                  <span className="font-medium">{form.possuiVeiculo ? `${form.placa} — ${form.modelo} ${form.cor}` : "Não"}</span>
                </div>

                {selfiePreview && (
                  <div className="flex justify-center">
                    <div className="w-20 h-20 rounded-lg overflow-hidden border">
                      <img src={selfiePreview} alt="Preview" className="h-full w-full object-cover" />
                    </div>
                  </div>
                )}

                <div className="rounded-lg border border-border bg-muted/20 p-3">
                  <p className="text-xs text-muted-foreground">
                    <Shield className="h-3 w-3 inline mr-1" />
                    Ao enviar, você concorda com o tratamento dos seus dados conforme a LGPD. Suas informações serão utilizadas exclusivamente para controle de acesso.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-4 border-t border-border">
              <Button variant="outline" onClick={() => step > 0 && setStep(step - 1)} disabled={step === 0}>
                <ArrowLeft className="mr-1.5 h-4 w-4" /> Voltar
              </Button>
              {step < 3 ? (
                <Button onClick={() => setStep(step + 1)}>
                  Próximo <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} className="gap-1.5">
                  <Send className="h-4 w-4" /> Enviar Cadastro
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-[10px] text-muted-foreground">
          Portal seguro de cadastro de visitantes • Dados protegidos pela LGPD
        </p>
      </main>
    </div>
  );
};

export default VisitantePublicoPage;
