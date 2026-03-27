import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Camera, Check, User, Car, FileText, Send, QrCode, Shield, ArrowRight, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { getSolicitacaoAcessoPublicaByToken, preencherSolicitacaoAcessoPublica } from "@/services/operacional";

const STEPS = ["Identificacao", "Selfie", "Veiculo", "Revisao"];
const MAX_SELFIE_PAYLOAD_CHARS = 900_000;

type PageStatus = "loading" | "form" | "submitted" | "expired" | "used" | "error";

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Falha ao ler selfie."));
    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Falha ao processar selfie."));
    img.src = dataUrl;
  });
}

async function optimizeSelfie(file: File): Promise<string> {
  const rawDataUrl = await fileToDataUrl(file);
  if (!rawDataUrl.startsWith("data:image/")) {
    throw new Error("Formato de selfie invalido.");
  }

  let img: HTMLImageElement;
  try {
    img = await loadImage(rawDataUrl);
  } catch {
    throw new Error("Formato da selfie nao suportado. Tire outra foto no formato JPG.");
  }

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return "";

  let width = img.width;
  let height = img.height;
  const maxSide = 1280;
  const scale = Math.min(1, maxSide / Math.max(width, height));

  width = Math.max(1, Math.round(width * scale));
  height = Math.max(1, Math.round(height * scale));

  const render = () => {
    canvas.width = width;
    canvas.height = height;
    context.clearRect(0, 0, width, height);
    context.drawImage(img, 0, 0, width, height);
  };

  render();

  let quality = 0.86;
  let result = canvas.toDataURL("image/jpeg", quality);

  while (result.length > MAX_SELFIE_PAYLOAD_CHARS && quality > 0.45) {
    quality -= 0.08;
    result = canvas.toDataURL("image/jpeg", quality);
  }

  while (result.length > MAX_SELFIE_PAYLOAD_CHARS && (width > 480 || height > 480)) {
    width = Math.max(480, Math.round(width * 0.85));
    height = Math.max(480, Math.round(height * 0.85));
    render();

    quality = 0.74;
    result = canvas.toDataURL("image/jpeg", quality);

    while (result.length > MAX_SELFIE_PAYLOAD_CHARS && quality > 0.45) {
      quality -= 0.08;
      result = canvas.toDataURL("image/jpeg", quality);
    }

    if (width === 480 && height === 480) break;
  }

  return result.length <= MAX_SELFIE_PAYLOAD_CHARS ? result : "";
}

