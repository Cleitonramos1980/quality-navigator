import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Save, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { mockLojas, mockDepartamentos } from "@/data/mockInventarioData";
import { FREQUENCIA_LABELS, type FrequenciaInventario } from "@/types/inventario";
import { toast } from "@/hooks/use-toast";

interface PlanoLinha {
  id: string;
  lojaId: string;
  departamentoId: string;
  frequencia: FrequenciaInventario;
  quantidadeItens: number;
}

const NovoPlanoInventarioPage = () => {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [dataInicio, setDataInicio] = useState("2026-03-15");
  const [dataFim, setDataFim] = useState("2026-06-15");
  const [lojasSelecionadas, setLojasSelecionadas] = useState<string[]>([]);
  const [linhas, setLinhas] = useState<PlanoLinha[]>([]);

  const toggleLoja = (lojaId: string) => {
    setLojasSelecionadas((prev) =>
      prev.includes(lojaId) ? prev.filter((id) => id !== lojaId) : [...prev, lojaId]
    );
  };

  const addLinha = () => {
    setLinhas((prev) => [
      ...prev,
      {
        id: `PL-${Date.now()}`,
        lojaId: lojasSelecionadas[0] || mockLojas[0].id,
        departamentoId: mockDepartamentos[0].id,
        frequencia: "DIARIA",
        quantidadeItens: 10,
      },
    ]);
  };

  const removeLinha = (id: string) => {
    setLinhas((prev) => prev.filter((l) => l.id !== id));
  };

  const updateLinha = (id: string, field: keyof PlanoLinha, value: any) => {
    setLinhas((prev) => prev.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  };

  const handleSalvar = () => {
    if (!nome.trim()) {
      toast({ title: "Erro", description: "Informe o nome do plano.", variant: "destructive" });
      return;
    }
    if (linhas.length === 0) {
      toast({ title: "Erro", description: "Adicione ao menos uma linha de contagem.", variant: "destructive" });
      return;
    }
    toast({ title: "Plano criado com sucesso", description: `"${nome}" foi salvo com ${linhas.length} regra(s) de contagem.` });
    navigate("/qualidade/inventario");
  };

  const lojasFiltradas = lojasSelecionadas.length > 0
    ? mockLojas.filter((l) => lojasSelecionadas.includes(l.id))
    : mockLojas;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Novo Plano de Inventário</h1>
          <p className="text-sm text-muted-foreground">
            Cadastre um plano com lojas, departamentos, frequências e quantidade de itens a contar
          </p>
        </div>
      </div>

      {/* Dados básicos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Dados do Plano</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Nome do Plano *</Label>
              <Input
                placeholder="Ex: Inventário Q1 2026 — Colchões Diário"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Data Início</Label>
                <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Data Fim</Label>
                <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Descrição / Observações</Label>
            <Textarea
              placeholder="Descreva o objetivo e escopo deste plano de inventário..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Seleção de lojas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Lojas Participantes</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (lojasSelecionadas.length === mockLojas.length) {
                setLojasSelecionadas([]);
              } else {
                setLojasSelecionadas(mockLojas.map((l) => l.id));
              }
            }}
          >
            {lojasSelecionadas.length === mockLojas.length ? "Desmarcar Todas" : "Selecionar Todas"}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {mockLojas.map((loja) => (
              <label
                key={loja.id}
                className="flex items-center gap-2 p-2.5 rounded-md border border-border hover:bg-muted/30 cursor-pointer transition-colors"
              >
                <Checkbox
                  checked={lojasSelecionadas.includes(loja.id)}
                  onCheckedChange={() => toggleLoja(loja.id)}
                />
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{loja.nome}</div>
                  <div className="text-xs text-muted-foreground">{loja.regional}</div>
                </div>
              </label>
            ))}
          </div>
          {lojasSelecionadas.length > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              {lojasSelecionadas.length} loja(s) selecionada(s)
            </p>
          )}
        </CardContent>
      </Card>

      {/* Regras de contagem */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">
            Regras de Contagem ({linhas.length})
          </CardTitle>
          <Button size="sm" onClick={addLinha}>
            <Plus className="h-4 w-4 mr-1" /> Adicionar Regra
          </Button>
        </CardHeader>
        <CardContent>
          {linhas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Nenhuma regra adicionada. Clique em "Adicionar Regra" para definir lojas, departamentos, frequência e
              quantidade de itens a contar.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left p-3 font-medium text-muted-foreground">Loja</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Departamento</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Frequência</th>
                    <th className="text-right p-3 font-medium text-muted-foreground w-36">Qtd Itens a Contar</th>
                    <th className="text-center p-3 font-medium text-muted-foreground w-16" />
                  </tr>
                </thead>
                <tbody>
                  {linhas.map((linha) => (
                    <tr key={linha.id} className="border-b border-border/50">
                      <td className="p-2">
                        <Select
                          value={linha.lojaId}
                          onValueChange={(v) => updateLinha(linha.id, "lojaId", v)}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {lojasFiltradas.map((l) => (
                              <SelectItem key={l.id} value={l.id}>
                                {l.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-2">
                        <Select
                          value={linha.departamentoId}
                          onValueChange={(v) => updateLinha(linha.id, "departamentoId", v)}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {mockDepartamentos.map((d) => (
                              <SelectItem key={d.id} value={d.id}>
                                {d.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-2">
                        <Select
                          value={linha.frequencia}
                          onValueChange={(v) => updateLinha(linha.id, "frequencia", v)}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(Object.keys(FREQUENCIA_LABELS) as FrequenciaInventario[]).map((f) => (
                              <SelectItem key={f} value={f}>
                                {FREQUENCIA_LABELS[f]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          min={1}
                          value={linha.quantidadeItens}
                          onChange={(e) =>
                            updateLinha(linha.id, "quantidadeItens", Math.max(1, Number(e.target.value)))
                          }
                          className="h-9 text-right"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => removeLinha(linha.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Cancelar
        </Button>
        <Button onClick={handleSalvar}>
          <Save className="h-4 w-4 mr-1" /> Salvar Plano
        </Button>
      </div>
    </div>
  );
};

export default NovoPlanoInventarioPage;
