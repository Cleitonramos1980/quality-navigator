import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { RequirePermission, RequireRole } from "@/components/RequireAuthz";
import Dashboard from "@/pages/Dashboard";
import GarantiasPage from "@/pages/GarantiasPage";
import NCPage from "@/pages/NCPage";
import CAPAPage from "@/pages/CAPAPage";
import AuditoriasPage from "@/pages/AuditoriasPage";
import AdminPage from "@/pages/AdminPage";
import LoginPage from "@/pages/LoginPage";
import NotFound from "@/pages/NotFound";
import NovaGarantiaPage from "@/pages/garantias/NovaGarantiaPage";
import NovaNCPage from "@/pages/nc/NovaNCPage";
import NovaCAPAPage from "@/pages/capa/NovaCAPAPage";
import NovaAuditoriaPage from "@/pages/auditorias/NovaAuditoriaPage";
import CalendarioAuditoriasPage from "@/pages/auditorias/CalendarioAuditoriasPage";
import UsuariosPage from "@/pages/admin/UsuariosPage";
import PerfisPage from "@/pages/admin/PerfisPage";
import LogAuditoriaPage from "@/pages/admin/LogAuditoriaPage";
import ParametrosPage from "@/pages/admin/ParametrosPage";
import SACDashboardPage from "@/pages/sac/SACDashboardPage";
import AtendimentosPage from "@/pages/sac/AtendimentosPage";
import NovoAtendimentoPage from "@/pages/sac/NovoAtendimentoPage";
import AtendimentoDetalhePage from "@/pages/sac/AtendimentoDetalhePage";
import PesquisaSACPage from "@/pages/sac/PesquisaSACPage";
import NovaRequisicaoPage from "@/pages/sac/requisicoes/NovaRequisicaoPage";
import RequisicaoListPage from "@/pages/sac/requisicoes/RequisicaoListPage";
import RequisicaoDetalhePage from "@/pages/sac/requisicoes/RequisicaoDetalhePage";
import AtenderRequisicaoPage from "@/pages/sac/requisicoes/AtenderRequisicaoPage";
import AssistenciaDashboardPage from "@/pages/assistencia/AssistenciaDashboardPage";
import OSListPage from "@/pages/assistencia/OSListPage";
import OSDetalhePage from "@/pages/assistencia/OSDetalhePage";
import ReqAssistListPage from "@/pages/assistencia/ReqAssistListPage";
import EstoquePage from "@/pages/assistencia/EstoquePage";
import NovaOSPage from "@/pages/assistencia/NovaOSPage";
import ReceberRequisicaoPage from "@/pages/assistencia/ReceberRequisicaoPage";
import ConsumoOSPage from "@/pages/assistencia/ConsumoOSPage";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
          <Route path="/garantias" element={<AppLayout><GarantiasPage /></AppLayout>} />
          <Route path="/garantias/nova" element={<AppLayout><NovaGarantiaPage /></AppLayout>} />
          <Route path="/nao-conformidades" element={<AppLayout><NCPage /></AppLayout>} />
          <Route path="/nao-conformidades/nova" element={<AppLayout><NovaNCPage /></AppLayout>} />
          <Route path="/capa" element={<AppLayout><CAPAPage /></AppLayout>} />
          <Route path="/capa/nova" element={<AppLayout><NovaCAPAPage /></AppLayout>} />
          <Route path="/auditorias" element={<AppLayout><AuditoriasPage /></AppLayout>} />
          <Route path="/auditorias/nova" element={<AppLayout><NovaAuditoriaPage /></AppLayout>} />
          <Route path="/auditorias/calendario" element={<AppLayout><CalendarioAuditoriasPage /></AppLayout>} />

          {/* SAC — restricted by role */}
          <Route path="/sac/dashboard" element={<AppLayout><RequireRole roles={["SAC", "DIRETORIA"]}><SACDashboardPage /></RequireRole></AppLayout>} />
          <Route path="/sac/atendimentos" element={<AppLayout><RequireRole roles={["SAC", "DIRETORIA"]}><AtendimentosPage /></RequireRole></AppLayout>} />
          <Route path="/sac/novo" element={<AppLayout><RequireRole roles={["SAC"]}><NovoAtendimentoPage /></RequireRole></AppLayout>} />
          <Route path="/sac/pesquisa" element={<AppLayout><RequireRole roles={["SAC", "DIRETORIA"]}><PesquisaSACPage /></RequireRole></AppLayout>} />
          <Route path="/sac/requisicoes" element={<AppLayout><RequireRole roles={["SAC", "DIRETORIA"]}><RequisicaoListPage /></RequireRole></AppLayout>} />
          <Route path="/sac/requisicoes/nova" element={<AppLayout><RequireRole roles={["SAC"]}><NovaRequisicaoPage /></RequireRole></AppLayout>} />
          <Route path="/sac/requisicoes/:id" element={<AppLayout><RequireRole roles={["SAC", "DIRETORIA"]}><RequisicaoDetalhePage /></RequireRole></AppLayout>} />
          <Route path="/sac/requisicoes/:id/atender" element={<AppLayout><RequireRole roles={["SAC"]}><AtenderRequisicaoPage /></RequireRole></AppLayout>} />
          <Route path="/sac/:id" element={<AppLayout><RequireRole roles={["SAC", "DIRETORIA"]}><AtendimentoDetalhePage /></RequireRole></AppLayout>} />

          {/* Admin — restricted */}
          <Route path="/admin" element={<AppLayout><RequireRole roles={["ADMIN"]}><AdminPage /></RequireRole></AppLayout>} />
          <Route path="/administracao/usuarios" element={<AppLayout><RequireRole roles={["ADMIN"]}><UsuariosPage /></RequireRole></AppLayout>} />
          <Route path="/administracao/perfis" element={<AppLayout><RequireRole roles={["ADMIN"]}><PerfisPage /></RequireRole></AppLayout>} />
          <Route path="/administracao/log-auditoria" element={<AppLayout><RequireRole roles={["ADMIN"]}><LogAuditoriaPage /></RequireRole></AppLayout>} />
          <Route path="/administracao/parametros" element={<AppLayout><RequireRole roles={["ADMIN"]}><ParametrosPage /></RequireRole></AppLayout>} />

          {/* Assistência Técnica — permission-guarded */}
          <Route path="/assistencia/dashboard" element={<AppLayout><RequirePermission perm="ASSIST_DASH_VIEW"><AssistenciaDashboardPage /></RequirePermission></AppLayout>} />
          <Route path="/assistencia/os" element={<AppLayout><RequirePermission perm="ASSIST_OS_VIEW"><OSListPage /></RequirePermission></AppLayout>} />
          <Route path="/assistencia/os/nova" element={<AppLayout><RequirePermission perm="ASSIST_OS_CREATE"><NovaOSPage /></RequirePermission></AppLayout>} />
          <Route path="/assistencia/os/:id" element={<AppLayout><RequirePermission perm="ASSIST_OS_VIEW"><OSDetalhePage /></RequirePermission></AppLayout>} />
          <Route path="/assistencia/os/:id/consumo" element={<AppLayout><RequirePermission perm="ASSIST_CONSUMO_CREATE"><ConsumoOSPage /></RequirePermission></AppLayout>} />
          <Route path="/assistencia/requisicoes/:id/receber" element={<AppLayout><RequirePermission perm="ASSIST_REQ_RECEBER"><ReceberRequisicaoPage /></RequirePermission></AppLayout>} />
          <Route path="/assistencia/requisicoes" element={<AppLayout><RequirePermission perm="ASSIST_REQ_VIEW"><ReqAssistListPage /></RequirePermission></AppLayout>} />
          <Route path="/assistencia/estoque" element={<AppLayout><RequirePermission perm="ASSIST_ESTOQUE_VIEW"><EstoquePage /></RequirePermission></AppLayout>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
