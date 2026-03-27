import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getExcecoesTorre } from "@/services/torreControle";
import { toast } from "@/hooks/use-toast";
import type { ExcecaoTorre } from "@/types/torreControle";
import { EXCECAO_STATUS_LABELS, EXCECAO_STATUS_COLORS, CRITICIDADE_LABELS, CRITICIDADE_COLORS } from "@/types/torreControle";

interface Props {
  origemId: string;
  origemTipo: "Agendamento" | "Custódia";
}

export default function ExcecoesRelacionadasPanel({ origemId, origemTipo }: Props) {
  const [excecoes, setExcecoes] = useState<ExcecaoTorre[]>([]);

  useEffect(() => {
    getExcecoesTorre()
      .then((all) => {
        const related = all.filter((e) => e.origemId === origemId);
        setExcecoes(related);
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Falha ao carregar excecoes relacionadas.";
        toast({
          title: `Erro ao carregar excecoes de ${origemTipo.toLowerCase()}`,
          description: message,
          variant: "destructive",
        });
      });
  }, [origemId, origemTipo]);

  if (excecoes.length === 0) return null;

  return (
    <div className="glass-card rounded-lg p-4">
      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <ShieldAlert className="h-4 w-4 text-destructive" />
        Exceções Relacionadas ({excecoes.length})
      </h3>
      <div className="space-y-2">
        {excecoes.map(exc => (
          <div key={exc.id} className="flex items-start gap-3 rounded-md border border-border p-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground">{exc.titulo}</p>
              <p className="text-[10px] text-muted-foreground line-clamp-1">{exc.descricao}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <Badge className={`text-[9px] ${CRITICIDADE_COLORS[exc.criticidade]}`}>
                  {CRITICIDADE_LABELS[exc.criticidade]}
                </Badge>
                <Badge className={`text-[9px] ${EXCECAO_STATUS_COLORS[exc.status]}`}>
                  {EXCECAO_STATUS_LABELS[exc.status]}
                </Badge>
              </div>
            </div>
            <Button variant="ghost" size="sm" asChild title="Ver exceção">
              <Link to={`/torre-controle/${exc.id}`}>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
