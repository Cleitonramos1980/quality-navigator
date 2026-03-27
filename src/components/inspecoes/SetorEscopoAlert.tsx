import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface SetorEscopoAlertProps {
  loading: boolean;
  error?: string | null;
  setoresPermitidos: string[];
}

const SetorEscopoAlert = ({ loading, error, setoresPermitidos }: SetorEscopoAlertProps) => {
  if (loading) return null;

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Falha ao carregar escopo de setores</AlertTitle>
        <AlertDescription>
          {error} Recarregue a página. Se persistir, valide sessão/permissões.
        </AlertDescription>
      </Alert>
    );
  }

  if (setoresPermitidos.length === 0) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Nenhum setor vinculado ao usuário</AlertTitle>
        <AlertDescription>
          Não há setores permitidos para este login. Vincule setores em
          <strong> Inspeções - Usuário/Setor</strong>.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};

export default SetorEscopoAlert;
