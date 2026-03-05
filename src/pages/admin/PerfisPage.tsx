import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionCard from "@/components/forms/SectionCard";
import { Checkbox } from "@/components/ui/checkbox";
import { ASSIST_PERMISSION_LABELS, ASSIST_PERMISSION_GROUPS, PERFIL_ASSIST_PERMISSIONS, PerfilNome } from "@/lib/rbac";
import type { AssistPermission } from "@/types/assistencia";

const perfis: { nome: PerfilNome; desc: string; perms: string[] }[] = [
  { nome: "ADMIN", desc: "Acesso total ao sistema", perms: ["dashboard", "sac", "garantias", "nc", "capa", "auditorias", "assistencia", "admin"] },
  { nome: "SAC", desc: "Atendimento ao cliente e garantias", perms: ["dashboard", "sac", "garantias", "nc", "assistencia"] },
  { nome: "QUALIDADE", desc: "Gestão de qualidade e NC", perms: ["dashboard", "nc", "capa", "auditorias"] },
  { nome: "AUDITOR", desc: "Execução de auditorias", perms: ["dashboard", "auditorias"] },
  { nome: "ASSISTENCIA", desc: "Assistência técnica e OS", perms: ["dashboard", "assistencia"] },
  { nome: "ALMOX", desc: "Almoxarifado e estoque", perms: ["dashboard", "assistencia"] },
  { nome: "TECNICO", desc: "Execução técnica de OS", perms: ["dashboard", "assistencia"] },
  { nome: "DIRETORIA", desc: "Visão executiva", perms: ["dashboard", "sac", "garantias", "nc", "capa", "auditorias", "assistencia"] },
];

const modulos = ["dashboard", "sac", "garantias", "nc", "capa", "auditorias", "assistencia", "admin"];

const PerfisPage = () => {
  const navigate = useNavigate();
  const [expandedPerfil, setExpandedPerfil] = useState<PerfilNome | null>(null);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}><ArrowLeft className="w-5 h-5" /></Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Perfis de Acesso</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Configuração RBAC — Roles e Permissões</p>
        </div>
      </div>

      {/* Módulos */}
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
                <tr
                  key={p.nome}
                  className={`border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer ${expandedPerfil === p.nome ? "bg-muted/40" : ""}`}
                  onClick={() => setExpandedPerfil(expandedPerfil === p.nome ? null : p.nome)}
                >
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

      {/* Permissões Avançadas (expandido) */}
      {expandedPerfil && (
        <SectionCard title={`Permissões Avançadas — ${expandedPerfil}`} description="Permissões granulares do módulo Assistência Técnica">
          <div className="space-y-4">
            {ASSIST_PERMISSION_GROUPS.map((group) => (
              <div key={group.label}>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{group.label}</h4>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {group.perms.map((perm) => {
                    const checked = PERFIL_ASSIST_PERMISSIONS[expandedPerfil]?.includes(perm) ?? false;
                    return (
                      <label key={perm} className="flex items-center gap-2 text-sm cursor-default">
                        <Checkbox checked={checked} disabled />
                        <span className={checked ? "text-foreground" : "text-muted-foreground"}>{ASSIST_PERMISSION_LABELS[perm]}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      <p className="text-xs text-muted-foreground">
        * Clique em um perfil para ver as permissões avançadas. A edição será habilitada após integração com o backend.
      </p>
    </div>
  );
};

export default PerfisPage;
