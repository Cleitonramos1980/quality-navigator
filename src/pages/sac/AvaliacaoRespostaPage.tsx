import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getAvaliacaoPublic, responderAvaliacaoPublic } from "@/services/sac";

type PublicAvaliacao = Awaited<ReturnType<typeof getAvaliacaoPublic>>;

const AvaliacaoRespostaPage = () => {
  const { token } = useParams<{ token: string }>();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avaliacao, setAvaliacao] = useState<PublicAvaliacao | null>(null);
  const [nota, setNota] = useState<number>(5);
  const [comentario, setComentario] = useState("");

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    getAvaliacaoPublic(token)
      .then((data) => {
        setAvaliacao(data);
        if (typeof data.nota === "number") setNota(data.nota);
        if (data.comentario) setComentario(data.comentario);
      })
      .catch((error) => {
        toast({
          title: "Link inválido",
          description: error instanceof Error ? error.message : "Não foi possível carregar a avaliação.",
          variant: "destructive",
        });
      })
      .finally(() => setLoading(false));
  }, [token, toast]);

  const jaRespondida = useMemo(() => avaliacao?.statusResposta === "RESPONDIDA", [avaliacao]);

  const handleSubmit = async () => {
    if (!token || jaRespondida) return;
    setSaving(true);
    try {
      await responderAvaliacaoPublic({ token, nota, comentario });
      toast({
        title: "Avaliação registrada",
        description: "Obrigado pela sua resposta.",
      });
      const refreshed = await getAvaliacaoPublic(token);
      setAvaliacao(refreshed);
    } catch (error) {
      toast({
        title: "Erro ao enviar avaliação",
        description: error instanceof Error ? error.message : "Não foi possível salvar sua avaliação.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Avaliação de Atendimento SAC</CardTitle>
          <CardDescription>
            {avaliacao
              ? `Atendimento ${avaliacao.atendimentoId} - Cliente ${avaliacao.clienteNome}`
              : "Carregando dados da avaliação..."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {loading && <p className="text-sm text-muted-foreground">Carregando...</p>}
          {!loading && !avaliacao && (
            <p className="text-sm text-destructive">Não foi possível localizar este link de avaliação.</p>
          )}

          {!loading && avaliacao && (
            <>
              <div className="space-y-2">
                <Label>Nota do atendimento</Label>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <Button
                      key={value}
                      type="button"
                      variant={nota === value ? "default" : "outline"}
                      disabled={jaRespondida}
                      onClick={() => setNota(value)}
                    >
                      {value}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comentario">Comentário (opcional)</Label>
                <Textarea
                  id="comentario"
                  value={comentario}
                  onChange={(event) => setComentario(event.target.value)}
                  placeholder="Conte como foi sua experiência."
                  rows={4}
                  disabled={jaRespondida}
                />
              </div>

              {jaRespondida && (
                <p className="text-sm text-success">
                  Esta avaliação já foi respondida. Obrigado pelo retorno.
                </p>
              )}

              <Button
                onClick={() => void handleSubmit()}
                disabled={saving || jaRespondida}
                className="w-full"
              >
                {saving ? "Enviando..." : "Enviar avaliação"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AvaliacaoRespostaPage;
