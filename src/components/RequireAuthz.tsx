import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { hasPermission, getCurrentPerfil } from "@/lib/rbac";
import { getCurrentPapel, type PapelOperacional } from "@/lib/workflowOs";
import { registrarAuditoria } from "@/services/auditoria";
import type { AssistPermission } from "@/types/assistencia";
import { useEffect, useRef } from "react";

interface RequirePermissionProps {
  perm: AssistPermission | "SAC_VIEW" | "ADMIN_VIEW";
  children: ReactNode;
}

const sacPerms: AssistPermission[] = [];
const adminPerms: AssistPermission[] = [];

function checkPerm(perm: string): boolean {
  const perfil = getCurrentPerfil();
  if ((perfil as string) === "ADMIN") return true;

  if (perm === "SAC_VIEW") {
    const papel = getCurrentPapel();
    return ["SAC", "ADMIN", "DIRETORIA"].includes(papel);
  }
  if (perm === "ADMIN_VIEW") {
    return perfil === "ADMIN";
  }
  return hasPermission(perm as AssistPermission);
}

function AccessDeniedCard({ perm }: { perm: string }) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Card className="max-w-md w-full">
        <CardContent className="pt-8 pb-6 px-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Acesso Negado</h2>
          <p className="text-sm text-muted-foreground">
            Você não possui permissão para acessar esta página.
          </p>
          <p className="text-xs text-muted-foreground font-mono">Permissão necessária: {perm}</p>
          <Button variant="outline" onClick={() => navigate(-1 as any)} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function RequirePermission({ perm, children }: RequirePermissionProps) {
  const logged = useRef(false);

  const allowed = checkPerm(perm);

  useEffect(() => {
    if (!allowed && !logged.current) {
      logged.current = true;
      registrarAuditoria(
        "ACESSO_NEGADO",
        "ROTA",
        window.location.pathname,
        `Permissão: ${perm}. Perfil: ${getCurrentPerfil()}. Papel: ${getCurrentPapel()}`
      );
    }
  }, [allowed, perm]);

  if (!allowed) {
    return <AccessDeniedCard perm={perm} />;
  }

  return <>{children}</>;
}

interface RequireRoleProps {
  roles: PapelOperacional[];
  children: ReactNode;
}

export function RequireRole({ roles, children }: RequireRoleProps) {
  const logged = useRef(false);
  const papel = getCurrentPapel();
  const perfil = getCurrentPerfil();
  const allowed = perfil === "ADMIN" || roles.includes(papel);

  useEffect(() => {
    if (!allowed && !logged.current) {
      logged.current = true;
      registrarAuditoria(
        "ACESSO_NEGADO",
        "ROTA",
        window.location.pathname,
        `Papéis requeridos: ${roles.join(", ")}. Perfil: ${perfil}. Papel: ${papel}`
      );
    }
  }, [allowed]);

  if (!allowed) {
    return <AccessDeniedCard perm={`Papel: ${roles.join(" ou ")}`} />;
  }

  return <>{children}</>;
}
