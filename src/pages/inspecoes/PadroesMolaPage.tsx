import { useEffect, useState } from "react";
import { Ruler, Plus, Save, Search, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import SectionCard from "@/components/forms/SectionCard";
import FormField from "@/components/forms/FormField";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { listPadroesMola, createPadraoMola, updatePadraoMola } from "@/services/inspecoes";
import type { PadraoMola } from "@/types/inspecoes";

const PadroesMolaPage = () => {
  const { toast } = useToast();
  const [padroes, setPadroes] = useState<PadraoMola[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ alturaTipo: "", item: "", descricao: "", padrao: "", minimo: "", maximo: "", unidade: "mm" });

  const load = async () => {
    setLoading(true);
    try { setPadroes(await listPadroesMola()); }
    catch (e) { toast({ title: "Erro", description: e instanceof Error ? e.message : "Falha", variant: "destructive" }); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const filtered = padroes.filter((p) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return p.alturaTipo.toLowerCase().includes(s) || p.item.toLowerCase().includes(s) || p.descricao.toLowerCase().includes(s);
  });

  const handleSave = async () => {
    if (!form.alturaTipo.trim() || !form.item.trim()) { toast({ title: "Campos obrigatórios", description: "Informe altura/tipo e item.", variant: "destructive" }); return; }
    const numPadrao = parseFloat(form.padrao.replace(",", "."));
    const numMin = parseFloat(form.minimo.replace(",", "."));
    const numMax = parseFloat(form.maximo.replace(",", "."));
    if (isNaN(numPadrao) || isNaN(numMin) || isNaN(numMax)) { toast({ title: "Valores inválidos", variant: "destructive" }); return; }

    try {
      const payload = { alturaTipo: form.alturaTipo, item: form.item, descricao: form.descricao, padrao: form.padrao, minimo: numMin, maximo: numMax, unidade: form.unidade, ativo: true };
      if (editId) {
        await updatePadraoMola(editId, payload);
        toast({ title: "Padrão atualizado" });
      } else {
        await createPadraoMola(payload);
        toast({ title: "Padrão criado" });
      }
      setForm({ alturaTipo: "", item: "", descricao: "", padrao: "", minimo: "", maximo: "", unidade: "mm" });
      setShowForm(false);
      setEditId(null);
      await load();
    } catch (e) {
      toast({ title: "Erro", description: e instanceof Error ? e.message : "Falha", variant: "destructive" });
    }
  };

  const startEdit = (p: PadraoMola) => {
    setEditId(p.id);
    setForm({ alturaTipo: p.alturaTipo, item: p.item, descricao: p.descricao, padrao: String(p.padrao), minimo: String(p.minimo), maximo: String(p.maximo), unidade: p.unidade });
    setShowForm(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Ruler className="w-6 h-6 text-primary" />
            Padrões de Molas
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Padrões dimensionais para inspeção de molas ensacadas</p>
        </div>
        <Button size="sm" onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ alturaTipo: "", item: "", descricao: "", padrao: "", minimo: "", maximo: "", unidade: "mm" }); }}>
          <Plus className="w-4 h-4 mr-1" />{showForm ? "Fechar" : "Novo Padrão"}
        </Button>
      </div>

      {showForm && (
        <SectionCard title={editId ? "Editar Padrão" : "Novo Padrão"}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FormField label="Altura / Tipo" required><Input value={form.alturaTipo} onChange={(e) => setForm((p) => ({ ...p, alturaTipo: e.target.value }))} placeholder="Ex: D28-15cm" /></FormField>
            <FormField label="Item" required><Input value={form.item} onChange={(e) => setForm((p) => ({ ...p, item: e.target.value }))} placeholder="Ex: Diâmetro arame" /></FormField>
            <FormField label="Descrição"><Input value={form.descricao} onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))} /></FormField>
            <FormField label="Padrão" required><Input value={form.padrao} onChange={(e) => setForm((p) => ({ ...p, padrao: e.target.value }))} placeholder="2.0" /></FormField>
            <FormField label="Mínimo" required><Input value={form.minimo} onChange={(e) => setForm((p) => ({ ...p, minimo: e.target.value }))} placeholder="1.95" /></FormField>
            <FormField label="Máximo" required><Input value={form.maximo} onChange={(e) => setForm((p) => ({ ...p, maximo: e.target.value }))} placeholder="2.05" /></FormField>
            <FormField label="Unidade">
              <select value={form.unidade} onChange={(e) => setForm((p) => ({ ...p, unidade: e.target.value }))} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option>mm</option><option>cm</option><option>N</option><option>kgf</option><option>g</option>
              </select>
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
      </div>

      <SectionCard title="Padrões Cadastrados" description={loading ? "Carregando..." : `${filtered.length} padrão(ões)`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-3 py-2">Altura/Tipo</th>
                <th className="text-left px-3 py-2">Item</th>
                <th className="text-left px-3 py-2">Descrição</th>
                <th className="text-center px-3 py-2">Padrão</th>
                <th className="text-center px-3 py-2">Mín</th>
                <th className="text-center px-3 py-2">Máx</th>
                <th className="text-center px-3 py-2">Und</th>
                <th className="text-left px-3 py-2">Status</th>
                <th className="text-left px-3 py-2">Ação</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="px-3 py-8 text-center text-muted-foreground">Nenhum padrão encontrado.</td></tr>
              ) : filtered.map((p) => (
                <tr key={p.id} className="border-b border-border/60 hover:bg-muted/10">
                  <td className="px-3 py-2 font-medium">{p.alturaTipo}</td>
                  <td className="px-3 py-2">{p.item}</td>
                  <td className="px-3 py-2 text-muted-foreground">{p.descricao}</td>
                  <td className="px-3 py-2 text-center font-mono">{p.padrao}</td>
                  <td className="px-3 py-2 text-center font-mono">{p.minimo}</td>
                  <td className="px-3 py-2 text-center font-mono">{p.maximo}</td>
                  <td className="px-3 py-2 text-center">{p.unidade}</td>
                  <td className="px-3 py-2"><Badge variant={p.ativo ? "default" : "secondary"}>{p.ativo ? "Ativo" : "Inativo"}</Badge></td>
                  <td className="px-3 py-2"><Button size="sm" variant="ghost" onClick={() => startEdit(p)}><Edit className="w-4 h-4" /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
};

export default PadroesMolaPage;
