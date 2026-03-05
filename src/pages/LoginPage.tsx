import { useState } from "react";
import { Factory } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { setCurrentPerfil, type PerfilNome } from "@/lib/rbac";
import { getDefaultRouteForPerfil } from "@/lib/workflowOs";

const PERFIL_OPTIONS: { value: PerfilNome; label: string }[] = [
  { value: "ADMIN", label: "Administrador" },
  { value: "SAC", label: "SAC" },
  { value: "ASSISTENCIA", label: "Assistência Técnica" },
  { value: "QUALIDADE", label: "Qualidade / Inspeção" },
  { value: "TECNICO", label: "Técnico / Reparo" },
  { value: "ALMOX", label: "Almoxarifado / CD" },
  { value: "DIRETORIA", label: "Diretoria" },
  { value: "AUDITOR", label: "Auditor" },
];

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedPerfil, setSelectedPerfil] = useState<PerfilNome>("ADMIN");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPerfil(selectedPerfil);
    navigate(getDefaultRouteForPerfil(selectedPerfil));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-sidebar p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-sidebar-primary flex items-center justify-center mx-auto mb-4">
            <Factory className="w-7 h-7 text-sidebar-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-sidebar-primary">SGQ RODRIGUES</h1>
          <p className="text-sm text-sidebar-foreground/60 mt-1">Sistema de Gestão da Qualidade</p>
          <p className="text-xs text-sidebar-foreground/40 mt-0.5">Rodrigues Ind. e Com. de Colchões Ltda</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 bg-card rounded-xl p-6 shadow-lg border border-border">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="perfil">Perfil (simulação)</Label>
            <Select value={selectedPerfil} onValueChange={(v) => setSelectedPerfil(v as PerfilNome)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERFIL_OPTIONS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full">
            Entrar
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Esqueceu a senha? Contate o administrador.
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
