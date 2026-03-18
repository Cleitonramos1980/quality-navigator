import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Plus, Save, Search, Edit, Power, PowerOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import SectionCard from "@/components/forms/SectionCard";
import FormField from "@/components/forms/FormField";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { listTiposNCInspecao, createTipoNCInspecao, updateTipoNCInspecao } from "@/services/inspecoes";
import type { TipoNCInspecao } from "@/types/inspecoes";
import { SETORES_INSPECAO, CATEGORIAS_NC } from "@/types/inspecoes";

const TiposNCPage = () => {
  const { toast } = useToast();
  const [tipos, setTipos] = useState<TipoNCInspecao[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filtroSetor, setFiltroSetor] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ setor: "Produção", nome: "", categoria: "Visual", observacao: "" });

  const load = async () => {
    setLoading(true);
    try { setTipos(await listTiposNCInspecao()); }
    catch (e) { toast({ title: "Erro", description: e instanceof Error ? e.message : "Falha", variant: "destructive" }); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const filtered = tipos.filter((t) => {
    if (search && !t.nome.toLowerCase().includes(search.toLowerCase())) return false;
    if (filtroSetor && t.setor !== filtroSetor) return false;
    return true;
  });

  const handleSave = async () => {
    if (!form.nome.trim()) { toast({ title: "Informe o nome", variant: "destructive" }); return; }
    try {
      if (editId) {
        await updateTipoNCInspecao(editId, { ...form, ativo: true });
        toast({ title: "Tipo atualizado" });
      } else {
        await createTipoNCInspecao({ ...form, ativo: true });
        toast({ title: "Tipo criado" });
      }
      setForm({ setor: "Produção", nome: "", categoria: "Visual", observacao: "" });
      setShowForm(false);
      setEditId(null);
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
          <p className="text-sm text-muted-foreground mt-0.5">Cadastro de tipos de NC por setor para inspeções</p>
        </div>
        <Button size="sm" onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ setor: "Produção", nome: "", categoria: "Visual", observacao: "" }); }}>
          <Plus className="w-4 h-4 mr-1" />{showForm ? "Fechar" : "Novo Tipo"}
        </Button>
      </div>

      {showForm && (
        <SectionCard title={editId ? "Editar Tipo de NC" : "Novo Tipo de NC"}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FormField label="Setor" required>
              <select value={form.setor} onChange={(e) => setForm((p) => ({ ...p, setor: e.target.value }))} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {SETORES_INSPECAO.map((s) => <option key={s} value={s}>{s}</option>)}
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
            <Button variant="outline" onClick={() => { setShowForm(false); setEditId(null); }}>Cancelar</Button>
            <Button onClick={handleSave} className="gap-2"><Save className="w-4 h-4" />Salvar</Button>
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
          {SETORES_INSPECAO.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <SectionCard title="Tipos Cadastrados" description={loading ? "Carregando..." : `${filtered.length} tipo(s)`}>
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
