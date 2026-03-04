import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionCard from "@/components/forms/SectionCard";
import { Checkbox } from "@/components/ui/checkbox";

const perfis = [
  { nome: "ADMIN", desc: "Acesso total ao sistema", perms: ["garantias", "nc", "capa", "auditorias", "admin", "dashboard"] },
  { nome: "SAC", desc: "Atendimento ao cliente e garantias", perms: ["garantias", "nc", "dashboard"] },
  { nome: "QUALIDADE", desc: "Gestão de qualidade e NC", perms: ["nc", "capa", "auditorias", "dashboard"] },
  { nome: "AUDITOR", desc: "Execução de auditorias", perms: ["auditorias", "dashboard"] },
  { nome: "DIRETORIA", desc: "Visão executiva", perms: ["dashboard", "garantias", "nc", "capa", "auditorias"] },
];

const modulos = ["dashboard", "garantias", "nc", "capa", "auditorias", "admin"];

const PerfisPage = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}><ArrowLeft className="w-5 h-5" /></Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Perfis de Acesso</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Configuração RBAC — Roles e Permissões</p>
        </div>
      </div>

      <div className="glass-card rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Perfil</th>
                {modulos.map((m) => (
                  <th key={m} className="text-center px-4 py-3 font-medium text-muted-foreground capitalize">{m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {perfis.map((p) => (
                <tr key={p.nome} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary" />
                      <div>
                        <div className="font-medium text-foreground">{p.nome}</div>
                        <div className="text-xs text-muted-foreground">{p.desc}</div>
                      </div>
                    </div>
                  </td>
                  {modulos.map((m) => (
                    <td key={m} className="text-center px-4 py-3">
                      <Checkbox checked={p.perms.includes(m)} disabled className="mx-auto" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        * A edição de permissões será habilitada após integração com o backend.
      </p>
    </div>
  );
};

export default PerfisPage;
