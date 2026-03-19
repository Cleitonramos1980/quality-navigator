import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Plus, Save, Search, Edit, Power, PowerOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SectionCard from "@/components/forms/SectionCard";
import FormField from "@/components/forms/FormField";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { listTiposNCInspecao, createTipoNCInspecao, updateTipoNCInspecao } from "@/services/inspecoes";
import type { TipoNCInspecao } from "@/types/inspecoes";
import { CATEGORIAS_NC } from "@/types/inspecoes";
import { useSetoresPermitidos } from "@/hooks/useSetoresPermitidos";

const TiposNCPage = () => {
  const { toast } = useToast();
  const { setoresPermitidos, loading: loadingSetores } = useSetoresPermitidos();
  const [tipos, setTipos] = useState<TipoNCInspecao[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filtroSetor, setFiltroSetor] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ setor: "", nome: "", categoria: "Visual", observacao: "" });

  const setoresDisponiveis = useMemo(() => [...setoresPermitidos].sort(), [setoresPermitidos]);

  const resetForm = () => {
    setForm({ setor: setoresDisponiveis[0] ?? "", nome: "", categoria: "Visual", observacao: "" });
    setEditId(null);
    setShowForm(false);
  };

  const load = async () => {
    setLoading(true);
    try {
      const data = await listTiposNCInspecao();
      setTipos(data.filter((tipo) => tipo.setor === "Geral" || setoresPermitidos.includes(tipo.setor)));
    } catch (e) {
      toast({ title: "Erro", description: e instanceof Error ? e.message : "Falha", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loadingSetores && !form.setor && setoresDisponiveis.length > 0) {
      setForm((prev) => ({ ...prev, setor: setoresDisponiveis[0] }));
    }
  }, [loadingSetores, form.setor, setoresDisponiveis]);

  useEffect(() => {
    if (loadingSetores) return;
    void load();
  }, [loadingSetores, setoresPermitidos]);

  useEffect(() => {
    if (filtroSetor && !setoresDisponiveis.includes(filtroSetor)) {
      setFiltroSetor("");
    }
  }, [filtroSetor, setoresDisponiveis]);

  const filtered = tipos.filter((t) => {
    if (search && !t.nome.toLowerCase().includes(search.toLowerCase())) return false;
    if (filtroSetor && t.setor !== filtroSetor) return false;
    return true;
  });

  const handleSave = async () => {
    if (!form.nome.trim()) { toast({ title: "Informe o nome", variant: "destructive" }); return; }
    if (!form.setor) { toast({ title: "Selecione um setor permitido", variant: "destructive" }); return; }
    try {
      if (editId) {
        await updateTipoNCInspecao(editId, { ...form, ativo: true });
        toast({ title: "Tipo atualizado" });
      } else {
        await createTipoNCInspecao({ ...form, ativo: true });
        toast({ title: "Tipo criado" });
      }
      resetForm();
      await load();
    } catch (e) {
      toast({ title: "Erro", description: e instanceof Error ? e.message : "Falha", variant: "destructive" });
    }
  };

  const toggleAtivo = async (t: TipoNCInspecao) => {
    try {
      await updateTipoNCInspecao(t.id, { ativo: !t.ativo });
      toast({ title: t.ativo ? "Tipo inativado" : "Tipo ativado" });
      await load();
    } catch (e) {
      toast({ title: "Erro", description: e instanceof Error ? e.message : "Falha", variant: "destructive" });
    }
  };

  const startEdit = (t: TipoNCInspecao) => {
    setEditId(t.id);
    setForm({ setor: t.setor, nome: t.nome, categoria: t.categoria, observacao: t.observacao || "" });
    setShowForm(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-primary" />
            Tipos de Não Conformidade
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Cadastro de tipos de NC por setor dentro do seu escopo</p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            if (showForm) {
              resetForm();
              return;
            }
            setEditId(null);
            setForm({ setor: setoresDisponiveis[0] ?? "", nome: "", categoria: "Visual", observacao: "" });
            setShowForm(true);
          }}
        >
          <Plus className="w-4 h-4 mr-1" />{showForm ? "Fechar" : "Novo Tipo"}
        </Button>
      </div>

      {showForm && (
        <SectionCard title={editId ? "Editar Tipo de NC" : "Novo Tipo de NC"}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FormField label="Setor" required>
              <select value={form.setor} onChange={(e) => setForm((p) => ({ ...p, setor: e.target.value }))} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" disabled={loadingSetores || setoresDisponiveis.length === 0}>
                <option value="">Selecione...</option>
                {setoresDisponiveis.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </FormField>
            <FormField label="Nome" required>
              <Input value={form.nome} onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))} placeholder="Ex: Limpeza inadequada" />
            </FormField>
            <FormField label="Categoria">
              <select value={form.categoria} onChange={(e) => setForm((p) => ({ ...p, categoria: e.target.value }))} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {CATEGORIAS_NC.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </FormField>
            <FormField label="Observação">
              <Input value={form.observacao} onChange={(e) => setForm((p) => ({ ...p, observacao: e.target.value }))} />
            </FormField>
          </div>
          <div className="flex justify-end mt-3 gap-2">
            <Button variant="outline" onClick={resetForm}>Cancelar</Button>
            <Button onClick={handleSave} className="gap-2" disabled={loadingSetores}><Save className="w-4 h-4" />Salvar</Button>
          </div>
        </SectionCard>
      )}

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Pesquisar..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <select value={filtroSetor} onChange={(e) => setFiltroSetor(e.target.value)} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">Todos os Setores</option>
          {setoresDisponiveis.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <SectionCard title="Tipos Cadastrados" description={loading || loadingSetores ? "Carregando..." : `${filtered.length} tipo(s)`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-3 py-2">Setor</th>
                <th className="text-left px-3 py-2">Nome</th>
                <th className="text-left px-3 py-2">Categoria</th>
                <th className="text-left px-3 py-2">Status</th>
                <th className="text-left px-3 py-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">Nenhum tipo encontrado.</td></tr>
              ) : filtered.map((t) => (
                <tr key={t.id} className="border-b border-border/60 hover:bg-muted/10">
                  <td className="px-3 py-2">{t.setor}</td>
                  <td className="px-3 py-2 font-medium">{t.nome}</td>
                  <td className="px-3 py-2">{t.categoria}</td>
                  <td className="px-3 py-2"><Badge variant={t.ativo ? "default" : "secondary"}>{t.ativo ? "Ativo" : "Inativo"}</Badge></td>
                  <td className="px-3 py-2 flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => startEdit(t)}><Edit className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => toggleAtivo(t)}>{t.ativo ? <PowerOff className="w-4 h-4 text-destructive" /> : <Power className="w-4 h-4 text-success" />}</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
};

export default TiposNCPage;
