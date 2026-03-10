import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, UserCheck, UserX, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import FormField from "@/components/forms/FormField";
import { useToast } from "@/hooks/use-toast";
import { getUsuarios, createUsuario, updateUsuario, getPerfis, type Usuario } from "@/services/admin";

const UsuariosPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [perfis, setPerfis] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Usuario | null>(null);
  const [form, setForm] = useState({ nome: "", email: "", perfil: "" });

  useEffect(() => {
    Promise.all([getUsuarios(), getPerfis()])
      .then(([users, roles]) => {
        setUsuarios(users);
        setPerfis(roles as string[]);
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Falha ao carregar usuários.";
        toast({ title: "Erro ao carregar dados", description: message, variant: "destructive" });
      });
  }, []);

  const openNew = () => { setEditing(null); setForm({ nome: "", email: "", perfil: "" }); setDialogOpen(true); };
  const openEdit = (u: Usuario) => { setEditing(u); setForm({ nome: u.nome, email: u.email, perfil: u.perfil }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.nome || !form.email || !form.perfil) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }

    try {
      if (editing) {
        const updated = await updateUsuario(editing.id, form as any);
        setUsuarios((prev) => prev.map((u) => u.id === editing.id ? updated : u));
        toast({ title: "Usuário atualizado" });
      } else {
        const novo = await createUsuario({ ...form, perfil: form.perfil as any, ativo: true });
        setUsuarios((prev) => [...prev, novo]);
        toast({ title: "Usuário criado" });
      }
      setDialogOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao salvar usuário.";
      toast({ title: "Erro ao salvar usuário", description: message, variant: "destructive" });
    }
  };

  const toggleAtivo = async (u: Usuario) => {
    try {
      const updated = await updateUsuario(u.id, { ativo: !u.ativo });
      setUsuarios((prev) => prev.map((x) => x.id === u.id ? updated : x));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao atualizar status do usuário.";
      toast({ title: "Erro ao atualizar usuário", description: message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in"><div className="flex items-center gap-4"><Button variant="ghost" size="icon" onClick={() => navigate("/admin")}><ArrowLeft className="w-5 h-5" /></Button><div className="flex-1"><h1 className="text-2xl font-bold text-foreground">Usuários</h1><p className="text-sm text-muted-foreground mt-0.5">Gerenciar usuários do sistema</p></div><Button className="gap-2" onClick={openNew}><Plus className="w-4 h-4" />Novo Usuário</Button></div><div className="glass-card rounded-lg overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-border bg-muted/50"><th className="text-left px-4 py-3 font-medium text-muted-foreground">ID</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">Nome</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">Perfil</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">Ações</th></tr></thead><tbody>{usuarios.map((u) => <tr key={u.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors"><td className="px-4 py-3 font-mono text-xs text-primary">{u.id}</td><td className="px-4 py-3 font-medium text-foreground">{u.nome}</td><td className="px-4 py-3 text-muted-foreground">{u.email}</td><td className="px-4 py-3"><span className="text-xs font-mono bg-primary/10 text-primary px-2 py-0.5 rounded">{u.perfil}</span></td><td className="px-4 py-3"><span className={`text-xs font-medium ${u.ativo ? "text-success" : "text-destructive"}`}>{u.ativo ? "Ativo" : "Inativo"}</span></td><td className="px-4 py-3"><div className="flex gap-1"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(u)}><Pencil className="w-3.5 h-3.5" /></Button><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { void toggleAtivo(u); }}>{u.ativo ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}</Button></div></td></tr>)}</tbody></table></div></div><Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent><DialogHeader><DialogTitle>{editing ? "Editar Usuário" : "Novo Usuário"}</DialogTitle></DialogHeader><div className="space-y-4"><FormField label="Nome" required><Input value={form.nome} onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))} /></FormField><FormField label="Email" required><Input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} /></FormField><FormField label="Perfil" required><Select value={form.perfil} onValueChange={(v) => setForm((p) => ({ ...p, perfil: v }))}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{perfis.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></FormField></div><DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button><Button onClick={() => { void handleSave(); }}>Salvar</Button></DialogFooter></DialogContent></Dialog></div>
  );
};

export default UsuariosPage;


