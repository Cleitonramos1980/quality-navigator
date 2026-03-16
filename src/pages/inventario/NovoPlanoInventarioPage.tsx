import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Save, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { getLojas, getDepartamentos } from "@/services/inventario";
import type { LojaInventario, DepartamentoInventario } from "@/types/inventario";
import { FREQUENCIA_LABELS, type FrequenciaInventario } from "@/types/inventario";
import { toast } from "@/hooks/use-toast";

interface PlanoLinha {
  id: string;
  lojaIds: string[];
  departamentoIds: string[];
  frequencias: FrequenciaInventario[];
  quantidadeItens: number;
}

const LojaMultiSelect = ({
  lojaIds,
  lojas,
  onChange,
}: {
  lojaIds: string[];
  lojas: LojaInventario[];
  onChange: (ids: string[]) => void;
}) => {
  const [open, setOpen] = useState(false);

  const allSelected = lojas.length > 0 && lojaIds.length === lojas.length;

  const toggleAll = () => {
    onChange(allSelected ? [] : lojas.map((l) => l.id));
  };

  const toggle = (id: string) => {
    onChange(
      lojaIds.includes(id) ? lojaIds.filter((i) => i !== id) : [...lojaIds, id]
    );
  };

  const label =
    lojaIds.length === 0
      ? "Selecione..."
      : lojaIds.length === lojas.length
        ? "Todas as lojas"
        : lojaIds.length === 1
          ? lojas.find((l) => l.id === lojaIds[0])?.nome ?? "1 loja"
          : `${lojaIds.length} lojas`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm ring-offset-background hover:bg-muted/30 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <span className="truncate">{label}</span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-1" align="start">
        <button
          type="button"
          onClick={toggleAll}
          className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
        >
          <div className={`flex h-4 w-4 items-center justify-center rounded-sm border ${allSelected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30"}`}>
            {allSelected && <Check className="h-3 w-3" />}
          </div>
          <span className="font-medium">Selecionar Todas</span>
        </button>
        <div className="my-1 h-px bg-border" />
        <div className="max-h-48 overflow-y-auto">
          {lojas.map((loja) => {
            const checked = lojaIds.includes(loja.id);
            return (
              <button
                key={loja.id}
                type="button"
                onClick={() => toggle(loja.id)}
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
              >
                <div className={`flex h-4 w-4 items-center justify-center rounded-sm border ${checked ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30"}`}>
                  {checked && <Check className="h-3 w-3" />}
                </div>
                <span className="truncate">{loja.nome}</span>
                <span className="ml-auto text-xs text-muted-foreground">{loja.regional}</span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};

const MultiSelectPopover = ({
  selectedIds,
  options,
  onChange,
  placeholder = "Selecione...",
  allLabel = "Selecionar Todos",
}: {
  selectedIds: string[];
  options: { id: string; label: string }[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
  allLabel?: string;
}) => {
  const [open, setOpen] = useState(false);
  const allSelected = options.length > 0 && selectedIds.length === options.length;

  const toggleAll = () => {
    onChange(allSelected ? [] : options.map((o) => o.id));
  };

  const toggle = (id: string) => {
    onChange(
      selectedIds.includes(id) ? selectedIds.filter((i) => i !== id) : [...selectedIds, id]
    );
  };

  const label =
    selectedIds.length === 0
      ? placeholder
      : selectedIds.length === options.length
        ? allLabel
        : selectedIds.length === 1
          ? options.find((o) => o.id === selectedIds[0])?.label ?? "1 item"
          : `${selectedIds.length} selecionados`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm ring-offset-background hover:bg-muted/30 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <span className="truncate">{label}</span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-1" align="start">
        <button
          type="button"
          onClick={toggleAll}
          className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
        >
          <div className={`flex h-4 w-4 items-center justify-center rounded-sm border ${allSelected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30"}`}>
            {allSelected && <Check className="h-3 w-3" />}
          </div>
          <span className="font-medium">Selecionar Todos</span>
        </button>
        <div className="my-1 h-px bg-border" />
        <div className="max-h-48 overflow-y-auto">
          {options.map((opt) => {
            const checked = selectedIds.includes(opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => toggle(opt.id)}
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
              >
                <div className={`flex h-4 w-4 items-center justify-center rounded-sm border ${checked ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30"}`}>
                  {checked && <Check className="h-3 w-3" />}
                </div>
                <span className="truncate">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};

const NovoPlanoInventarioPage = () => {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [dataInicio, setDataInicio] = useState("2026-03-15");
  const [dataFim, setDataFim] = useState("2026-06-15");
  const [lojasSelecionadas, setLojasSelecionadas] = useState<string[]>([]);
  const [linhas, setLinhas] = useState<PlanoLinha[]>([]);
  const [allLojas, setAllLojas] = useState<LojaInventario[]>([]);
  const [allDepartamentos, setAllDepartamentos] = useState<DepartamentoInventario[]>([]);

  useEffect(() => {
    getLojas().then(setAllLojas);
    getDepartamentos().then(setAllDepartamentos);
  }, []);

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
        lojaIds: lojasSelecionadas.length > 0 ? [...lojasSelecionadas] : allLojas.length > 0 ? [allLojas[0].id] : [],
        departamentoIds: allDepartamentos.length > 0 ? [allDepartamentos[0].id] : [],
        frequencias: ["DIARIA" as FrequenciaInventario],
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
    ? allLojas.filter((l) => lojasSelecionadas.includes(l.id))
    : allLojas;

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
                      <td className="p-2 min-w-[200px]">
                        <LojaMultiSelect
                          lojaIds={linha.lojaIds}
                          lojas={lojasFiltradas}
                          onChange={(ids) => updateLinha(linha.id, "lojaIds", ids)}
                        />
                      </td>
                      <td className="p-2">
                        <MultiSelectPopover
                          selectedIds={linha.departamentoIds}
                          options={mockDepartamentos.map((d) => ({ id: d.id, label: d.nome }))}
                          onChange={(ids) => updateLinha(linha.id, "departamentoIds", ids)}
                          placeholder="Selecione..."
                          allLabel="Todos os departamentos"
                        />
                      </td>
                      <td className="p-2">
                        <MultiSelectPopover
                          selectedIds={linha.frequencias}
                          options={(Object.keys(FREQUENCIA_LABELS) as FrequenciaInventario[]).map((f) => ({ id: f, label: FREQUENCIA_LABELS[f] }))}
                          onChange={(ids) => updateLinha(linha.id, "frequencias", ids)}
                          placeholder="Selecione..."
                          allLabel="Todas as frequências"
                        />
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
