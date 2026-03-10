import { useEffect, useState } from "react";
import { FileText, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import SectionCard from "@/components/forms/SectionCard";
import FormField from "@/components/forms/FormField";
import {
  createDocumentoQualidade,
  listDocumentosQualidade,
} from "@/services/governancaQualidade";
import type { DocumentoQualidade } from "@/types/sgq";

const defaultForm = {
  codigo: "",
  titulo: "",
  tipo: "INSTRUCAO_TRABALHO",
  status: "VIGENTE",
  versaoAtual: "1.0",
  elaborador: "",
  revisor: "",
  aprovador: "",
  setor: "Qualidade",
  validadeAt: "",
};

const DocumentosQualidadePage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [docs, setDocs] = useState<DocumentoQualidade[]>([]);
  const [form, setForm] = useState(defaultForm);

  const load = async () => {
    setLoading(true);
    try {
      setDocs(await listDocumentosQualidade());
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao carregar documentos.";
      toast({ title: "Erro", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const update = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreate = async () => {
    if (!form.codigo.trim() || !form.titulo.trim() || !form.elaborador.trim() || !form.revisor.trim() || !form.aprovador.trim()) {
      toast({
        title: "Campos obrigatorios",
        description: "Informe codigo, titulo, elaborador, revisor e aprovador.",
        variant: "destructive",
      });
      return;
    }
    try {
      const payload = {
        ...form,
        validadeAt: form.validadeAt || undefined,
      };
      const created = await createDocumentoQualidade(payload);
      setDocs((prev) => [created, ...prev]);
      setForm(defaultForm);
      toast({ title: "Documento criado", description: `${created.codigo} registrado com sucesso.` });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao salvar documento.";
      toast({ title: "Erro ao salvar", description: message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary" />
          Documentos da Qualidade
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Controle de documentos vigentes, revisao e responsaveis.
        </p>
      </div>

      <SectionCard title="Novo Documento" description="Cadastro rapido de documento controlado">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormField label="Codigo" required>
            <Input value={form.codigo} onChange={(e) => update("codigo", e.target.value)} />
          </FormField>
          <FormField label="Titulo" required>
            <Input value={form.titulo} onChange={(e) => update("titulo", e.target.value)} />
          </FormField>
          <FormField label="Tipo">
            <Input value={form.tipo} onChange={(e) => update("tipo", e.target.value)} />
          </FormField>
          <FormField label="Status">
            <Input value={form.status} onChange={(e) => update("status", e.target.value)} />
          </FormField>
          <FormField label="Versao">
            <Input value={form.versaoAtual} onChange={(e) => update("versaoAtual", e.target.value)} />
          </FormField>
          <FormField label="Elaborador" required>
            <Input value={form.elaborador} onChange={(e) => update("elaborador", e.target.value)} />
          </FormField>
          <FormField label="Revisor" required>
            <Input value={form.revisor} onChange={(e) => update("revisor", e.target.value)} />
          </FormField>
          <FormField label="Aprovador" required>
            <Input value={form.aprovador} onChange={(e) => update("aprovador", e.target.value)} />
          </FormField>
          <FormField label="Setor">
            <Input value={form.setor} onChange={(e) => update("setor", e.target.value)} />
          </FormField>
          <FormField label="Validade">
            <Input type="date" value={form.validadeAt} onChange={(e) => update("validadeAt", e.target.value)} />
          </FormField>
        </div>
        <div className="flex justify-end mt-3">
          <Button className="gap-2" onClick={() => void handleCreate()}>
            <Save className="w-4 h-4" />
            Salvar Documento
          </Button>
        </div>
      </SectionCard>

      <SectionCard title="Documentos Cadastrados" description={loading ? "Carregando..." : `${docs.length} registro(s)`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-3 py-2">Codigo</th>
                <th className="text-left px-3 py-2">Titulo</th>
                <th className="text-left px-3 py-2">Tipo</th>
                <th className="text-left px-3 py-2">Status</th>
                <th className="text-left px-3 py-2">Versao</th>
                <th className="text-left px-3 py-2">Elaborador</th>
                <th className="text-left px-3 py-2">Revisor</th>
                <th className="text-left px-3 py-2">Aprovador</th>
                <th className="text-left px-3 py-2">Setor</th>
                <th className="text-left px-3 py-2">Validade</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((doc) => (
                <tr key={doc.id} className="border-b border-border/60">
                  <td className="px-3 py-2">{doc.codigo}</td>
                  <td className="px-3 py-2">{doc.titulo}</td>
                  <td className="px-3 py-2">{doc.tipo}</td>
                  <td className="px-3 py-2">{doc.status}</td>
                  <td className="px-3 py-2">{doc.versaoAtual}</td>
                  <td className="px-3 py-2">{doc.elaborador}</td>
                  <td className="px-3 py-2">{doc.revisor}</td>
                  <td className="px-3 py-2">{doc.aprovador}</td>
                  <td className="px-3 py-2">{doc.setor}</td>
                  <td className="px-3 py-2">{doc.validadeAt || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
};

export default DocumentosQualidadePage;
