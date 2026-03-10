import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { listAll } from "@/services/osTransitionLog";
import { OS_STATUS_LABELS } from "@/types/assistencia";
import type { OSTransitionLog } from "@/types/assistencia";
import { Badge } from "@/components/ui/badge";
import { getAuditLog, type AuditLogEntry } from "@/services/admin";

const LogAuditoriaPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [transitionLogs, setTransitionLogs] = useState<OSTransitionLog[]>([]);
  const [transSearch, setTransSearch] = useState("");

  useEffect(() => {
    getAuditLog().then(setAuditLog);
    listAll().then(setTransitionLogs);
  }, []);

  const filtered = auditLog.filter((l) => l.usuario.toLowerCase().includes(search.toLowerCase()) || l.entidade.toLowerCase().includes(search.toLowerCase()) || l.acao.toLowerCase().includes(search.toLowerCase()));
  const filteredTrans = transitionLogs.filter((l) => l.usuario.toLowerCase().includes(transSearch.toLowerCase()) || l.osId.toLowerCase().includes(transSearch.toLowerCase()) || l.planta.toLowerCase().includes(transSearch.toLowerCase()) || (l.motivo || "").toLowerCase().includes(transSearch.toLowerCase()));

  return (
    <div className="space-y-6 animate-fade-in"><div className="flex items-center gap-4"><Button variant="ghost" size="icon" onClick={() => navigate("/admin")}><ArrowLeft className="w-5 h-5" /></Button><div><h1 className="text-2xl font-bold text-foreground">Log de Auditoria</h1><p className="text-sm text-muted-foreground mt-0.5">Registro de todas as ações do sistema</p></div></div><Tabs defaultValue="geral"><TabsList><TabsTrigger value="geral">Geral</TabsTrigger><TabsTrigger value="transicoes">Transições de OS</TabsTrigger></TabsList><TabsContent value="geral" className="space-y-4"><div className="relative max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Buscar por usuário, entidade..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" /></div><div className="glass-card rounded-lg overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-border bg-muted/50"><th className="text-left px-4 py-3 font-medium text-muted-foreground">Data</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">Usuário</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">Ação</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">Entidade</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">ID</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">Detalhes</th></tr></thead><tbody>{filtered.map((l) => <tr key={l.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors"><td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">{l.data}</td><td className="px-4 py-3 font-medium text-foreground">{l.usuario}</td><td className="px-4 py-3"><span className="text-xs font-mono bg-primary/10 text-primary px-2 py-0.5 rounded">{l.acao}</span></td><td className="px-4 py-3 text-xs font-mono">{l.entidade}</td><td className="px-4 py-3 text-xs font-mono text-primary">{l.entidadeId}</td><td className="px-4 py-3 text-muted-foreground">{l.detalhes}</td></tr>)}</tbody></table></div></div></TabsContent><TabsContent value="transicoes" className="space-y-4"><div className="relative max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Buscar por OS, usuário, planta, motivo..." value={transSearch} onChange={(e) => setTransSearch(e.target.value)} className="pl-9" /></div><div className="glass-card rounded-lg overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-border bg-muted/50"><th className="text-left px-4 py-3 font-medium text-muted-foreground">Data/Hora</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">OS</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">Usuário</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">Perfil/Papel</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">Planta</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">De ? Para</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">Motivo</th></tr></thead><tbody>{filteredTrans.length === 0 ? <tr><td colSpan={7} className="text-center py-6 text-muted-foreground text-sm">Nenhuma transição registrada</td></tr> : filteredTrans.map((l) => <tr key={l.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors"><td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">{l.timestamp.replace("T", " ").slice(0, 16)}</td><td className="px-4 py-3 text-xs font-mono text-primary">{l.osId}</td><td className="px-4 py-3 font-medium text-foreground text-xs">{l.usuario}</td><td className="px-4 py-3 text-xs">{l.perfil} / {l.papel}</td><td className="px-4 py-3 text-xs">{l.planta}</td><td className="px-4 py-3 text-xs"><Badge variant="outline" className="text-[10px] mr-1">{OS_STATUS_LABELS[l.oldStatus]}</Badge><span className="text-muted-foreground">?</span><Badge variant="outline" className="text-[10px] ml-1">{OS_STATUS_LABELS[l.newStatus]}</Badge></td><td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate">{l.motivo || "-"}</td></tr>)}</tbody></table></div></div></TabsContent></Tabs></div>
  );
};

export default LogAuditoriaPage;


