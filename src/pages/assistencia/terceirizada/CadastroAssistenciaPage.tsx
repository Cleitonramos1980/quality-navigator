import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Plus, Building2, Edit, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { listarAssistenciasTerceirizadas, criarAssistenciaTerceirizada, atualizarAssistenciaTerceirizada } from "@/services/assistenciaTerceirizada";
import type { AssistenciaTerceirizada } from "@/types/assistenciaTerceirizada";
import { toast } from "sonner";

const CadastroAssistenciaPage = () => {
  const navigate = useNavigate();
  const [lista, setLista] = useState<AssistenciaTerceirizada[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AssistenciaTerceirizada | null>(null);
  const [form, setForm] = useState({ nome: "", razaoSocial: "", cnpjCpf: "", contatoPrincipal: "", telefone: "", email: "", endereco: "", cidade: "", uf: "", observacoes: "", status: "ATIVA" as const });

  const load = () => listarAssistenciasTerceirizadas().then(setLista);
  useEffect(() => { load(); }, []);

  const filtered = lista.filter((a) => {
    if (filterStatus !== "ALL" && a.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return a.nome.toLowerCase().includes(q) || (a.cnpjCpf || "").includes(q) || (a.cidade || "").toLowerCase().includes(q);
    }
    return true;
  });

  const openNew = () => {
    setEditing(null);
    setForm({ nome: "", razaoSocial: "", cnpjCpf: "", contatoPrincipal: "", telefone: "", email: "", endereco: "", cidade: "", uf: "", observacoes: "", status: "ATIVA" });
    setModalOpen(true);
  };

  const openEdit = (a: AssistenciaTerceirizada) => {
    setEditing(a);
    setForm({ nome: a.nome, razaoSocial: a.razaoSocial || "", cnpjCpf: a.cnpjCpf || "", contatoPrincipal: a.contatoPrincipal || "", telefone: a.telefone || "", email: a.email || "", endereco: a.endereco || "", cidade: a.cidade || "", uf: a.uf || "", observacoes: a.observacoes || "", status: a.status });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.nome.trim()) { toast.error("Nome é obrigatório"); return; }
    try {
      if (editing) {
        await atualizarAssistenciaTerceirizada(editing.id, form as any);
        toast.success("Assistência atualizada");
      } else {
        await criarAssistenciaTerceirizada(form as any);
        toast.success("Assistência cadastrada");
      }
      setModalOpen(false);
      load();
    } catch { toast.error("Erro ao salvar"); }
  };

  const toggleStatus = async (a: AssistenciaTerceirizada) => {
    const newStatus = a.status === "ATIVA" ? "INATIVA" : "ATIVA";
    await atualizarAssistenciaTerceirizada(a.id, { status: newStatus });
    toast.success(`Assistência ${newStatus === "ATIVA" ? "ativada" : "inativada"}`);
    load();
  };

  const F = ({ label, field, type }: { label: string; field: string; type?: string }) => (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      {type === "textarea" ? (
        <Textarea value={(form as any)[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} className="text-sm" rows={2} />
      ) : (
        <Input value={(form as any)[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} className="text-sm" />
      )}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/assistencia/terceirizada")}><ArrowLeft className="w-5 h-5" /></Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Assistências Técnicas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Cadastro de prestadores de assistência técnica externa</p>
        </div>
        <Button onClick={openNew} className="gap-2"><Plus className="w-4 h-4" /> Nova Assistência</Button>
      </div>

      <Card className="glass-card">
        <CardContent className="py-3 px-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar por nome, CNPJ ou cidade..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                <SelectItem value="ATIVA">Ativas</SelectItem>
                <SelectItem value="INATIVA">Inativas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Nome</TableHead>
                <TableHead className="text-xs">CNPJ/CPF</TableHead>
                <TableHead className="text-xs">Contato</TableHead>
                <TableHead className="text-xs">Cidade/UF</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground text-xs py-6">Nenhuma assistência encontrada</TableCell></TableRow>
              ) : filtered.map((a) => (
                <TableRow key={a.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/assistencia/terceirizada/detalhe/${a.id}`)}>
                  <TableCell className="text-sm font-medium">{a.nome}</TableCell>
                  <TableCell className="text-xs font-mono">{a.cnpjCpf || "—"}</TableCell>
                  <TableCell className="text-xs">{a.contatoPrincipal || "—"}</TableCell>
                  <TableCell className="text-xs">{a.cidade ? `${a.cidade}/${a.uf}` : "—"}</TableCell>
                  <TableCell><Badge variant={a.status === "ATIVA" ? "default" : "secondary"} className="text-[10px]">{a.status === "ATIVA" ? "Ativa" : "Inativa"}</Badge></TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(a)}><Edit className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleStatus(a)}><Power className="w-3.5 h-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Editar Assistência" : "Nova Assistência Técnica"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><F label="Nome *" field="nome" /></div>
            <F label="Razão Social" field="razaoSocial" />
            <F label="CNPJ/CPF" field="cnpjCpf" />
            <F label="Contato Principal" field="contatoPrincipal" />
            <F label="Telefone" field="telefone" />
            <div className="col-span-2"><F label="E-mail" field="email" /></div>
            <div className="col-span-2"><F label="Endereço" field="endereco" /></div>
            <F label="Cidade" field="cidade" />
            <F label="UF" field="uf" />
            <div className="col-span-2"><F label="Observações" field="observacoes" type="textarea" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>{editing ? "Salvar" : "Cadastrar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CadastroAssistenciaPage;
