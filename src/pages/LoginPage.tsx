import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { setAuthSession } from "@/lib/rbac";
import { getDefaultRouteForPerfil } from "@/lib/workflowOs";
import { login } from "@/services/auth";
import { useToast } from "@/components/ui/use-toast";
import { DoorOpen } from "lucide-react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await login(email, password);
      setAuthSession({
        token: response.token,
        user: response.user,
      });
      navigate(getDefaultRouteForPerfil(response.user.perfil));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha de autenticação.";
      toast({
        title: "Login inválido",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-sidebar p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mx-auto mb-4">
            <DoorOpen className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-sidebar-primary">Torre de Controle</h1>
          <p className="text-xs text-sidebar-foreground/50 mt-1 leading-relaxed">SAC · Qualidade · Inventário · Assistência Técnica<br/>Acessos · Portaria · Controle de Pátio e Frota</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 bg-card rounded-xl p-6 shadow-lg border border-border">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="usuario@empresa.com.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Acesso seguro — autenticação corporativa
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