const VisitantePublicoPage = () => {
  const { token } = useParams();
  const [status, setStatus] = useState<PageStatus>("loading");
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
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

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }

    let active = true;
    setStatus("loading");
    getSolicitacaoAcessoPublicaByToken(token)
      .then((info) => {
        if (!active) return;
        if (["PREENCHIDO", "VALIDADO", "CONVERTIDO_EM_ACESSO"].includes(info.status) || info.visitantePreenchido) {
          setStatus("used");
          return;
        }
        if (info.status === "EXPIRADO") {
          setStatus("expired");
          return;
        }
        setStatus("form");
      })
      .catch((error: any) => {
        if (!active) return;
        if (error?.status === 410) {
          setStatus("expired");
          return;
        }
        if (error?.status === 409) {
          setStatus("used");
          return;
        }
        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [token]);

  const handleSelfieCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const optimizedSelfie = await optimizeSelfie(file);
      if (!optimizedSelfie) {
        setSelfiePreview(null);
        toast({
          title: "Selfie invalida",
          description: "Nao foi possivel preparar a selfie para envio. Tire outra foto mais proxima do rosto.",
          variant: "destructive",
        });
        return;
      }

      setSelfiePreview(optimizedSelfie);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao processar selfie.";
      toast({
        title: "Erro na selfie",
        description: message,
        variant: "destructive",
      });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const validateBeforeSubmit = (): boolean => {
    if (!form.nome.trim() || !form.documento.trim() || !form.empresa.trim() || !form.telefone.trim()) {
      toast({
        title: "Campos obrigatorios",
        description: "Preencha nome, documento, empresa e telefone.",
        variant: "destructive",
      });
      setStep(0);
      return false;
    }
    if (form.possuiVeiculo && !form.placa.trim()) {
      toast({
        title: "Placa obrigatoria",
        description: "Informe a placa do veiculo.",
        variant: "destructive",
      });
      setStep(2);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!token || !validateBeforeSubmit()) return;
    setSubmitting(true);
    try {
      await preencherSolicitacaoAcessoPublica(token, {
        nome: form.nome.trim(),
        documento: form.documento.trim(),
        empresa: form.empresa.trim(),
        telefone: form.telefone.trim(),
        email: form.email.trim(),
        possuiVeiculo: form.possuiVeiculo,
        placa: form.placa.trim(),
        tipoVeiculo: form.tipoVeiculo.trim(),
        modelo: form.modelo.trim(),
        cor: form.cor.trim(),
        obs: form.obs.trim(),
        selfieUrl: selfiePreview || "",
      });
      setStatus("submitted");
    } catch (error: any) {
      if (error?.status === 410) {
        setStatus("expired");
        return;
      }
      if (error?.status === 409) {
        setStatus("used");
        return;
      }
      const message = error?.message || "Nao foi possivel enviar o cadastro.";
      const description =
        typeof message === "string" && message.toLowerCase().includes("tempo limite")
          ? "Tempo limite no envio. Tente tirar outra selfie e enviar novamente."
          : message;
      toast({
        title: "Falha ao enviar",
        description,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8 space-y-3">
            <p className="text-sm text-muted-foreground">Validando link de preenchimento...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              Este link nao e mais valido. Solicite um novo convite ao responsavel interno.
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
            <h2 className="text-xl font-bold text-foreground">Cadastro Ja Realizado</h2>
            <p className="text-sm text-muted-foreground">
              Seus dados ja foram enviados para validacao da portaria.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <h2 className="text-xl font-bold text-foreground">Link Invalido</h2>
            <p className="text-sm text-muted-foreground">
              Nao foi possivel validar este link. Confira o endereco recebido.
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
                Seus dados foram recebidos e estao aguardando validacao da portaria.
              </p>
            </div>
            <div className="mx-auto w-48 h-48 rounded-xl border-2 border-border bg-card flex items-center justify-center">
              <div className="text-center">
                <QrCode className="h-24 w-24 text-foreground mx-auto" />
                <p className="text-[10px] text-muted-foreground mt-2 font-mono">{token}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground">Cadastro de Visitante</h1>
            <p className="text-xs text-muted-foreground">Portal de Pre-autorizacao Segura</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
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

            {step === 1 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Camera className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Foto de Identificacao</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Tire uma selfie ou envie uma foto recente para conferência na portaria.
                </p>

                {selfiePreview ? (
                  <div className="space-y-3">
                    <div className="mx-auto w-48 h-48 rounded-xl overflow-hidden border-2 border-success">
                      <img src={selfiePreview} alt="Selfie" className="h-full w-full object-cover" />
                    </div>
                    <div className="flex justify-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setSelfiePreview(null)} className="gap-1.5">
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
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Car className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Veiculo</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox checked={form.possuiVeiculo} onCheckedChange={(v) => set("possuiVeiculo", !!v)} id="veiculo-pub" />
                  <Label htmlFor="veiculo-pub">Vou com veiculo</Label>
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
                          <SelectItem value="utilitario">Utilitario</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Modelo</Label>
                      <Input value={form.modelo} onChange={(e) => set("modelo", e.target.value)} placeholder="Modelo do veiculo" />
                    </div>
                    <div className="space-y-2">
                      <Label>Cor</Label>
                      <Input value={form.cor} onChange={(e) => set("cor", e.target.value)} placeholder="Cor do veiculo" />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Observacoes</Label>
                  <Textarea value={form.obs} onChange={(e) => set("obs", e.target.value)} placeholder="Alguma observacao para a portaria..." rows={2} />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Revisao Final</h3>
                </div>
                <p className="text-sm text-muted-foreground">Confira seus dados antes de enviar.</p>

                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <span className="text-muted-foreground">Nome:</span><span className="font-medium">{form.nome || "-"}</span>
                  <span className="text-muted-foreground">Documento:</span><span className="font-medium">{form.documento || "-"}</span>
                  <span className="text-muted-foreground">Empresa:</span><span className="font-medium">{form.empresa || "-"}</span>
                  <span className="text-muted-foreground">Telefone:</span><span className="font-medium">{form.telefone || "-"}</span>
                  <span className="text-muted-foreground">E-mail:</span><span className="font-medium">{form.email || "-"}</span>
                  <span className="text-muted-foreground">Selfie:</span>
                  <span className="font-medium flex items-center gap-1">
                    {selfiePreview ? <><Check className="h-3 w-3 text-success" /> Enviada</> : <span className="text-warning">Nao enviada</span>}
                  </span>
                  <span className="text-muted-foreground">Veiculo:</span>
                  <span className="font-medium">{form.possuiVeiculo ? `${form.placa} - ${form.modelo} ${form.cor}` : "Nao"}</span>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4 border-t border-border">
              <Button variant="outline" onClick={() => step > 0 && setStep(step - 1)} disabled={step === 0 || submitting}>
                <ArrowLeft className="mr-1.5 h-4 w-4" /> Voltar
              </Button>
              {step < 3 ? (
                <Button onClick={() => setStep(step + 1)} disabled={submitting}>
                  Proximo <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} className="gap-1.5" disabled={submitting}>
                  <Send className="h-4 w-4" /> {submitting ? "Enviando..." : "Enviar Cadastro"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-[10px] text-muted-foreground">
          Portal seguro de cadastro de visitantes - Dados protegidos pela LGPD
        </p>
      </main>
    </div>
  );
};

export default VisitantePublicoPage;
