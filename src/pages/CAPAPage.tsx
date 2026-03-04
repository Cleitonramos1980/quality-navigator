import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StatusBadge from "@/components/StatusBadge";
import { mockCAPAs } from "@/data/mockData";
import { useState } from "react";

const CAPAPage = () => {
  const [search, setSearch] = useState("");

  const filtered = mockCAPAs.filter(
    (c) =>
      c.descricaoProblema.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">CAPA</h1>
          <p className="text-sm text-muted-foreground mt-1">Ações Corretivas e Preventivas</p>
        </div>
        <Button className="gap-2"><Plus className="w-4 h-4" />Nova CAPA</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="grid gap-4">
        {filtered.map((c) => (
          <div key={c.id} className="glass-card rounded-lg p-5 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-medium text-primary">{c.id}</span>
                  <StatusBadge status={c.status} />
                  <span className="text-xs text-muted-foreground">Origem: {c.origemTipo} {c.origemId}</span>
                </div>
                <h3 className="font-medium text-foreground">{c.descricaoProblema}</h3>
                {c.causaRaiz && <p className="text-sm text-muted-foreground mt-1">Causa raiz: {c.causaRaiz}</p>}
              </div>
            </div>
            <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
              <span>Responsável: <strong className="text-foreground">{c.responsavel}</strong></span>
              <span>Início: {c.dataInicio}</span>
              <span>Prazo: {c.dataPrazo}</span>
              {c.dataConclusao && <span>Concluído: {c.dataConclusao}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CAPAPage;
