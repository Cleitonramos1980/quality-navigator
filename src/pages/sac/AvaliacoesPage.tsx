import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Copy, RefreshCw, Send, Search } from "lucide-react";
import { getAvaliacoes, reenviarAvaliacao } from "@/services/sac";
import type { SACAvaliacao } from "@/types/sac";

const STATUS_ENVIO_LABEL: Record<string, string> = {
  NAO_ENVIADA: "Não enviada",
  ENVIADA: "Enviada",
  ENTREGUE: "Entregue",
  LIDA: "Lida",
  RESPONDIDA: "Respondida",
  FALHA: "Falha",
  EXPIRADA: "Expirada",
};

const STATUS_RESPOSTA_LABEL: Record<string, string> = {
  NAO_RESPONDIDA: "Não respondida",
  RESPONDIDA: "Respondida",
  EXPIRADA: "Expirada",
};

const AvaliacoesPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<SACAvaliacao[]>([]);
  const [search, setSearch] = useState("");
  const [planta, setPlanta] = useState<string>("ALL");
  const [statusEnvio, setStatusEnvio] = useState<string>("ALL");
  const [statusResposta, setStatusResposta] = useState<string>("ALL");

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAvaliacoes();
      setItems(data);
    } catch (error) {
      toast({
        title: "Erro ao carregar avaliações",
        description: error instanceof Error ? error.message : "Não foi possível carregar as avaliações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const searchNormalized = search.trim().toLowerCase();
      const matchesSearch = !searchNormalized
        || item.clienteNome.toLowerCase().includes(searchNormalized)
        || item.codcli.includes(searchNormalized)
        || item.atendimentoId.toLowerCase().includes(searchNormalized);
      const matchesPlanta = planta === "ALL" || item.planta === planta;
      const matchesEnvio = statusEnvio === "ALL" || item.statusEnvio === statusEnvio;
      const matchesResposta = statusResposta === "ALL" || item.statusResposta === statusResposta;
      return matchesSearch && matchesPlanta && matchesEnvio && matchesResposta;
    });
  }, [items, search, planta, statusEnvio, statusResposta]);

  const copyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      toast({ title: "Link copiado", description: "Link da avaliação copiado para a área de transferência." });
    } catch {
      toast({ title: "Falha ao copiar link", description: "Não foi possível copiar o link.", variant: "destructive" });
    }
  };

  const handleReenviar = async (avaliacaoId: string) => {
    try {
      await reenviarAvaliacao(avaliacaoId, true);
      toast({ title: "Reenvio realizado", description: "A avaliação foi reenviada ao cliente." });
      await load();
    } catch (error) {
      toast({
        title: "Erro ao reenviar",
        description: error instanceof Error ? error.message : "Não foi possível reenviar a avaliação.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Avaliações SAC</h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe envios e respostas da pesquisa de satisfação de atendimento.
          </p>
        </div>
        <Button variant="outline" onClick={() => void load()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Atualizar
        </Button>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="grid gap-3 md:grid-cols-4">
            <div className="relative md:col-span-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cliente, CODCLI ou atendimento"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={planta} onValueChange={setPlanta}>
              <SelectTrigger>
                <SelectValue placeholder="Planta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas as plantas</SelectItem>
                <SelectItem value="MAO">MAO</SelectItem>
                <SelectItem value="BEL">BEL</SelectItem>
                <SelectItem value="AGR">AGR</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusEnvio} onValueChange={setStatusEnvio}>
              <SelectTrigger>
                <SelectValue placeholder="Status de envio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos os envios</SelectItem>
                {Object.entries(STATUS_ENVIO_LABEL).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-3 max-w-xs">
            <Select value={statusResposta} onValueChange={setStatusResposta}>
              <SelectTrigger>
                <SelectValue placeholder="Status da resposta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas as respostas</SelectItem>
                {Object.entries(STATUS_RESPOSTA_LABEL).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>CODCLI</TableHead>
                <TableHead>Atendimento</TableHead>
                <TableHead className="hidden lg:table-cell">Encerramento</TableHead>
                <TableHead>Status envio</TableHead>
                <TableHead>Status resposta</TableHead>
                <TableHead>Nota</TableHead>
                <TableHead className="hidden xl:table-cell">Comentário</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-foreground">{item.clienteNome}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{item.codcli}</TableCell>
                  <TableCell>
                    <Link to={`/sac/${item.atendimentoId}`} className="font-mono text-primary hover:underline">
                      {item.atendimentoId}
                    </Link>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">{item.encerradoAt || "-"}</TableCell>
                  <TableCell>{STATUS_ENVIO_LABEL[item.statusEnvio] || item.statusEnvio}</TableCell>
                  <TableCell>{STATUS_RESPOSTA_LABEL[item.statusResposta] || item.statusResposta}</TableCell>
                  <TableCell>{typeof item.nota === "number" ? item.nota : "-"}</TableCell>
                  <TableCell className="hidden max-w-[320px] truncate xl:table-cell text-muted-foreground">
                    {item.comentario || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => void copyLink(item.link)} title="Copiar link">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => void handleReenviar(item.id)} title="Reenviar avaliação">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                    Nenhuma avaliação encontrada.
                  </TableCell>
                </TableRow>
              )}
              {loading && (
                <TableRow>
                  <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                    Carregando avaliações...
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AvaliacoesPage;
