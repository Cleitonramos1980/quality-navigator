import { Users, Shield, ScrollText, Settings as SettingsIcon } from "lucide-react";

const sections = [
  { title: "Usuários", desc: "Gerenciar usuários do sistema", icon: Users, count: 12 },
  { title: "Perfis de Acesso", desc: "Configurar roles e permissões (RBAC)", icon: Shield, count: 5 },
  { title: "Log de Auditoria", desc: "Registro de todas as ações do sistema", icon: ScrollText, count: "1.2k" },
  { title: "Parâmetros", desc: "Configurações gerais do sistema", icon: SettingsIcon },
];

const AdminPage = () => (
  <div className="space-y-6 animate-fade-in">
    <div>
      <h1 className="text-2xl font-bold text-foreground">Administração</h1>
      <p className="text-sm text-muted-foreground mt-1">Gestão de usuários, permissões e configurações</p>
    </div>

    <div className="grid gap-4 sm:grid-cols-2">
      {sections.map((s) => (
        <div
          key={s.title}
          className="glass-card rounded-lg p-5 hover:shadow-md transition-shadow cursor-pointer group"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
              <s.icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-foreground">{s.title}</h3>
                {s.count && <span className="text-xs font-mono text-muted-foreground">{s.count}</span>}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{s.desc}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default AdminPage;
